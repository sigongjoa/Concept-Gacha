-- ============================================================
-- 008_clean_answer_parens.sql
-- answer 필드 데이터 정리 — 괄호 설명 제거
--
-- 문제: answer = "a - bi (허수부 부호만 반대)" 처럼
--       괄호 설명이 붙어 있으면 MCQ에서 정답이 바로 티남
-- 목표: answer = "a - bi" (순수 답만 남기기)
-- ============================================================

-- ── 1단계: 영향받는 카드 확인 (수정 전 미리 보기) ─────────
SELECT
    id,
    question,
    answer AS answer_before,
    TRIM(REGEXP_REPLACE(answer, '\s*\([^)]+\)\s*$', '', 'g')) AS answer_after
FROM cards
WHERE answer ~ '\([^)]+\)'
ORDER BY id;


-- ── 2단계: answer 끝 괄호 설명 제거 ──────────────────────
-- 예) "a - bi (허수부 부호만 반대)" → "a - bi"
-- 예) "sin²θ + cos²θ = 1 (피타고라스 항등식)" → "sin²θ + cos²θ = 1"
-- 예) "√(a²+b²)" 같은 수식 내 괄호는 건드리지 않음
--     → 끝에 붙은 괄호만 제거 ($)
UPDATE cards
SET answer = TRIM(REGEXP_REPLACE(answer, '\s*\([^)]+\)\s*$', '', 'g'))
WHERE answer ~ '\([^)]+\)\s*$';


-- ── 3단계: em-dash 뒤 설명 제거 ──────────────────────────
-- 예) "25 — 두 직선이 평행" → "25"
-- 예) "합동 — 넓이가 서로 같다" → "합동"
UPDATE cards
SET answer = TRIM(SPLIT_PART(answer, ' — ', 1))
WHERE answer LIKE '% — %';

-- em-dash 변형 처리
UPDATE cards
SET answer = TRIM(SPLIT_PART(answer, '—', 1))
WHERE answer LIKE '%—%'
  AND answer NOT LIKE '% — %';  -- 위에서 이미 처리된 것 제외


-- ── 4단계: 결과 확인 ──────────────────────────────────────
SELECT id, question, answer
FROM cards
ORDER BY id;
