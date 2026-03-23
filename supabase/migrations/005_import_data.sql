-- ============================================
-- data.json → Supabase 마이그레이션 v2
-- 학생 6명 + 카드 40개
-- ============================================

-- 0. cards 테이블에 누락 컬럼 추가
ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS topic          TEXT,
  ADD COLUMN IF NOT EXISTS question_image TEXT;

-- box 체크 제약 4→5로 확장 (기존 제약 삭제 후 재생성)
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_box_check;
ALTER TABLE cards ADD CONSTRAINT cards_box_check CHECK (box BETWEEN 1 AND 5);

-- 1. 선생님 PIN
INSERT INTO teacher_settings (id, pin, pin_salt)
VALUES (1, '9117a4737b5e872ff5ca453c560ca9ed7d8af71d8b3a67438e3a2d2bab7fb4a7', '764cb6da70279180a45289a9a00fb6b7')
ON CONFLICT (id) DO UPDATE SET pin = EXCLUDED.pin, pin_salt = EXCLUDED.pin_salt;

-- 2. 학생 삽입
INSERT INTO students (name, pin, pin_salt, created_at)
VALUES ('최예지', '333b848072995623c9c93b2026f115b27ca8d6ee4062168a35f893b4b525c653', '9ebcd0bad2e7974a57d50ed5fe6779c9', '2026-01-21T06:11:12.943Z')
ON CONFLICT (name) DO UPDATE SET pin = EXCLUDED.pin, pin_salt = EXCLUDED.pin_salt;
INSERT INTO students (name, pin, pin_salt, created_at)
VALUES ('정지효', '7f288e6ed9120f3d67bbbf5c5d989cdf3bc449493ce7b360b1b58ae39db2c7b9', 'bdf8649ae0bd101adeedbca8c6aba5b5', '2026-01-29T10:38:24.251Z')
ON CONFLICT (name) DO UPDATE SET pin = EXCLUDED.pin, pin_salt = EXCLUDED.pin_salt;
INSERT INTO students (name, pin, pin_salt, created_at)
VALUES ('김시우', '58907c3b12bdc648d296cd9a3fa60e0f2cbee601f5d9ac250c187185df8f7afb', '3f46f85e57e8acf66634d1dccbb2a815', '2026-02-26T12:46:53.518Z')
ON CONFLICT (name) DO UPDATE SET pin = EXCLUDED.pin, pin_salt = EXCLUDED.pin_salt;
INSERT INTO students (name, pin, pin_salt, created_at)
VALUES ('윤지후', 'a8d1301c4e7abedbaaaa515f2c42b84feee75b3630a8d9802a6d7234faaf962f', 'f841c6240713aa683b07f46269851f25', '2026-03-03T11:22:29.370Z')
ON CONFLICT (name) DO UPDATE SET pin = EXCLUDED.pin, pin_salt = EXCLUDED.pin_salt;
INSERT INTO students (name, pin, pin_salt, created_at)
VALUES ('김하진', '4bce6bbefc82f99b4a36709e59602d9a9fcc4d63773990420a08dc7c046d2775', 'ef930bdebedf599c190d318bea83aae7', '2026-03-10T05:06:58.383Z')
ON CONFLICT (name) DO UPDATE SET pin = EXCLUDED.pin, pin_salt = EXCLUDED.pin_salt;
INSERT INTO students (name, pin, pin_salt, created_at)
VALUES ('영어유저', 'b3091e530c63974563288dddfbaa16b0a4ea6afafff860c64857dcc0f3d8a868', '5eb272b89a20d275d0e0f591bef516d6', '2026-03-12T05:15:35.189Z')
ON CONFLICT (name) DO UPDATE SET pin = EXCLUDED.pin, pin_salt = EXCLUDED.pin_salt;

