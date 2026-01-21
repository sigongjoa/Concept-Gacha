const API_BASE = '';

const API = {
    async getStudents() {
        const res = await fetch(`${API_BASE}/api/students`);
        return res.json();
    },

    async addStudent(name) {
        const res = await fetch(`${API_BASE}/api/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || '등록 실패');
        }
        return res.json();
    },

    async getStats(studentId) {
        const res = await fetch(`${API_BASE}/api/students/${studentId}/stats`);
        return res.json();
    },

    async updateStudent(id, name) {
        const res = await fetch(`${API_BASE}/api/students/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || '업데이트 실패');
        }
        return res.json();
    },

    async deleteStudent(id) {
        const res = await fetch(`${API_BASE}/api/students/${id}`, { method: 'DELETE' });
        return res.json();
    },

    async getRandomCard(studentId) {
        const res = await fetch(`${API_BASE}/api/students/${studentId}/cards/random`);
        if (!res.ok) {
            if (res.status === 404) throw new Error('NO_CARDS');
            throw new Error('카드 뽑기 실패');
        }
        return res.json();
    },

    async getCards(studentId) {
        const res = await fetch(`${API_BASE}/api/students/${studentId}/cards`);
        return res.json();
    },

    async submitFeedback(cardId, success) {
        const res = await fetch(`${API_BASE}/api/cards/${cardId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success })
        });
        return res.json();
    },

    async addCard(studentId, cardData) {
        const res = await fetch(`${API_BASE}/api/students/${studentId}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cardData)
        });
        return res.json();
    },

    async deleteCard(cardId) {
        const res = await fetch(`${API_BASE}/api/cards/${cardId}`, { method: 'DELETE' });
        return res.json();
    },

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    }
};

window.API = API;
