-- ============================================================
-- 009_clean_answer_hints.sql
-- answer 필드 2차 정리 — 대괄호 힌트 & 잔여 괄호 설명 제거
-- ============================================================

-- ── 1단계: 수정 전 미리 보기 ──────────────────────────────
SELECT
    id,
    answer AS before,
    TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(answer, '\s*\[[^\]]*\]\s*$', '', 'g'),
    '\s*\([^)]*\)\s*$', '', 'g')) AS after
FROM cards
WHERE answer ~ '\[[^\]]+\]'
   OR answer ~ '\s\([^)]+\)\s*$';


-- ── 2단계: [공식: ...] 대괄호 힌트 제거 ──────────────────
-- 예) "20  [공식: 4ab]"          → "20"
-- 예) "7  [공식: (x+1/x)²-2]"   → "7"
UPDATE cards
SET answer = TRIM(REGEXP_REPLACE(answer, '\s*\[[^\]]*\]\s*$', '', 'g'))
WHERE answer ~ '\[[^\]]+\]\s*$';


-- ── 3단계: 끝에 붙은 (설명) 괄호 제거 ────────────────────
-- 대상: 앞에 실제 답이 있고 뒤에 공백+(설명) 형태인 것만
-- 예) "a + bi (a, b는 실수)"      → "a + bi"
-- 예) "i² = -1 (즉, i = √(-1))"  → "i² = -1"
-- 예) "0 ((−1)²+(−1)=1−1=0)"     → "0"
-- 예) "뺄셈과 나눗셈 ((a-b)-c ≠ a-(b-c))" → "뺄셈과 나눗셈"
-- 주의: "(x+4)²" 같은 수학 표기는 앞에 공백이 없으므로 안전
UPDATE cards
SET answer = TRIM(REGEXP_REPLACE(answer, '\s+\([^)]*\)\s*$', '', 'g'))
WHERE answer ~ '\s\([^)]+\)\s*$';


-- ── 4단계: 결과 확인 ──────────────────────────────────────
SELECT id, question, answer
FROM cards
WHERE id IN (
    '15531d8f-cd08-4404-b159-c6c47285edc7',
    '9d8ddd4b-0c40-4c82-8609-273a634d8aae',
    '1ab1d2ac-a2c0-4549-8b9d-60d34796ea27',
    '41cb7348-292d-4f43-b70d-092da27aa045',
    '6b85c460-a879-49b7-8c27-ab0873e0b68d',
    'bb70cebf-85f1-4169-bfd0-3b57f7d84452',
    'ce0c95e8-b995-46e5-a003-3a882f4e1dda',
    'cf84159e-1c5f-4f6d-8840-1f0a8f922452',
    '4474f490-46e8-440d-94bb-cf01b0c5b6d0',
    '6958af2c-f225-4500-83cd-4c0aec19d484',
    'd184091b-5fd8-43d8-adba-7abcab6b5709',
    'e6f02a7c-d3fd-4592-a37d-ce6990be6cf5',
    'f4fe71fa-bc16-42b7-901c-2dfe11707f31'
)
ORDER BY id;
