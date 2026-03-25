require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { promisify } = require('util');
const archiver = require('archiver');
const execFileAsync = promisify(execFile);
const { createClient } = require('@supabase/supabase-js');

// ── Supabase 클라이언트 (서버 전용 — 크리덴셜 브라우저 비노출) ─────
const _supabaseUrl = process.env.SUPABASE_URL;
const _supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
if (!_supabaseUrl || !_supabaseKey) {
  console.warn('[WARN] SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수 미설정. Supabase API 비활성화.');
}
const supabase = (_supabaseUrl && _supabaseKey)
  ? createClient(_supabaseUrl, _supabaseKey)
  : null;

function requireSB(res) {
  if (!supabase) { res.status(503).json({ error: 'Supabase 환경변수 미설정 (.env 확인)' }); return false; }
  return true;
}
function sbCheck({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

const PRINT_DIR = path.join(__dirname, 'print');
const PRINT_TMP = path.join(PRINT_DIR, 'tmp');
if (!fs.existsSync(PRINT_TMP)) fs.mkdirSync(PRINT_TMP, { recursive: true });

const app = express();
const _corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3002', 'http://127.0.0.1:3002'];
app.use(cors({ origin: _corsOrigins }));
app.use(express.json());
app.use(express.static('public'));

// ── PIN 해싱 (PBKDF2) ──────────────────────────────────────
function hashPin(pin, salt) {
  return crypto.pbkdf2Sync(String(pin), salt, 10000, 32, 'sha256').toString('hex');
}
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

// ── 선생님 세션 토큰 (서버 메모리) ───────────────────────────
const teacherSessions = new Map(); // token → expiresAt
function createTeacherToken() {
  const token = crypto.randomBytes(32).toString('hex');
  teacherSessions.set(token, Date.now() + 30 * 60 * 1000); // 30분
  return token;
}
function validateTeacherToken(token) {
  if (!token) return false;
  const exp = teacherSessions.get(token);
  if (!exp) return false;
  if (Date.now() > exp) { teacherSessions.delete(token); return false; }
  return true;
}

// ── 로그인 시도 횟수 제한 (5회 / 15분) ───────────────────────
const loginAttempts = new Map();
function checkRateLimit(key) {
  const now = Date.now();
  const rec = loginAttempts.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + 15 * 60 * 1000; }
  if (rec.count >= 5) return false;
  rec.count++;
  loginAttempts.set(key, rec);
  return true;
}
function resetRateLimit(key) { loginAttempts.delete(key); }

// ── 인메모리 캐시 ─────────────────────────────────────────
let _dataCache = null;
let _dataCacheMtime = 0;

// 이미지 업로드 설정
const ASSETS_DIR = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ASSETS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다'));
    }
  }
});

// 데이터 파일 경로
const DATA_FILE = path.join(__dirname, 'data.json');

// 데이터 로드
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const stat = fs.statSync(DATA_FILE);
      if (_dataCache && stat.mtimeMs === _dataCacheMtime) return _dataCache;

      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (!data.curricula)  data.curricula  = [];
      if (!data.progress)   data.progress   = [];

      let needsSave = false;

      // 선생님 PIN 해싱 마이그레이션
      if (!data.teacherPinSalt) {
        const plain = data.teacherPin || '1234';
        data.teacherPinSalt = generateSalt();
        data.teacherPin = hashPin(plain, data.teacherPinSalt);
        needsSave = true;
      }

      // 학생 PIN 해싱 마이그레이션
      data.students.forEach(s => {
        if (!s.enrolledCurricula) s.enrolledCurricula = [];
        if (!s.pinSalt) {
          const plain = s.pin || '0000';
          s.pinSalt = generateSalt();
          s.pin = hashPin(plain, s.pinSalt);
          needsSave = true;
        }
      });

      if (needsSave) {
        try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8'); }
        catch (e) { console.error('마이그레이션 저장 실패:', e); }
      }

      const finalStat = needsSave ? fs.statSync(DATA_FILE) : stat;
      _dataCache = data;
      _dataCacheMtime = finalStat.mtimeMs;
      return data;
    }
  } catch (e) {
    console.error('데이터 로드 실패:', e);
  }
  const salt = generateSalt();
  return { students: [], cards: [], curricula: [], progress: [], teacherPin: hashPin('1234', salt), teacherPinSalt: salt };
}

// 커리큘럼 카드의 학생별 진도 조회/생성 헬퍼
function getProgress(data, studentId, cardId) {
  return data.progress.find(p => p.studentId === studentId && p.cardId === cardId);
}

function mergeProgress(card, studentId, data) {
  if (!card.curriculumId) return card; // 개인 카드 → 진도가 카드 자체에 있음
  const p = getProgress(data, studentId, card.id);
  return {
    ...card,
    box:          p?.box          ?? 1,
    successCount: p?.successCount ?? 0,
    failCount:    p?.failCount    ?? 0,
    lastReview:   p?.lastReview   ?? null,
  };
}

// 데이터 저장
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  _dataCache = data;
  try { _dataCacheMtime = fs.statSync(DATA_FILE).mtimeMs; } catch (_) {}
}

// ============================================================
// ── Supabase 기반 API (브라우저에 키 비노출) ──────────────────
// ============================================================

// ── 학생 API ─────────────────────────────────────────────────

