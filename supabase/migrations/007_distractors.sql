-- Migration 007: Add distractors column to cards table
-- Enables per-card attractive wrong answer choices for MCQ mode

ALTER TABLE cards
ADD COLUMN IF NOT EXISTS distractors JSONB DEFAULT NULL;

COMMENT ON COLUMN cards.distractors IS
'오답 선택지 배열 (null이면 client-side 자동생성).
 예: ["bi", "a", "a+bi", "√(a²+b²)", "a-bi", "b²"]
 최대 15개 권장. 화면에는 정답 포함 4~6개 랜덤 선택 표시.';
