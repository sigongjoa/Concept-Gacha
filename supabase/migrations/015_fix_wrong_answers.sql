-- ============================================================
-- 015_fix_wrong_answers.sql
-- 전수 검사로 발견된 오답·오타 수정
-- ============================================================

-- ① 동류항: "가수" → "차수" 오타
UPDATE cards SET answer = '문자와 차수가 각각 같은 항'
WHERE id = '53bbaf09-3239-4f12-8868-b383e6ef32fb';

-- ② 평행사변형: 질문 오타 + 답 오타
UPDATE cards SET
  question = '평행사변형이란?',
  answer   = '마주 보는 두 변이 서로 평행한 사각형'
WHERE id = '46363edf-3e5b-4072-bca8-715f6b5df205';

-- ③ 원이란?: "같은 길이가 같은" → "거리가 같은"
UPDATE cards SET answer = '한 점으로부터 거리가 같은 점들의 집합'
WHERE id = '42f61f44-e7d7-466e-bd93-aef77b118f32';

-- ④ a³+b³ 세제곱 변형: (a+b)³-3ab → (a+b)³-3ab(a+b)
UPDATE cards SET answer = '(a+b)³ - 3ab(a+b)'
WHERE id IN ('bc530699-6fc6-4d60-9b50-1c4317a35893',
             'bddace40-0b0f-478e-abde-a6e6a5b559b2');

-- ⑤ a³-b³ 세제곱 변형: (a-b)³+3ab → (a-b)³+3ab(a-b)
UPDATE cards SET answer = '(a-b)³ + 3ab(a-b)'
WHERE id IN ('638a3d3d-677f-499c-8bbf-70392d242d89',
             'ce1db58f-0bc2-4c05-960c-d0b0ab3d91c0');

-- ⑥ 소피 제르맹: 두 번째 인수 추가
UPDATE cards SET answer = '(a²+2b²+2ab)(a²+2b²-2ab)'
WHERE id IN ('0c9e881b-d6d9-401c-97a3-8fc1c697eaea',
             'ddc58239-d32f-42fc-922b-8254940b6847');

-- ⑦ x²-25 인수분해: (x+5) → (x+5)(x-5)
UPDATE cards SET answer = '(x+5)(x-5)'
WHERE id IN ('14634fc6-29eb-4cf4-b6e4-fc656f1d16a5',
             'f0785b52-51c1-456b-9a66-68d4f1e99609');

-- ⑧ 4x²-9 인수분해: (2x+3) → (2x+3)(2x-3)
UPDATE cards SET answer = '(2x+3)(2x-3)'
WHERE id IN ('eace493b-caf7-4fd6-b2d8-57eeab0ea2cf',
             '33e50c6c-be80-4429-9b75-afd238dcc245');

-- ⑨ (a+b)²-(a-b)²: 20 → 24  (4ab = 4×3×2 = 24)
UPDATE cards SET answer = '24'
WHERE id IN ('9d8ddd4b-0c40-4c82-8609-273a634d8aae',
             '15531d8f-cd08-4404-b159-c6c47285edc7');

-- ⑩ a²+b²+c²-ab-bc-ca: "½" → 완전한 식
UPDATE cards SET answer = '½[(a-b)²+(b-c)²+(c-a)²]'
WHERE id IN ('358e1ade-f6b9-4264-bde2-43a794cc3803',
             '15d1701d-5e23-4afb-a25a-8da5b3dad002');

-- explanation도 수정된 내용에 맞게 업데이트
UPDATE cards SET explanation = '예: 3x, -5x는 동류항(문자 x, 차수 1 동일). 2x²와 3x는 동류항 아님(차수 다름). 동류항끼리만 덧셈·뺄셈 가능.'
WHERE id = '53bbaf09-3239-4f12-8868-b383e6ef32fb';

UPDATE cards SET explanation = '성질: 마주 보는 각이 같고, 마주 보는 변의 길이가 같으며, 대각선이 서로 이등분.'
WHERE id = '46363edf-3e5b-4072-bca8-715f6b5df205';

UPDATE cards SET explanation = '그 한점을 "원의 중심"이라 함. 중심까지의 거리 = 반지름(r). 원의 넓이 = πr², 원의 둘레 = 2πr.'
WHERE id = '42f61f44-e7d7-466e-bd93-aef77b118f32';

UPDATE cards SET explanation = '(a+b)³=a³+3a²b+3ab²+b³ 변형. 3a²b+3ab²=3ab(a+b). 즉 a³+b³=(a+b)³-3ab(a+b).'
WHERE id IN ('bc530699-6fc6-4d60-9b50-1c4317a35893','bddace40-0b0f-478e-abde-a6e6a5b559b2');

UPDATE cards SET explanation = '(a-b)³=a³-3a²b+3ab²-b³ 변형. -3a²b+3ab²=-3ab(a-b). 즉 a³-b³=(a-b)³+3ab(a-b).'
WHERE id IN ('638a3d3d-677f-499c-8bbf-70392d242d89','ce1db58f-0bc2-4c05-960c-d0b0ab3d91c0');

UPDATE cards SET explanation = '소피 제르맹 항등식: a⁴+4b⁴=(a²+2b²)²-(2ab)²=(a²+2b²+2ab)(a²+2b²-2ab). 두 인수의 곱.'
WHERE id IN ('0c9e881b-d6d9-401c-97a3-8fc1c697eaea','ddc58239-d32f-42fc-922b-8254940b6847');

UPDATE cards SET explanation = '합차공식 역방향: a²-b²=(a+b)(a-b). x²-25=x²-5²=(x+5)(x-5). 두 인수 모두 필요.'
WHERE id IN ('14634fc6-29eb-4cf4-b6e4-fc656f1d16a5','f0785b52-51c1-456b-9a66-68d4f1e99609');

UPDATE cards SET explanation = '합차공식 역방향: (2x)²-3²=(2x+3)(2x-3). 두 인수 모두 필요.'
WHERE id IN ('eace493b-caf7-4fd6-b2d8-57eeab0ea2cf','33e50c6c-be80-4429-9b75-afd238dcc245');

UPDATE cards SET explanation = '공식: (a+b)²-(a-b)²=4ab. a=3, b=2 → 4×3×2=24.'
WHERE id IN ('9d8ddd4b-0c40-4c82-8609-273a634d8aae','15531d8f-cd08-4404-b159-c6c47285edc7');

UPDATE cards SET explanation = '항상 ≥ 0. 등호 성립 조건: a=b=c. ½[(a-b)²+(b-c)²+(c-a)²]와 동치.'
WHERE id IN ('358e1ade-f6b9-4264-bde2-43a794cc3803','15d1701d-5e23-4afb-a25a-8da5b3dad002');

-- 확인
SELECT id, question, answer FROM cards
WHERE id IN (
  '53bbaf09-3239-4f12-8868-b383e6ef32fb',
  '46363edf-3e5b-4072-bca8-715f6b5df205',
  '42f61f44-e7d7-466e-bd93-aef77b118f32',
  'bc530699-6fc6-4d60-9b50-1c4317a35893',
  '638a3d3d-677f-499c-8bbf-70392d242d89',
  '0c9e881b-d6d9-401c-97a3-8fc1c697eaea',
  '14634fc6-29eb-4cf4-b6e4-fc656f1d16a5',
  'eace493b-caf7-4fd6-b2d8-57eeab0ea2cf',
  '9d8ddd4b-0c40-4c82-8609-273a634d8aae',
  '358e1ade-f6b9-4264-bde2-43a794cc3803'
)
ORDER BY question;
