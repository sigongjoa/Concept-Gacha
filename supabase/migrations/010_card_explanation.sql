-- ============================================================
-- 010_card_explanation.sql
-- cards 테이블에 explanation 컬럼 추가
-- 개념 설명/정의를 저장 — 학생이 정답 확인 후 표시됨
-- ============================================================

ALTER TABLE cards
ADD COLUMN IF NOT EXISTS explanation TEXT DEFAULT NULL;

-- 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cards' AND column_name = 'explanation';
