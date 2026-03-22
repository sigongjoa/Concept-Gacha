// ============================================
// API Layer - 로컬 Express 서버 연동 (fetch 기반)
// ============================================

const API_BASE = ''  // 같은 서버에서 서빙 → 상대경로

const API = {
    async _fetch(path, options = {}) {
        const res = await fetch(API_BASE + path, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }))
            throw new Error(err.error || '요청 실패')
        }
        return res.json()
    },

    // ============================================
    // 인증 API
    // ============================================
    async login(name, pin) {
        return this._fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ name, pin })
        })
    },

    async teacherLogin(pin) {
        return this._fetch('/api/auth/teacher', {
            method: 'POST',
            body: JSON.stringify({ pin })
        })
    },

    async setStudentPin(id, pin, teacherPin) {
        return this._fetch(`/api/students/${id}/pin`, {
            method: 'PUT',
            headers: { 'X-Teacher-Pin': teacherPin },
            body: JSON.stringify({ pin })
        })
    },

    async setTeacherPin(currentPin, newPin) {
        return this._fetch('/api/auth/teacher-pin', {
            method: 'PUT',
            headers: { 'X-Teacher-Pin': currentPin },
            body: JSON.stringify({ newPin })
        })
    },

    // ============================================
    // 학생 관리 API
    // ============================================
    async getStudents() {
        return this._fetch('/api/students')
    },

    async getStudent(id) {
        return this._fetch(`/api/students/${id}`)
    },

    async addStudent(name) {
        return this._fetch('/api/students', {
            method: 'POST',
            body: JSON.stringify({ name })
        })
    },

    async updateStudent(id, name) {
        return this._fetch(`/api/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name })
        })
    },

    async deleteStudent(id) {
        return this._fetch(`/api/students/${id}`, { method: 'DELETE' })
    },

    // ============================================
    // 카드 관리 API
    // ============================================
    async getCards(studentId) {
        return this._fetch(`/api/students/${studentId}/cards`)
    },

    async addCard(studentId, cardData) {
        return this._fetch(`/api/students/${studentId}/cards`, {
            method: 'POST',
            body: JSON.stringify(cardData)
        })
    },

    async updateCard(cardId, updates) {
        return this._fetch(`/api/cards/${cardId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        })
    },

    async deleteCard(cardId) {
        return this._fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
    },

    // ============================================
    // 피드백 (Leitner 박스 이동)
    // ============================================
    async submitFeedback(cardId, success, studentId) {
        return this._fetch(`/api/cards/${cardId}/feedback`, {
            method: 'POST',
            body: JSON.stringify({ success, studentId })
        })
    },

    // ============================================
    // 가챠 (랜덤 카드)
    // ============================================
    async getRandomCard(studentId) {
        const res = await fetch(`/api/students/${studentId}/cards/random`)
        if (res.status === 404) throw new Error('NO_CARDS')
        if (!res.ok) throw new Error('카드 뽑기 실패')
        return res.json()
    },

    // ============================================
    // 통계
    // ============================================
    async getStats(studentId) {
        return this._fetch(`/api/students/${studentId}/stats`)
    },

    // ============================================
    // 이미지 업로드
    // ============================================
    async uploadImage(file) {
        const formData = new FormData()
        formData.append('image', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('업로드 실패')
        return res.json()
    },

    // ============================================
    // 인쇄 (PDF 다운로드)
    // ============================================
    async printFlashcard(studentId, boxFilter = []) {
        const res = await fetch('/api/print/flashcard-sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, boxFilter })
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'PDF 생성 실패')
        }
        return res.blob()
    },

    async printQuiz(studentId, chapter = '') {
        const res = await fetch('/api/print/quiz-sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, chapter })
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'PDF 생성 실패')
        }
        return res.blob()
    },

    async printBulk(studentIds, type, boxFilter = []) {
        const res = await fetch('/api/print/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentIds, type, boxFilter })
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'ZIP 생성 실패')
        }
        return res.blob()
    },

    async printPractice(studentId, topic, count = 10) {
        const res = await fetch('/api/print/practice-sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, topic, count })
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'PDF 생성 실패')
        }
        return res.blob()
    }
}

window.API = API
export default API
