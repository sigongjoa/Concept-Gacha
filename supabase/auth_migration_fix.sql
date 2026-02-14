-- ============================================
-- Supabase Auth 통합 마이그레이션 (수정본)
-- ============================================
-- 문제: Trigger에서 INSERT 시 RLS 정책 위반
-- 해결: SECURITY DEFINER + 서비스 역할 권한 부여

-- ============================================
-- 1. 기존 Trigger 및 함수 삭제
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_student_for_new_user();

-- ============================================
-- 2. 수정된 Trigger 함수 생성
-- ============================================
-- SECURITY DEFINER: 함수가 소유자(postgres) 권한으로 실행됨
-- 이렇게 하면 RLS 정책을 우회할 수 있음

CREATE OR REPLACE FUNCTION create_student_for_new_user()
RETURNS TRIGGER 
SECURITY DEFINER  -- 중요! 이게 있어야 RLS 우회 가능
SET search_path = public
AS $$
BEGIN
  -- students 테이블에 새 레코드 삽입
  INSERT INTO public.students (user_id, name)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 에러 로깅 (선택사항)
    RAISE LOG 'Error in create_student_for_new_user: %', SQLERRM;
    RETURN NEW;  -- 에러가 나도 사용자 생성은 계속 진행
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Trigger 재생성
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_student_for_new_user();

-- ============================================
-- 4. 함수 권한 부여
-- ============================================
-- postgres 역할에 students 테이블 INSERT 권한 부여
GRANT INSERT ON public.students TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================
-- 5. 확인 쿼리
-- ============================================
-- Trigger 확인
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 함수 확인
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'create_student_for_new_user';
-- prosecdef가 true면 SECURITY DEFINER 설정됨
