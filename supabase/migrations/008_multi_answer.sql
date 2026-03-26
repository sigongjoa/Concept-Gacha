-- 다중정답(N:M) 지원을 위한 answers 컬럼 추가
-- null이면 기존 단일정답(answer 컬럼) 사용 — 하위 호환 유지
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT NULL;

COMMENT ON COLUMN cards.answers IS
'다중정답 배열. null이면 단일정답(answer 컬럼 사용).
 예: ["나머지 없이 나눌 수 있는 수", "곱해서 그 수가 되는 수"]
 distractors와 합쳐서 MCQ 보기 구성. 2개 이상일 때 다중정답 모드 활성화.';
