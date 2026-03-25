// ============================================
// API Layer — 이중 모드
//   GitHub Pages : Supabase 직접 연결 (정적 호스팅)
//   로컬 서버    : /api/ 프록시 (Supabase 키 브라우저 비노출)
// ============================================

import { supabase, uploadImage as supabaseUploadImage } from './supabase-client.js'

// GitHub Pages 감지
const GH = window.location.hostname.includes('github.io');

// ── 서버 모드 fetch 헬퍼 ─────────────────────────────────────
async function srv(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const token = sessionStorage.getItem('teacherToken');
    if (token) opts.headers['x-teacher-token'] = token;
    const res = await fetch(path, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json;
}

// ── Supabase 헬퍼 ────────────────────────────────────────────
function sbCheck({ data, error }) { if (error) throw new Error(error.message); return data; }

// ── PIN 해싱 (GitHub Pages용, Web Crypto API) ─────────────────
async function hashPin(pin, salt) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(salt), iterations: 10000, hash: 'SHA-256' }, key, 256);
    return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function generateSalt() {
    const arr = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Rate limit ───────────────────────────────────────────────
const _rl = { teacher: { count: 0, lockedUntil: 0 }, student: {} };
const RL_MAX = 5, RL_MS = 30_000;
function _checkRL(r) {
    if (r.lockedUntil > Date.now()) throw new Error(`PIN 시도 초과. ${Math.ceil((r.lockedUntil - Date.now()) / 1000)}초 후 재시도`);
    r.count = (r.count || 0) + 1;
    if (r.count >= RL_MAX) { r.lockedUntil = Date.now() + RL_MS; r.count = 0; throw new Error('PIN 시도 초과. 30초 후 재시도'); }
}
function _resetRL(r) { r.count = 0; r.lockedUntil = 0; }

// ── 선생님 토큰 ──────────────────────────────────────────────
let _teacherToken = null, _teacherExpiry = 0;

const API = {

    // ── 인증 ────────────────────────────────────────────────
    async login(name, pin) {
        if (!_rl.student[name]) _rl.student[name] = { count: 0, lockedUntil: 0 };
        _checkRL(_rl.student[name]);

        if (GH) {
            const { data: students, error } = await supabase
                .from('students').select('id, name, pin, pin_salt, created_at').eq('name', name.trim());
            if (error) throw new Error(error.message);
            if (!students?.length) throw new Error('학생을 찾을 수 없습니다');
            const s = students[0];
            if (!s.pin) throw new Error('PIN이 설정되지 않았습니다. 선생님에게 문의하세요');
            const ok = await hashPin(pin, s.pin_salt) === s.pin;
            if (!ok) throw new Error('PIN이 올바르지 않습니다');
            _resetRL(_rl.student[name]);
            return { id: s.id, name: s.name, created_at: s.created_at };
        } else {
            const student = await srv('POST', '/api/auth/login', { name, pin });
            _resetRL(_rl.student[name]);
            return student;
        }
    },

    async teacherLogin(pin) {
        _checkRL(_rl.teacher);

        if (GH) {
            const { data, error } = await supabase.from('teacher_settings').select('pin, pin_salt').eq('id', 1).single();
            if (error || !data) throw new Error('선생님 설정을 찾을 수 없습니다');
            const ok = await hashPin(pin, data.pin_salt) === data.pin;
            if (!ok) throw new Error('PIN이 올바르지 않습니다');
            _resetRL(_rl.teacher);
            _teacherToken = crypto.randomUUID();
            _teacherExpiry = Date.now() + 30 * 60 * 1000;
            return { token: _teacherToken };
        } else {
            const { token } = await srv('POST', '/api/auth/teacher', { pin });
            _resetRL(_rl.teacher);
            _teacherToken = token;
            _teacherExpiry = Date.now() + 30 * 60 * 1000;
            sessionStorage.setItem('teacherToken', token);
            return { token };
        }
    },

    _checkTeacher(token) {
        if (!token || token !== _teacherToken || Date.now() > _teacherExpiry) throw new Error('선생님 인증이 필요합니다');
    },

    async setStudentPin(id, pin, teacherToken) {
        this._checkTeacher(teacherToken);
        if (GH) {
            const salt = await generateSalt();
            sbCheck(await supabase.from('students').update({ pin: await hashPin(pin, salt), pin_salt: salt }).eq('id', id));
        } else {
            await srv('PUT', `/api/students/${id}/pin`, { pin });
        }
    },

    async setTeacherPin(teacherToken, newPin) {
        this._checkTeacher(teacherToken);
        if (GH) {
            const salt = await generateSalt();
            sbCheck(await supabase.from('teacher_settings').update({ pin: await hashPin(newPin, salt), pin_salt: salt, updated_at: new Date().toISOString() }).eq('id', 1));
        } else {
            await srv('PUT', '/api/auth/teacher-pin', { newPin });
        }
    },

    // ── 학생 관리 ────────────────────────────────────────────
    async getStudents() {
        if (GH) return sbCheck(await supabase.from('students').select('id, name, created_at').order('created_at'));
        return srv('GET', '/api/students');
    },
    async getStudent(id) {
        if (GH) return sbCheck(await supabase.from('students').select('id, name, created_at').eq('id', id).single());
        return srv('GET', `/api/students/${id}`);
    },
    async addStudent(name) {
        if (GH) {
            const salt = await generateSalt();
            const { data, error } = await supabase.from('students')
                .insert({ name, pin: await hashPin('0000', salt), pin_salt: salt }).select('id, name, created_at').single();
            if (error) throw new Error(error.message);
            return data;
        }
        return srv('POST', '/api/students', { name });
    },
    async updateStudent(id, name) {
        if (GH) return sbCheck(await supabase.from('students').update({ name }).eq('id', id).select('id, name, created_at').single());
        return srv('PUT', `/api/students/${id}`, { name });
    },
    async deleteStudent(id) {
        if (GH) { sbCheck(await supabase.from('students').delete().eq('id', id)); return { ok: true }; }
        return srv('DELETE', `/api/students/${id}`);
    },

    // ── 카드 관리 ────────────────────────────────────────────
    async getCards(studentId) {
        if (GH) return sbCheck(await supabase.from('cards').select('*').eq('student_id', studentId).order('created_at'));
        return srv('GET', `/api/students/${studentId}/cards`);
    },
    async addCard(studentId, cardData) {
        if (GH) {
            const { data, error } = await supabase.from('cards')
                .insert({ student_id: studentId, ...cardData }).select().single();
            if (error) throw new Error(error.message);
            return data;
        }
        return srv('POST', `/api/students/${studentId}/cards`, cardData);
    },
    async updateCard(cardId, updates) {
        if (GH) return sbCheck(await supabase.from('cards').update(updates).eq('id', cardId).select().single());
        return srv('PUT', `/api/cards/${cardId}`, updates);
    },
    async deleteCard(cardId) {
        if (GH) { sbCheck(await supabase.from('cards').delete().eq('id', cardId)); return { ok: true }; }
        return srv('DELETE', `/api/cards/${cardId}`);
    },

    // ── 피드백 (Leitner) ─────────────────────────────────────
    async submitFeedback(cardId, success, studentId) {
        if (GH) {
            const { data: card, error } = await supabase.from('cards')
                .select('box, success_count, fail_count').eq('id', cardId).single();
            if (error) throw new Error(error.message);
            const newBox = success ? Math.min((card.box || 1) + 1, 5) : Math.max((card.box || 1) - 1, 1);
            return sbCheck(await supabase.from('cards').update({
                box: newBox,
                success_count: success ? (card.success_count || 0) + 1 : (card.success_count || 0),
                fail_count:    success ? (card.fail_count || 0)    : (card.fail_count || 0) + 1,
                last_review:   new Date().toISOString(),
            }).eq('id', cardId).select().single());
        }
        return srv('POST', `/api/cards/${cardId}/feedback`, { success, studentId });
    },

    // ── 가챠 (랜덤 카드) ─────────────────────────────────────
    async getRandomCard(studentId) {
        if (GH) {
            const { data: cards, error } = await supabase.from('cards').select('*').eq('student_id', studentId);
            if (error) throw new Error(error.message);
            if (!cards?.length) throw new Error('NO_CARDS');
            const weights = cards.map(c => Math.max(6 - (c.box || 1), 1));
            const total = weights.reduce((a, b) => a + b, 0);
            let rand = Math.random() * total;
            for (let i = 0; i < cards.length; i++) { rand -= weights[i]; if (rand <= 0) return cards[i]; }
            return cards[cards.length - 1];
        }
        try {
            return await srv('GET', `/api/students/${studentId}/cards/random`);
        } catch (e) {
            if (e.message.includes('NO_CARDS') || e.message.includes('404')) throw new Error('NO_CARDS');
            throw e;
        }
    },

    // ── 통계 ─────────────────────────────────────────────────
    async getStats(studentId) {
        if (GH) {
            const { data: cards } = await supabase.from('cards').select('box').eq('student_id', studentId);
            const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            (cards || []).forEach(c => { if (c.box >= 1 && c.box <= 5) dist[c.box]++; });
            return { distribution: dist, total: cards?.length || 0 };
        }
        return srv('GET', `/api/students/${studentId}/stats`);
    },

    // ── 오늘/날짜별 학습 결과 ────────────────────────────────
    async getTodayResults(studentId) { return this.getResultsByDate(studentId); },
    async getResultsByDate(studentId, date) {
        // 추후 구현
        return { session: null, cards: [] };
    },

    // ── 이미지 업로드 ─────────────────────────────────────────
    async uploadImage(file, studentId) {
        if (GH) {
            const result = await supabaseUploadImage(file, studentId || 'unknown');
            return { url: result.publicUrl, path: result.filePath };
        }
        const form = new FormData();
        form.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || '업로드 실패');
        return { url: `/assets/${json.filename}`, path: json.filename };
    },

    // ── 인쇄 (서버 전용 — GitHub Pages 미지원) ───────────────
    async printFlashcard(studentId, boxFilter) {
        if (GH) throw new Error('PDF 인쇄는 로컬 서버에서만 사용 가능합니다');
        const res = await fetch('/api/print/flashcard-sheet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, boxFilter }) });
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'PDF 실패'); }
        return res.blob();
    },
    async printQuiz(studentId, chapter) {
        if (GH) throw new Error('PDF 인쇄는 로컬 서버에서만 사용 가능합니다');
        const res = await fetch('/api/print/quiz-sheet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, chapter }) });
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'PDF 실패'); }
        return res.blob();
    },
    async printBulk(studentIds, type, boxFilter) {
        if (GH) throw new Error('PDF 인쇄는 로컬 서버에서만 사용 가능합니다');
        const res = await fetch('/api/print/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentIds, type, boxFilter }) });
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'ZIP 실패'); }
        return res.blob();
    },
    async printPractice(studentId, topic, count) {
        if (GH) throw new Error('PDF 인쇄는 로컬 서버에서만 사용 가능합니다');
        const res = await fetch('/api/print/practice-sheet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, topic, count }) });
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'PDF 실패'); }
        return res.blob();
    },
};

window.API = API;
export default API;
