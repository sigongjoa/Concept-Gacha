// ============================================
// Daily Session Manager — 이중 모드
//   GitHub Pages : Supabase 직접 연결
//   로컬 서버    : /api/ 프록시
// ============================================

import { supabase } from './supabase-client.js'

const GH = window.location.hostname.includes('github.io');

async function apiFetch(path) {
    const res = await fetch(path);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json;
}

async function apiPost(path, body) {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    return json;
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

// ── 스트릭 계산 (공통) ────────────────────────────────────────
async function calcStreak(studentId) {
    let hist;
    if (GH) {
        const { data } = await supabase.from('daily_sessions')
            .select('session_date, completed').eq('student_id', studentId)
            .order('session_date', { ascending: false }).limit(60);
        hist = data || [];
    } else {
        hist = await apiFetch(`/api/students/${studentId}/session/history?days=60`);
    }
    const map = new Map(hist.map(s => [s.session_date, s.completed]));
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 60; i++) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        if (i === 0) { if (map.get(ds)) streak++; continue; }
        if (map.get(ds) === true) streak++; else break;
    }
    return streak;
}

export async function getOrCreateTodaySession(studentId, target = 10) {
    if (!GH) {
        return apiFetch(`/api/students/${studentId}/session/today`);
    }

    const today = todayStr();
    let { data: session, error } = await supabase
        .from('daily_sessions').select('*').eq('student_id', studentId).eq('session_date', today).maybeSingle();
    if (error) throw new Error('세션 조회 실패: ' + error.message);

    if (!session) {
        const { data: ns, error: ce } = await supabase
            .from('daily_sessions').insert({ student_id: studentId, session_date: today, cards_target: target }).select().single();
        if (ce) throw new Error('세션 생성 실패: ' + ce.message);
        session = ns;
    }

    const remaining = Math.max(0, session.cards_target - session.cards_drawn);
    const streak = await calcStreak(studentId);
    return { session, remaining, streak };
}

export async function recordCardResult(sessionId, cardId, result, boxBefore, boxAfter) {
    if (!GH) {
        return apiPost(`/api/sessions/${sessionId}/record`, { card_id: cardId, result, box_before: boxBefore, box_after: boxAfter });
    }

    const [scResult] = await Promise.all([
        supabase.from('session_cards').insert({ session_id: sessionId, card_id: cardId, result, box_before: boxBefore, box_after: boxAfter }),
    ]);
    if (scResult.error) throw new Error('결과 기록 실패: ' + scResult.error.message);

    const { data: cur } = await supabase.from('daily_sessions').select('cards_drawn, cards_target').eq('id', sessionId).single();
    const newDrawn = (cur?.cards_drawn ?? 0) + 1;
    const completed = newDrawn >= (cur?.cards_target ?? 10);
    const { data: final } = await supabase.from('daily_sessions')
        .update({ cards_drawn: newDrawn })
        .eq('id', sessionId).select().single();
    return final;
}

export async function getSessionHistory(studentId, days = 30) {
    if (!GH) return apiFetch(`/api/students/${studentId}/session/history?days=${days}`);

    const since = new Date(); since.setDate(since.getDate() - days);
    const { data, error } = await supabase.from('daily_sessions')
        .select('session_date, cards_drawn, cards_target, completed')
        .eq('student_id', studentId).gte('session_date', since.toISOString().split('T')[0])
        .order('session_date', { ascending: true });
    if (error) throw new Error('기록 조회 실패: ' + error.message);
    return data || [];
}

export async function getStreak(studentId) {
    if (!GH) {
        try { const { streak } = await apiFetch(`/api/students/${studentId}/session/today`); return streak ?? 0; }
        catch (_) { return 0; }
    }
    return calcStreak(studentId);
}

export async function getWeeklyStatus(studentId) {
    if (!GH) return apiFetch(`/api/students/${studentId}/session/weekly`);

    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today); monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = new Date(monday.getTime() + 6 * 86400000).toISOString().split('T')[0];
    const todayString = today.toISOString().split('T')[0];

    const { data } = await supabase.from('daily_sessions')
        .select('session_date, completed').eq('student_id', studentId)
        .gte('session_date', mondayStr).lte('session_date', sundayStr);
    const map = new Map((data || []).map(s => [s.session_date, s.completed]));

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday); d.setDate(monday.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        if (ds > todayString) return null;
        return map.get(ds) === true;
    });
}

export async function getSessionCards(sessionId) {
    if (!GH) return apiFetch(`/api/sessions/${sessionId}/cards`);
    const { data, error } = await supabase.from('session_cards')
        .select('*, cards(question, box)').eq('session_id', sessionId).order('reviewed_at');
    if (error) throw new Error('세션 카드 조회 실패: ' + error.message);
    return data || [];
}
