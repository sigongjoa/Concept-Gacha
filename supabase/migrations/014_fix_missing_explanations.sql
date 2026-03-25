-- ============================================================
-- 014_fix_missing_explanations.sql
-- explanation이 NULL인 나머지 5개 카드 ID 직접 지정
-- ============================================================

UPDATE cards SET explanation = '유한소수: 소수점 아래 자릿수가 유한. 기약분수의 분모가 2와 5의 곱으로만 이루어진 경우. 예: 3/4=0.75, 1/8=0.125.'
WHERE id = '3447eb0d-abaf-4f8b-a6ba-ded249fcedb9';

UPDATE cards SET explanation = 'n각형의 변의 수 = 꼭짓점의 수 = n. 삼각형: 변 3개, 사각형: 변 4개, 오각형: 변 5개.'
WHERE id = '5e8d3619-b575-4cd9-adde-1f159df27463';

UPDATE cards SET explanation = '공식: 거리 = 속력 × 시간. 예: 시속 60km로 2시간 이동 → 거리 = 60 × 2 = 120km.'
WHERE id = 'd1807306-8503-45c0-910c-f9bdf5c7f6b4';

UPDATE cards SET explanation = '공식: 속력 = 거리 ÷ 시간. 예: 120km를 2시간에 이동 → 속력 = 120 ÷ 2 = 60km/h.'
WHERE id = '62a81197-ea72-4073-8af3-20194258c76a';

UPDATE cards SET explanation = '공식: 속력 = 거리 ÷ 시간. 예: 120km를 2시간에 이동 → 속력 = 120 ÷ 2 = 60km/h.'
WHERE id = '3b296119-0cd0-4146-84be-852d3f3a15e7';

-- 확인
SELECT COUNT(*) AS 남은_설명없음
FROM cards
WHERE type = 'text' AND explanation IS NULL;
