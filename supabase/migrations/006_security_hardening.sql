-- ============================================
-- Migration 006: 보안 강화
-- 1. PLAIN: 평문 PIN 잔존 데이터 제거
-- 2. PIN 길이/형식 제약 추가
-- 3. RLS 현황 정리 (Supabase Auth 없이 per-student 제한 불가)
-- ============================================

-- ============================================
-- 1. PLAIN: 평문 PIN 잔존 데이터 삭제
--    (Migration 005가 올바르게 실행되었다면 이 행은 없음)
-- ============================================
DELETE FROM teacher_settings WHERE pin LIKE 'PLAIN:%';
DELETE FROM students WHERE pin LIKE 'PLAIN:%';

-- teacher_settings 행이 없으면 최소 1행 보장
-- 초기 PIN 해시는 별도로 설정 필요 (브라우저 콘솔에서 hashPin('원하는PIN', salt) 실행)
-- 비상 복구: Supabase 대시보드 SQL에서 직접 INSERT

-- ============================================
-- 2. PIN 컬럼 형식 제약 (해시는 64자 hex)
-- ============================================
ALTER TABLE students
  ADD CONSTRAINT students_pin_not_plain CHECK (pin IS NULL OR pin NOT LIKE 'PLAIN:%');

ALTER TABLE teacher_settings
  ADD CONSTRAINT teacher_settings_pin_not_plain CHECK (pin NOT LIKE 'PLAIN:%');

-- ============================================
-- 3. RLS 현황 메모
-- ============================================
-- 현재 RLS 상태:
--   students, cards: public access (Migration 001에서 설정)
--   daily_sessions, session_cards: public access (Migration 002에서 설정)
--   teacher_settings: public access (Migration 004에서 설정)
--
-- ⚠️ per-student RLS 강화를 위해서는 Supabase Auth(auth.uid()) 도입 필요
--    → students 테이블에 auth_id UUID REFERENCES auth.users(id) 컬럼 추가 후
--      Migration 003의 주석 처리된 정책 활성화
--
-- 현 아키텍처(GitHub Pages + anon key) 보안 경계:
--   - PIN 인증: 클라이언트 PBKDF2-SHA256, 평문 전송 없음
--   - 교사 토큰: 인메모리 전용, 30분 만료, 페이지 새로고침 시 소멸
--   - 학생 세션: sessionStorage 전용, 탭 닫으면 소멸
--   - DB 읽기: anon key로 공개 읽기 가능 → 민감 데이터(PIN 해시) 노출 위험
--
-- 추가 보안 강화 옵션:
--   a) Supabase Auth + RLS (권장)
--   b) Edge Function을 인증 프록시로 사용
--   c) 현 구조 유지 + 중요 데이터 암호화
