-- ============================================================
-- 013_seed_explanations_full.sql
-- curl로 확인한 전체 카드 explanation 삽입 (ID 기준)
-- 011/012에서 누락된 곱셈공식·연산법칙·복소수·대입 카드 포함
-- ============================================================

-- ══════════════════════════════════════════════════
-- ① 곱셈공식 — 기본 공식
-- ══════════════════════════════════════════════════

UPDATE cards SET explanation = '전개 원리: (a+b)(a+b) 직접 계산. 자기제곱 2개 + 교차항 2ab. 예: (x+3)² = x²+6x+9'
WHERE id IN ('c474f7be-2d8f-41a0-a894-8debd114fdf5','ff8043b8-92d3-413b-9ac5-41f88c2f7cee');

UPDATE cards SET explanation = '전개 원리: (a-b)(a-b) 직접 계산. 교차항 부호 주의: -2ab. 예: (x-2)² = x²-4x+4'
WHERE id IN ('bc4d7e60-98f9-4630-b1cd-8dc4ad451a20','728d17ce-0ea0-473b-a97e-d4a064e3d4c4');

UPDATE cards SET explanation = '합차공식: 두 수의 합×차 = 제곱의 차. 예: (x+5)(x-5)=x²-25. 인수분해 역방향으로도 사용.'
WHERE id IN ('614ba44a-3e3d-4536-a3f6-0ae9980af017','222073f4-c357-4612-a525-e0ef701d33cc');

UPDATE cards SET explanation = 'x의 계수 = a+b (두 수의 합), 상수항 = ab (두 수의 곱). 예: (x+2)(x+3) = x²+5x+6'
WHERE id IN ('3f402384-758a-4e49-8643-53b5a532f69c','1f6687fc-e0d9-429c-bdeb-3d5a9d69458e');

UPDATE cards SET explanation = '일반형 이차식 전개. ac=이차항계수, ad+bc=일차항계수, bd=상수항. 예: (2x+1)(3x+2)=6x²+7x+2'
WHERE id IN ('2aefedf6-2fe2-4c44-902a-7f4fa94b6add','abeac0e4-530d-47b3-b166-4b1a66be4a60');

UPDATE cards SET explanation = '세 항의 합의 제곱. 자기제곱(a²+b²+c²) + 교차항(2ab+2bc+2ca). 교차항은 두 항씩 모든 쌍에 2 곱함.'
WHERE id IN ('c419907a-6835-43a9-b43b-1fc2b204594c','ea1c7383-c6df-4763-abf6-fd4076cac907');

UPDATE cards SET explanation = '이항정리 계수 1,3,3,1 (파스칼 삼각형 3행). 예: (x+1)³=x³+3x²+3x+1. (a+b)를 세 번 곱함.'
WHERE id IN ('57ddd772-3633-423c-916c-5ca14b5669f3','703a2ef7-bd6b-4b05-831e-774b0c164631');

UPDATE cards SET explanation = '부호 패턴: +,-,+,-. 예: (a-2)³=a³-6a²+12a-8. (a-b)³ = a³-3a²b+3ab²-b³'
WHERE id IN ('a3fdd042-fc61-4148-a495-d5ebfd96f7d3','a90e5c97-7cef-4275-8aa1-f3e0db9d39da');

UPDATE cards SET explanation = '세제곱의 합 인수분해 역방향. a³+b³ = (a+b)(a²-ab+b²). 중간항 -ab에 주의.'
WHERE id IN ('76671817-d07a-4d8a-aa86-f1393297211b','10b7e51a-4a38-4c01-9070-43a00e7f5e9d');

UPDATE cards SET explanation = '세제곱의 차 인수분해 역방향. a³-b³ = (a-b)(a²+ab+b²). 중간항 +ab에 주의.'
WHERE id IN ('b059c174-9e18-4796-a2cc-e4c6fce0537a','97acb00c-92ac-4f2f-b328-64626a97bd70');

