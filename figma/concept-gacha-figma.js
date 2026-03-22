/**
 * 개념 가챠 — Figma Plugin Code (Multi-Page)
 * 실행: Figma > Plugins > Development > Open Console > 코드 붙여넣기
 *
 * 생성 페이지:
 *  1. 🎨 Design Tokens
 *  2. 🔐 학생 선택 (index.html)
 *  3. 🎴 카드 뽑기 (gacha.html)
 *  4. ➕ 카드 추가 (add.html)
 *  5. 📋 전체 목록 (list.html)
 *  6. 🖨️ 인쇄 센터 (print.html)
 *  7. ⚙️ 관리자 (admin.html)
 *  8. ⌨️ 컴포넌트 라이브러리
 */

// ─── 디자인 토큰 ─────────────────────────────────────────────────
const T = {
  color: {
    bgPage:      { r:0.973, g:0.980, b:0.988 },
    bgCard:      { r:1,     g:1,     b:1     },
    bgKeypad:    { r:0.945, g:0.961, b:0.976 },
    bgKeypadDel: { r:1,     g:0.945, b:0.949 },
    bgInput:     { r:0.973, g:0.980, b:0.988 },
    textPrimary: { r:0.118, g:0.153, b:0.196 },
    textSecond:  { r:0.373, g:0.455, b:0.549 },
    textMuted:   { r:0.576, g:0.659, b:0.741 },
    white:       { r:1,     g:1,     b:1     },
    orange50:    { r:1,     g:0.973, b:0.961 },
    orange500:   { r:0.976, g:0.451, b:0.086 },
    red600:      { r:0.863, g:0.149, b:0.149 },
    indigo50:    { r:0.933, g:0.949, b:1     },
    indigo200:   { r:0.780, g:0.824, b:0.996 },
    indigo500:   { r:0.388, g:0.400, b:0.945 },
    indigo600:   { r:0.310, g:0.275, b:0.898 },
    emerald500:  { r:0.063, g:0.725, b:0.506 },
    rose500:     { r:0.957, g:0.247, b:0.369 },
    teal50:      { r:0.941, g:0.992, b:0.988 },
    teal700:     { r:0.047, g:0.529, b:0.490 },
    yellow50:    { r:1,     g:0.984, b:0.898 },
    blue50:      { r:0.937, g:0.957, b:1     },
    blue500:     { r:0.235, g:0.510, b:0.965 },
    box1:        { r:0.937, g:0.267, b:0.267 },
    box2:        { r:0.933, g:0.698, b:0.145 },
    box3:        { r:0.059, g:0.686, b:0.451 },
    box4:        { r:0.235, g:0.510, b:0.965 },
    border200:   { r:0.886, g:0.918, b:0.945 },
  },
  radius: { sm:8, md:12, lg:16, xl:24, xxl:32, full:9999 },
  shadow: {
    card: [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.10}, offset:{x:0,y:4},  radius:24, spread:0, visible:true, blendMode:'NORMAL' }],
    btn:  [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.12}, offset:{x:0,y:8},  radius:24, spread:0, visible:true, blendMode:'NORMAL' }],
    sm:   [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.08}, offset:{x:0,y:2},  radius:8,  spread:0, visible:true, blendMode:'NORMAL' }],
  },
};

function rgb(c, a=1) { return { ...c, a }; }

async function loadFonts() {
  await Promise.all([
    ['Inter','Regular'],['Inter','Medium'],['Inter','Semi Bold'],['Inter','Bold'],['Inter','Extra Bold'],
    ['Noto Sans KR','Regular'],['Noto Sans KR','Bold'],
  ].map(([f,s]) => figma.loadFontAsync({ family:f, style:s }).catch(()=>{})));
}

function frame(name, w, h, opts={}) {
  const f = figma.createFrame();
  f.name = name; f.resize(w, h);
  f.cornerRadius              = opts.radius  ?? 0;
  f.fills                     = opts.fills   ?? [{ type:'SOLID', color:T.color.bgCard }];
  f.effects                   = opts.shadow  ?? [];
  f.layoutMode                = opts.layout  ?? 'NONE';
  f.itemSpacing               = opts.gap     ?? 0;
  f.paddingTop                = opts.pt ?? opts.p ?? 0;
  f.paddingBottom             = opts.pb ?? opts.p ?? 0;
  f.paddingLeft               = opts.pl ?? opts.p ?? 0;
  f.paddingRight              = opts.pr ?? opts.p ?? 0;
  f.primaryAxisAlignItems     = opts.mainAxis  ?? 'MIN';
  f.counterAxisAlignItems     = opts.crossAxis ?? 'MIN';
  f.clipsContent = true;
  return f;
}

function rect(name, w, h, color, radius=0) {
  const r = figma.createRectangle();
  r.name = name; r.resize(w, h);
  r.cornerRadius = radius;
  r.fills = [{ type:'SOLID', color }];
  return r;
}

function text(content, size, weight, color, opts={}) {
  const t = figma.createText();
  t.characters = String(content);
  t.fontSize   = size;
  const style  = weight>=900?'Extra Bold':weight>=700?'Bold':weight>=600?'Semi Bold':weight>=500?'Medium':'Regular';
  t.fontName   = { family: opts.family ?? 'Inter', style };
  t.fills      = [{ type:'SOLID', color }];
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.w) { t.textAutoResize = 'HEIGHT'; t.resize(opts.w, t.height); }
  return t;
}

function stroke(node, color, weight=1) {
  node.strokes = [{ type:'SOLID', color }];
  node.strokeWeight = weight;
  return node;
}

