-- ============================================================
-- 011_seed_explanations.sql
-- 기존 카드들의 explanation 필드 채우기
-- ============================================================

-- ── 정지효 카드 ─────────────────────────────────────────────
UPDATE cards SET explanation =
  '예: 2, 3, 5, 7, 11, 13… 단, 1은 소수가 아님. 합성수와 반대 개념.'
WHERE question = '소수'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

UPDATE cards SET explanation =
  '예: 4(=2×2), 6(=2×3), 8, 9, 10… 1은 소수도 합성수도 아님.'
WHERE question = '합성수'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

UPDATE cards SET explanation =
  '예: 2×2×2 = 2³. 이때 2가 밑, 3이 지수. aⁿ은 a를 n번 곱한 것.'
WHERE question = '거듭제곱'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

UPDATE cards SET explanation =
  '예: 2³에서 밑은 2. 지수만큼 반복하여 곱하는 수(또는 문자).'
WHERE question = '밑'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

UPDATE cards SET explanation =
  '예: 2³에서 지수는 3 → 2를 3번 곱하라는 뜻. 위첨자로 나타냄.'
WHERE question = '지수'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

UPDATE cards SET explanation =
  '예: 4와 9는 서로소(공약수 1뿐). 3과 6은 서로소가 아님(공약수 3 존재).'
WHERE question = '서로소'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

UPDATE cards SET explanation =
  '양의 정수(자연수) > 0 > 음의 정수 순서. 자연수와 양의 정수는 같은 개념.'
WHERE question = '정수에는 **가 있다?'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

UPDATE cards SET explanation =
  '수직선에서 오른쪽이 크고 왼쪽이 작다. 음수끼리는 절댓값이 작을수록 큼.'
WHERE question = '대소관계'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

UPDATE cards SET explanation =
  '예: x²의 제곱근은 ±x. 양의 제곱근은 √, 음의 제곱근은 −√로 표기.'
WHERE question = '제곱근'
  AND student_id = (SELECT id FROM students WHERE name = '정지효');

-- ── 최예지 카드 ─────────────────────────────────────────────
UPDATE cards SET explanation =
  '예: 3x와 −5x는 동류항(문자 x 동일). 2x와 2y는 동류항 아님. 동류항끼리만 덧셈·뺄셈 가능.'
WHERE question = '동류항'
  AND student_id = (SELECT id FROM students WHERE name = '최예지');

UPDATE cards SET explanation =
  '예: 3의 역수는 1/3, a/b의 역수는 b/a. 나눗셈을 역수의 곱셈으로 바꿀 수 있음. 단, 0은 역수 없음.'
WHERE question = '역수란?'
  AND student_id = (SELECT id FROM students WHERE name = '최예지');

-- ── 윤지후 카드 ─────────────────────────────────────────────
UPDATE cards SET explanation =
  '예: 2x²+3x+1, x²−4. 최고차항의 차수가 2. 이차방정식·이차함수의 기본 형태.'
WHERE question = '이차식'
  AND student_id = (SELECT id FROM students WHERE name = '윤지후');

-- ── 김시우 카드 ─────────────────────────────────────────────
UPDATE cards SET explanation =
  '높이는 밑변에 수직인 선분의 길이. 예: 밑변 6cm, 높이 4cm → 넓이 = 6×4÷2 = 12cm²'
WHERE question = '삼각형의 넓이 공식은?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '예: 가로 5cm, 세로 3cm → 둘레 = (5+3)×2 = 16cm. 넓이는 가로×세로.'
WHERE question = '직사각형의 둘레는?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '마름모는 평행사변형의 특수형. 두 대각선이 서로 수직 이등분. 마름모 넓이 = 대각선₁×대각선₂÷2.'
WHERE question = '마름모의 성질은?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '윗변과 아랫변은 서로 평행. 높이는 두 평행선 사이의 거리. 예: 윗변 3, 아랫변 7, 높이 4 → 넓이 = (3+7)×4÷2 = 20'
WHERE question = '사다리꼴의 넓이는?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '두 대각선이 서로 수직으로 만나는 성질 이용. 예: 대각선 6cm, 8cm → 넓이 = 6×8÷2 = 24cm²'
WHERE question = '대각선 길이가 주어졌을 때 마름모의 넓이는?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '정사각형은 직사각형의 특수형(모든 변이 같은 경우). 직사각형 ⊂ 평행사변형.'
WHERE question = '직사각형이란?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '정사각형 ⊂ 직사각형 ⊂ 평행사변형 ⊂ 사다리꼴 ⊂ 사각형. 가장 특수한 사각형.'
WHERE question = '정사각형이란?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '성질: 마주 보는 각이 같고, 마주 보는 변이 같으며, 대각선이 서로 이등분.'
WHERE question = '평행사변평이란?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '다각형의 꼭짓점 수 = 변의 수. n각형 → 꼭짓점 n개, 변 n개.'
WHERE question = '꼭짓점이란?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '그 한점을 "원의 중심"이라 함. 중심까지의 거리 = 반지름(r). 원의 넓이 = πr², 원의 둘레 = 2πr.'
WHERE question = '원이란?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '마름모의 두 대각선 = 원의 지름. 따라서 마름모 넓이 = (지름×지름)÷2 = (2r×2r)÷2 = 2r²'
WHERE question = '원에 꼭 맞게 들어가는 마름모의 대각선 길이와 원의 어떤 길이가 같나요?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '합동인 두 삼각형은 넓이, 변의 길이, 각도가 모두 같음. 종이 접기에서 좌우 삼각형이 합동.'
WHERE question = '직사각형 종이를 대각선으로 접으면 생기는 두 삼각형의 관계는?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '예: 넓이 24cm², 밑변 8cm → 높이 = 24×2÷8 = 6cm. 삼각형 넓이 공식을 역으로 풀기.'
WHERE question = '삼각형의 넓이와 밑변을 알 때, 높이를 구하는 방법은?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '방법 1: 여러 도형으로 쪼개서 더함. 방법 2: 큰 도형에서 필요 없는 부분을 빼기.'
WHERE question = '복잡한 도형의 넓이를 구하는 전략은?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '방법: (전체 도형 넓이) − (색칠 안 된 부분 넓이), 또는 색칠된 각 부분의 넓이를 따로 계산해 합산.'
WHERE question = '색칠된 부분의 넓이를 구하는 방법은?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '1m = 100cm이므로 1m² = 100×100 = 10,000cm². 넓이 단위는 길이 단위를 두 번 곱함.'
WHERE question = '넓이의 단위 변환: 1m² = 몇 cm²인가요?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

UPDATE cards SET explanation =
  '1km = 1,000m이므로 1km² = 1,000×1,000 = 1,000,000m². 단위가 커질수록 제곱 배율도 커짐.'
WHERE question = '단위 변환: 1km² = 몇 m²인가요?'
  AND student_id = (SELECT id FROM students WHERE name = '김시우');

-- ── 확인 ───────────────────────────────────────────────────
SELECT s.name, c.question, c.answer,
       LEFT(c.explanation, 50) AS explanation_preview
FROM cards c
JOIN students s ON s.id = c.student_id
WHERE c.explanation IS NOT NULL
ORDER BY s.name, c.created_at;