UPDATE cards SET explanation = '계수 규칙: x²의 계수=a+b+c(합), x의 계수=ab+bc+ca(두 개씩 곱의 합), 상수=abc(세 수의 곱).'
WHERE id IN ('ccc469ab-33cf-4ccc-8f65-032f6bba5a46','a47f0b40-46e8-440d-94bb-cf01b0c5b6d0');

UPDATE cards SET explanation = '특수 인수분해 공식. a=b=c일 때 좌변=0이고 우변=0. 증명: a³+b³+c³-3abc=(a+b+c)(a²+b²+c²-ab-bc-ca).'
WHERE id IN ('b6b13f89-4ced-4ea0-af38-64f5a3c4aca4','e3235b91-baf4-4b8a-8c85-0d312e9706d3');

UPDATE cards SET explanation = '치환: A=a²+b², B=ab로 놓으면 (A+B)(A-B)=A²-B²=(a²+b²)²-(ab)². 곱하면 a⁴+a²b²+b⁴.'
WHERE id IN ('0d83fe68-9872-42ed-a6e1-01735dc4d398','9cf1ccc8-b7fb-4ee3-a849-700f7dad34f2');

UPDATE cards SET explanation = '이항정리 계수 1,4,6,4,1 (파스칼 삼각형 4행). (a+b)⁴ = Σ C(4,k)·a^(4-k)·b^k.'
WHERE id IN ('4357ef5d-f5cc-4d60-b9d3-7b68480e6988','25457245-bf70-4889-b250-0517d982def9');

-- ══════════════════════════════════════════════════
-- ② 곱셈공식 — 변형 유도
-- ══════════════════════════════════════════════════

UPDATE cards SET explanation = '(a+b)²=a²+2ab+b² 변형 → a²+b²=(a+b)²-2ab. a+b와 ab를 알 때 a²+b² 바로 계산 가능.'
WHERE id IN ('dd289e5d-d17b-4ccd-ad87-5e00c8c99e57','674e5b0b-a508-4a9a-bbed-58dfee6b0cbf');

UPDATE cards SET explanation = '(a-b)²=a²-2ab+b² 변형 → a²+b²=(a-b)²+2ab. a-b와 ab를 알 때 a²+b² 바로 계산 가능.'
WHERE id IN ('f6f6da9d-3998-4f6f-b160-619b154c0cd8','4a986f18-906d-402b-910b-ee50ba9a3c0b');

UPDATE cards SET explanation = '(a+b)²-(a-b)²=4ab에서 유도. 즉 (a-b)²=(a+b)²-4ab. a+b와 ab를 알 때 (a-b)² 계산 가능.'
WHERE id IN ('d4490fae-3357-4405-9ebb-fbd7e866d080','96ea0cba-b5aa-41e7-a879-e2b6bc02669f');

UPDATE cards SET explanation = '동치 표현: ½[(a-b)²+(b-c)²+(c-a)²]. 항상 ≥ 0. 등호 성립 조건: a=b=c. 음이 아닌 실수의 합.'
WHERE id IN ('358e1ade-f6b9-4264-bde2-43a794cc3803','15d1701d-5e23-4afb-a25a-8da5b3dad002');

UPDATE cards SET explanation = '(a+b)³=a³+3a²b+3ab²+b³ 변형. 3ab(a+b)=3a²b+3ab². 즉 a³+b³=(a+b)³-3ab(a+b).'
WHERE id IN ('bc530699-6fc6-4d60-9b50-1c4317a35893','bddace40-0b0f-478e-abde-a6e6a5b559b2');

UPDATE cards SET explanation = '(a-b)³=a³-3a²b+3ab²-b³ 변형. 3ab(a-b)=3a²b-3ab². 즉 a³-b³=(a-b)³+3ab(a-b).'
WHERE id IN ('638a3d3d-677f-499c-8bbf-70392d242d89','ce1db58f-0bc2-4c05-960c-d0b0ab3d91c0');

