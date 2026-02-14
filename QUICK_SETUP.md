# Supabase 프로젝트 빠른 설정 가이드

이 가이드는 **실제로 테스트할 수 있도록** Supabase 프로젝트를 빠르게 설정하는 방법입니다.

---

## 🚀 1단계: Supabase 프로젝트 생성 (5분)

### 1. Supabase 가입 및 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. **Start your project** 클릭 (GitHub 계정으로 로그인 가능)
3. **New Project** 클릭
4. 프로젝트 정보 입력:
   ```
   Name: concept-gacha-test
   Database Password: [안전한 비밀번호 생성 - 저장 필수!]
   Region: Northeast Asia (Seoul)
   ```
5. **Create new project** 클릭 → 약 2분 대기

---

## 📊 2단계: 데이터베이스 설정 (2분)

### 1. SQL 스키마 실행

1. 좌측 메뉴 **SQL Editor** 클릭
2. **New query** 클릭
3. 아래 SQL 복사하여 붙여넣기:

```sql
-- Students 테이블
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_name ON students(name);

-- Cards 테이블
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image')),
  question TEXT,
  question_image TEXT,
  answer TEXT,
  box INTEGER NOT NULL DEFAULT 1 CHECK (box BETWEEN 1 AND 4),
  success_count INTEGER NOT NULL DEFAULT 0,
  fail_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_review TIMESTAMPTZ
);

CREATE INDEX idx_cards_student_id ON cards(student_id);
CREATE INDEX idx_cards_box ON cards(box);

-- RLS 정책 (공개 접근)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for cards" ON cards FOR ALL USING (true) WITH CHECK (true);

-- 테스트 데이터
INSERT INTO students (name) VALUES ('테스트학생');
INSERT INTO cards (student_id, type, question, answer, box)
VALUES (
  (SELECT id FROM students WHERE name = '테스트학생'),
  'text', '1+1=?', '2', 1
);
```

4. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
5. 성공 메시지 확인: `Success. No rows returned`

### 2. 테이블 확인

좌측 메뉴 **Table Editor** → `students`, `cards` 테이블 확인

---

## 🗂️ 3단계: Storage 설정 (1분)

1. 좌측 메뉴 **Storage** 클릭
2. **New bucket** 클릭
3. 버킷 설정:
   ```
   Name: card-images
   Public bucket: ✅ 체크
   ```
4. **Create bucket** 클릭

---

## 🔑 4단계: API 키 복사 (1분)

1. 좌측 메뉴 **Settings** → **API** 클릭
2. 다음 정보 복사:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💻 5단계: 로컬 프로젝트 설정 (1분)

### 1. API 키 입력

`public/js/supabase-client.js` 파일 열기:

```javascript
// 10-11번 줄 수정
const SUPABASE_URL = 'https://xxxxx.supabase.co'  // 여기에 Project URL 붙여넣기
const SUPABASE_ANON_KEY = 'eyJhbGci...'           // 여기에 anon public 키 붙여넣기
```

### 2. 저장 확인

파일 저장 후 다음 명령어로 확인:

```bash
grep -n "YOUR_SUPABASE" public/js/supabase-client.js
```

출력이 없으면 성공! (YOUR_SUPABASE가 실제 값으로 대체됨)

---

## 🧪 6단계: 로컬 테스트 (2분)

### 1. 로컬 서버 실행

```bash
cd public
python3 -m http.server 8000
```

또는

```bash
npx serve public
```

### 2. 브라우저 접속

`http://localhost:8000` 접속

### 3. 브라우저 콘솔 확인

1. `F12` 눌러 개발자 도구 열기
2. **Console** 탭 확인
3. 다음 메시지 확인:

```
✅ Supabase 연결 성공!
```

### 4. 기능 테스트

- [ ] 학생 목록에 "테스트학생" 표시 확인
- [ ] "테스트학생" 클릭 → 가챠 페이지 이동
- [ ] 카드 뽑기 버튼 클릭 → "1+1=?" 카드 표시
- [ ] 정답 보기 → "2" 표시
- [ ] "알고 있었다" 클릭 → 성공 메시지

---

## ✅ 완료!

모든 기능이 정상 작동하면 Supabase 마이그레이션 완료입니다!

---

## 🐛 문제 해결

### "Supabase 연결 실패" 에러

**원인**: API 키가 올바르지 않음

**해결**:
1. `public/js/supabase-client.js` 파일 확인
2. SUPABASE_URL과 SUPABASE_ANON_KEY가 실제 값으로 대체되었는지 확인
3. Supabase 대시보드 Settings → API에서 키 재확인

### CORS 에러

**원인**: Supabase에서 localhost를 허용하지 않음 (드물음)

**해결**:
1. Supabase 대시보드 Settings → API → URL Configuration
2. Site URL에 `http://localhost:8000` 추가

### "RLS policy violation" 에러

**원인**: RLS 정책이 올바르지 않음

**해결**:
1. SQL Editor에서 다음 실행:
```sql
DROP POLICY IF EXISTS "Public access for students" ON students;
DROP POLICY IF EXISTS "Public access for cards" ON cards;

CREATE POLICY "Public access for students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for cards" ON cards FOR ALL USING (true) WITH CHECK (true);
```

---

## 📚 다음 단계

테스트 완료 후:

1. **데이터 마이그레이션** (기존 data.json이 있다면)
   ```bash
   cd scripts
   npm install
   SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npm run migrate
   ```

2. **GitHub Pages 배포**
   - GitHub 리포지토리 Settings → Pages
   - Source: GitHub Actions 선택
   - `main` 브랜치에 푸시

3. **추가 기능 개발**
   - 사용자 인증 (Supabase Auth)
   - 실시간 업데이트 (Supabase Realtime)
   - 통계 대시보드 개선
