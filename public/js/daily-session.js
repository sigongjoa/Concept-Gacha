// ============================================
// Daily Session Manager — 서버 API 경유
// ============================================

async function apiFetch(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json;
}

/**
 * 오늘 세션 조회/생성 + 스트릭 반환
 * @returns {Promise<{session, remaining, streak}>}
 */
export async function getOrCreateTodaySession(studentId, target = 10) {
    return apiFetch('GET', `/api/students/${studentId}/session/today`);
}

/**
 * 카드 학습 결과 기록
 */
export async function recordCardResult(sessionId, cardId, result, boxBefore, boxAfter) {
    return apiFetch('POST', `/api/sessions/${sessionId}/record`, {
        card_id: cardId, result, box_before: boxBefore, box_after: boxAfter,
    });
}

/**
 * 최근 N일 학습 기록
 */
export async function getSessionHistory(studentId, days = 30) {
    return apiFetch('GET', `/api/students/${studentId}/session/history?days=${days}`);
}

/**
 * 연속 학습 스트릭 (session/today 에 포함되어 있으므로 별도 호출 최소화)
 */
export async function getStreak(studentId) {
    try {
        const { streak } = await apiFetch('GET', `/api/students/${studentId}/session/today`);
        return streak ?? 0;
    } catch (_) { return 0; }
}

/**
 * 이번 주(월~일) 완료 현황 → boolean[] (null=미래)
 */
export async function getWeeklyStatus(studentId) {
    return apiFetch('GET', `/api/students/${studentId}/session/weekly`);
}

/**
 * 세션 카드 기록 조회
 */
export async function getSessionCards(sessionId) {
    return apiFetch('GET', `/api/sessions/${sessionId}/cards`);
}