// ─── 공통: 사이드바 ──────────────────────────────────────────────
function buildSidebar(active='카드 뽑기') {
  const sb = frame('Sidebar', 288, 768, { fills:[{type:'SOLID',color:T.color.bgCard}], layout:'VERTICAL' });

  const top = frame('Top', 288, 600, { fills:[], layout:'VERTICAL', pt:32, pb:24, pl:32, pr:32, gap:28 });

  // 로고
  const logo = frame('Logo', 224, 56, { fills:[], layout:'VERTICAL', gap:4 });
  logo.appendChild(text('개념 가챠', 26, 900, T.color.orange500));
  logo.appendChild(text('몰랐던 것을 기록하고, 랜덤으로 꺼내서 기억하자', 10, 500, T.color.textSecond, {w:224}));
  top.appendChild(logo);

  // 학생 배지
  const badge = frame('Badge', 224, 60, { fills:[{type:'SOLID',color:T.color.orange50}], radius:T.radius.lg, layout:'VERTICAL', p:14, gap:3 });
  badge.appendChild(text('현재 학생', 10, 700, T.color.orange500));
  badge.appendChild(text('김시우', 16, 900, T.color.textPrimary));
  top.appendChild(badge);

  // 네비
  const nav = frame('Nav', 224, 320, { fills:[], layout:'VERTICAL', gap:6 });
  [
    { icon:'🎴', label:'카드 뽑기' },
    { icon:'➕', label:'카드 추가' },
    { icon:'📋', label:'전체 목록' },
    { icon:'🖨️', label:'인쇄 센터' },
    { icon:'⚙️', label:'관리자'   },
  ].forEach(item => {
    const on = item.label === active;
    const link = frame(`Nav-${item.label}`, 224, 48, {
      fills: on ? [{type:'SOLID',color:T.color.orange50}] : [],
      radius:T.radius.lg, layout:'HORIZONTAL', pl:16, pr:16, gap:12, crossAxis:'CENTER',
    });
    link.appendChild(text(item.label, 13, on?700:500, on?T.color.orange500:T.color.textSecond));
    nav.appendChild(link);
  });
  top.appendChild(nav);
  sb.appendChild(top);

  // 하단 학습 현황
  const bottom = frame('Bottom', 288, 168, { fills:[], layout:'VERTICAL', pt:24, pb:32, pl:32, pr:32, gap:16 });
  bottom.appendChild(text('학습 현황', 10, 700, T.color.textMuted));
  const stats = frame('Stats', 224, 72, { fills:[], layout:'HORIZONTAL', gap:10 });
  [
    { label:'전체',  val:'24', bg:T.color.bgCard,              tc:T.color.textPrimary },
    { label:'상자1', val:'8',  bg:{r:1,g:0.945,b:0.945},       tc:T.color.box1 },
    { label:'상자2', val:'10', bg:{r:1,g:0.984,b:0.898},       tc:T.color.box2 },
    { label:'상자3+',val:'6',  bg:{r:0.925,g:0.992,b:0.961},   tc:T.color.box3 },
  ].forEach(s => {
    const c = frame(s.label, 50, 60, { fills:[{type:'SOLID',color:s.bg}], radius:T.radius.md, layout:'VERTICAL', p:8, gap:4 });
    c.appendChild(text(s.label, 8, 700, T.color.textSecond));
    c.appendChild(text(s.val, 18, 900, s.tc));
    stats.appendChild(c);
  });
  bottom.appendChild(stats);
  sb.appendChild(bottom);
  return sb;
}

// ─── 페이지 1: 🎨 Design Tokens ──────────────────────────────────
function buildTokensPage(page) {
  const bg = frame('DesignTokens', 1000, 680, {
    fills:[{type:'SOLID',color:T.color.bgPage}], layout:'VERTICAL', p:48, gap:36,
  });
  bg.appendChild(text('개념 가챠 — Design System', 26, 900, T.color.textPrimary));

  // Colors
  const colorSec = frame('Colors', 904, 260, { fills:[], layout:'VERTICAL', gap:14 });
  colorSec.appendChild(text('Colors', 11, 700, T.color.textMuted));
  const palette = frame('Palette', 904, 220, { fills:[], layout:'HORIZONTAL', gap:16 });
  [
    { label:'Brand',  colors:[['Orange 500',T.color.orange500],['Red 600',T.color.red600]] },
    { label:'Indigo', colors:[['Indigo 50',T.color.indigo50],['Indigo 500',T.color.indigo500],['Indigo 600',T.color.indigo600]] },
    { label:'Slate',  colors:[['Bg Page',T.color.bgPage],['Bg Keypad',T.color.bgKeypad],['Text Muted',T.color.textMuted],['Text Primary',T.color.textPrimary]] },
    { label:'State',  colors:[['Emerald',T.color.emerald500],['Rose',T.color.rose500],['Teal',T.color.teal700]] },
    { label:'Box',    colors:[['Box 1',T.color.box1],['Box 2',T.color.box2],['Box 3',T.color.box3],['Box 4',T.color.box4]] },
  ].forEach(g => {
    const col = frame(g.label, 160, 210, { fills:[], layout:'VERTICAL', gap:8 });
    col.appendChild(text(g.label, 10, 700, T.color.textMuted));
    g.colors.forEach(([n, c]) => {
      const sw = frame(n, 140, 30, { fills:[{type:'SOLID',color:c}], radius:6, layout:'HORIZONTAL', pl:8, crossAxis:'CENTER' });
      sw.appendChild(text(n, 8, 500, T.color.white));
      col.appendChild(sw);
    });
    palette.appendChild(col);
  });
  colorSec.appendChild(palette);
  bg.appendChild(colorSec);

  // Typography
  const typoSec = frame('Typography', 904, 220, { fills:[], layout:'VERTICAL', gap:10 });
  typoSec.appendChild(text('Typography', 11, 700, T.color.textMuted));
  [
    [36, 900, 'H1 — 카드 질문 (36px / ExtraBold)'],
    [28, 900, 'H2 — 사이드바 로고 (28px / ExtraBold)'],
    [22, 700, 'H3 — 연습문제 질문 (22px / Bold)'],
    [16, 600, 'Body — 일반 텍스트 (16px / SemiBold)'],
    [12, 400, 'Caption — 레이블 / 배지 (12px / Regular)'],
  ].forEach(([size, weight, label]) => {
    typoSec.appendChild(text(label, size, weight, T.color.textPrimary));
  });
  bg.appendChild(typoSec);

  bg.x = 0; bg.y = 0;
  page.appendChild(bg);
}