UPDATE cards SET explanation = '소피 제르맹 항등식: a⁴+4b⁴=(a²+2b²)²-(2ab)²=(a²+2b²+2ab)(a²+2b²-2ab). 합이지만 인수분해 가능.'
WHERE id IN ('0c9e881b-d6d9-401c-97a3-8fc1c697eaea','ddc58239-d32f-42fc-922b-8254940b6847');

-- ══════════════════════════════════════════════════
-- ③ 곱셈공식 — 실전 적용
-- ══════════════════════════════════════════════════

UPDATE cards SET explanation = '(a+b)² 공식. a=x, b=3. 2ab=6x, b²=9. (x+3)²=x²+6x+9.'
WHERE id IN ('5e33fc7c-c268-469d-90bd-a1c6019df68f','98e91ee6-7355-430f-bcde-863b89d7569e');

UPDATE cards SET explanation = '(a-b)² 공식. a=2a, b=5. (2a)²=4a², 2×2a×5=20a, 5²=25. 결과: 4a²-20a+25.'
WHERE id IN ('20f15ea7-6590-4c9c-91d3-ceb599392cd7','f05f057c-fc84-4b26-ab97-51047d275001');

UPDATE cards SET explanation = '합차공식. a=x, b=4. x²-4²=x²-16. 합과 차의 곱은 제곱의 차.'
WHERE id IN ('e582db7d-82aa-427f-9fbd-cc5e6ff73ee8','bdc87a5e-a389-47e5-8c78-715e68e16797');

UPDATE cards SET explanation = '합차공식. a=3x, b=2. (3x)²=9x², 2²=4. 결과: 9x²-4.'
WHERE id IN ('c1c9abc1-6b47-4de9-9fcd-71851c1eb827','1750d89e-749f-4b71-8944-f5c1138eb28f');

UPDATE cards SET explanation = '(x+a)(x+b) 공식. a=2, b=5. a+b=7(일차항계수), ab=10(상수항). 결과: x²+7x+10.'
WHERE id IN ('ec48108d-c5df-4ce8-a030-028003cda4c6','64183621-a348-4ed0-9017-731768842b6a');

UPDATE cards SET explanation = '(x+a)(x+b) 공식. a=-3, b=7. a+b=4, ab=-21. 결과: x²+4x-21. 부호 주의!'
WHERE id IN ('b6febf69-489e-4291-9798-d43973e244cf','e39fd0fb-215f-43ce-b084-3e177bcc602d');

UPDATE cards SET explanation = '(ax+b)(cx+d) 공식. ac=6, ad+bc=2×(-2)+3×1=-1, bd=-2. 결과: 6x²-x-2.'
WHERE id IN ('80e8e398-24d1-45af-a4ac-9d2181ee381c','113c7150-e672-4cfa-bb62-cbeff640acea');

UPDATE cards SET explanation = '(a+b)³ 공식. a=x, b=1. 계수: 1,3,3,1. x³+3x²·1+3x·1+1=x³+3x²+3x+1.'
WHERE id IN ('aecb93d3-e2d7-4436-9c8b-02205136de65','34aced43-2c85-4447-8480-2db0fa8b122b');

UPDATE cards SET explanation = '(a-b)³ 공식. a=a, b=2. -3a²·2=-6a², 3a·4=12a, -8. 결과: a³-6a²+12a-8.'
WHERE id IN ('d85f8baa-0599-4342-9faa-d4402103ad12','6791fde0-ec59-4db1-ac00-2e77a318ab72');

UPDATE cards SET explanation = '(a+b+c)² 공식. a=x, b=y, c=1. 교차항: 2xy+2x·1+2y·1=2xy+2x+2y.'
WHERE id IN ('cf493180-439c-40ca-bd32-313e0f03341e','391bb7f0-4bb9-4c18-bbcd-d0cc59e847bc');

