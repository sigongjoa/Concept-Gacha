// ============================================
// API Layer — 서버 프록시 경유 (Supabase 키 브라우저 비노출)
// ============================================

// ── 공통 fetch 헬퍼 ─────────────────────────────────────────
async function apiFetch(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const token = sessionStorage.getItem('teacherToken');
    if (token) opts.headers['x-teacher-token'] = token;
    const res = await fetch(path, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json;
}
const _get  = (path)       => apiFetch('GET',    path);
const _post = (path, body) => apiFetch('POST',   path, body);
const _put  = (path, body) => apiFetch('PUT',    path, body);
const _del  = (path)       => apiFetch('DELETE', path);

// ── Rate limit (클라이언트 측 보조) ─────────────────────────
const _rl = { teacher: { count: 0, lockedUntil: 0 }, student: {} };
const RL_MAX = 5, RL_MS = 30_000;
function _checkRL(r) {
    if (r.lockedUntil > Date.now()) throw new Error(`PIN 시도 초과. ${Math.ceil((r.lockedUntil - Date.now()) / 1000)}초 후 재시도`);
    r.count = (r.count || 0) + 1;
    if (r.count >= RL_MAX) { r.lockedUntil = Date.now() + RL_MS; r.count = 0; throw new Error('PIN 시도 초과. 30초 후 재시도'); }
}
function _resetRL(r) { r.count = 0; r.lockedUntil = 0; }

// ── 선생님 토큰 인메모리 ─────────────────────────────────────
let _teacherToken = null, _teacherExpiry = 0;

const API = {

    // ── 인증 ────────────────────────────────────────────────
    async login(name, pin) {
        if (!_rl.student[name]) _rl.student[name] = { count: 0, lockedUntil: 0 };
        _checkRL(_rl.student[name]);
        const student = await _post('/api/auth/login', { name, pin });
        _resetRL(_rl.student[name]);
        return student;
    },

    async teacherLogin(pin) {
        _checkRL(_rl.teacher);
        const { token } = await _post('/api/auth/teacher', { pin });
        _resetRL(_rl.teacher);
        _teacherToken = token;
        _teacherExpiry = Date.now() + 30 * 60 * 1000;
        sessionStorage.setItem('teacherToken', token);
        return { token };
    },

    _checkTeacher(token) {
        if (!token || token !== _teacherToken || Date.now() > _teacherExpiry) throw new Error('선생님 인증이 필요합니다');
    },

    async setStudentPin(id, pin, teacherToken) {
        this._checkTeacher(teacherToken);
        return _put(`/api/students/${id}/pin`, { pin });
    },

    async setTeacherPin(teacherToken, newPin) {
        this._checkTeacher(teacherToken);
        return _put('/api/auth/teacher-pin', { newPin });
    },

    // ── 학생 관리 ────────────────────────────────────────────
    async getStudents()           { return _get('/api/students'); },
    async getStudent(id)          { return _get(`/api/students/${id}`); },
    async addStudent(name)        { return _post('/api/students', { name }); },
    async updateStudent(id, name) { return _put(`/api/students/${id}`, { name }); },
    async deleteStudent(id)       { return _del(`/api/students/${id}`); },

    // ── 카드 관리 ────────────────────────────────────────────
    async getCards(studentId)         { return _get(`/api/students/${studentId}/cards`); },
    async addCard(studentId, cardData){ return _post(`/api/students/${studentId}/cards`, cardData); },
    async updateCard(cardId, updates) { return _put(`/api/cards/${cardId}`, updates); },
    async deleteCard(cardId)          { return _del(`/api/cards/${cardId}`); },

    // ── 피드백 (Leitner) ─────────────────────────────────────
    async submitFeedback(cardId, success, studentId) {
        return _post(`/api/cards/${cardId}/feedback`, { success, studentId });
    },

    // ── 가챠 (랜덤 카드) ─────────────────────────────────────
    async getRandomCard(studentId) {
        try {
            return await _get(`/api/students/${studentId}/cards/random`);
        } catch (e) {
            if (e.message.includes('NO_CARDS') || e.message.includes('404')) throw new Error('NO_CARDS');
            throw e;
        }
    },

    // ── 통계 ─────────────────────────────────────────────────
    async getStats(studentId) { return _get(`/api/students/${studentId}/stats`); },

    // ── 오늘/날짜별 학습 결과 ────────────────────────────────
    async getTodayResults(studentId) {
        return this.getResultsByDate(studentId, new Date().toISOString().slice(0, 10));
    },
    async getResultsByDate(studentId, date) {
        return _get(`/api/students/${studentId}/results?date=${date || new Date().toISOString().slice(0, 10)}`);
    },

    // ── 이미지 업로드 ─────────────────────────────────────────
    async uploadImage(file, studentId) {
        const form = new FormData();
        form.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || '업로드 실패');
        return { url: `/assets/${json.filename}`, path: json.filename };
    },

    // ── 인쇄 (서버에서 PDF 생성) ─────────────────────────────
    async printFlashcard(studentId, boxFilter) {
        const res = await fetch('/api/print/flashcard-sheet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, boxFilter }) });
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'PDF 실패'); }
        return res.blob();
    },
    async printQuiz(studentId, chapter) {
        const res = await fetch('/api/print/quiz-sheet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, chapter }) });
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'PDF 실패'); }
        return res.blob();
    },
    async printBulk(studentIds, type, boxFilter) {
        const res = await fetch('/api/print/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentIds, type, boxFilter }) });
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'ZIP 실패'); }
        return res.blob();
    },
    async printPractice(studentId, topic, count) {
        const res = await fetch('/api/print/practice-sheet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, topic, count }) });
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'PDF 실패'); }
        return res.blob();
    },
};

window.API = API;
export default API;
