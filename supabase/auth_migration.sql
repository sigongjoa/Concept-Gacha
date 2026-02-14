-- ============================================
-- Supabase Auth 통합 마이그레이션
-- ============================================
-- 목적: 사용자 인증 시스템 추가 및 RLS 정책 수정

-- ============================================
-- 1. 기존 테스트 데이터 삭제
-- ============================================
DELETE FROM cards;
DELETE FROM students;

-- ============================================
-- 2. Students 테이블 수정
-- ============================================

-- user_id 컬럼 추가
ALTER TABLE students 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- UNIQUE 제약조건 추가 (한 사용자당 하나의 student)
ALTER TABLE students 
ADD CONSTRAINT students_user_id_unique UNIQUE (user_id);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_students_user_id ON students(user_id);

-- ============================================
-- 3. RLS 정책 삭제 (기존 공개 접근)
-- ============================================

-- Students 테이블
DROP POLICY IF EXISTS "Public access for students" ON students;

-- Cards 테이블
DROP POLICY IF EXISTS "Public access for cards" ON cards;

-- ============================================
-- 4. 새로운 RLS 정책 생성 (user_id 기반)
-- ============================================

-- Students 테이블 RLS 정책
-- 본인 레코드만 조회
CREATE POLICY "Users can view own student" ON students
  FOR SELECT USING (auth.uid() = user_id);

-- 본인 레코드만 수정
CREATE POLICY "Users can update own student" ON students
  FOR UPDATE USING (auth.uid() = user_id);

-- 회원가입 시 자동 생성 (Trigger가 처리)
CREATE POLICY "Users can insert own student" ON students
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 레코드만 삭제
CREATE POLICY "Users can delete own student" ON students
  FOR DELETE USING (auth.uid() = user_id);

-- Cards 테이블 RLS 정책
-- 본인 학생의 카드만 조회
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- 본인 학생의 카드만 추가
CREATE POLICY "Users can insert own cards" ON cards
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- 본인 학생의 카드만 수정
CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- 본인 학생의 카드만 삭제
CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 5. Database Trigger 생성
-- ============================================

-- 함수: 새 사용자 생성 시 Student 레코드 자동 생성
CREATE OR REPLACE FUNCTION create_student_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- raw_user_meta_data에서 이름 가져오기, 없으면 이메일 앞부분 사용
  INSERT INTO students (user_id, name)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auth.users에 새 레코드 삽입 시 실행
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_student_for_new_user();

-- ============================================
-- 6. 완료 확인
-- ============================================

-- Students 테이블 구조 확인
\d students

-- RLS 정책 확인
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('students', 'cards');

-- Trigger 확인
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- 마이그레이션 완료!
-- ============================================
-- 다음 단계:
-- 1. Supabase Dashboard에서 테스트 사용자 생성
-- 2. Students 테이블에 자동으로 레코드 생성되는지 확인
-- 3. 프론트엔드 인증 UI 구현
