# Supabase Auth 배포 가이드

## 🚀 빠른 시작

### 1단계: 데이터베이스 마이그레이션

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **SQL Editor 열기**
   - 왼쪽 메뉴 → SQL Editor

3. **마이그레이션 SQL 실행**
   - [`supabase/auth_migration.sql`](file:///mnt/d/progress/mathesis/node8_concept_gacha/supabase/auth_migration.sql) 파일 내용 복사
   - SQL Editor에 붙여넣기
   - **Run** 버튼 클릭

4. **결과 확인**
   ```sql
   -- students 테이블 구조 확인
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'students';
   
   -- user_id 컬럼이 있어야 함
   ```

---

### 2단계: 테스트 사용자 생성

#### 방법 A: 회원가입 페이지 (권장)

1. 로컬 서버 실행
   ```bash
   cd /mnt/d/progress/mathesis/node8_concept_gacha/public
   python3 -m http.server 8000
   ```

2. 브라우저에서 접속
   ```
   http://localhost:8000/signup.html
   ```

3. 회원가입
   - 이름: 테스트사용자
   - 이메일: test@example.com
   - 비밀번호: test123456

4. 자동 로그인 확인

#### 방법 B: Supabase Dashboard

1. **Authentication → Users → Add User**
2. 이메일/비밀번호 입력
3. **Students 테이블 확인**
   ```sql
   SELECT * FROM students WHERE user_id = (
     SELECT id FROM auth.users WHERE email = 'test@example.com'
   );
   ```

---

### 3단계: 기능 테스트

#### ✅ 로그인/로그아웃
- [ ] `/login.html`에서 로그인
- [ ] 대시보드(`/index.html`)로 리다이렉트
- [ ] 사용자 이름 표시 확인
- [ ] 로그아웃 버튼 클릭
- [ ] `/login.html`로 리다이렉트

#### ✅ 카드 추가
- [ ] "카드 추가" 클릭
- [ ] 텍스트 카드 추가 (질문/정답)
- [ ] 이미지 카드 추가 (이미지/정답)
- [ ] "카드 목록"에서 확인

#### ✅ 가챠 실행
- [ ] "가챠 시작" 클릭
- [ ] 랜덤 카드 뽑기
- [ ] 정답 보기
- [ ] "알고 있었다" / "몰랐다" 피드백

#### ✅ 다중 사용자 격리
- [ ] 사용자 A로 로그인 → 카드 추가
- [ ] 로그아웃
- [ ] 사용자 B로 로그인
- [ ] 사용자 A의 카드 안 보임 ✅
- [ ] 사용자 B 카드 추가
- [ ] 각자 본인 카드만 관리

---

### 4단계: GitHub Pages 배포

1. **Git 커밋 및 푸시**
   ```bash
   cd /mnt/d/progress/mathesis/node8_concept_gacha
   git add .
   git commit -m "feat: Add Supabase Authentication system"
   git push origin main
   ```

2. **GitHub Actions 확인**
   - GitHub 리포지토리 → Actions 탭
   - 배포 워크플로우 실행 확인

3. **배포된 사이트 접속**
   ```
   https://YOUR_USERNAME.github.io/Concept-Gacha/
   ```

---

## 📋 체크리스트

### 데이터베이스
- [ ] `auth_migration.sql` 실행 완료
- [ ] `students` 테이블에 `user_id` 컬럼 추가됨
- [ ] RLS 정책 변경됨 (공개 → user_id 기반)
- [ ] Database Trigger 생성됨

### 로컬 테스트
- [ ] 회원가입 성공
- [ ] 로그인/로그아웃 작동
- [ ] 카드 CRUD 작동
- [ ] 다중 사용자 격리 확인

### 배포
- [ ] GitHub에 푸시 완료
- [ ] GitHub Actions 배포 성공
- [ ] 배포된 사이트에서 테스트 완료

---

## 🐛 문제 해결

### 문제 1: "학생 정보를 찾을 수 없습니다"

**원인**: Database Trigger가 작동하지 않음

**해결**:
```sql
-- Trigger 확인
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Trigger 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_student_for_new_user();
```

### 문제 2: RLS 정책 오류

**원인**: RLS 정책이 제대로 설정되지 않음

**해결**:
```sql
-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Public access for students" ON students;
DROP POLICY IF EXISTS "Public access for cards" ON cards;

-- auth_migration.sql의 RLS 정책 부분 재실행
```

### 문제 3: 로그인 후 리다이렉트 안 됨

**원인**: `auth.js`의 `requireAuth` 함수 문제

**해결**:
- 브라우저 콘솔 확인
- `supabase-client.js`의 API 키 확인
- 네트워크 탭에서 Supabase 요청 확인

---

## 📚 참고 파일

- [구현 계획](file:///root/.gemini/antigravity/brain/c3bae362-a995-41e1-9523-e215def139f1/implementation_plan.md)
- [브레인스토밍](file:///root/.gemini/antigravity/brain/c3bae362-a995-41e1-9523-e215def139f1/brainstorming_auth_integration.md)
- [Walkthrough](file:///root/.gemini/antigravity/brain/c3bae362-a995-41e1-9523-e215def139f1/walkthrough.md)
- [데이터베이스 마이그레이션 SQL](file:///mnt/d/progress/mathesis/node8_concept_gacha/supabase/auth_migration.sql)

---

## ✅ 완료!

모든 단계를 완료하면 Supabase Auth가 정상적으로 작동합니다! 🎉
