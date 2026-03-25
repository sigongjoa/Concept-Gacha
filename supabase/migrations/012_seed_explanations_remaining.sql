-- ============================================================
-- 012_seed_explanations_remaining.sql
-- 011에서 누락된 카드들 explanation 보완
-- ============================================================

-- ── 최예지 — 누락 카드 ──────────────────────────────────────
UPDATE cards SET explanation =
  '유한소수: 소수점 아래 자릿수가 유한한 소수. 기약분수의 분모가 2와 5의 곱으로만 이루어진 경우.'
WHERE question = '유한소수를 다르게 표현하면?'
  AND student_id = (SELECT id FROM students WHERE name = '최예지');

UPDATE cards SET explanation =
  '공식: 거리 = 속력 × 시간. 예: 시속 60km로 2시간 → 거리 = 60 × 2 = 120km'
WHERE question = '거리는?'
  AND student_id = (SELECT id FROM students WHERE name = '최예지');

UPDATE cards SET explanation =
  '공식: 속력 = 거리 ÷ 시간. 예: 120km를 2시간에 이동 → 속력 = 120 ÷ 2 = 60km/h'
WHERE question = '속력은?'
  AND student_id = (SELECT id FROM students WHERE name = '최예지');

-- ── 김시우 — 누락 카드 ──────────────────────────────────────
UPDATE cards SET explanation =
  'n각형의 변의 수 = 꼭짓점의 수 = n. 삼각형: 변 3개, 사각형: 변 4개, 오각형: 변 5개.'
WHERE question = '변'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

-- ── 영어유저 ─────────────────────────────────────────────────
UPDATE cards SET explanation =
  'apple [ǽpl]. 복수형: apples. 관련 단어: fruit(과일), pear(배), orange(오렌지).'
WHERE question = 'apple'
  AND student_id = (SELECT id FROM students WHERE name = '영어유저');

-- ── 김하진 — 모든 텍스트 카드에 설명이 없으면 question=answer 패턴으로 확인
-- (김하진 카드는 import 파일에 없으므로 DB에서 확인 필요)
SELECT s.name, c.question, c.answer
FROM cards c
JOIN students s ON s.id = c.student_id
WHERE s.name = '김하진'
  AND c.type = 'text'
  AND c.explanation IS NULL
ORDER BY c.created_at;

-- ── 전체 커버리지 확인 ──────────────────────────────────────
SELECT
  s.name,
  COUNT(*) AS total,
  COUNT(c.explanation) AS with_explanation,
  COUNT(*) - COUNT(c.explanation) AS missing
FROM cards c
JOIN students s ON s.id = c.student_id
WHERE c.type = 'text'
GROUP BY s.name
ORDER BY s.name;