-- 3. 카드 삽입
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'image', 'Updated Question via Curl', '1768979027018-435864782.jpg', '약분과 통분 설명', NULL, 1, 0, 1, '2026-01-21T07:04:00.624Z', '2026-03-15T16:01:50.700Z'
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'image', '', '1768981507369-362609818.jpg', '유리수의 수 체계', '수체계', 2, 1, 0, '2026-01-21T07:45:17.446Z', '2026-03-11T13:50:28.045Z'
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'image', '', '1769071796828-151411793.jpg', '소수의 자릿수 변화', NULL, 1, 0, 0, '2026-01-22T08:50:02.594Z', NULL
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'image', '', '1769071805944-125494158.jpg', '순환소수의 분수표현', '순환소수', 1, 0, 0, '2026-01-22T08:50:11.104Z', NULL
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '소수', NULL, '1보다 큰 자연수 중에서 1과 자기자신만을 약수로 가지는 수', NULL, 3, 2, 1, '2026-01-29T10:40:13.360Z', '2026-02-10T05:53:26.067Z'
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '합성수', NULL, '1보다 큰 자연수 중에서 1과 자기자신 이외의 수를 약수로 가지는 수', NULL, 3, 2, 0, '2026-01-29T10:40:35.257Z', '2026-01-29T10:44:49.565Z'
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '거듭제곱', NULL, '같은 수나 문자를 거듭하여 곱한 것을 간단히 나타낸 것', NULL, 2, 2, 1, '2026-01-29T10:41:07.476Z', '2026-03-22T14:27:06.107Z'
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '밑', NULL, '거듭제곱에서 거듭하여 곱한 수 또는 문자', NULL, 3, 2, 0, '2026-01-29T10:41:30.633Z', '2026-02-03T09:18:12.340Z'
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '지수', NULL, '거듭제곱에서 거듭하여 곱해진 수 또는 문자의 개수', NULL, 2, 1, 0, '2026-01-29T10:41:44.282Z', '2026-03-22T14:26:56.775Z'
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '유한소수를 다르게 표현하면?', NULL, '10의 거듭제곱으로 나타낼 수 있는가?', NULL, 2, 1, 0, '2026-02-03T07:58:39.582Z', '2026-02-05T07:13:10.023Z'
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'image', '', '1770107152660-549137641.jpg', '순환소수의 분수 표현 공식', '순환소수', 1, 0, 0, '2026-02-03T08:26:00.584Z', NULL
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '서로소', NULL, '최대공약수가 1인 자연수', NULL, 1, 0, 0, '2026-02-03T09:53:18.951Z', NULL
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '정수에는 **가 있다?', NULL, '양의정수, 음의정수, 0', NULL, 2, 1, 0, '2026-02-03T10:36:42.020Z', '2026-02-14T04:10:45.815Z'
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '역수란?', NULL, '두 수를 곱해서 1이되는 수', NULL, 1, 0, 0, '2026-02-05T07:57:44.934Z', NULL
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '대소관계', NULL, '크다 작다', NULL, 1, 0, 0, '2026-02-05T10:06:39.489Z', NULL
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '동류항', NULL, '문자와 가수가 각각 같은 항', NULL, 1, 0, 0, '2026-02-10T09:50:51.043Z', NULL
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '제곱근', NULL, '제곱해서 a가 되는 수', NULL, 2, 2, 1, '2026-02-10T11:03:19.384Z', '2026-02-14T04:08:37.088Z'
FROM students WHERE name = '정지효';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '삼각형의 넓이 공식은?', NULL, '(밑변)*(높이)/2', '삼각형', 1, 0, 0, '2026-02-26T12:47:44.299Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '직사각형의 둘레는?', NULL, '(가로+세로)*2', '직사각형', 1, 0, 0, '2026-02-26T12:48:02.920Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '마름모의 성질은?', NULL, '네변의 길이가 모두 같음', '마름모', 1, 0, 0, '2026-02-26T12:48:15.559Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '사다리꼴의 넓이는?', NULL, '(윗변+아랫변)*(높이)/2', '사다리꼴', 1, 0, 0, '2026-02-26T12:48:39.705Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '대각선 길이가 주어졌을 때 마름모의 넓이는?', NULL, '대각선*대각선/2', '마름모', 2, 1, 0, '2026-02-26T12:50:15.133Z', '2026-03-16T08:48:47.056Z'
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '직사각형이란?', NULL, '네각이 모두 직각이고, 마주 보는 두 변의 길이가 같은 사각형', '직사각형', 1, 0, 0, '2026-02-26T12:53:09.555Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '정사각형이란?', NULL, '네 각이 모두 직각이고, 네 변의 길이가 모두 같은 사각형', '직사각형', 1, 0, 0, '2026-02-26T12:53:26.097Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '평행사변평이란?', NULL, '마주 보는 두 변이 서로 평핸한 사각형', NULL, 3, 2, 0, '2026-02-26T12:54:25.768Z', '2026-03-21T10:06:11.351Z'
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '변', NULL, '다각형이나 각을 이루는 선분', NULL, 1, 0, 1, '2026-02-26T12:54:48.049Z', '2026-03-21T10:07:50.329Z'
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '꼭짓점이란?', NULL, '각을 이루는 변과 변 또는 모서리와 모서리가 만나는 점', NULL, 1, 2, 3, '2026-02-26T12:55:20.871Z', '2026-03-21T10:05:21.865Z'
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '원이란?', NULL, '한점으로부터 같은 길이가 같은 점들의 집합', NULL, 1, 0, 2, '2026-02-26T12:57:20.402Z', '2026-03-21T10:15:09.146Z'
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '이차식', NULL, '다항식의 각 항의 차수 중에서 가장 큰 차수가 2인 다항식', NULL, 2, 1, 0, '2026-03-03T11:23:54.589Z', '2026-03-05T06:51:02.739Z'
FROM students WHERE name = '윤지후';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '거리는?', NULL, '속력*시간', NULL, 1, 0, 0, '2026-03-07T03:26:04.723Z', NULL
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '속력은?', NULL, '거리/시간', NULL, 1, 0, 0, '2026-03-07T03:26:15.389Z', NULL
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '속력은?', NULL, '거리/시간', NULL, 1, 0, 0, '2026-03-07T03:26:22.271Z', NULL
FROM students WHERE name = '최예지';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', 'apple', NULL, '사과', NULL, 1, 0, 0, '2026-03-12T05:15:49.282Z', NULL
FROM students WHERE name = '영어유저';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '원에 꼭 맞게 들어가는 마름모의 대각선 길이와 원의 어떤 길이가 같나요?', NULL, '원의 지름 (반지름 × 2)', '원내접마름모', 1, 0, 0, '2026-03-16T01:08:48.369Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '직사각형 종이를 대각선으로 접으면 생기는 두 삼각형의 관계는?', NULL, '합동 — 넓이가 서로 같다', '종이접기', 1, 0, 0, '2026-03-16T01:08:48.369Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '삼각형의 넓이와 밑변을 알 때, 높이를 구하는 방법은?', NULL, '높이 = 넓이 × 2 ÷ 밑변', '넓이역산', 1, 0, 0, '2026-03-16T01:08:48.369Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '복잡한 도형의 넓이를 구하는 전략은?', NULL, '단순 도형으로 분리 후 합산 또는 빼기', '복잡한도형', 1, 0, 0, '2026-03-16T01:08:48.369Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '색칠된 부분의 넓이를 구하는 방법은?', NULL, '전체 − 색칠 안 된 부분, 또는 각 도형 넓이 합산', '색칠부분', 1, 0, 0, '2026-03-16T01:08:48.369Z', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '넓이의 단위 변환: 1m² = 몇 cm²인가요?', NULL, '10,000cm²  (1m = 100cm이므로 1m² = 100 × 100 = 10,000cm²)', '넓이단위', 1, 0, 0, '1773649037592', NULL
FROM students WHERE name = '김시우';
INSERT INTO cards (student_id, type, question, question_image, answer, topic, box, success_count, fail_count, created_at, last_review)
SELECT id, 'text', '단위 변환: 1km² = 몇 m²인가요?', NULL, '1,000,000m²  (1km = 1000m이므로 1km² = 1000 × 1000 = 1,000,000m²)', '단위변환', 1, 0, 0, '1773649037593', NULL
FROM students WHERE name = '김시우';