app.get('/api/students', async (req, res) => {
  if (!requireSB(res)) return;
  try {
    const data = sbCheck(await supabase.from('students').select('id, name, created_at').order('created_at'));
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 특정 학생 정보
app.get('/api/students/:id', async (req, res) => {
  if (!requireSB(res)) return;
  try {
    const data = sbCheck(await supabase.from('students').select('id, name, created_at').eq('id', req.params.id).single());
    res.json(data);
  } catch (e) { res.status(404).json({ error: e.message }); }
});

// ── 학생 추가
app.post('/api/students', async (req, res) => {
  if (!requireSB(res)) return;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '이름을 입력해주세요' });
  if (name.trim().length > 50) return res.status(400).json({ error: '이름은 50자 이하로 입력해주세요' });
  try {
    const salt = generateSalt();
    const { data, error } = await supabase
      .from('students').insert({ name: name.trim(), pin: hashPin('0000', salt), pin_salt: salt }).select('id, name, created_at').single();
    if (error) return res.status(error.code === '23505' ? 400 : 500).json({ error: error.message });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── 학생 삭제
app.delete('/api/students/:id', async (req, res) => {
  if (!requireSB(res)) return;
  try {
    sbCheck(await supabase.from('students').delete().eq('id', req.params.id));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── 학생 업데이트 (PUT / PATCH 모두 지원)
async function _updateStudent(req, res) {
  if (!requireSB(res)) return;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '이름을 입력해주세요' });
  try {
    const data = sbCheck(await supabase.from('students').update({ name: name.trim() }).eq('id', req.params.id).select('id, name, created_at').single());
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
app.patch('/api/students/:id', _updateStudent);
app.put('/api/students/:id', _updateStudent);

// ── 인증 API ──────────────────────────────────────────────────

// 학생 로그인 (서버사이드 PIN 검증)
app.post('/api/auth/login', async (req, res) => {
  if (!requireSB(res)) return;
  const { name, pin } = req.body;
  if (!name || !pin) return res.status(400).json({ error: '이름과 PIN을 입력해주세요' });

  const ip = req.ip || 'unknown';
  const key = `login:${ip}:${name.trim()}`;
  if (!checkRateLimit(key)) return res.status(429).json({ error: '시도 횟수 초과. 15분 후 다시 시도해주세요' });

  try {
    const { data: students, error } = await supabase
      .from('students').select('id, name, pin, pin_salt, created_at').eq('name', name.trim());
    if (error) return res.status(500).json({ error: error.message });
    if (!students?.length) return res.status(401).json({ error: '이름 또는 PIN이 올바르지 않습니다' });

    const student = students[0];
    if (!student.pin) return res.status(401).json({ error: 'PIN이 설정되지 않았습니다. 선생님에게 문의하세요' });
    if (hashPin(pin, student.pin_salt) !== student.pin) return res.status(401).json({ error: '이름 또는 PIN이 올바르지 않습니다' });

    resetRateLimit(key);
    res.json({ id: student.id, name: student.name, created_at: student.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 선생님 로그인
app.post('/api/auth/teacher', async (req, res) => {
  if (!requireSB(res)) return;
  const { pin } = req.body;
  const ip = req.ip || 'unknown';
  const key = `teacher:${ip}`;
  if (!checkRateLimit(key)) return res.status(429).json({ error: '시도 횟수 초과. 15분 후 다시 시도해주세요' });

  try {
    const { data, error } = await supabase.from('teacher_settings').select('pin, pin_salt').eq('id', 1).single();
    if (error || !data) return res.status(500).json({ error: '선생님 설정을 찾을 수 없습니다' });
    if (hashPin(pin, data.pin_salt) !== data.pin) return res.status(401).json({ error: 'PIN이 올바르지 않습니다' });
    resetRateLimit(key);
    res.json({ token: createTeacherToken() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 학생 PIN 변경
app.put('/api/students/:id/pin', async (req, res) => {
  if (!requireSB(res)) return;
  const token = req.headers['x-teacher-token'];
  if (!validateTeacherToken(token)) return res.status(401).json({ error: '선생님 인증 필요' });
  const { pin } = req.body;
  if (!pin || !/^\d{4}$/.test(pin)) return res.status(400).json({ error: '4자리 숫자 PIN을 입력해주세요' });
  try {
    const salt = generateSalt();
    sbCheck(await supabase.from('students').update({ pin: hashPin(pin, salt), pin_salt: salt }).eq('id', req.params.id));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 선생님 PIN 변경
app.put('/api/auth/teacher-pin', async (req, res) => {
  if (!requireSB(res)) return;
  const token = req.headers['x-teacher-token'];
  if (!validateTeacherToken(token)) return res.status(401).json({ error: '선생님 인증 필요' });
  const { newPin } = req.body;
  if (!newPin || !/^\d{4}$/.test(newPin)) return res.status(400).json({ error: '4자리 숫자 PIN을 입력해주세요' });
  try {
    const salt = generateSalt();
    sbCheck(await supabase.from('teacher_settings').update({ pin: hashPin(newPin, salt), pin_salt: salt, updated_at: new Date().toISOString() }).eq('id', 1));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── 카드 API ──────────────────────────────────────────────────

// 학생 카드 목록
app.get('/api/students/:studentId/cards', async (req, res) => {
  if (!requireSB(res)) return;
  try {
    const data = sbCheck(await supabase.from('cards').select('*').eq('student_id', req.params.studentId).order('created_at'));
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 이미지 업로드 (파일 시스템, 변경 없음)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '이미지가 없습니다' });
  res.json({ filename: req.file.filename });
});

// 카드 추가
app.post('/api/students/:studentId/cards', async (req, res) => {
  if (!requireSB(res)) return;
  const { studentId } = req.params;
  const { question, answer, type, question_image, topic, explanation } = req.body;
  if (question?.length > 2000) return res.status(400).json({ error: '질문은 2000자 이하로 입력해주세요' });
  if (answer?.length > 2000) return res.status(400).json({ error: '정답은 2000자 이하로 입력해주세요' });
  try {
    const { data, error } = await supabase.from('cards')
      .insert({ student_id: studentId, type: type || 'text', question: question || '', answer: answer || '', question_image: question_image || null, topic: topic || null, explanation: explanation || null })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 카드 업데이트 (PUT / PATCH)
async function _updateCard(req, res) {
  if (!requireSB(res)) return;
  const { id } = req.params;
  const { question, answer, type, question_image, box, success_count, fail_count, explanation } = req.body;
  const updates = {};
  if (question !== undefined) updates.question = question;
  if (answer !== undefined) updates.answer = answer;
  if (type !== undefined) updates.type = type;
  if (question_image !== undefined) updates.question_image = question_image;
  if (box !== undefined) updates.box = box;
  if (success_count !== undefined) updates.success_count = success_count;
  if (fail_count !== undefined) updates.fail_count = fail_count;
  if (explanation !== undefined) updates.explanation = explanation;
  try {
    const data = sbCheck(await supabase.from('cards').update(updates).eq('id', id).select().single());
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
app.patch('/api/cards/:id', _updateCard);
app.put('/api/cards/:id', _updateCard);

// 카드 삭제
app.delete('/api/cards/:id', async (req, res) => {
  if (!requireSB(res)) return;
  try {
    sbCheck(await supabase.from('cards').delete().eq('id', req.params.id));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 랜덤 카드 (Leitner 가중치)
app.get('/api/students/:studentId/cards/random', async (req, res) => {
  if (!requireSB(res)) return;
  try {
    const { data: cards, error } = await supabase.from('cards').select('*').eq('student_id', req.params.studentId);
    if (error) return res.status(500).json({ error: error.message });
    if (!cards?.length) return res.status(404).json({ error: 'NO_CARDS' });

    const weights = cards.map(c => Math.max(6 - (c.box || 1), 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < cards.length; i++) { rand -= weights[i]; if (rand <= 0) return res.json(cards[i]); }
    res.json(cards[cards.length - 1]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 학생 통계
app.get('/api/students/:studentId/stats', async (req, res) => {
  if (!requireSB(res)) return;
  try {
    const { data: cards } = await supabase.from('cards').select('box').eq('student_id', req.params.studentId);
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (cards || []).forEach(c => { if (c.box >= 1 && c.box <= 5) dist[c.box]++; });
    res.json({ distribution: dist, total: cards?.length || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 전체 학생 통계 (관리자)
app.get('/api/stats/all', async (req, res) => {
  if (!requireSB(res)) return;
  try {
    const [{ data: students }, { data: cards }] = await Promise.all([
      supabase.from('students').select('id, name, created_at').order('created_at'),
      supabase.from('cards').select('student_id, box'),
    ]);
    const result = (students || []).map(s => {
      const sc = (cards || []).filter(c => c.student_id === s.id);
      return { student: s, total: sc.length, box1: sc.filter(c => c.box === 1).length, box5: sc.filter(c => c.box === 5).length };
    });
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 피드백 (Leitner 박스 이동)
app.post('/api/cards/:id/feedback', async (req, res) => {
  if (!requireSB(res)) return;
  const { id } = req.params;
  const { success } = req.body;
  try {
    const { data: card, error } = await supabase.from('cards').select('box, success_count, fail_count').eq('id', id).single();
    if (error) return res.status(404).json({ error: '카드를 찾을 수 없습니다' });

    const newBox = success ? Math.min((card.box || 1) + 1, 5) : Math.max((card.box || 1) - 1, 1);
    const data = sbCheck(await supabase.from('cards').update({
      box: newBox,
      success_count: success ? (card.success_count || 0) + 1 : (card.success_count || 0),
      fail_count:    success ? (card.fail_count || 0)    : (card.fail_count || 0) + 1,
      last_review:   new Date().toISOString(),
    }).eq('id', id).select().single());
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Daily Session API ─────────────────────────────────────────

// 오늘 세션 조회/생성
app.get('/api/students/:studentId/session/today', async (req, res) => {
  if (!requireSB(res)) return;
  const { studentId } = req.params;
  const today = new Date().toISOString().split('T')[0];
  try {
    let { data: session, error } = await supabase.from('daily_sessions').select('*').eq('student_id', studentId).eq('session_date', today).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!session) {
      const { data: ns, error: ce } = await supabase.from('daily_sessions').insert({ student_id: studentId, session_date: today, cards_target: 10 }).select().single();
      if (ce) return res.status(500).json({ error: ce.message });
      session = ns;
    }
    const remaining = Math.max(0, session.cards_target - session.cards_drawn);
    // 스트릭 계산
    const { data: hist } = await supabase.from('daily_sessions').select('session_date, completed').eq('student_id', studentId).order('session_date', { ascending: false }).limit(60);
    const completedMap = new Map((hist || []).map(s => [s.session_date, s.completed]));
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (i === 0) { if (completedMap.get(ds)) streak++; continue; }
      if (completedMap.get(ds) === true) streak++; else break;
    }
    res.json({ session, remaining, streak });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 카드 결과 기록
app.post('/api/sessions/:sessionId/record', async (req, res) => {
  if (!requireSB(res)) return;
  const { sessionId } = req.params;
  const { card_id, result, box_before, box_after } = req.body;
  try {
    await supabase.from('session_cards').insert({ session_id: sessionId, card_id, result, box_before, box_after });
    const { data: cur } = await supabase.from('daily_sessions').select('cards_drawn, cards_target').eq('id', sessionId).single();
    const newDrawn = (cur?.cards_drawn ?? 0) + 1;
    const completed = newDrawn >= (cur?.cards_target ?? 10);
    const { data: final } = await supabase.from('daily_sessions')
      .update({ cards_drawn: newDrawn, completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', sessionId).select().single();
    res.json(final);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 세션 히스토리
app.get('/api/students/:studentId/session/history', async (req, res) => {
  if (!requireSB(res)) return;
  const days = parseInt(req.query.days) || 30;
  const since = new Date(); since.setDate(since.getDate() - days);
  try {
    const data = sbCheck(await supabase.from('daily_sessions')
      .select('session_date, cards_drawn, cards_target, completed')
      .eq('student_id', req.params.studentId)
      .gte('session_date', since.toISOString().split('T')[0])
      .order('session_date', { ascending: true }));
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 이번 주 현황
app.get('/api/students/:studentId/session/weekly', async (req, res) => {
  if (!requireSB(res)) return;
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today); monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  const mondayStr = monday.toISOString().split('T')[0];
  const sundayStr = new Date(monday.getTime() + 6 * 86400000).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  try {
    const { data } = await supabase.from('daily_sessions')
      .select('session_date, completed').eq('student_id', req.params.studentId)
      .gte('session_date', mondayStr).lte('session_date', sundayStr);
    const map = new Map((data || []).map(s => [s.session_date, s.completed]));
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      if (ds > todayStr) return null;
      return map.get(ds) === true;
    });
    res.json(week);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============ 인쇄 API ============

function escapeTypst(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
}

async function buildPDF(templateFile, replacer) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const typFile = path.join(PRINT_TMP, `${id}.typ`);
  const pdfFile = path.join(PRINT_TMP, `${id}.pdf`);
  try {
    const template = fs.readFileSync(templateFile, 'utf8');
    const content = replacer(template);
    fs.writeFileSync(typFile, content, 'utf8');
    await execFileAsync('typst', ['compile', '--root', __dirname, typFile, pdfFile]);
    const buf = fs.readFileSync(pdfFile);
    return buf;
  } finally {
    fs.unlink(typFile, () => {});
    fs.unlink(pdfFile, () => {});
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}.`;
}

function injectDate(template) {
  return template.replace(/rdate\s*=\s*"[^"]*"/, `rdate   = "${todayString()}"`);
}

// 카드 텍스트에서 topic 추론
// 핵심 규칙: "유한소수 → 거듭제곱 꼴" 같은 정의 카드 오염 방지
//   → question에 있는 키워드 우선, answer에만 있는 경우 계산형 답(공식·숫자)일 때만 인정
function inferTopic(card) {
  if (card.topic && TOPIC_GENERATORS[card.topic]) return card.topic;

  const q = (card.question || '').toLowerCase();
  const a = (card.answer || '').toLowerCase();

  // ── 항상 q+a 전체 매칭 (오염 위험 없는 주제) ──────────────────
  if (/속력|거리.+시간|시간.+거리|km\/h|속도/.test(q + ' ' + a))    return '속력';
  if (/순환소수|순환마디/.test(q + ' ' + a))                          return '순환소수';
  if (/동류항/.test(q + ' ' + a))                                      return '동류항';
  if (/보조선|ㄱ자|ㄷ자|복잡한.도형|도형.나누/.test(q + ' ' + a))    return '복잡한도형';
  if (/km²|m²|cm²|mm²|넓이.단위|단위.변환.*넓이/.test(q + ' ' + a)) return '단위변환';

  // ── question 우선 매칭 (answer에만 있으면 오염 가능) ──────────
  // 예) "거듭제곱이란?" → q에 있으므로 OK
  //     "유한소수 → 10의 거듭제곱 꼴" → q엔 없고 a에만 있으므로 스킵
  if (/거듭제곱|밑.*지수|지수.*밑/.test(q))   return '거듭제곱';
  if (/역수/.test(q))                           return '역수';
  if (/약분|기약분수|통분/.test(q))             return '약분';
  if (/서로소/.test(q))                          return '서로소';
  if (/소수|합성수/.test(q))                    return '소수';
  if (/제곱근|√/.test(q))                       return '제곱근';
  if (/대소관계|크기.*비교/.test(q))            return '대소관계';

  // ── 도형 넓이 공식 카드: answer에 공식이 있으면 OK ──────────────
  // 공식 카드 판별: answer가 짧고(60자 미만) × 또는 ÷ 기호 포함
  const isFormula = a.length < 60 && /[×÷]/.test(a);
  if (/삼각형.*(넓이|공식)/.test(q + ' ' + a))                       return '삼각형';
  if (/직사각형|정사각형/.test(q) || (isFormula && /직사각형/.test(a))) return '직사각형';
  if (/마름모/.test(q + ' ' + a))                                     return '마름모';
  if (/사다리꼴/.test(q + ' ' + a))                                   return '사다리꼴';

  return null;
}

function injectCards(template, cards) {
  const lines = shuffle(cards).slice(0, 8).map(c => {
    // Supabase snake_case 필드 지원 (question_image, success_count, fail_count)
    const imgPath = (c.question_image || c.questionImage) ? `/public/assets/${c.question_image || c.questionImage}` : '';
    const topic = inferTopic(c);
    let pq = '', pa = '';
    if (topic) [pq, pa] = TOPIC_GENERATORS[topic]();
    return `  ("${escapeTypst(c.question)}", "${escapeTypst(c.answer)}", ${c.box || 1}, ${c.success_count ?? c.successCount ?? 0}, ${c.fail_count ?? c.failCount ?? 0}, "${imgPath}", "${escapeTypst(pq)}", "${escapeTypst(pa)}"),`;
  }).join('\n');
  let out = template.replace(
    /\/\/ ─── AUTO_CARDS_START[\s\S]*?\/\/ ─── AUTO_CARDS_END/,
    `// ─── AUTO_CARDS_START\n${lines}\n// ─── AUTO_CARDS_END`
  );
  return injectDate(out);
}

function injectItems(template, cards) {
  const lines = shuffle(cards).slice(0, 10).map(c =>
    `  ("${escapeTypst(c.question)}", "${escapeTypst(c.answer)}", "", none),`
  ).join('\n');
  let out = template.replace(
    /\/\/ ─── AUTO_ITEMS_START[\s\S]*?\/\/ ─── AUTO_ITEMS_END/,
    `// ─── AUTO_ITEMS_START\n${lines}\n// ─── AUTO_ITEMS_END`
  );
  return injectDate(out);
}

// ── Supabase에서 학생+카드 로드 헬퍼 ────────────────────────
async function loadStudentCards(studentId, boxFilter) {
  if (!supabase) throw new Error('Supabase 미설정');
  const [{ data: student, error: se }, { data: cards, error: ce }] = await Promise.all([
    supabase.from('students').select('id, name').eq('id', studentId).single(),
    supabase.from('cards').select('*').eq('student_id', studentId),
  ]);
  if (se || !student) throw new Error('학생을 찾을 수 없습니다');
  if (ce) throw new Error(ce.message);
  let filtered = cards || [];
  if (boxFilter?.length) filtered = filtered.filter(c => boxFilter.includes(c.box));
  return { student, cards: filtered };
}

// POST /api/print/flashcard-sheet
app.post('/api/print/flashcard-sheet', async (req, res) => {
  const { studentId, boxFilter } = req.body;
  try {
    const { student, cards } = await loadStudentCards(studentId, boxFilter);
    if (!cards.length) return res.status(400).json({ error: '카드가 없습니다' });
    const buf = await buildPDF(path.join(PRINT_DIR, 'flashcard-sheet.typ'), (t) => injectCards(t, cards));
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${date}_${encodeURIComponent(student.name)}-flashcard.pdf`);
    res.send(buf);
  } catch (e) {
    console.error('PDF 오류:', e.message);
    res.status(e.message === '학생을 찾을 수 없습니다' ? 404 : 500).json({ error: e.message });
  }
});

// POST /api/print/quiz-sheet
app.post('/api/print/quiz-sheet', async (req, res) => {
  const { studentId, chapter } = req.body;
  try {
    const { student, cards } = await loadStudentCards(studentId);
    if (!cards.length) return res.status(400).json({ error: '카드가 없습니다' });
    const buf = await buildPDF(path.join(PRINT_DIR, 'quiz-sheet.typ'), (t) => {
      let out = injectItems(t, cards);
      if (chapter) out = out.replace(/chapter\s*=\s*"[^"]*"/, `chapter = "${escapeTypst(chapter)}"`);
      return out;
    });
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${date}_${encodeURIComponent(student.name)}-quiz.pdf`);
    res.send(buf);
  } catch (e) {
    console.error('PDF 오류:', e.message);
    res.status(e.message === '학생을 찾을 수 없습니다' ? 404 : 500).json({ error: e.message });
  }
});

// ─── 서버 측 문제 생성기 (problem-generators.js와 동일한 로직) ───
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function simplify(n, d) { const g = gcd(Math.abs(n), Math.abs(d)); return [n/g, d/g]; }

function generateRepeatingDecimalProblem() {
  const pick = Math.random();
  if (pick < 0.34) {
    const d = Math.floor(Math.random() * 9) + 1;
    const [n, de] = simplify(d, 9);
    return [`0.${d}${d}${d}…  (순환마디: ${d})`, `${n}/${de}`];
  }
  if (pick < 0.67) {
    const d1 = Math.floor(Math.random() * 9) + 1;
    const d2 = Math.floor(Math.random() * 10);
    const raw = d1 * 10 + d2;
    const [n, de] = simplify(raw, 99);
    return [`0.${d1}${d2}${d1}${d2}…  (순환마디: ${d1}${d2})`, `${n}/${de}`];
  }
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const raw_n = 9 * a + b;
  const [n, de] = simplify(raw_n, 90);
  return [`0.${a}${b}${b}${b}…  (순환마디: ${b})`, `${n}/${de}`];
}

function generateSpeedProblem() {
  const SPEEDS = [40, 50, 60, 80, 100, 120];
  const TIMES  = [1, 2, 3, 4, 5];
  const s = SPEEDS[Math.floor(Math.random() * SPEEDS.length)];
  const t = TIMES[Math.floor(Math.random() * TIMES.length)];
  const d = s * t;
  const type = Math.floor(Math.random() * 3);
  if (type === 0) return [`시속 ${s}km로 ${t}시간 달린 거리는?  (거리=속력×시간)`, `${d}km`];
  if (type === 1) return [`${d}km를 시속 ${s}km/h로 달리면 몇 시간?  (시간=거리÷속력)`, `${t}시간`];
  return [`${d}km를 ${t}시간 만에 달렸을 때 평균 속력은?  (속력=거리÷시간)`, `시속 ${s}km`];
}

function generateLikeTermsProblem() {
  const coef = (c, v) => c === 1 ? v : c === -1 ? `-${v}` : `${c}${v}`;
  const VARS = ['x', 'y', 'a', 'n'];
  const v = VARS[Math.floor(Math.random() * VARS.length)];
  const type = Math.floor(Math.random() * 4);
  if (type === 0) {
    const a = Math.floor(Math.random() * 8) + 2, b = Math.floor(Math.random() * 7) + 2;
    return [`${coef(a,v)} + ${coef(b,v)}  을 동류항끼리 정리하면?`, coef(a+b,v)];
  }
  if (type === 1) {
    const b = Math.floor(Math.random() * 4) + 1, a = b + Math.floor(Math.random() * 5) + 1;
    return [`${coef(a,v)} - ${coef(b,v)}  을 동류항끼리 정리하면?`, coef(a-b,v)];
  }
  if (type === 2) {
    const a = Math.floor(Math.random()*5)+2, b = Math.floor(Math.random()*5)+2;
    const c = Math.floor(Math.random()*Math.min(a+b-1,5))+1;
    return [`${coef(a,v)} + ${coef(b,v)} - ${coef(c,v)}  을 동류항끼리 정리하면?`, coef(a+b-c,v)];
  }
  const w = v === 'x' ? 'y' : 'x';
  const [a,b,c,d] = Array.from({length:4}, ()=>Math.floor(Math.random()*5)+1);
  return [
    `${coef(a,v)} + ${coef(b,w)} + ${coef(c,v)} + ${coef(d,w)}  을 동류항끼리 정리하면?`,
    `${coef(a+c,v)} + ${coef(b+d,w)}`
  ];
}

// ── 거듭제곱 ──────────────────────────────────────────────
function generateExponentProblem() {
  const BASE = [2, 3, 4, 5, 6, 7];
  const EXP  = [2, 3, 4];
  const base = BASE[Math.floor(Math.random() * BASE.length)];
  const exp  = EXP[Math.floor(Math.random() * EXP.length)];
  const val  = Math.pow(base, exp);
  const type = Math.floor(Math.random() * 3);
  if (type === 0) return [`${base}^${exp} = ?`, `${val}`];
  if (type === 1) return [`${val} = ${base}^□  □ 에 알맞은 수는?`, `${exp}`];
  return [`${val} = □^${exp}  □ 에 알맞은 수는?`, `${base}`];
}

// ── 역수 ──────────────────────────────────────────────────
function generateReciprocalProblem() {
  const type = Math.floor(Math.random() * 3);
  if (type === 0) {
    let n, d;
    do { n = Math.floor(Math.random() * 7) + 2; d = Math.floor(Math.random() * 7) + 2; } while (n === d);
    return [`${n}/${d}의 역수는?`, `${d}/${n}`];
  }
  if (type === 1) {
    const n = Math.floor(Math.random() * 8) + 2;
    return [`${n}의 역수는?`, `1/${n}`];
  }
  let n, d;
  do { n = Math.floor(Math.random() * 7) + 2; d = Math.floor(Math.random() * 7) + 2; } while (n === d);
  return [`${n}/${d} × □ = 1  □ 에 알맞은 수는?`, `${d}/${n}`];
}

// ── 약분/기약분수 ─────────────────────────────────────────
function generateSimplifyFractionProblem() {
  const GCDS = [2, 3, 4, 5, 6];
  const g = GCDS[Math.floor(Math.random() * GCDS.length)];
  let n, d;
  do {
    n = Math.floor(Math.random() * 7) + 2;
    d = Math.floor(Math.random() * 7) + 2;
  } while (n === d);
  const [rn, rd] = simplify(n * g, d * g);
  return [`${n * g}/${d * g}를 기약분수로 나타내면?`, `${rn}/${rd}`];
}

// ── 서로소 ────────────────────────────────────────────────
function generateCoprimeProblem() {
  const pairs = [
    [8,15,'서로소'], [4,9,'서로소'], [7,12,'서로소'], [5,13,'서로소'],
    [3,11,'서로소'], [6,35,'서로소'], [4,6,'서로소 아님 (GCD=2)'],
    [9,12,'서로소 아님 (GCD=3)'], [10,15,'서로소 아님 (GCD=5)'],
    [8,12,'서로소 아님 (GCD=4)'],
  ];
  const [a, b, ans] = pairs[Math.floor(Math.random() * pairs.length)];
  return [`${a}과 ${b}는 서로소인가?`, ans];
}

// ── 소수/합성수 ───────────────────────────────────────────
function generatePrimeProblem() {
  const PRIMES    = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47];
  const COMPOSITES = [4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28];
  const type = Math.floor(Math.random() * 2);
  if (type === 0) {
    const n = [...PRIMES, ...COMPOSITES][Math.floor(Math.random() * (PRIMES.length + COMPOSITES.length))];
    return [`${n}은 소수인가, 합성수인가?`, PRIMES.includes(n) ? '소수' : '합성수'];
  }
  const p = PRIMES[Math.floor(Math.random() * 8)];
  return [`1과 ${p} 사이에서 ${p}의 약수를 모두 구하면?`, `1, ${p}`];
}

// ── 제곱근 ────────────────────────────────────────────────
function generateSquareRootProblem() {
  const PERFECT = [1,4,9,16,25,36,49,64,81,100,121,144];
  const n = PERFECT[Math.floor(Math.random() * PERFECT.length)];
  const type = Math.floor(Math.random() * 2);
  if (type === 0) return [`√${n} = ?`, `${Math.sqrt(n)}`];
  return [`제곱해서 ${n}이 되는 수 중 양수는?`, `${Math.sqrt(n)}`];
}

// ── 대소관계 ─────────────────────────────────────────────
function generateComparisonProblem() {
  const fractions = [[1,2],[1,3],[2,3],[3,4],[1,4],[3,5],[2,5],[4,5],[1,6],[5,6]];
  const [n1,d1] = fractions[Math.floor(Math.random() * fractions.length)];
  let idx2;
  do { idx2 = Math.floor(Math.random() * fractions.length); } while (fractions[idx2][0]===n1 && fractions[idx2][1]===d1);
  const [n2,d2] = fractions[idx2];
  const v1 = n1/d1, v2 = n2/d2;
  const sym = v1 > v2 ? '>' : v1 < v2 ? '<' : '=';
  return [`${n1}/${d1}  ○  ${n2}/${d2}  (○ 안에 >, <, = 쓰기)`, sym];
}

// ── 삼각형 넓이 ──────────────────────────────────────────
function generateTriangleAreaProblem() {
  const base = Math.floor(Math.random() * 8) + 2;
  const height = Math.floor(Math.random() * 8) + 2;
  const area = base * height / 2;
  return [`밑변 ${base}cm, 높이 ${height}cm인 삼각형의 넓이는?`, `${area}cm²`];
}

// ── 직사각형 둘레 ─────────────────────────────────────────
function generateRectangleProblem() {
  const w = Math.floor(Math.random() * 8) + 2;
  const h = Math.floor(Math.random() * 8) + 2;
  const type = Math.floor(Math.random() * 2);
  if (type === 0) return [`가로 ${w}cm, 세로 ${h}cm인 직사각형의 둘레는?`, `${2*(w+h)}cm`];
  return [`가로 ${w}cm, 세로 ${h}cm인 직사각형의 넓이는?`, `${w*h}cm²`];
}

// ── 마름모 넓이 ──────────────────────────────────────────
function generateRhombusAreaProblem() {
  const d1 = (Math.floor(Math.random() * 5) + 2) * 2; // 짝수
  const d2 = (Math.floor(Math.random() * 5) + 2) * 2;
  return [`대각선이 ${d1}cm, ${d2}cm인 마름모의 넓이는?`, `${d1*d2/2}cm²`];
}

// ── 사다리꼴 넓이 ─────────────────────────────────────────
function generateTrapezoidAreaProblem() {
  const top    = Math.floor(Math.random() * 5) + 2;
  const bottom = top + Math.floor(Math.random() * 5) + 1;
  const h      = Math.floor(Math.random() * 6) + 2;
  return [`윗변 ${top}cm, 아랫변 ${bottom}cm, 높이 ${h}cm인 사다리꼴의 넓이는?`, `${(top+bottom)*h/2}cm²`];
}

// ── 복잡한 도형 넓이 (보조선으로 분할) ───────────────────────
// 초등 5학년 수준: ㄱ자·ㄷ자·계단 모양 → 직사각형으로 나눠서 계산
function generateComplexShapeProblem() {
  const r = () => Math.floor(Math.random() * 5) + 2; // 2~6
  const type = Math.floor(Math.random() * 4);

  if (type === 0) {
    // ㄱ자: 전체 큰 직사각형 - 오른쪽 위 작은 직사각형
    const W = r() + 4, H = r() + 4;
    const w = Math.floor(Math.random() * (W - 2)) + 1;
    const h = Math.floor(Math.random() * (H - 2)) + 1;
    const area = W * H - w * h;
    return [
      `전체 가로 ${W}cm, 세로 ${H}cm인 직사각형에서 오른쪽 위 가로 ${w}cm, 세로 ${h}cm를 잘라낸 ㄱ자 도형의 넓이는?`,
      `${W}×${H} - ${w}×${h} = ${area}cm²`
    ];
  }
  if (type === 1) {
    // 계단(2단): 아래 큰 직사각형 + 위 작은 직사각형
    const W1 = r() + 3, H1 = r() + 1;
    const W2 = Math.floor(W1 / 2) + 1, H2 = r() + 1;
    const area = W1 * H1 + W2 * H2;
    return [
      `아래 가로 ${W1}cm×세로 ${H1}cm, 위 가로 ${W2}cm×세로 ${H2}cm가 붙은 계단 모양 도형의 넓이는?`,
      `${W1}×${H1} + ${W2}×${H2} = ${area}cm²`
    ];
  }
  if (type === 2) {
    // ㄷ자: 전체 큰 직사각형 - 안쪽 빈 부분
    const W = r() + 4, H = r() + 4;
    const w = Math.floor(Math.random() * (W - 3)) + 1;
    const h = Math.floor(Math.random() * (H - 3)) + 1;
    const area = W * H - w * h;
    return [
      `전체 가로 ${W}cm, 세로 ${H}cm 직사각형의 안쪽 가로 ${w}cm, 세로 ${h}cm가 뚫린 ㄷ자 도형의 넓이는?`,
      `${W}×${H} - ${w}×${h} = ${area}cm²`
    ];
  }
  // type === 3: 가로막대 + 세로막대 십자 모양
  const hw = r() + 3, hh = r();
  const vw = r(), vh = r() + 3;
  const area = hw * hh + vw * vh - vw * hh;
  return [
    `가로 ${hw}cm×세로 ${hh}cm 막대와 가로 ${vw}cm×세로 ${vh}cm 막대를 겹친 십자 도형의 넓이는? (겹친 부분: ${vw}×${hh})`,
    `${hw}×${hh} + ${vw}×${vh} - ${vw}×${hh} = ${area}cm²`
  ];
}

// ── 넓이 단위 변환 (km²↔m², m²↔cm²) ─────────────────────────
// 1km² = 1,000,000m²  /  1m² = 10,000cm²  /  1cm² = 100mm²
function generateAreaUnitProblem() {
  const type = Math.floor(Math.random() * 6);

  if (type === 0) {
    const n = Math.floor(Math.random() * 5) + 1;
    return [`${n}km² = ______ m²`, `${(n * 1_000_000).toLocaleString('ko-KR')}m²`];
  }
  if (type === 1) {
    const n = [500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000][Math.floor(Math.random() * 5)];
    return [`${n.toLocaleString('ko-KR')}m² = ______ km²`, `${n / 1_000_000}km²`];
  }
  if (type === 2) {
    const n = Math.floor(Math.random() * 5) + 1;
    return [`${n}m² = ______ cm²`, `${(n * 10_000).toLocaleString('ko-KR')}cm²`];
  }
  if (type === 3) {
    const n = [10_000, 20_000, 50_000, 100_000][Math.floor(Math.random() * 4)];
    return [`${n.toLocaleString('ko-KR')}cm² = ______ m²`, `${n / 10_000}m²`];
  }
  if (type === 4) {
    const n = Math.floor(Math.random() * 5) + 1;
    return [`${n}cm² = ______ mm²`, `${(n * 100).toLocaleString('ko-KR')}mm²`];
  }
  // 빈칸 채우기: 1km = 1000m 이므로 1km² = □ × □ = □ m²
  return [`1km = 1000m 일 때, 1km² = (______)² m² = ______ m²`, `1000² = 1,000,000m²`];
}

const TOPIC_GENERATORS = {
  '순환소수': generateRepeatingDecimalProblem,
  '속력':     generateSpeedProblem,
  '동류항':   generateLikeTermsProblem,
  '거듭제곱': generateExponentProblem,
  '밑':       generateExponentProblem,
  '지수':     generateExponentProblem,
  '역수':     generateReciprocalProblem,
  '약분':     generateSimplifyFractionProblem,
  '통분':     generateSimplifyFractionProblem,
  '서로소':   generateCoprimeProblem,
  '소수':     generatePrimeProblem,
  '합성수':   generatePrimeProblem,
  '제곱근':   generateSquareRootProblem,
  '대소관계': generateComparisonProblem,
  '삼각형':   generateTriangleAreaProblem,
  '직사각형': generateRectangleProblem,
  '정사각형': generateRectangleProblem,
  '마름모':   generateRhombusAreaProblem,
  '사다리꼴': generateTrapezoidAreaProblem,
  '복잡한도형': generateComplexShapeProblem,
  '보조선':     generateComplexShapeProblem,
  '단위변환':   generateAreaUnitProblem,
  '넓이단위':   generateAreaUnitProblem,
};

function injectCardsAndProblems(template, cards, problems) {
  let out = injectCards(template, cards);
  const plines = problems.map(([q, a]) =>
    `  ("${escapeTypst(q)}", "${escapeTypst(a)}"),`
  ).join('\n');
  out = out.replace(
    /\/\/ ─── AUTO_PROBLEMS_START[\s\S]*?\/\/ ─── AUTO_PROBLEMS_END/,
    `// ─── AUTO_PROBLEMS_START\n${plines}\n// ─── AUTO_PROBLEMS_END`
  );
  return out;
}

function injectProblems(template, problems, topic) {
  const lines = problems.map(([q, a]) =>
    `  ("${escapeTypst(q)}", "${escapeTypst(a)}"),`
  ).join('\n');
  let out = template.replace(
    /\/\/ ─── AUTO_PROBLEMS_START[\s\S]*?\/\/ ─── AUTO_PROBLEMS_END/,
    `// ─── AUTO_PROBLEMS_START\n${lines}\n// ─── AUTO_PROBLEMS_END`
  );
  out = injectDate(out);
  if (topic) out = out.replace(/topic\s*=\s*"[^"]*"/, `topic   = "${escapeTypst(topic)}"`);
  return out;
}

// POST /api/print/practice-sheet
app.post('/api/print/practice-sheet', async (req, res) => {
  const { studentId, topic = '순환소수', count = 10 } = req.body;
  let student;
  try {
    const { data, error } = await (supabase
      ? supabase.from('students').select('id, name').eq('id', studentId).single()
      : Promise.resolve({ data: null, error: new Error('Supabase 미설정') }));
    if (error || !data) return res.status(404).json({ error: '학생을 찾을 수 없습니다' });
    student = data;
  } catch (e) { return res.status(500).json({ error: e.message }); }

  // 수체계는 트리 전용 PDF
  if (topic === '수체계') {
    const candidates = ['integer', 'pos_int', 'zero', 'neg_int', 'non_int', 'finite', 'repeating'];
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const blankCount = Math.random() < 0.45 ? 1 : 2;
    const blanks = shuffled.slice(0, blankCount);
    try {
      const buf = await buildPDF(
        path.join(PRINT_DIR, 'practice-tree-sheet.typ'),
        (t) => {
          const lines = blanks.map(b => `"${b}"`).join('\n');
          let out = t.replace(
            /\/\/ ─── AUTO_BLANKS_START[\s\S]*?\/\/ ─── AUTO_BLANKS_END/,
            `// ─── AUTO_BLANKS_START\n${lines}\n// ─── AUTO_BLANKS_END`
          );
          return injectDate(out);
        }
      );
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${date}_${encodeURIComponent(student.name)}-tree.pdf`);
      res.send(buf);
    } catch (e) {
      console.error('PDF 오류:', e.message);
      res.status(500).json({ error: 'PDF 생성 실패', detail: e.message });
    }
    return;
  }

  const generator = TOPIC_GENERATORS[topic];
  if (!generator) return res.status(400).json({ error: `지원하지 않는 topic: ${topic}` });

  const n = Math.min(Math.max(parseInt(count) || 10, 1), 20);
  const problems = Array.from({ length: n }, () => generator());

  try {
    const buf = await buildPDF(
      path.join(PRINT_DIR, 'practice-sheet.typ'),
      (t) => injectProblems(t, problems, topic)
    );
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${date}_${encodeURIComponent(student.name)}-practice.pdf`);
    res.send(buf);
  } catch (e) {
    console.error('PDF 오류:', e.message);
    res.status(500).json({ error: 'PDF 생성 실패', detail: e.message });
  }
});

// POST /api/print/bulk → ZIP
app.post('/api/print/bulk', async (req, res) => {
  const { studentIds, type, boxFilter } = req.body;
  if (!studentIds || studentIds.length === 0) return res.status(400).json({ error: '학생을 선택하세요' });

  const date = new Date().toISOString().slice(0, 10);
  const typLabel = type === 'quiz' ? '퀴즈' : '플래시카드';

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(typLabel)}-${date}.zip`);

  const zip = archiver('zip', { zlib: { level: 6 } });
  zip.pipe(res);

  const templateFile = path.join(PRINT_DIR, type === 'quiz' ? 'quiz-sheet.typ' : 'flashcard-sheet.typ');

  for (const sid of studentIds) {
    let student, cards;
    try {
      ({ student, cards } = await loadStudentCards(sid, boxFilter));
    } catch (_) { continue; }
    if (!cards.length) continue;

    try {
      let pdfBuf;
      if (type === 'quiz') {
        pdfBuf = await buildPDF(templateFile, (t) => injectItems(t, cards));
      } else {
        const topicSet = new Set(
          cards
            .map(c => {
              const t = c.topic && TOPIC_GENERATORS[c.topic] ? c.topic : inferTopic(c);
              return t && TOPIC_GENERATORS[t] ? t : null;
            })
            .filter(Boolean)
        );
        let problemTopics = [...topicSet];
        if (problemTopics.length === 0) problemTopics = Object.keys(TOPIC_GENERATORS);
        const practiceProblems = [];
        const perTopic = Math.ceil(6 / problemTopics.length);
        for (const topic of problemTopics) {
          for (let i = 0; i < perTopic && practiceProblems.length < 6; i++) {
            practiceProblems.push(TOPIC_GENERATORS[topic]());
          }
        }
        pdfBuf = await buildPDF(templateFile, (t) => injectCardsAndProblems(t, cards, practiceProblems));
      }
      const buf = pdfBuf;
      zip.append(buf, { name: `${student.name}-${typLabel}.pdf` });
    } catch (e) {
      console.error(`${student.name} PDF 실패:`, e.message);
    }
  }

  zip.finalize();
});

// ── 제네레이터 디버그 API ──────────────────────────────────────
app.post('/api/debug/generator', (req, res) => {
  const { topic, count = 3 } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic 필요' });

  // 수체계는 TOPIC_GENERATORS에 없음 — 특수 처리
  if (topic === '수체계') {
    const n = Math.min(Math.max(parseInt(count) || 3, 1), 20);
    const candidates = ['integer', 'pos_int', 'zero', 'neg_int', 'non_int', 'finite', 'repeating'];
    const problems = Array.from({ length: n }, () => {
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);
      const blankCount = Math.random() < 0.45 ? 1 : 2;
      const blanks = shuffled.slice(0, blankCount);
      return { type: 'fillblank', blankIds: Object.fromEntries(blanks.map(b => [b, b])) };
    });
    return res.json({ topic, count: n, problems });
  }

  const gen = TOPIC_GENERATORS[topic];
  if (!gen) return res.status(404).json({ error: `TOPIC_GENERATORS에 "${topic}" 없음`, available: Object.keys(TOPIC_GENERATORS) });
  const n = Math.min(Math.max(parseInt(count) || 3, 1), 20);
  try {
    const problems = Array.from({ length: n }, () => gen());
    res.json({ topic, count: n, problems });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎴 개념 가챠 서버: http://localhost:${PORT}`);
});