UPDATE cards SET explanation = '(a+b+c)²에서 i≠j인 두 항의 곱에 2를 곱한 합. 세 쌍: ab, bc, ca 각각 2배. 자기제곱항과 구분.'
WHERE id IN ('0191a711-4572-4cd4-9de2-0c75ccafbfa7','7681c401-dd89-4215-8c8e-2a93f2710927');

UPDATE cards SET explanation = '완전제곱식 인수분해. (x+a)²=x²+2ax+a². 상수항 16=4²이고 계수 8=2×4이므로 a=4.'
WHERE id IN ('805bfb19-0018-43ce-915b-81070187d7c2','1584e45c-66e7-415f-b2f3-16467f3e90d3');

UPDATE cards SET explanation = '완전제곱식. (3a-2)²=(3a)²-2×3a×2+2²=9a²-12a+4. a=3a, b=2로 (a-b)² 공식 적용.'
WHERE id IN ('3b8d2027-6b62-497e-a86f-34a6ca340c9b','e49510a7-85b0-49b0-8536-5faebad36f48');

UPDATE cards SET explanation = '합차공식 역방향. x²-25=x²-5²=(x+5)(x-5). a²-b²=(a+b)(a-b) 인수분해 패턴.'
WHERE id IN ('14634fc6-29eb-4cf4-b6e4-fc656f1d16a5','f0785b52-51c1-456b-9a66-68d4f1e99609');

UPDATE cards SET explanation = '합차공식 역방향. 4x²-9=(2x)²-3²=(2x+3)(2x-3). 완전제곱 계수인지 확인 후 적용.'
WHERE id IN ('eace493b-caf7-4fd6-b2d8-57eeab0ea2cf','33e50c6c-be80-4429-9b75-afd238dcc245');

UPDATE cards SET explanation = '치환: A=x²로 놓으면 (A+x+1)(A-x+1)=(A+1+x)(A+1-x)=(A+1)²-x²=(x²+1)²-x²=x⁴+x²+1.'
WHERE id IN ('f52215fa-f70c-4bf9-8691-b5bd19bc7784','f53ddae0-6556-42d6-9e22-a1981088c332');

-- ══════════════════════════════════════════════════
-- ④ 곱셈공식 — 응용 문제
-- ══════════════════════════════════════════════════

UPDATE cards SET explanation = '공식: (a+b)²-(a-b)²=4ab. a=3, b=2 대입 → 4×3×2=24. ※ 정답 재확인 필요.'
WHERE id IN ('9d8ddd4b-0c40-4c82-8609-273a634d8aae','15531d8f-cd08-4404-b159-c6c47285edc7');

UPDATE cards SET explanation = '(x+1/x)²=x²+2+1/x² → x²+1/x²=(x+1/x)²-2=3²-2=9-2=7. 제곱 후 2를 빼면 됨.'
WHERE id IN ('bb70cebf-85f1-4169-bfd0-3b57f7d84452','6b85c460-a879-49b7-8c27-ab0873e0b68d');

UPDATE cards SET explanation = '(x-1/x)²=x²-2+1/x² → x²+1/x²=(x-1/x)²+2=2²+2=4+2=6. 제곱 후 2를 더하면 됨.'
WHERE id IN ('cf84159e-1c5f-4f6d-8840-1f0a8f922452','ce0c95e8-b995-46e5-a003-3a882f4e1dda');

UPDATE cards SET explanation = 'x²-3x+1=0 양변을 x로 나누면: x-3+1/x=0 → x+1/x=3. x≠0이므로 나눗셈 가능.'
WHERE id IN ('41cb7348-292d-4f43-b70d-092da27aa045','1ab1d2ac-a2c0-4549-8b9d-60d34796ea27');

-- ══════════════════════════════════════════════════
-- ⑤ 곱셈공식 — 추가 실전
-- ══════════════════════════════════════════════════

UPDATE cards SET explanation = '(a+b)² 공식 검증. (2+3)²=5²=25. 또는 2²+2×2×3+3²=4+12+9=25. 동일한 결과.'
WHERE id = '8a0a582c-c4f3-48bb-ae7c-aa03cc604863';