// ─── 페이지 2: 🔐 학생 선택 ─────────────────────────────────────
function buildStudentSelectPage(page) {
  const bg = frame('StudentSelect', 768, 960, {
    fills:[{type:'SOLID',color:{r:1,g:0.980,b:0.973}}], layout:'VERTICAL', mainAxis:'CENTER', crossAxis:'CENTER', gap:32,
  });

  // 로고
  const logoArea = frame('Logo', 448, 80, { fills:[], layout:'VERTICAL', gap:6, crossAxis:'CENTER' });
  logoArea.appendChild(text('개념 가챠', 48, 900, T.color.orange500, {align:'CENTER'}));
  logoArea.appendChild(text('몰랐던 것을 기록하고, 랜덤으로 꺼내서 기억하자', 13, 500, T.color.textSecond, {align:'CENTER', w:448}));
  bg.appendChild(logoArea);

  // 메인 카드
  const card = frame('MainCard', 448, 420, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl,
    shadow:T.shadow.card, layout:'VERTICAL', pt:40, pb:40, pl:40, pr:40, gap:20,
  });
  card.appendChild(text('학생 선택', 18, 700, T.color.textPrimary));
  const divider = rect('Divider', 368, 1, T.color.border200);
  card.appendChild(divider);

  // 학생 목록
  const list = frame('StudentList', 368, 220, { fills:[], layout:'VERTICAL', gap:10 });
  ['김시우','이다인','박준혁','최예지'].forEach((name, i) => {
    const row = frame(`S-${name}`, 368, 48, {
      fills:[{type:'SOLID', color: i===0 ? T.color.orange50 : T.color.bgPage}],
      radius:T.radius.lg, layout:'HORIZONTAL', pl:14, pr:14, gap:12, crossAxis:'CENTER',
    });
    if (i===0) stroke(row, T.color.orange500, 2);
    const av = frame('Av', 32, 32, {
      fills:[{type:'SOLID', color: i===0 ? T.color.orange500 : T.color.bgKeypad}],
      radius:T.radius.full, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    av.appendChild(text(name[0], 13, 700, i===0 ? T.color.white : T.color.textSecond, {align:'CENTER'}));
    row.appendChild(av);
    row.appendChild(text(name, 14, i===0?700:500, i===0?T.color.orange500:T.color.textPrimary));
    list.appendChild(row);
  });
  card.appendChild(list);

  // 학생 추가 입력
  const addRow = frame('AddRow', 368, 44, {
    fills:[{type:'SOLID',color:T.color.bgInput}], radius:T.radius.full,
    layout:'HORIZONTAL', pl:16, pr:8, gap:8, crossAxis:'CENTER',
  });
  stroke(addRow, T.color.border200);
  addRow.appendChild(text('새 학생 이름 입력...', 13, 400, T.color.textMuted));
  const addBtn = frame('AddBtn', 68, 30, {
    fills:[{type:'SOLID',color:T.color.orange500}], radius:T.radius.full,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  addBtn.appendChild(text('추가', 12, 700, T.color.white));
  addRow.appendChild(addBtn);
  card.appendChild(addRow);

  bg.appendChild(card);
  bg.x = 0; bg.y = 0;
  page.appendChild(bg);
}

// ─── 페이지 3: 🎴 카드 뽑기 ────────────────────────────────────
function buildGachaPage(page) {
  const screen = frame('GachaMain', 1024, 768, { fills:[{type:'SOLID',color:T.color.bgPage}] });

  // 배경 글로우
  const glow = rect('BgGlow', 480, 480, T.color.orange500, 240);
  glow.opacity = 0.06; glow.x = 420; glow.y = 80;
  screen.appendChild(glow);

  // 사이드바
  const sb = buildSidebar('카드 뽑기');
  sb.x = 0; sb.y = 0;
  screen.appendChild(sb);

  // 다크모드 버튼
  const darkBtn = frame('DarkBtn', 44, 44, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.full, shadow:T.shadow.sm,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  darkBtn.appendChild(text('☾', 18, 400, T.color.textSecond));
  darkBtn.x = 962; darkBtn.y = 16;
  screen.appendChild(darkBtn);

  // 개념 카드
  const conceptCard = frame('ConceptCard', 560, 320, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', pt:44, pb:36, pl:52, pr:52, gap:20, crossAxis:'CENTER',
  });
  const boxBadge = frame('BoxBadge', 72, 26, {
    fills:[{type:'SOLID',color:T.color.bgKeypad}], radius:T.radius.full,
    layout:'HORIZONTAL', pl:10, pr:10, gap:6, crossAxis:'CENTER', mainAxis:'CENTER',
  });
  boxBadge.appendChild(rect('Dot', 8, 8, T.color.box1, 4));
  boxBadge.appendChild(text('상자 1', 10, 700, T.color.textSecond));
  conceptCard.appendChild(boxBadge);
  conceptCard.appendChild(text('삼각형의 넓이 공식은?', 30, 900, T.color.textPrimary, {align:'CENTER', w:456}));
  const ansBox = frame('Answer', 456, 68, {
    fills:[{type:'SOLID',color:T.color.teal50}], radius:T.radius.lg,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  ansBox.appendChild(text('밑변 × 높이 ÷ 2', 19, 700, T.color.teal700, {align:'CENTER'}));
  conceptCard.appendChild(ansBox);
  conceptCard.x = 316; conceptCard.y = 48;
  screen.appendChild(conceptCard);

  // 연습문제 패널
  const practicePanel = frame('PracticePanel', 560, 340, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', pt:24, pb:24, pl:28, pr:28, gap:14,
  });

  // 헤더
  const hdr = frame('Header', 504, 26, { fills:[], layout:'HORIZONTAL', mainAxis:'SPACE_BETWEEN', crossAxis:'CENTER' });
  hdr.appendChild(text('삼각형 넓이', 12, 700, T.color.indigo500));
  const newBtn = frame('NewProblem', 68, 24, {
    fills:[{type:'SOLID',color:T.color.indigo50}], radius:T.radius.sm,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  newBtn.appendChild(text('다른 문제', 10, 700, T.color.indigo600));
  hdr.appendChild(newBtn);
  practicePanel.appendChild(hdr);

  practicePanel.appendChild(text('밑변 6cm, 높이 8cm인 삼각형의 넓이는?', 17, 900, T.color.textPrimary, {w:504}));

  // 단위 버튼 행
  const unitRow = frame('Units', 504, 36, { fills:[], layout:'HORIZONTAL', gap:6 });
  ['cm²','m²','km²','없음'].forEach((u, i) => {
    const ub = frame(u, 56, 32, {
      fills: i===0?[{type:'SOLID',color:T.color.indigo50}]:[],
      radius:T.radius.md, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    stroke(ub, i===0?T.color.indigo500:T.color.border200);
    ub.appendChild(text(u, 11, 700, i===0?T.color.indigo600:T.color.textSecond));
    unitRow.appendChild(ub);
  });
  practicePanel.appendChild(unitRow);

  // 디스플레이
  const display = frame('Display', 504, 48, {
    fills:[{type:'SOLID',color:T.color.bgKeypad}], radius:T.radius.xl,
    layout:'HORIZONTAL', pl:20, gap:6, crossAxis:'CENTER', mainAxis:'CENTER',
  });
  display.appendChild(text('24', 26, 900, T.color.textPrimary));
  display.appendChild(text(' cm²', 26, 900, T.color.indigo500));
  practicePanel.appendChild(display);

  // 채점 버튼
  const submitBtn = frame('Submit', 504, 46, {
    fills:[{type:'SOLID',color:T.color.indigo500}], radius:T.radius.xl, shadow:T.shadow.btn,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  submitBtn.appendChild(text('채점', 15, 700, T.color.white, {align:'CENTER'}));
  practicePanel.appendChild(submitBtn);

  practicePanel.x = 316; practicePanel.y = 396;
  screen.appendChild(practicePanel);

  // 가챠 버튼
  const gachaBtn = frame('GachaBtn', 108, 108, {
    fills:[{type:'GRADIENT_LINEAR',
      gradientStops:[{position:0,color:rgb(T.color.orange500)},{position:1,color:rgb(T.color.red600)}],
      gradientTransform:[[0.707,-0.707,0.5],[0.707,0.707,-0.207]],
    }],
    radius:T.radius.full, shadow:T.shadow.btn,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  gachaBtn.appendChild(text('🎴', 40, 400, T.color.white, {align:'CENTER'}));
  gachaBtn.x = 908; gachaBtn.y = 620;
  screen.appendChild(gachaBtn);

  screen.x = 0; screen.y = 0;
  page.appendChild(screen);
}

// ─── 페이지 4: ➕ 카드 추가 ─────────────────────────────────────
function buildAddCardPage(page) {
  const screen = frame('AddCard', 1024, 768, { fills:[{type:'SOLID',color:T.color.bgPage}] });

  const sb = buildSidebar('카드 추가');
  sb.x = 0; sb.y = 0;
  screen.appendChild(sb);

  const main = frame('Main', 736, 768, { fills:[], layout:'VERTICAL', pt:72, pb:48, pl:64, pr:64, gap:0, mainAxis:'CENTER' });
  main.x = 288; main.y = 0;

  const form = frame('Form', 608, 600, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', pt:44, pb:44, pl:44, pr:44, gap:22,
  });
  form.appendChild(text('새 카드 추가', 22, 900, T.color.textPrimary));

  // 타입 탭
  const tabs = frame('Tabs', 520, 46, { fills:[], layout:'HORIZONTAL', gap:8 });
  [['텍스트', true], ['이미지', false]].forEach(([label, on]) => {
    const tab = frame(label, 256, 46, {
      fills: on?[{type:'SOLID',color:T.color.orange50}]:[],
      radius:T.radius.lg, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    stroke(tab, on?T.color.orange500:T.color.border200, 2);
    tab.appendChild(text(label, 14, 700, on?T.color.orange500:T.color.textMuted, {align:'CENTER'}));
    tabs.appendChild(tab);
  });
  form.appendChild(tabs);

  // 질문 textarea
  const qWrap = frame('QWrap', 520, 116, { fills:[], layout:'VERTICAL', gap:8 });
  qWrap.appendChild(text('질문 (QUESTION)', 10, 700, T.color.textMuted));
  const qArea = frame('QArea', 520, 92, {
    fills:[{type:'SOLID',color:T.color.bgInput}], radius:T.radius.md,
    layout:'HORIZONTAL', pl:14, pt:12,
  });
  stroke(qArea, T.color.border200);
  qArea.appendChild(text('예: 삼각형의 넓이 공식은?', 13, 400, T.color.textMuted));
  qWrap.appendChild(qArea);
  form.appendChild(qWrap);

  // 정답 input
  const aWrap = frame('AWrap', 520, 76, { fills:[], layout:'VERTICAL', gap:8 });
  aWrap.appendChild(text('정답 (ANSWER)', 10, 700, T.color.textMuted));
  const aField = frame('AField', 520, 48, {
    fills:[{type:'SOLID',color:T.color.bgInput}], radius:T.radius.md,
    layout:'HORIZONTAL', pl:14, crossAxis:'CENTER',
  });
  stroke(aField, T.color.border200);
  aField.appendChild(text('예: 밑변 × 높이 ÷ 2', 13, 400, T.color.textMuted));
  aWrap.appendChild(aField);
  form.appendChild(aWrap);

  // 상자 선택
  const boxWrap = frame('BoxWrap', 520, 76, { fills:[], layout:'VERTICAL', gap:8 });
  boxWrap.appendChild(text('상자 (BOX)', 10, 700, T.color.textMuted));
  const boxRow = frame('BoxRow', 520, 44, { fills:[], layout:'HORIZONTAL', gap:8 });
  [
    ['상자 1', T.color.box1, {r:1,g:0.945,b:0.945}, true ],
    ['상자 2', T.color.box2, {r:1,g:0.984,b:0.898}, false],
    ['상자 3', T.color.box3, {r:0.925,g:0.992,b:0.961}, false],
    ['상자 4', T.color.box4, T.color.blue50,           false],
  ].forEach(([label, tc, bg, on]) => {
    const bb = frame(label, 120, 40, {
      fills:[{type:'SOLID',color: on ? bg : T.color.bgPage}], radius:T.radius.md,
      layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    stroke(bb, on ? tc : T.color.border200, on?2:1);
    bb.appendChild(text(label, 12, 700, on?tc:T.color.textSecond, {align:'CENTER'}));
    boxRow.appendChild(bb);
  });
  boxWrap.appendChild(boxRow);
  form.appendChild(boxWrap);

  // 저장 버튼
  const saveBtn = frame('SaveBtn', 520, 50, {
    fills:[{type:'SOLID',color:T.color.orange500}], radius:T.radius.xl, shadow:T.shadow.btn,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  saveBtn.appendChild(text('카드 저장', 15, 700, T.color.white, {align:'CENTER'}));
  form.appendChild(saveBtn);

  main.appendChild(form);
  screen.appendChild(main);
  screen.x = 0; screen.y = 0;
  page.appendChild(screen);
}

// ─── 페이지 5: 📋 전체 목록 ─────────────────────────────────────
function buildCardListPage(page) {
  const screen = frame('CardList', 1024, 768, { fills:[{type:'SOLID',color:T.color.bgPage}] });

  const sb = buildSidebar('전체 목록');
  sb.x = 0; sb.y = 0;
  screen.appendChild(sb);

  const main = frame('Main', 736, 768, { fills:[], layout:'VERTICAL', pt:44, pb:44, pl:44, pr:44, gap:20 });
  main.x = 288; main.y = 0;
  main.appendChild(text('전체 카드 목록', 26, 900, T.color.textPrimary));

  const listCard = frame('ListCard', 648, 628, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', p:28, gap:10,
  });

  const cards = [
    { q:'삼각형의 넓이 공식은?',          a:'밑변 × 높이 ÷ 2',         box:1 },
    { q:'0.3̄을 분수로 나타내시오',         a:'1/3',                        box:1 },
    { q:'피타고라스 정리',                  a:'a² + b² = c²',               box:2 },
    { q:'소수의 정의',                      a:'1과 자신으로만 나눌 수 있는 수', box:2 },
    { q:'넓이 단위 변환: 1m² = ?cm²',       a:'10,000cm²',                  box:3 },
    { q:'역수의 정의',                      a:'곱이 1인 두 수의 관계',        box:3 },
  ];
  const boxBgs = ['',{r:1,g:0.945,b:0.945},{r:1,g:0.984,b:0.898},{r:0.925,g:0.992,b:0.961},{r:0.937,g:0.957,b:1}];
  const boxTcs = ['',T.color.box1,T.color.box2,T.color.box3,T.color.box4];

  cards.forEach(c => {
    const row = frame(`R-${c.box}`, 592, 60, {
      fills:[{type:'SOLID',color:T.color.bgPage}], radius:T.radius.md,
      layout:'HORIZONTAL', pl:14, pr:14, gap:12, crossAxis:'CENTER',
    });
    const icon = frame('Icon', 36, 36, {
      fills:[{type:'SOLID',color:T.color.orange50}], radius:T.radius.md,
      layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    icon.appendChild(text('📄', 15, 400, T.color.orange500, {align:'CENTER'}));
    row.appendChild(icon);
    const info = frame('Info', 380, 40, { fills:[], layout:'VERTICAL', gap:3 });
    info.appendChild(text(c.q, 12, 700, T.color.textPrimary));
    info.appendChild(text('정답: ' + c.a, 10, 400, T.color.textSecond));
    row.appendChild(info);
    const bb = frame('BB', 44, 22, {
      fills:[{type:'SOLID',color:boxBgs[c.box]}], radius:T.radius.sm,
      layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    bb.appendChild(text(`상자${c.box}`, 9, 700, boxTcs[c.box]));
    row.appendChild(bb);
    const del = frame('Del', 28, 28, { fills:[], layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER' });
    del.appendChild(text('🗑', 13, 400, T.color.textMuted, {align:'CENTER'}));
    row.appendChild(del);
    listCard.appendChild(row);
  });

  main.appendChild(listCard);
  screen.appendChild(main);
  screen.x = 0; screen.y = 0;
  page.appendChild(screen);
}

// ─── 페이지 6: 🖨️ 인쇄 센터 ────────────────────────────────────
function buildPrintPage(page) {
  const screen = frame('PrintCenter', 1024, 768, { fills:[{type:'SOLID',color:T.color.bgPage}] });

  const sb = buildSidebar('인쇄 센터');
  sb.x = 0; sb.y = 0;
  screen.appendChild(sb);

  const main = frame('Main', 736, 768, { fills:[], layout:'VERTICAL', pt:44, pb:44, pl:44, pr:44, gap:20 });
  main.x = 288; main.y = 0;
  main.appendChild(text('🖨 인쇄 센터', 26, 900, T.color.textPrimary));

  // 학생 선택
  const sSec = frame('StudentSec', 648, 148, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', p:28, gap:14,
  });
  sSec.appendChild(text('학생 선택', 15, 700, T.color.textPrimary));
  const sRow = frame('SRow', 592, 44, { fills:[], layout:'HORIZONTAL', gap:8 });
  ['김시우','이다인','박준혁','최예지'].forEach((name, i) => {
    const chip = frame(name, 130, 40, {
      fills:[{type:'SOLID',color: i===0?T.color.orange50:T.color.bgPage}],
      radius:T.radius.full, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    stroke(chip, i===0?T.color.orange500:T.color.border200, i===0?2:1);
    chip.appendChild(text(name, 12, i===0?700:500, i===0?T.color.orange500:T.color.textSecond));
    sRow.appendChild(chip);
  });
  sSec.appendChild(sRow);
  sSec.appendChild(text('여러 명 선택 시 ZIP으로 다운로드됩니다', 10, 400, T.color.textMuted));
  main.appendChild(sSec);

  // 플래시카드
  const fSec = frame('FlashSec', 648, 288, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', p:28, gap:16,
  });
  fSec.appendChild(text('플래시카드 시트', 15, 700, T.color.textPrimary));

  const filterWrap = frame('Filter', 592, 72, { fills:[], layout:'VERTICAL', gap:8 });
  filterWrap.appendChild(text('상자 필터 (미선택 시 전체)', 10, 700, T.color.textMuted));
  const filterRow = frame('FilterRow', 592, 40, { fills:[], layout:'HORIZONTAL', gap:8 });
  [
    ['상자1·C급', {r:1,g:0.945,b:0.945},       T.color.box1],
    ['상자2·B급', {r:1,g:0.984,b:0.898},       T.color.box2],
    ['상자3·A급', T.color.blue50,               T.color.box4],
    ['상자4·S급', {r:0.925,g:0.992,b:0.961},   T.color.box3],
    ['상자5·SS급',{r:1,g:0.984,b:0.898},       T.color.yellow50],
  ].forEach(([label, bg, tc]) => {
    const chip = frame(label, 104, 36, {
      fills:[{type:'SOLID',color:bg}], radius:T.radius.md,
      layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    stroke(chip, tc);
    chip.appendChild(text(label, 9, 700, tc, {align:'CENTER'}));
    filterRow.appendChild(chip);
  });
  filterWrap.appendChild(filterRow);
  fSec.appendChild(filterWrap);

  const pdfBtn = frame('PdfBtn', 592, 50, {
    fills:[{type:'SOLID',color:T.color.blue500}], radius:T.radius.xl, shadow:T.shadow.btn,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  pdfBtn.appendChild(text('📄 플래시카드 PDF 다운로드', 14, 700, T.color.white, {align:'CENTER'}));
  fSec.appendChild(pdfBtn);
  main.appendChild(fSec);

  // 원격 인쇄 섹션
  const rSec = frame('RemoteSec', 648, 160, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', p:28, gap:14,
  });
  rSec.appendChild(text('원격 인쇄', 15, 700, T.color.textPrimary));
  rSec.appendChild(text('학원 프린터에 직접 전송합니다', 12, 400, T.color.textSecond));
  const printBtn = frame('PrintBtn', 592, 48, {
    fills:[{type:'SOLID',color:T.color.orange500}], radius:T.radius.xl, shadow:T.shadow.btn,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  printBtn.appendChild(text('🖨 프린터로 바로 인쇄', 14, 700, T.color.white, {align:'CENTER'}));
  rSec.appendChild(printBtn);
  main.appendChild(rSec);

  screen.appendChild(main);
  screen.x = 0; screen.y = 0;
  page.appendChild(screen);
}

// ─── 페이지 7: ⚙️ 관리자 ────────────────────────────────────────
function buildAdminPage(page) {
  const screen = frame('Admin', 1024, 768, { fills:[{type:'SOLID',color:T.color.bgPage}] });

  // 상단 헤더 (관리자는 풀 와이드)
  const header = frame('Header', 1024, 68, {
    fills:[{type:'SOLID',color:T.color.bgCard}], shadow:T.shadow.sm,
    layout:'HORIZONTAL', pl:40, pr:40, crossAxis:'CENTER', mainAxis:'SPACE_BETWEEN',
  });
  header.appendChild(text('관리자 대시보드', 22, 900, T.color.textPrimary));
  const darkBtn = frame('DarkBtn', 40, 40, {
    fills:[{type:'SOLID',color:T.color.bgPage}], radius:T.radius.full,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  darkBtn.appendChild(text('☾', 17, 400, T.color.textSecond));
  header.appendChild(darkBtn);
  header.x = 0; header.y = 0;
  screen.appendChild(header);

  // 2열 그리드
  const grid = frame('Grid', 944, 648, { fills:[], layout:'HORIZONTAL', gap:28 });
  grid.x = 40; grid.y = 84;

  // ── 학생 관리 패널 ──
  const sPanel = frame('StudentMgmt', 458, 640, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', p:32, gap:18,
  });
  sPanel.appendChild(text('학생 관리', 18, 700, T.color.textPrimary));

  const sList = frame('SList', 394, 420, { fills:[], layout:'VERTICAL', gap:10 });
  [
    { name:'김시우', count:24, last:'오늘'   },
    { name:'이다인', count:18, last:'어제'   },
    { name:'박준혁', count:31, last:'3일 전' },
    { name:'최예지', count:12, last:'1주일 전'},
  ].forEach(s => {
    const row = frame(`S-${s.name}`, 394, 68, {
      fills:[{type:'SOLID',color:T.color.bgPage}], radius:T.radius.lg,
      layout:'HORIZONTAL', pl:14, pr:14, gap:12, crossAxis:'CENTER',
    });
    const av = frame('Av', 36, 36, {
      fills:[{type:'SOLID',color:T.color.orange50}], radius:T.radius.full,
      layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    av.appendChild(text(s.name[0], 14, 700, T.color.orange500, {align:'CENTER'}));
    row.appendChild(av);
    const info = frame('Info', 270, 38, { fills:[], layout:'VERTICAL', gap:3 });
    info.appendChild(text(s.name, 13, 700, T.color.textPrimary));
    info.appendChild(text(`카드 ${s.count}장 · 최근 ${s.last}`, 10, 400, T.color.textSecond));
    row.appendChild(info);
    const del = frame('Del', 28, 28, { fills:[], layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER' });
    del.appendChild(text('🗑', 13, 400, T.color.textMuted));
    row.appendChild(del);
    sList.appendChild(row);
  });
  sPanel.appendChild(sList);

  // 새 학생 추가 입력
  const addInp = frame('AddInp', 394, 44, {
    fills:[{type:'SOLID',color:T.color.bgInput}], radius:T.radius.lg,
    layout:'HORIZONTAL', pl:14, pr:8, gap:8, crossAxis:'CENTER',
  });
  stroke(addInp, T.color.border200);
  addInp.appendChild(text('새 학생 이름...', 13, 400, T.color.textMuted));
  const addBtn = frame('AddBtn', 60, 30, {
    fills:[{type:'SOLID',color:T.color.orange500}], radius:T.radius.md,
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  addBtn.appendChild(text('추가', 11, 700, T.color.white));
  addInp.appendChild(addBtn);
  sPanel.appendChild(addInp);
  grid.appendChild(sPanel);

  // ── 카드 관리 패널 ──
  const cPanel = frame('CardMgmt', 458, 640, {
    fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
    layout:'VERTICAL', p:32, gap:18,
  });
  const cHdr = frame('CHdr', 394, 34, { fills:[], layout:'HORIZONTAL', crossAxis:'CENTER', mainAxis:'SPACE_BETWEEN' });
  cHdr.appendChild(text('카드 관리', 18, 700, T.color.textPrimary));
  const drop = frame('Drop', 130, 32, {
    fills:[{type:'SOLID',color:T.color.bgInput}], radius:T.radius.md,
    layout:'HORIZONTAL', pl:10, pr:10, gap:6, crossAxis:'CENTER', mainAxis:'SPACE_BETWEEN',
  });
  stroke(drop, T.color.border200);
  drop.appendChild(text('학생 선택', 11, 500, T.color.textSecond));
  drop.appendChild(text('▾', 10, 400, T.color.textMuted));
  cHdr.appendChild(drop);
  cPanel.appendChild(cHdr);

  const cList = frame('CList', 394, 460, { fills:[], layout:'VERTICAL', gap:8 });
  [
    { q:'삼각형의 넓이',  box:1 },
    { q:'0.3̄ → 분수',    box:1 },
    { q:'피타고라스 정리', box:2 },
    { q:'소수의 정의',    box:2 },
    { q:'넓이 단위 변환', box:3 },
    { q:'역수의 정의',    box:3 },
  ].forEach(c => {
    const row = frame(`C-${c.q}`, 394, 52, {
      fills:[{type:'SOLID',color:T.color.bgPage}], radius:T.radius.md,
      layout:'HORIZONTAL', pl:12, pr:12, gap:10, crossAxis:'CENTER',
    });
    const icon = frame('Icon', 30, 30, {
      fills:[{type:'SOLID',color:T.color.orange50}], radius:T.radius.sm,
      layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    icon.appendChild(text('📄', 13, 400, T.color.orange500));
    row.appendChild(icon);
    row.appendChild(text(c.q, 12, 600, T.color.textPrimary));
    const boxBgs = ['',{r:1,g:0.945,b:0.945},{r:1,g:0.984,b:0.898},{r:0.925,g:0.992,b:0.961}];
    const boxTcs = ['',T.color.box1,T.color.box2,T.color.box3];
    const bb = frame('BB', 40, 20, {
      fills:[{type:'SOLID',color:boxBgs[c.box]}], radius:T.radius.sm,
      layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    bb.appendChild(text(`상자${c.box}`, 9, 700, boxTcs[c.box]));
    row.appendChild(bb);
    const del = frame('Del', 26, 26, { fills:[], layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER' });
    del.appendChild(text('🗑', 12, 400, T.color.textMuted));
    row.appendChild(del);
    cList.appendChild(row);
  });
  cPanel.appendChild(cList);
  grid.appendChild(cPanel);

  screen.appendChild(grid);
  screen.x = 0; screen.y = 0;
  page.appendChild(screen);
}

// ─── 페이지 8: ⌨️ 컴포넌트 라이브러리 ──────────────────────────
function buildComponentLibPage(page) {
  const bg = frame('ComponentLib', 1440, 860, {
    fills:[{type:'SOLID',color:T.color.bgPage}], layout:'VERTICAL', p:48, gap:40,
  });
  bg.appendChild(text('컴포넌트 라이브러리 — 키패드 변형', 26, 900, T.color.textPrimary));

  const row = frame('KeypadRow', 1344, 680, { fills:[], layout:'HORIZONTAL', gap:20 });

  const modes = [
    { label:'Numeric',   desc:'숫자 입력',   keys:[['7','8','9'],['4','5','6'],['1','2','3'],['.','0','⌫']], extra:null },
    { label:'Fraction',  desc:'분수 입력',   keys:[['7','8','9'],['4','5','6'],['1','2','3'],['.','0','⌫']], extra:'fraction' },
    { label:'Unit',      desc:'숫자 + 단위', keys:[['7','8','9'],['4','5','6'],['1','2','3'],['.','0','⌫']], extra:'unit' },
    { label:'Choice',    desc:'선택지',       keys:null, extra:'choice' },
    { label:'Algebraic', desc:'대수식',       keys:[['7','8','9'],['4','5','6'],['1','2','3'],['.','0','⌫']], extra:'algebraic' },
  ];

  modes.forEach(({ label, desc, keys, extra }) => {
    const w = extra==='algebraic' ? 276 : 248;
    const wrap = frame(`KP-${label}`, w, 660, {
      fills:[{type:'SOLID',color:T.color.bgCard}], radius:T.radius.xxl, shadow:T.shadow.card,
      layout:'VERTICAL', p:20, gap:10,
    });
    const lbl = frame('Lbl', w-40, 40, { fills:[], layout:'VERTICAL', gap:3 });
    lbl.appendChild(text(label, 14, 700, T.color.textPrimary));
    lbl.appendChild(text(desc, 10, 400, T.color.textSecond));
    wrap.appendChild(lbl);

    const iw = w - 40;

    // 디스플레이
    const disp = frame('Display', iw, 40, {
      fills:[{type:'SOLID',color:T.color.bgKeypad}], radius:T.radius.lg,
      layout:'HORIZONTAL', pl:12, gap:4, crossAxis:'CENTER', mainAxis:'CENTER',
    });
    if (extra==='fraction') {
      disp.appendChild(text('3', 16, 900, T.color.indigo600));
      disp.appendChild(text('/', 13, 500, T.color.textMuted));
      disp.appendChild(text('4', 16, 900, T.color.textMuted));
    } else if (extra==='unit') {
      disp.appendChild(text('24', 18, 900, T.color.textPrimary));
      disp.appendChild(text(' cm²', 18, 900, T.color.indigo500));
    } else if (extra==='choice') {
      disp.appendChild(text('3/4  ○  5/8', 15, 700, T.color.textPrimary, {align:'CENTER'}));
    } else if (extra==='algebraic') {
      disp.appendChild(text('3x + 2y', 16, 900, T.color.textPrimary));
    } else {
      disp.appendChild(text('___', 18, 900, T.color.textPrimary, {align:'CENTER'}));
    }
    wrap.appendChild(disp);

    // 단위 버튼
    if (extra==='unit') {
      const uRow = frame('Units', iw, 32, { fills:[], layout:'HORIZONTAL', gap:5 });
      ['cm²','m²','km²','없음'].forEach((u, i) => {
        const ub = frame(u, 44, 28, {
          fills: i===0?[{type:'SOLID',color:T.color.indigo50}]:[],
          radius:T.radius.md, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
        });
        stroke(ub, i===0?T.color.indigo500:T.color.border200);
        ub.appendChild(text(u, 9, 700, i===0?T.color.indigo600:T.color.textSecond));
        uRow.appendChild(ub);
      });
      wrap.appendChild(uRow);
    }

    // 변수 버튼 (algebraic)
    if (extra==='algebraic') {
      const vRow = frame('Vars', iw, 32, { fills:[], layout:'HORIZONTAL', gap:5 });
      ['x','y','z'].forEach((v, i) => {
        const vb = frame(v, 56, 28, {
          fills: i===0?[{type:'SOLID',color:T.color.indigo50}]:[],
          radius:T.radius.md, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
        });
        stroke(vb, i===0?T.color.indigo500:T.color.border200);
        vb.appendChild(text(v, 13, 700, i===0?T.color.indigo600:T.color.textSecond));
        vRow.appendChild(vb);
      });
      wrap.appendChild(vRow);
    }

    // 선택 버튼 (choice)
    if (extra==='choice') {
      const cRow = frame('Choices', iw, 52, { fills:[], layout:'HORIZONTAL', gap:6 });
      ['<','=','>'].forEach((c, i) => {
        const cb = frame(c, (iw-12)/3, 48, {
          fills: i===0?[{type:'SOLID',color:T.color.indigo50}]:[],
          radius:T.radius.lg, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
        });
        stroke(cb, i===0?T.color.indigo500:T.color.border200, i===0?2:1);
        cb.appendChild(text(c, 20, 700, i===0?T.color.indigo600:T.color.textSecond, {align:'CENTER'}));
        cRow.appendChild(cb);
      });
      wrap.appendChild(cRow);
    }

    // 숫자 키패드 그리드
    if (keys) {
      const colW = Math.floor((iw - 10) / 3);
      const cols = [0,1,2].map(i => frame(`Col${i}`, colW, 220, { fills:[], layout:'VERTICAL', gap:6 }));
      const grid = frame('Grid', iw, 220, { fills:[], layout:'HORIZONTAL', gap:5 });
      keys.forEach(keyRow => {
        keyRow.forEach((k, ci) => {
          const isDel = k==='⌫';
          const btn = frame(`K${k}`, colW, 48, {
            fills:[{type:'SOLID',color: isDel?T.color.bgKeypadDel:T.color.bgKeypad}],
            radius:T.radius.md, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
          });
          btn.appendChild(text(k, 15, 700, isDel?T.color.rose500:T.color.textPrimary, {align:'CENTER'}));
          cols[ci].appendChild(btn);
        });
      });
      // 분수: 분모 입력 키
      if (extra==='fraction') {
        const slashBtn = frame('SlashKey', colW, 48, {
          fills:[{type:'SOLID',color:T.color.indigo50}], radius:T.radius.md,
          layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
        });
        stroke(slashBtn, T.color.indigo200);
        slashBtn.appendChild(text('―', 14, 700, T.color.indigo600, {align:'CENTER'}));
        cols[1].appendChild(slashBtn);
      }
      cols.forEach(c => grid.appendChild(c));
      wrap.appendChild(grid);
    }

    // 채점 버튼
    const sub = frame('Submit', iw, 42, {
      fills:[{type:'SOLID',color:T.color.indigo500}], radius:T.radius.xl,
      layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
    });
    sub.appendChild(text('채점', 13, 700, T.color.white));
    wrap.appendChild(sub);

    row.appendChild(wrap);
  });

  bg.appendChild(row);
  bg.x = 0; bg.y = 0;
  page.appendChild(bg);
}

// ─── 메인 실행 ──────────────────────────────────────────────────
async function buildAll() {
  await loadFonts();

  // 초기 페이지 → Design Tokens
  figma.currentPage.name = '🎨 Design Tokens';
  buildTokensPage(figma.currentPage);

  const pages = [
    ['🔐 학생 선택',        buildStudentSelectPage],
    ['🎴 카드 뽑기',        buildGachaPage],
    ['➕ 카드 추가',        buildAddCardPage],
    ['📋 전체 목록',        buildCardListPage],
    ['🖨️ 인쇄 센터',       buildPrintPage],
    ['⚙️ 관리자',          buildAdminPage],
    ['⌨️ 컴포넌트 라이브러리', buildComponentLibPage],
  ];

  for (const [name, builder] of pages) {
    const p = figma.createPage();
    p.name = name;
    figma.currentPage = p;
    builder(p);
  }

  // 카드 뽑기 페이지로 이동
  const gachaPage = figma.root.children.find(p => p.name === '🎴 카드 뽑기');
  if (gachaPage) {
    figma.currentPage = gachaPage;
    figma.viewport.scrollAndZoomIntoView(gachaPage.children);
  }

  figma.notify('✅ 개념 가챠 UI 생성 완료! — 8개 페이지');
  figma.closePlugin();
}

buildAll().catch(e => {
  figma.notify('❌ 오류: ' + e.message, { error: true });
  figma.closePlugin();
});
