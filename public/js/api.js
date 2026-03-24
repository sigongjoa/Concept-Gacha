// ============================================
// API Layer - Supabase 직접 연동 (GitHub Pages용)
// Express 서버 불필요
// ============================================

import { supabase, uploadImage as supabaseUploadImage } from './supabase-client.js'

// ── PIN 해싱 (Web Crypto API, PBKDF2-SHA256) ─────────────────
async function generateSalt() {
    const arr = crypto.getRandomValues(new Uint8Array(16))
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashPin(pin, salt) {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveBits']
    )
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(salt), iterations: 10000, hash: 'SHA-256' },
        keyMaterial, 256
    )
    return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPin(plain, storedHash, salt) {
    const hash = await hashPin(plain, salt)
    return hash === storedHash
}

// ── teacherToken 인메모리 저장 ───────────────────────────────
let _teacherToken = null
let _teacherExpiry = 0

// ── Rate Limiting (클라이언트 측, 페이지 새로고침 초기화) ────
const _rl = {
    teacher: { count: 0, lockedUntil: 0 },
    student: {},   // key: student name
}
const RL_MAX = 5
const RL_LOCKOUT_MS = 30_000

function _checkRateLimit(record) {
    const now = Date.now()
    if (record.lockedUntil > now) {
        const sec = Math.ceil((record.lockedUntil - now) / 1000)
        throw new Error(`PIN 시도 횟수 초과. ${sec}초 후 다시 시도하세요`)
    }
    record.count = (record.count || 0) + 1
    if (record.count >= RL_MAX) {
        record.lockedUntil = now + RL_LOCKOUT_MS
        record.count = 0
        throw new Error('PIN 시도 횟수 초과. 30초 후 다시 시도하세요')
    }
}

function _rlReset(record) {
    record.count = 0
    record.lockedUntil = 0
}

// ── 전역 에러 헬퍼 ───────────────────────────────────────────
function sb(result) {
    if (result.error) throw new Error(result.error.message)
    return result.data
}

