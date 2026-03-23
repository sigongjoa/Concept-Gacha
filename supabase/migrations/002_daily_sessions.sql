-- ============================================
-- Migration 002: Daily Sessions
-- 일일 학습 세션 추적 시스템
-- ============================================
-- Supabase SQL Editor에서 실행하세요
-- https://app.supabase.com/project/_/sql

-- ============================================
-- 1. daily_sessions 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS daily_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  cards_drawn     INT NOT NULL DEFAULT 0,
  cards_target    INT NOT NULL DEFAULT 10,
  completed       BOOLEAN GENERATED ALWAYS AS (cards_drawn >= cards_target) STORED,
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  UNIQUE (student_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_sessions_student_date
  ON daily_sessions(student_id, session_date DESC);

-- ============================================
-- 2. session_cards 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS session_cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES daily_sessions(id) ON DELETE CASCADE,
  card_id     UUID REFERENCES cards(id) ON DELETE SET NULL,
  result      TEXT CHECK (result IN ('success', 'fail')),
  box_before  INT,
  box_after   INT,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_cards_session
  ON session_cards(session_id);

-- ============================================
-- 3. RLS 정책
-- ============================================
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_cards   ENABLE ROW LEVEL SECURITY;

-- daily_sessions: 현재는 공개 접근 허용 (인증 도입 전)
CREATE POLICY "Public access for daily_sessions" ON daily_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- session_cards: 현재는 공개 접근 허용 (인증 도입 전)
CREATE POLICY "Public access for session_cards" ON session_cards
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- (선택) 인증 도입 후 사용할 정책 (주석 처리)
-- ============================================
-- DROP POLICY "Public access for daily_sessions" ON daily_sessions;
-- CREATE POLICY "sessions_self" ON daily_sessions
--   FOR ALL USING (
--     student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
--   );
--
-- DROP POLICY "Public access for session_cards" ON session_cards;
-- CREATE POLICY "session_cards_self" ON session_cards
--   FOR ALL USING (
--     session_id IN (
--       SELECT id FROM daily_sessions
--       WHERE student_id IN (SELECT id FROM students WHERE auth_id = auth.uid())
--     )
--   );

-- ============================================
-- 4. 완료 시각 자동 기록 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_session_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- cards_drawn이 cards_target에 도달하면 completed_at 기록
  IF NEW.cards_drawn >= NEW.cards_target AND OLD.cards_drawn < OLD.cards_target THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_session_completed
  BEFORE UPDATE ON daily_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_completed_at();
