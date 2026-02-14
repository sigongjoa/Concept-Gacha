-- ============================================
-- Concept-Gacha Supabase Database Schema
-- ============================================
-- 이 파일을 Supabase SQL Editor에서 실행하세요
-- https://app.supabase.com/project/_/sql

-- ============================================
-- 1. Students Table
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스: 이름 검색 최적화
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);

-- ============================================
-- 2. Cards Table
-- ============================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image')),
  question TEXT,
  question_image TEXT, -- Supabase Storage 파일 경로
  answer TEXT,
  box INTEGER NOT NULL DEFAULT 1 CHECK (box BETWEEN 1 AND 4),
  success_count INTEGER NOT NULL DEFAULT 0,
  fail_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_review TIMESTAMPTZ
);

-- 인덱스: 쿼리 성능 최적화
CREATE INDEX IF NOT EXISTS idx_cards_student_id ON cards(student_id);
CREATE INDEX IF NOT EXISTS idx_cards_box ON cards(box);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at DESC);

-- ============================================
-- 3. Row Level Security (RLS) 정책
-- ============================================
-- 현재는 인증 없이 공개 접근 허용
-- 향후 인증 추가 시 정책 수정 필요

-- Students 테이블 RLS 활성화
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기/쓰기 허용 (인증 없음)
CREATE POLICY "Public access for students" ON students
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Cards 테이블 RLS 활성화
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기/쓰기 허용 (인증 없음)
CREATE POLICY "Public access for cards" ON cards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. 테스트 데이터 (선택사항)
-- ============================================
-- 아래 주석을 해제하면 테스트 데이터가 삽입됩니다

-- INSERT INTO students (name) VALUES ('테스트학생');
-- 
-- INSERT INTO cards (student_id, type, question, answer, box)
-- VALUES (
--   (SELECT id FROM students WHERE name = '테스트학생'),
--   'text',
--   '1 + 1 = ?',
--   '2',
--   1
-- );

-- ============================================
-- 5. 유용한 쿼리 (참고용)
-- ============================================

-- 모든 학생과 카드 수 조회
-- SELECT 
--   s.id,
--   s.name,
--   COUNT(c.id) as card_count
-- FROM students s
-- LEFT JOIN cards c ON s.id = c.student_id
-- GROUP BY s.id, s.name
-- ORDER BY s.created_at DESC;

-- 특정 학생의 box별 카드 분포
-- SELECT 
--   box,
--   COUNT(*) as count
-- FROM cards
-- WHERE student_id = 'YOUR_STUDENT_ID'
-- GROUP BY box
-- ORDER BY box;

-- ============================================
-- 향후 인증 추가 시 사용할 스키마 (참고용)
-- ============================================

-- Students 테이블에 owner_id 컬럼 추가
-- ALTER TABLE students ADD COLUMN owner_id UUID REFERENCES auth.users(id);

-- RLS 정책 업데이트 (사용자별 데이터 분리)
-- DROP POLICY "Public access for students" ON students;
-- CREATE POLICY "Users can manage own students" ON students
--   FOR ALL
--   USING (auth.uid() = owner_id)
--   WITH CHECK (auth.uid() = owner_id);

-- DROP POLICY "Public access for cards" ON cards;
-- CREATE POLICY "Users can manage own cards" ON cards
--   FOR ALL
--   USING (
--     student_id IN (
--       SELECT id FROM students WHERE owner_id = auth.uid()
--     )
--   )
--   WITH CHECK (
--     student_id IN (
--       SELECT id FROM students WHERE owner_id = auth.uid()
--     )
--   );
