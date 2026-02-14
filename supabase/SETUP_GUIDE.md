# Supabase 설정 가이드

이 가이드는 Concept-Gacha 프로젝트를 위한 Supabase 설정 방법을 안내합니다.

---

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 후 로그인
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `concept-gacha` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 생성 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` 권장
4. **Create new project** 클릭 (약 2분 소요)

---

## 2. 데이터베이스 스키마 생성

1. Supabase 대시보드 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase/schema.sql` 파일 내용 전체 복사
4. SQL Editor에 붙여넣기
5. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
6. 성공 메시지 확인: `Success. No rows returned`

### 검증

좌측 메뉴 **Table Editor**에서 다음 테이블 확인:
- ✅ `students` 테이블
- ✅ `cards` 테이블

---

## 3. Storage 버킷 생성

1. 좌측 메뉴에서 **Storage** 클릭
2. **New bucket** 클릭
3. 버킷 설정:
   - **Name**: `card-images`
   - **Public bucket**: ✅ 체크 (이미지 URL 직접 접근 가능)
4. **Create bucket** 클릭

### 버킷 정책 설정 (선택사항)

파일 업로드/삭제를 제한하려면:

1. `card-images` 버킷 클릭
2. **Policies** 탭 클릭
3. **New policy** 클릭
4. 다음 정책 추가:

```sql
-- 모든 사용자 업로드 허용
CREATE POLICY "Public upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'card-images');

-- 모든 사용자 읽기 허용
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'card-images');

-- 모든 사용자 삭제 허용
CREATE POLICY "Public delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'card-images');
```

---

## 4. API 키 확인

1. 좌측 메뉴에서 **Settings** → **API** 클릭
2. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** 키: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

> ⚠️ **중요**: `service_role` 키는 절대 프론트엔드에 노출하지 마세요!

---

## 5. 프론트엔드 설정

### 방법 1: 코드에 직접 포함 (권장)

`public/js/supabase-client.js` 파일에서:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'  // 여기에 Project URL 입력
const SUPABASE_ANON_KEY = 'eyJhbGci...'           // 여기에 anon public 키 입력
```

> 💡 **안전한 이유**: `anon` 키는 공개되어도 안전합니다. Row Level Security (RLS)로 보호됩니다.

### 방법 2: 환경 변수 사용 (빌드 도구 필요)

Vite 등 빌드 도구 사용 시:

1. `.env` 파일 생성:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

2. `supabase-client.js`에서:
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
```

---

## 6. 테스트

### 데이터베이스 테스트

SQL Editor에서 실행:

```sql
-- 테스트 학생 추가
INSERT INTO students (name) VALUES ('테스트학생');

-- 학생 조회
SELECT * FROM students;

-- 테스트 카드 추가
INSERT INTO cards (student_id, type, question, answer, box)
VALUES (
  (SELECT id FROM students WHERE name = '테스트학생'),
  'text', '1+1=?', '2', 1
);

-- 카드 조회
SELECT * FROM cards;
```

### Storage 테스트

1. Storage → `card-images` 버킷 클릭
2. **Upload file** 클릭
3. 테스트 이미지 업로드
4. 업로드된 파일 클릭 → **Get URL** → 브라우저에서 URL 접속 확인

---

## 7. CORS 설정 (GitHub Pages 배포 시)

GitHub Pages URL을 Supabase에 등록:

1. **Settings** → **API** → **URL Configuration**
2. **Site URL** 또는 **Redirect URLs**에 추가:
   - `https://yourusername.github.io`
   - `https://yourusername.github.io/concept-gacha`

---

## 8. 데이터 마이그레이션 (기존 데이터 이전)

기존 `data.json` 데이터를 Supabase로 이전하려면:

```bash
# 마이그레이션 스크립트 실행 (Phase 4에서 생성 예정)
npm install @supabase/supabase-js
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/migrate-to-supabase.js
```

> ⚠️ **주의**: `service_role` 키 필요 (Settings → API → service_role secret)

---

## 문제 해결

### RLS 정책 오류

에러: `new row violates row-level security policy`

**해결**: SQL Editor에서 RLS 정책 확인:

```sql
-- 현재 정책 확인
SELECT * FROM pg_policies WHERE tablename IN ('students', 'cards');

-- 정책 재생성 (필요 시)
DROP POLICY IF EXISTS "Public access for students" ON students;
CREATE POLICY "Public access for students" ON students FOR ALL USING (true) WITH CHECK (true);
```

### Storage 업로드 실패

에러: `The resource already exists`

**해결**: 파일명 중복. 타임스탬프 + 랜덤 문자열 사용

### CORS 에러

에러: `Access to fetch at 'https://xxx.supabase.co' from origin 'https://xxx.github.io' has been blocked by CORS policy`

**해결**: 
1. Supabase Settings → API → URL Configuration에 GitHub Pages URL 추가
2. 브라우저 캐시 삭제 후 재시도

---

## 다음 단계

✅ Supabase 설정 완료!

이제 프론트엔드 코드를 수정하여 Supabase API를 사용하도록 변경하세요:
- `public/js/supabase-client.js` 작성
- `public/js/api.js` 마이그레이션
- HTML 파일 업데이트