UPDATE cards SET explanation = '(x+a)(x+b) 공식. a=3, b=5. a+b=8, ab=15. 결과: x²+8x+15.'
WHERE id = 'efc5b15f-92cf-4a08-9216-19acc2b0bfda';

UPDATE cards SET explanation = '(x+a)(x+b) 공식. a=3, b=-5. a+b=-2, ab=-15. 결과: x²-2x-15.'
WHERE id = 'a7fd1794-7715-4355-a150-3b4843fbca8d';

-- ══════════════════════════════════════════════════
-- ⑥ 연산법칙
-- ══════════════════════════════════════════════════

UPDATE cards SET explanation = '덧셈: a+b=b+a ✓, 곱셈: a×b=b×a ✓. 뺄셈: 5-3=2이지만 3-5=-2 ✗. 나눗셈도 마찬가지.'
WHERE id = '2b007fed-2076-484c-b432-e8dd130b102f';

UPDATE cards SET explanation = '덧셈·곱셈은 결합법칙 성립. 뺄셈: (8-4)-2=2이지만 8-(4-2)=6 ✗. 나눗셈도 마찬가지.'
WHERE id = '6958af2c-f225-4500-83cd-4c0aec19d484';

UPDATE cards SET explanation = '분배법칙: a×(b+c)=a×b+a×c. 2×7=14를 2×3+2×4=6+8=14로 나누어 계산.'
WHERE id = '0b46c380-bd8b-4760-aeb6-201ca6f5a04a';

UPDATE cards SET explanation = '교환법칙: a+b=b+a, a×b=b×a (덧셈·곱셈 모두). 결합법칙: (a+b)+c=a+(b+c) (덧셈·곱셈). 분배는 두 연산 사이의 법칙.'
WHERE id = 'ee572580-d170-42cc-af19-7fddb101cba9';

UPDATE cards SET explanation = '덧셈 교환법칙: a+b=b+a. 3+7=7+3=10. 결과는 같고 순서만 바뀜.'
WHERE id = '111d2ef4-d18c-493f-b37b-2cc146490de0';

UPDATE cards SET explanation = '분배법칙: a×(b+c)=a×b+a×c. 5×(2+3)=5×2+5×3=10+15=25.'
WHERE id = 'cd3c75ce-31c2-498c-804f-d8403a739fbe';

-- ══════════════════════════════════════════════════
-- ⑦ 복소수
-- ══════════════════════════════════════════════════

UPDATE cards SET explanation = '허수 단위 i는 실수 범위에 없음. i=√(-1)로도 표기. i의 거듭제곱: i¹=i, i²=-1, i³=-i, i⁴=1 (주기 4).'
WHERE id = 'd184091b-5fd8-43d8-adba-7abcab6b5709';

UPDATE cards SET explanation = 'a, b는 실수. b=0이면 실수, a=0·b≠0이면 순허수. 0은 a=b=0인 복소수. 모든 실수는 복소수.'
WHERE id = '4474f490-a709-4b93-b0bf-9afc502441ef';

UPDATE cards SET explanation = 'a+bi에서 실수 부분. b=0이면 복소수 전체가 실수. 실수부끼리, 허수부끼리 비교.'
WHERE id = 'fc787c39-9923-4e40-82e0-677cb5c3873e';

UPDATE cards SET explanation = 'a+bi에서 i의 계수. 주의: 허수부는 bi가 아니라 b (계수만). 예: 3+5i의 허수부는 5.'
WHERE id = 'a22fe6e8-0947-4f83-bb96-0e10e005d2ad';

UPDATE cards SET explanation = '순허수: 실수부=0, 허수부≠0. 예: 2i, -i, √3·i. 0은 b=0이므로 순허수 아님. 수직선 위에 없음.'
WHERE id = '98cbf8a4-3378-4cd3-b3dc-115ebf15c3ee';

