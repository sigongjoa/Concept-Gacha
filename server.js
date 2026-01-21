const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('데이터 로드 실패:', e);
  }
  return { students: [], cards: [] };
}

// 데이터 저장
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ============ 학생 API ============

// 모든 학생 목록
app.get('/api/students', (req, res) => {
  const data = loadData();
  res.json(data.students);
});

// 특정 학생 정보
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const student = data.students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: '학생을 찾을 수 없습니다' });
  }
  res.json(student);
});

// 학생 추가
app.post('/api/students', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '이름을 입력해주세요' });
  }

  const data = loadData();

  // 중복 체크
  if (data.students.find(s => s.name === name.trim())) {
    return res.status(400).json({ error: '이미 존재하는 이름입니다' });
  }

  const newStudent = {
    id: Date.now().toString(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  data.students.push(newStudent);
  saveData(data);
  res.json(newStudent);
});

// 학생 삭제
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();

  data.students = data.students.filter(s => s.id !== id);
  data.cards = data.cards.filter(c => c.studentId !== id); // 해당 학생의 카드도 삭제

  saveData(data);
  res.json({ success: true });
});

// 학생 업데이트
app.patch('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const data = loadData();

  const student = data.students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: '학생을 찾을 수 없습니다' });
  }

  if (name && name.trim()) {
    // 중복 체크 (자신 제외)
    if (data.students.find(s => s.id !== id && s.name === name.trim())) {
      return res.status(400).json({ error: '이미 존재하는 이름입니다' });
    }
    student.name = name.trim();
  }

  saveData(data);
  res.json(student);
});

// ============ 카드 API ============

// 특정 학생의 모든 카드
app.get('/api/students/:studentId/cards', (req, res) => {
  const { studentId } = req.params;
  const data = loadData();
  const cards = data.cards
    .filter(c => c.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(cards);
});

// 이미지 업로드 API
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '이미지가 없습니다' });
  }
  res.json({ filename: req.file.filename });
});

// 카드 추가
app.post('/api/students/:studentId/cards', (req, res) => {
  const { studentId } = req.params;
  const { question, answer, type, questionImage } = req.body;
  const data = loadData();

  const newCard = {
    id: Date.now().toString(),
    studentId,
    type: type || 'text', // 'text' 또는 'image'
    question: question || '',
    questionImage: questionImage || null, // 이미지 파일명
    answer: answer || '',
    box: 1,
    successCount: 0,
    failCount: 0,
    createdAt: new Date().toISOString(),
    lastReview: null,
  };

  data.cards.push(newCard);
  saveData(data);
  res.json(newCard);
});

// 카드 업데이트 (성공/실패 또는 내용 수정)
app.patch('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  const { success, question, answer, type, questionImage } = req.body;
  const data = loadData();

  const card = data.cards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ error: '카드를 찾을 수 없습니다' });
  }

  // 성공/실패 여부에 따른 상자 이동
  if (success !== undefined) {
    if (success) {
      card.box = Math.min(card.box + 1, 4);
      card.successCount++;
    } else {
      card.box = 1;
      card.failCount++;
    }
    card.lastReview = new Date().toISOString();
  }

  // 내용 업데이트
  if (question !== undefined) card.question = question;
  if (answer !== undefined) card.answer = answer;
  if (type !== undefined) card.type = type;
  if (questionImage !== undefined) card.questionImage = questionImage;

  saveData(data);
  res.json(card);
});

// 카드 삭제
app.delete('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  const data = loadData();
  data.cards = data.cards.filter(c => c.id !== id);
  saveData(data);
  res.json({ success: true });
});

// 랜덤 카드 뽑기 (특정 학생)
app.get('/api/students/:studentId/cards/random', (req, res) => {
  const { studentId } = req.params;
  const data = loadData();
  const cards = data.cards.filter(c => c.studentId === studentId);

  if (cards.length === 0) {
    return res.status(404).json({ error: '카드가 없습니다' });
  }

  // 가중치 기반 랜덤 (상자1=4, 상자4=1)
  const weighted = [];
  cards.forEach(card => {
    const weight = 5 - card.box;
    for (let i = 0; i < weight; i++) {
      weighted.push(card);
    }
  });

  const randomCard = weighted[Math.floor(Math.random() * weighted.length)];
  res.json(randomCard);
});

// 특정 학생 통계
app.get('/api/students/:studentId/stats', (req, res) => {
  const { studentId } = req.params;
  const data = loadData();
  const cards = data.cards.filter(c => c.studentId === studentId);

  const stats = { total: cards.length, box1: 0, box2: 0, box3: 0, box4: 0 };
  cards.forEach(c => stats[`box${c.box}`]++);
  res.json(stats);
});

// 전체 통계 (모든 학생)
app.get('/api/stats/all', (req, res) => {
  const data = loadData();
  const studentStats = data.students.map(student => {
    const cards = data.cards.filter(c => c.studentId === student.id);
    return {
      student,
      total: cards.length,
      box1: cards.filter(c => c.box === 1).length,
      box4: cards.filter(c => c.box === 4).length,
    };
  });
  res.json(studentStats);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎴 개념 가챠 서버: http://localhost:${PORT}`);
});
