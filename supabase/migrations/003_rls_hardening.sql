-- ============================================
-- Migration 003: RLS Hardening
-- 공개 접근 → 학생 본인 데이터만 접근 허용
-- ============================================
-- ⚠️ 이 마이그레이션은 students 테이블에 auth_id 컬럼이 추가된 후 적용
-- 현재는 준비 파일이며 인증 시스템 도입 후 활성화하세요

-- ============================================
-- 1. Supabase Auth increment RPC 함수
--    (race condition 없는 카운터 증가)
-- ============================================
CREATE OR REPLACE FUNCTION increment_cards_drawn(session_id UUID)
RETURNS SETOF daily_sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE daily_sessions
  SET cards_drawn = cards_drawn + 1
  WHERE id = session_id;

  RETURN QUERY SELECT * FROM daily_sessions WHERE id = session_id;
END;
$$;

-- ============================================
-- 2. students 테이블에 auth_id 추가 (인증 연동)
-- ============================================
-- ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);
-- CREATE INDEX IF NOT EXISTS idx_students_auth_id ON students(auth_id);

-- ============================================
-- 3. 인증 기반 RLS 정책 (활성화 전 위 ALTER 먼저 실행)
-- ============================================

-- students: 본인 레코드만
-- DROP POLICY IF EXISTS "Public access for students" ON students;
-- CREATE POLICY "students_own" ON students
--   FOR ALL USING (auth_id = auth.uid())
--   WITH CHECK (auth_id = auth.uid());

-- cards: 본인 카드만
-- DROP POLICY IF EXISTS "Public access for cards" ON cards;
-- CREATE POLICY "cards_own" ON cards
--   FOR ALL USING (
--     student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
--   )
--   WITH CHECK (
--     student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
--   );

-- daily_sessions: 본인 세션만
-- DROP POLICY IF EXISTS "Public access for daily_sessions" ON daily_sessions;
-- CREATE POLICY "sessions_own" ON daily_sessions
--   FOR ALL USING (
--     student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
--   );

-- session_cards: 본인 세션의 카드만
-- DROP POLICY IF EXISTS "Public access for session_cards" ON session_cards;
-- CREATE POLICY "session_cards_own" ON session_cards
--   FOR ALL USING (
--     session_id IN (
--       SELECT ds.id FROM daily_sessions ds
--       JOIN students s ON s.id = ds.student_id
--       WHERE s.auth_id = auth.uid()
--     )
--   );

-- ============================================
-- 4. 선생님 역할 정책 (service_role key 사용)
-- ============================================
-- 선생님은 service_role key로 bypass → 별도 정책 불필요
-- 또는 app_metadata.role = 'teacher' 확인:
--
-- CREATE POLICY "teacher_all_students" ON students
--   FOR ALL USING (
--     auth.jwt() ->> 'role' = 'teacher'
--     OR auth_id = auth.uid()
--   );
