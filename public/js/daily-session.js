// ============================================
// Daily Session Manager
// 하루 10개 카드 학습 세션 관리
// ============================================

import { supabase } from './supabase-client.js'

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환
 */
function todayStr() {
    return new Date().toISOString().split('T')[0]
}

/**
 * 오늘 세션을 가져오거나 없으면 새로 생성
 * @param {string} studentId
 * @param {number} target - 목표 카드 수 (기본 10)
 * @returns {Promise<{session, remaining, streak}>}
 */
export async function getOrCreateTodaySession(studentId, target = 10) {
    const today = todayStr()

    // 오늘 세션 조회
    let { data: session, error } = await supabase
        .from('daily_sessions')
        .select('*')
        .eq('student_id', studentId)
        .eq('session_date', today)
        .maybeSingle()

    if (error) throw new Error('세션 조회 실패: ' + error.message)

    // 없으면 생성
    if (!session) {
        const { data: newSession, error: createErr } = await supabase
            .from('daily_sessions')
            .insert({ student_id: studentId, session_date: today, cards_target: target })
            .select()
            .single()

        if (createErr) throw new Error('세션 생성 실패: ' + createErr.message)
        session = newSession
    }

    const remaining = Math.max(0, session.cards_target - session.cards_drawn)
    const streak = await getStreak(studentId)

    return { session, remaining, streak }
}

/**
 * 카드 학습 결과 기록 + 세션 카운터 증가
 * @param {string} sessionId
 * @param {string|null} cardId
 * @param {'success'|'fail'} result
 * @param {number} boxBefore
 * @param {number} boxAfter
 */
export async function recordCardResult(sessionId, cardId, result, boxBefore, boxAfter) {
    // session_cards에 기록
    const { error: scErr } = await supabase
        .from('session_cards')
        .insert({
            session_id: sessionId,
            card_id: cardId,
            result,
            box_before: boxBefore,
            box_after: boxAfter,
        })

    if (scErr) throw new Error('결과 기록 실패: ' + scErr.message)

    // cards_drawn을 직접 increment
    const { data: cur } = await supabase
        .from('daily_sessions')
        .select('cards_drawn')
        .eq('id', sessionId)
        .single()

    const { error: incErr } = await supabase
        .from('daily_sessions')
        .update({ cards_drawn: (cur?.cards_drawn ?? 0) + 1 })
        .eq('id', sessionId)

    if (incErr) throw new Error('세션 업데이트 실패: ' + incErr.message)

    // 업데이트된 세션 반환
    const { data: final } = await supabase
        .from('daily_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

    return final
}

/**
 * 최근 N일 학습 기록 조회
 * @param {string} studentId
 * @param {number} days - 조회할 일수 (기본 30)
 * @returns {Promise<Array<{session_date, cards_drawn, cards_target, completed}>>}
 */
export async function getSessionHistory(studentId, days = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('daily_sessions')
        .select('session_date, cards_drawn, cards_target, completed')
        .eq('student_id', studentId)
        .gte('session_date', sinceStr)
        .order('session_date', { ascending: true })

    if (error) throw new Error('기록 조회 실패: ' + error.message)
    return data || []
}

/**
 * 연속 학습 스트릭 계산
 * @param {string} studentId
 * @returns {Promise<number>} 연속 완료 일수
 */
export async function getStreak(studentId) {
    const { data, error } = await supabase
        .from('daily_sessions')
        .select('session_date, completed')
        .eq('student_id', studentId)
        .order('session_date', { ascending: false })
        .limit(60)

    if (error || !data?.length) return 0

    const completedMap = new Map(
        data.map(s => [s.session_date, s.completed])
    )

    let streak = 0
    const today = new Date()

    for (let i = 0; i < 60; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]

        // 오늘은 완료 여부와 무관하게 스트릭에 포함
        if (i === 0) {
            if (completedMap.has(dateStr)) {
                if (completedMap.get(dateStr)) streak++
                // 오늘 완료 안 했어도 어제부터 계속 확인
            }
            continue
        }

        if (completedMap.get(dateStr) === true) {
            streak++
        } else {
            break
        }
    }

    return streak
}

/**
 * 이번 주(월~일) 완료 현황
 * @param {string} studentId
 * @returns {Promise<boolean[]>} [월,화,수,목,금,토,일] 완료 여부
 */
export async function getWeeklyStatus(studentId) {
    const today = new Date()
    // 이번 주 월요일 구하기
    const monday = new Date(today)
    const day = today.getDay()
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))

    const mondayStr = monday.toISOString().split('T')[0]
    const sundayStr = new Date(monday.getTime() + 6 * 86400000).toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('daily_sessions')
        .select('session_date, completed')
        .eq('student_id', studentId)
        .gte('session_date', mondayStr)
        .lte('session_date', sundayStr)

    if (error) return Array(7).fill(false)

    const completedMap = new Map((data || []).map(s => [s.session_date, s.completed]))
    const todayStr = today.toISOString().split('T')[0]

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const ds = d.toISOString().split('T')[0]
        if (ds > todayStr) return null          // 미래: null
        return completedMap.get(ds) === true    // 완료: true, 미완료: false
    })
}

/**
 * 세션의 카드 기록 조회
 * @param {string} sessionId
 */
export async function getSessionCards(sessionId) {
    const { data, error } = await supabase
        .from('session_cards')
        .select('*, cards(question, box)')
        .eq('session_id', sessionId)
        .order('reviewed_at', { ascending: true })

    if (error) throw new Error('세션 카드 조회 실패: ' + error.message)
    return data || []
}