UPDATE cards SET explanation = '복소수 동치 조건. 실수 부분끼리, 허수 부분끼리 각각 같아야 함. 예: a+bi=3+2i → a=3, b=2.'
WHERE id = 'b8179fa0-c43f-44f1-8a1a-7ade44d19314';

UPDATE cards SET explanation = '켤레복소수 z̄: 실수부는 그대로, 허수부 부호 반대. z·z̄=a²+b²(실수). 복소수 나눗셈 시 분모 유리화에 사용.'
WHERE id = '21aa647a-24fd-4ec2-b387-f9e146c4c6fa';

UPDATE cards SET explanation = '켤레끼리 더하면 허수부 소거. (a+bi)+(a-bi)=2a. 결과는 항상 실수. z+z̄=2Re(z).'
WHERE id = '42fdc121-8051-4b77-800c-556683ae3ce4';

UPDATE cards SET explanation = '켤레끼리 곱하면 합차공식 적용. (a+bi)(a-bi)=a²-(bi)²=a²+b². 결과는 항상 음이 아닌 실수. z·z̄=|z|².'
WHERE id = '2a87eeaa-febd-42c9-959d-08cfed57f566';

UPDATE cards SET explanation = 'i의 거듭제곱 주기 4: i¹=i, i²=-1, i³=-i, i⁴=1, i⁵=i... n을 4로 나눈 나머지로 값 결정. 나머지 0이면 1.'
WHERE id = 'ca8123bf-752f-436b-8a91-b0edddb7645c';

-- ══════════════════════════════════════════════════
-- ⑧ 대입
-- ══════════════════════════════════════════════════

UPDATE cards SET explanation = '문자에 수를 넣어 식의 값을 구하는 것. 순서: 문자 찾기 → 주어진 수로 교체 → 계산.'
WHERE id = 'cfac770e-351d-4735-8414-c3a4e9f2cd0e';

UPDATE cards SET explanation = '2x에 x=3 대입: 2×3=6. 문자 x를 3으로 바꾼 후 계산.'
WHERE id = 'c944acab-41c0-4802-bffe-27ff58b7b93a';

UPDATE cards SET explanation = 'a+5에 a=4 대입: 4+5=9. 문자 a를 4로 교체.'
WHERE id = '1610ec4f-caa0-4902-930a-cc99af7d197b';

UPDATE cards SET explanation = '3x-1에 x=2 대입: 3×2-1=6-1=5. 곱셈 먼저, 빼기 나중.'
WHERE id = 'da818598-d49e-403e-a996-65553db5819a';

UPDATE cards SET explanation = 'a²에 a=-2 대입: (-2)²=(-2)×(-2)=4. 음수의 제곱은 양수. 괄호로 묶어 계산!'
WHERE id = 'f4fe71fa-bc16-42b7-901c-2dfe11707f31';

UPDATE cards SET explanation = 'x+y에 x=3, y=2 동시 대입: 3+2=5. 두 문자 모두 교체 후 계산.'
WHERE id = 'ee651a62-dcff-476e-aa8c-628ba1af644e';

UPDATE cards SET explanation = '2a-b에 a=5, b=3 대입: 2×5-3=10-3=7. 계수 주의: 2a는 2×a.'
WHERE id = '59215cf7-308a-4dd3-8671-82d224dfcad6';

UPDATE cards SET explanation = 'x²+x에 x=-1 대입: (-1)²+(-1)=1-1=0. 제곱항과 일차항 부호 각각 주의.'
WHERE id = 'e6f02a7c-d3fd-4592-a37d-ce6990be6cf5';

-- ══════════════════════════════════════════════════
-- ⑨ 확인
-- ══════════════════════════════════════════════════
SELECT
  s.name AS 학생,
  COUNT(*) AS 전체,
  COUNT(c.explanation) AS 설명있음,
  COUNT(*) - COUNT(c.explanation) AS 설명없음
FROM cards c
JOIN students s ON s.id = c.student_id
WHERE c.type = 'text'
GROUP BY s.name
ORDER BY s.name;