const API = {

    // ============================================
    // 인증 API
    // ============================================
    async login(name, pin) {
        // rate limit 확인
        if (!_rl.student[name]) _rl.student[name] = { count: 0, lockedUntil: 0 }
        _checkRateLimit(_rl.student[name])

        // 학생 이름으로 조회 (pin/pin_salt는 검증용으로만 사용)
        const { data: students, error } = await supabase
            .from('students')
            .select('id, name, pin, pin_salt, created_at')
            .eq('name', name)
        if (error) throw new Error(error.message)
        if (!students?.length) throw new Error('학생을 찾을 수 없습니다')

        const student = students[0]

        // PIN 미설정 학생은 로그인 불가 (교사에게 PIN 설정 요청)
        if (!student.pin) throw new Error('PIN이 설정되지 않았습니다. 선생님에게 문의하세요')

        const ok = await verifyPin(pin, student.pin, student.pin_salt)
        if (!ok) throw new Error('PIN이 올바르지 않습니다')

        // 로그인 성공 → rate limit 초기화, PIN 필드 제외하고 반환
        _rlReset(_rl.student[name])
        return { id: student.id, name: student.name, created_at: student.created_at }
    },

    async teacherLogin(pin) {
        // rate limit 확인
        _checkRateLimit(_rl.teacher)

        const { data, error } = await supabase
            .from('teacher_settings')
            .select('pin, pin_salt')
            .eq('id', 1)
            .single()
        if (error) throw new Error('선생님 설정을 찾을 수 없습니다')

        const ok = await verifyPin(pin, data.pin, data.pin_salt)
        if (!ok) throw new Error('PIN이 올바르지 않습니다')

        // 로그인 성공 → rate limit 초기화, 30분 인메모리 토큰 발급
        _rlReset(_rl.teacher)
        _teacherToken = crypto.randomUUID()
        _teacherExpiry = Date.now() + 30 * 60 * 1000
        return { token: _teacherToken }
    },

    _checkTeacher(token) {
        if (!token || token !== _teacherToken || Date.now() > _teacherExpiry) {
            throw new Error('선생님 인증이 필요합니다')
        }
    },

    async setStudentPin(id, pin, teacherToken) {
        this._checkTeacher(teacherToken)
        const salt = await generateSalt()
        const hashed = await hashPin(pin, salt)
        sb(await supabase.from('students').update({ pin: hashed, pin_salt: salt }).eq('id', id))
    },

    async setTeacherPin(teacherToken, newPin) {
        this._checkTeacher(teacherToken)
        const salt = await generateSalt()
        const hashed = await hashPin(newPin, salt)
        sb(await supabase.from('teacher_settings').update({ pin: hashed, pin_salt: salt, updated_at: new Date().toISOString() }).eq('id', 1))
    },

    // ============================================
    // 학생 관리 API
    // ============================================
    async getStudents() {
        return sb(await supabase.from('students').select('id, name, created_at').order('created_at'))
    },

    async getStudent(id) {
        return sb(await supabase.from('students').select('id, name, created_at').eq('id', id).single())
    },

    async addStudent(name) {
        const { data, error } = await supabase
            .from('students')
            .insert({ name })
            .select()
            .single()
        if (error) throw new Error(error.message)
        return data
    },

    async updateStudent(id, name) {
        return sb(await supabase.from('students').update({ name }).eq('id', id).select().single())
    },

    async deleteStudent(id) {
        sb(await supabase.from('students').delete().eq('id', id))
        return { ok: true }
    },

    // ============================================
    // 카드 관리 API
    // ============================================
    async getCards(studentId) {
        return sb(await supabase
            .from('cards')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at'))
    },

    async addCard(studentId, cardData) {
        const { data, error } = await supabase
            .from('cards')
            .insert({ student_id: studentId, ...cardData })
            .select()
            .single()
        if (error) throw new Error(error.message)
        return data
    },

    async updateCard(cardId, updates) {
        return sb(await supabase.from('cards').update(updates).eq('id', cardId).select().single())
    },

    async deleteCard(cardId) {
        sb(await supabase.from('cards').delete().eq('id', cardId))
        return { ok: true }
    },

    // ============================================
    // 피드백 (Leitner 박스 이동)
    // ============================================
    async submitFeedback(cardId, success, studentId) {
        // 현재 카드 조회
        const { data: card, error } = await supabase
            .from('cards')
            .select('box, success_count, fail_count')
            .eq('id', cardId)
            .single()
        if (error) throw new Error(error.message)

        const newBox = success
            ? Math.min((card.box || 1) + 1, 5)
            : Math.max((card.box || 1) - 1, 1)

        return sb(await supabase.from('cards').update({
            box: newBox,
            success_count: success ? (card.success_count || 0) + 1 : (card.success_count || 0),
            fail_count:    success ? (card.fail_count || 0)    : (card.fail_count || 0) + 1,
            last_review:   new Date().toISOString(),
        }).eq('id', cardId).select().single())
    },

    // ============================================
    // 가챠 (가중치 랜덤 카드)
    // ============================================
    async getRandomCard(studentId) {
        const { data: cards, error } = await supabase
            .from('cards')
            .select('*')
            .eq('student_id', studentId)
        if (error) throw new Error(error.message)
        if (!cards?.length) throw new Error('NO_CARDS')

        // box 역가중치: box1=5, box2=4, box3=3, box4=2, box5=1
        const weights = cards.map(c => Math.max(6 - (c.box || 1), 1))
        const total   = weights.reduce((a, b) => a + b, 0)
        let rand = Math.random() * total
        for (let i = 0; i < cards.length; i++) {
            rand -= weights[i]
            if (rand <= 0) return cards[i]
        }
        return cards[cards.length - 1]
    },

    // ============================================
    // 통계
    // ============================================
    async getStats(studentId) {
        const { data: cards } = await supabase
            .from('cards')
            .select('box')
            .eq('student_id', studentId)

        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        ;(cards || []).forEach(c => { if (c.box >= 1 && c.box <= 5) dist[c.box]++ })
        return { distribution: dist, total: cards?.length || 0 }
    },

    // ============================================
    // 오늘의 학습 결과
    // ============================================
    async getTodayResults(studentId) {
        return this.getResultsByDate(studentId, new Date().toISOString().slice(0, 10))
    },

    async getResultsByDate(studentId, date) {
        const today = date || new Date().toISOString().slice(0, 10)
        const { data: session, error: sessionErr } = await supabase
            .from('daily_sessions')
            .select('id, cards_drawn, cards_target, completed, completed_at')
            .eq('student_id', studentId)
            .eq('session_date', today)
            .maybeSingle()
        if (sessionErr) throw new Error(sessionErr.message)
        if (!session) return { session: null, cards: [] }

        const { data: cards, error: cardsErr } = await supabase
            .from('session_cards')
            .select('id, result, box_before, box_after, reviewed_at, cards(id, topic, question, answer, box)')
            .eq('session_id', session.id)
            .order('reviewed_at')
        if (cardsErr) throw new Error(cardsErr.message)
        return { session, cards: cards || [] }
    },

    // ============================================
    // 이미지 업로드 (Supabase Storage)
    // ============================================
    async uploadImage(file, studentId) {
        const result = await supabaseUploadImage(file, studentId || 'unknown')
        return { url: result.publicUrl, path: result.filePath }
    },

    // ============================================
    // 인쇄 (PDF) - 서버 필요, GitHub Pages에서 비활성
    // ============================================
    async printFlashcard()  { throw new Error('PDF 인쇄는 로컬 서버에서만 사용 가능합니다') },
    async printQuiz()       { throw new Error('PDF 인쇄는 로컬 서버에서만 사용 가능합니다') },
    async printBulk()       { throw new Error('PDF 인쇄는 로컬 서버에서만 사용 가능합니다') },
    async printPractice()   { throw new Error('PDF 인쇄는 로컬 서버에서만 사용 가능합니다') },
}

window.API = API
export default API
