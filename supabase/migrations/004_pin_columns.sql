-- ============================================
-- Migration 004: PIN 컬럼 + 선생님 설정 테이블
-- GitHub Pages 배포용 (서버 없음 → 클라이언트 PIN 검증)
-- ============================================

-- ============================================
-- 1. students 테이블에 PIN 컬럼 추가
-- ============================================
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS pin      TEXT,
  ADD COLUMN IF NOT EXISTS pin_salt TEXT;

-- ============================================
-- 2. 선생님 설정 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS teacher_settings (
  id         INT PRIMARY KEY DEFAULT 1,  -- 항상 1개 행만 존재
  pin        TEXT NOT NULL,
  pin_salt   TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT teacher_settings_single CHECK (id = 1)
);

ALTER TABLE teacher_settings ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기/쓰기 (PIN 검증은 클라이언트에서 해시 비교)
CREATE POLICY "Public access for teacher_settings" ON teacher_settings
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 3. 초기 선생님 PIN 설정 (기본값: 1234)
-- ============================================
-- PIN "1234"의 PBKDF2-SHA256 해시를 삽입
-- 실제 값은 아래 INSERT 전에 브라우저 콘솔에서 계산:
--   const salt = crypto.getRandomValues(new Uint8Array(16))
--   ...
-- 임시로 평문 저장 후 첫 로그인 시 해시로 교체하는 방식 사용
INSERT INTO teacher_settings (id, pin, pin_salt)
VALUES (1, 'PLAIN:1234', 'none')
ON CONFLICT (id) DO NOTHING;
