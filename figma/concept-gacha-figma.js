/**
 * 개념 가챠 — Figma Plugin Code
 * Figma 플러그인 콘솔(Plugins > Development > Open Console)에서 실행하거나
 * manifest.json + code.js 구조로 플러그인으로 등록해 사용하세요.
 *
 * 생성 화면:
 *  1. 디자인 토큰 (컬러/타이포/그림자)
 *  2. 사이드바 컴포넌트
 *  3. 개념 카드 컴포넌트
 *  4. 연습문제 패널 (숫자 키패드 + 단위 버튼)
 *  5. 가챠 버튼
 *  6. 전체 레이아웃 (태블릿 1024×768)
 */

// ─── 디자인 토큰 ────────────────────────────────────────────────
const T = {
  color: {
    // Backgrounds
    bgPage:       { r: 0.973, g: 0.980, b: 0.988 }, // slate-50  #f8fafc
    bgCard:       { r: 1,     g: 1,     b: 1     }, // white
    bgSidebar:    { r: 1,     g: 1,     b: 1     }, // white
    bgKeypad:     { r: 0.945, g: 0.961, b: 0.976 }, // slate-100 #f1f5f9
    bgKeypadDel:  { r: 1,     g: 0.945, b: 0.949 }, // rose-50   #fff1f2
    bgUnitSel:    { r: 0.933, g: 0.949, b: 1     }, // indigo-50 #eef2ff
    bgPractice:   { r: 0.945, g: 0.949, b: 1     }, // indigo-50 ~

    // Text
    textPrimary:  { r: 0.118, g: 0.153, b: 0.196 }, // slate-800 #1e293b
    textSecond:   { r: 0.373, g: 0.455, b: 0.549 }, // slate-500 #64748b
    textMuted:    { r: 0.576, g: 0.659, b: 0.741 }, // slate-400 #94a3b8

    // Brand
    orange500:    { r: 0.976, g: 0.451, b: 0.086 }, // #f97316
    red600:       { r: 0.863, g: 0.149, b: 0.149 }, // #dc2626

    // Indigo
    indigo50:     { r: 0.933, g: 0.949, b: 1     }, // #eef2ff
    indigo200:    { r: 0.780, g: 0.824, b: 0.996 }, // #c7d2fe
    indigo500:    { r: 0.388, g: 0.400, b: 0.945 }, // #6366f1
    indigo600:    { r: 0.310, g: 0.275, b: 0.898 }, // #4f46e5

    // State colors
    emerald500:   { r: 0.063, g: 0.725, b: 0.506 }, // #10b981
    rose500:      { r: 0.957, g: 0.247, b: 0.369 }, // #f43f5e
    teal50:       { r: 0.941, g: 0.992, b: 0.988 }, // #f0fdfa
    teal700:      { r: 0.047, g: 0.529, b: 0.490 }, // #0f766e

    // Box colors
    box1:         { r: 0.937, g: 0.267, b: 0.267 }, // red-500
    box2:         { r: 0.933, g: 0.698, b: 0.145 }, // yellow-500
    box3:         { r: 0.059, g: 0.686, b: 0.451 }, // emerald-500

    // Border
    border100:    { r: 0.945, g: 0.961, b: 0.976 }, // slate-100 #f1f5f9
    border200:    { r: 0.886, g: 0.918, b: 0.945 }, // slate-200 #e2e8f0
  },

  font: {
    black:  900,
    bold:   700,
    medium: 500,
    normal: 400,
  },

  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   24,
    xxl:  32,
    full: 9999,
  },

  shadow: {
    card: [{ type: 'DROP_SHADOW', color: { r:0, g:0, b:0, a:0.10 }, offset:{x:0,y:4}, radius:24, spread:0, visible:true, blendMode:'NORMAL' }],
    btn:  [{ type: 'DROP_SHADOW', color: { r:0, g:0, b:0, a:0.12 }, offset:{x:0,y:8}, radius:24, spread:0, visible:true, blendMode:'NORMAL' }],
  },
};

// ─── 유틸리티 함수 ──────────────────────────────────────────────
function rgb(c, a=1)   { return { ...c, a }; }
function hex(h)         {
  const n = parseInt(h.replace('#',''), 16);
  return { r: ((n>>16)&255)/255, g: ((n>>8)&255)/255, b: (n&255)/255 };
}

async function loadFont(family='Inter', style='Bold') {
  try { await figma.loadFontAsync({ family, style }); } catch(e) {}
}

async function loadFonts() {
  const variants = [
    ['Inter','Regular'],['Inter','Medium'],['Inter','Semi Bold'],
    ['Inter','Bold'],['Inter','Extra Bold'],
    ['Noto Sans KR','Regular'],['Noto Sans KR','Bold'],
  ];
  await Promise.all(variants.map(([f,s]) => loadFont(f,s)));
}

function frame(name, w, h, opts={}) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.cornerRadius   = opts.radius ?? 0;
  f.fills          = opts.fills ?? [{ type:'SOLID', color: T.color.bgCard }];
  f.effects        = opts.shadow ?? [];
  f.layoutMode     = opts.layout ?? 'NONE';
  f.itemSpacing    = opts.gap ?? 0;
  f.paddingTop     = opts.pt ?? opts.p ?? 0;
  f.paddingBottom  = opts.pb ?? opts.p ?? 0;
  f.paddingLeft    = opts.pl ?? opts.p ?? 0;
  f.paddingRight   = opts.pr ?? opts.p ?? 0;
  f.primaryAxisAlignItems     = opts.mainAxis ?? 'MIN';
  f.counterAxisAlignItems     = opts.crossAxis ?? 'MIN';
  if (opts.clip !== false) f.clipsContent = true;
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
  t.fontName   = { family: opts.family ?? 'Inter', style: weight >= 900 ? 'Extra Bold' : weight >= 700 ? 'Bold' : weight >= 500 ? 'Semi Bold' : 'Regular' };
  t.fills      = [{ type:'SOLID', color }];
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.w) { t.textAutoResize = 'HEIGHT'; t.resize(opts.w, t.height); }
  return t;
}

function group(name, nodes, parent) {
  const g = figma.group(nodes, parent);
  g.name = name;
  return g;
}

// ─── 컴포넌트 빌더 ──────────────────────────────────────────────

/** 사이드바 (288×768) */
function buildSidebar() {
  const sb = frame('Sidebar', 288, 768, {
    fills: [{ type:'SOLID', color: T.color.bgSidebar }],
    layout: 'VERTICAL',
    p: 0,
  });

  // ── 상단 패널 (로고 + 학생 + 네비) ──
  const top = frame('Top', 288, 600, {
    fills:[],
    layout:'VERTICAL',
    pt:32, pb:24, pl:32, pr:32,
    gap:32,
  });

  // 로고 영역
  const logoBox = frame('Logo', 224, 64, { fills:[], layout:'VERTICAL', gap:4 });
  const logoText = text('개념 가챠', 28, 900, T.color.orange500);
  const logoSub  = text('몰랐던 것을 기록하고,\n랜덤으로 꺼내서 기억하자', 11, 500, T.color.textSecond);
  logoBox.appendChild(logoText);
  logoBox.appendChild(logoSub);
  top.appendChild(logoBox);

  // 학생 배지
  const studentBadge = frame('StudentBadge', 224, 64, {
    fills:[{ type:'SOLID', color:{ r:1,g:0.973,b:0.961 } }],
    radius: 16,
    layout:'VERTICAL',
    p:16, gap:4,
  });
  const badgeLabel = text('현재 학생', 10, 700, T.color.orange500);
  const badgeName  = text('김시우', 18, 900, T.color.textPrimary);
  studentBadge.appendChild(badgeLabel);
  studentBadge.appendChild(badgeName);
  top.appendChild(studentBadge);

  // 네비게이션
  const navItems = [
    { icon:'style',      label:'카드 뽑기',      active: true  },
    { icon:'add_circle', label:'카드 추가',       active: false },
    { icon:'grid_view',  label:'전체 목록',       active: false },
    { icon:'print',      label:'인쇄 센터',       active: false },
    { icon:'settings',   label:'관리자',          active: false },
  ];
  const nav = frame('Nav', 224, 300, { fills:[], layout:'VERTICAL', gap:8 });
  navItems.forEach(item => {
    const navLink = frame(`NavLink-${item.label}`, 224, 52, {
      fills: item.active
        ? [{ type:'SOLID', color:{ r:1,g:0.961,b:0.949 } }]
        : [],
      radius:16,
      layout:'HORIZONTAL',
      pl:20, pr:20, pt:0, pb:0,
      gap:16,
      crossAxis:'CENTER',
    });
    const iconT = text(item.icon, 20, 400, item.active ? T.color.orange500 : T.color.textSecond,
      { family:'Material Symbols Outlined' });
    const labelT = text(item.label, 14, item.active ? 700 : 500,
      item.active ? T.color.orange500 : T.color.textSecond);
    navLink.appendChild(iconT);
    navLink.appendChild(labelT);
    nav.appendChild(navLink);
  });
  top.appendChild(nav);
  sb.appendChild(top);

  // ── 하단 패널 (학습 현황) ──
  const bottom = frame('Bottom', 288, 168, {
    fills:[],
    layout:'VERTICAL',
    pt:24, pb:32, pl:32, pr:32,
    gap:20,
  });
  const statsTitle = text('학습 현황', 10, 700, T.color.textMuted);
  bottom.appendChild(statsTitle);

  const statsGrid = frame('StatsGrid', 224, 96, {
    fills:[],
    layout:'HORIZONTAL',
    gap:12,
  });
  const statItems = [
    { label:'전체 카드', val:'24', bg:T.color.bgCard,  tc:T.color.textPrimary },
    { label:'상자 1',    val:'8',  bg:{ r:1,g:0.945,b:0.945 }, tc:T.color.box1 },
    { label:'상자 2',    val:'10', bg:{ r:1,g:0.984,b:0.898 }, tc:T.color.box2 },
    { label:'상자 3-4',  val:'6',  bg:{ r:0.925,g:0.992,b:0.961 }, tc:T.color.box3 },
  ];
  statItems.forEach(s => {
    const card = frame(`Stat-${s.label}`, 52, 64, {
      fills:[{ type:'SOLID', color:s.bg }],
      radius:12,
      layout:'VERTICAL',
      p:10, gap:4,
    });
    const lbl = text(s.label, 9, 700, T.color.textSecond);
    const val = text(s.val,   22, 900, s.tc);
    card.appendChild(lbl);
    card.appendChild(val);
    statsGrid.appendChild(card);
  });
  bottom.appendChild(statsGrid);
  sb.appendChild(bottom);

  return sb;
}

/** 개념 카드 컴포넌트 (560×340) */
function buildConceptCard() {
  const card = frame('ConceptCard', 560, 340, {
    fills:[{ type:'SOLID', color: T.color.bgCard }],
    radius: T.radius.xxl,
    shadow: T.shadow.card,
    layout:'VERTICAL',
    pt:48, pb:40, pl:56, pr:56,
    gap:24,
    crossAxis:'CENTER',
  });

  // 상자 배지
  const badge = frame('BoxBadge', 100, 28, {
    fills:[{ type:'SOLID', color:T.color.bgKeypad }],
    radius:T.radius.full,
    layout:'HORIZONTAL',
    pl:16, pr:16,
    gap:8,
    crossAxis:'CENTER',
    mainAxis:'CENTER',
  });
  const dot = rect('Dot', 8, 8, T.color.box1, 4);
  const badgeTxt = text('상자 1', 11, 700, T.color.textSecond);
  badge.appendChild(dot);
  badge.appendChild(badgeTxt);
  card.appendChild(badge);

  // 질문 텍스트
  const question = text('삼각형의 넓이 공식은?', 36, 900, T.color.textPrimary,
    { align:'CENTER', w:448 });
  card.appendChild(question);

  // 정답 박스 (숨김 상태 시각화)
  const answerBox = frame('AnswerBox', 448, 72, {
    fills:[{ type:'SOLID', color:T.color.teal50 }],
    radius:T.radius.lg,
    layout:'VERTICAL',
    crossAxis:'CENTER',
    mainAxis:'CENTER',
  });
  const answerTxt = text('밑변 × 높이 ÷ 2', 22, 700, T.color.teal700, { align:'CENTER' });
  answerBox.appendChild(answerTxt);
  card.appendChild(answerBox);

  return card;
}

/** 숫자 키패드 (560×auto) */
function buildKeypad(mode='unit') {
  const panel = frame('SmartInputPanel', 560, mode==='fraction' ? 460 : 380, {
    fills:[],
    layout:'VERTICAL',
    gap:12,
  });

  // ── 디스플레이 ──
  const display = frame('Display', 560, 80, {
    fills:[{ type:'SOLID', color:T.color.bgKeypad }],
    radius:T.radius.xl,
    layout:'HORIZONTAL',
    pl:24, pr:24,
    gap:8,
    crossAxis:'CENTER',
    mainAxis:'CENTER',
  });
  if (mode === 'fraction') {
    // 분수 시각화
    const fracBox = frame('FracDisplay', 120, 64, { fills:[], layout:'VERTICAL', gap:2, crossAxis:'CENTER' });
    const numTxt  = text('3', 28, 900, T.color.indigo600, { align:'CENTER' });
    const line    = rect('FracLine', 60, 2, T.color.textPrimary);
    const denTxt  = text('4', 28, 900, T.color.textMuted, { align:'CENTER' });
    fracBox.appendChild(numTxt);
    fracBox.appendChild(line);
    fracBox.appendChild(denTxt);
    display.appendChild(fracBox);
  } else {
    const valTxt  = text('24', 36, 900, T.color.textPrimary);
    const unitTxt = text('cm²',  36, 900, T.color.indigo500);
    display.appendChild(valTxt);
    display.appendChild(unitTxt);
  }
  panel.appendChild(display);

  // ── 단위 버튼 (unit 모드) ──
  if (mode === 'unit') {
    const unitRow = frame('UnitRow', 560, 48, {
      fills:[],
      layout:'HORIZONTAL',
      gap:8,
      crossAxis:'CENTER',
    });
    const units = ['cm²','m²','km²','없음'];
    units.forEach((u, i) => {
      const btn = frame(`Unit-${u}`, i===0?80:60, 44, {
        fills: i===0 ? [{ type:'SOLID', color:T.color.indigo50 }] : [],
        radius:T.radius.md,
        layout:'HORIZONTAL',
        mainAxis:'CENTER',
        crossAxis:'CENTER',
      });
      // border 효과를 위해 stroke
      btn.strokes     = [{ type:'SOLID', color: i===0 ? T.color.indigo500 : T.color.border200 }];
      btn.strokeWeight= 2;
      const uTxt = text(u, 15, 700, i===0 ? T.color.indigo600 : T.color.textSecond, { align:'CENTER' });
      btn.appendChild(uTxt);
      unitRow.appendChild(btn);
    });
    panel.appendChild(unitRow);
  }

  // ── 키패드 그리드 ──
  const grid = frame('KeypadGrid', 560, mode==='fraction' ? 260 : 240, {
    fills:[],
    layout:'HORIZONTAL',
  });
  // 3열 레이아웃 시뮬레이션 (3 cols)
  const keys = [
    ['7','8','9'],
    ['4','5','6'],
    ['1','2','3'],
    ['.','0','⌫'],
  ];
  const colW = (560 - 16) / 3;
  const colH = 64;

  const cols = [
    frame('Col1', colW, colH*4+12*3, { fills:[], layout:'VERTICAL', gap:12 }),
    frame('Col2', colW, colH*4+12*3, { fills:[], layout:'VERTICAL', gap:12 }),
    frame('Col3', colW, colH*4+12*3, { fills:[], layout:'VERTICAL', gap:12 }),
  ];
  grid.itemSpacing = 8;

  keys.forEach(row => {
    row.forEach((key, ci) => {
      const isDel = key==='⌫';
      const isDot = key==='.';
      const btn = frame(`Key-${key}`, colW, colH, {
        fills:[{ type:'SOLID', color: isDel ? T.color.bgKeypadDel : T.color.bgKeypad }],
        radius:T.radius.lg,
        layout:'HORIZONTAL',
        mainAxis:'CENTER',
        crossAxis:'CENTER',
      });
      const kTxt = text(key, 24, 700,
        isDel ? T.color.rose500 : isDot ? T.color.indigo500 : T.color.textPrimary,
        { align:'CENTER' });
      btn.appendChild(kTxt);
      cols[ci].appendChild(btn);
    });
  });
  cols.forEach(c => grid.appendChild(c));
  panel.appendChild(grid);

  // ── 분수 슬래시 키 (fraction 모드) ──
  if (mode === 'fraction') {
    const slashBtn = frame('SlashKey', 560, 52, {
      fills:[{ type:'SOLID', color:T.color.indigo50 }],
      radius:T.radius.lg,
      layout:'HORIZONTAL',
      mainAxis:'CENTER',
      crossAxis:'CENTER',
    });
    slashBtn.strokes      = [{ type:'SOLID', color:T.color.indigo200 }];
    slashBtn.strokeWeight = 2;
    const slashTxt = text('― 분모 입력', 16, 700, T.color.indigo600, { align:'CENTER' });
    slashBtn.appendChild(slashTxt);
    panel.appendChild(slashBtn);
  }

  // ── choice 버튼 (대소관계 예시) ──
  if (mode === 'choice') {
    const choiceRow = frame('ChoiceRow', 560, 64, {
      fills:[],
      layout:'HORIZONTAL',
      gap:8,
    });
    ['<','=','>'].forEach((c,i) => {
      const btn = frame(`Choice-${c}`, 176, 60, {
        fills: i===0 ? [{ type:'SOLID', color:T.color.indigo50 }] : [],
        radius:T.radius.lg,
        layout:'HORIZONTAL',
        mainAxis:'CENTER',
        crossAxis:'CENTER',
      });
      btn.strokes      = [{ type:'SOLID', color: i===0 ? T.color.indigo500 : T.color.border200 }];
      btn.strokeWeight = 2;
      const cTxt = text(c, 24, 700, i===0 ? T.color.indigo600 : T.color.textSecond, { align:'CENTER' });
      btn.appendChild(cTxt);
      choiceRow.appendChild(btn);
    });
    panel.appendChild(choiceRow);
  }

  // ── 채점 버튼 ──
  const submitBtn = frame('SubmitBtn', 560, 56, {
    fills:[{ type:'SOLID', color:T.color.indigo500 }],
    radius:T.radius.xl,
    layout:'HORIZONTAL',
    mainAxis:'CENTER',
    crossAxis:'CENTER',
    shadow: T.shadow.btn,
  });
  const submitTxt = text('채점', 18, 700, { r:1,g:1,b:1 }, { align:'CENTER' });
  submitBtn.appendChild(submitTxt);
  panel.appendChild(submitBtn);

  return panel;
}

/** 가챠 버튼 (128×128) */
function buildGachaButton() {
  const btn = frame('GachaBtn', 128, 128, {
    fills:[{ type:'GRADIENT_LINEAR',
      gradientStops:[
        { position:0, color: rgb(T.color.orange500) },
        { position:1, color: rgb(T.color.red600) },
      ],
      gradientTransform:[[0.707,-0.707,0.5],[0.707,0.707,-0.207]],
    }],
    radius:T.radius.full,
    shadow: T.shadow.btn,
    layout:'HORIZONTAL',
    mainAxis:'CENTER',
    crossAxis:'CENTER',
  });
  const icon = text('style', 52, 400, { r:1,g:1,b:1 }, { family:'Material Symbols Outlined', align:'CENTER' });
  btn.appendChild(icon);
  return btn;
}

/** 연습문제 패널 컨테이너 (560×auto) */
function buildPracticePanel(mode='unit') {
  const panel = frame('PracticePanel', 560, mode==='fraction' ? 680 : 600, {
    fills:[{ type:'SOLID', color:T.color.bgCard }],
    radius:T.radius.xxl,
    shadow: T.shadow.card,
    layout:'VERTICAL',
    pt:32, pb:32, pl:32, pr:32,
    gap:20,
  });
  // 패널 헤더
  const header = frame('PracticeHeader', 496, 32, {
    fills:[],
    layout:'HORIZONTAL',
    crossAxis:'CENTER',
    mainAxis:'SPACE_BETWEEN',
  });
  const topicLabel = text(mode==='fraction'?'순환소수 → 분수 변환':mode==='choice'?'분수 대소관계':'삼각형 넓이',
    14, 700, T.color.indigo500);
  const newBtn = frame('NewProblemBtn', 80, 28, {
    fills:[{ type:'SOLID', color:T.color.indigo50 }],
    radius:T.radius.sm,
    layout:'HORIZONTAL',
    mainAxis:'CENTER',
    crossAxis:'CENTER',
    gap:4,
  });
  const newTxt = text('다른 문제', 11, 700, T.color.indigo600);
  newBtn.appendChild(newTxt);
  header.appendChild(topicLabel);
  header.appendChild(newBtn);
  panel.appendChild(header);

  // 문제 텍스트
  const qTexts = {
    unit:     '밑변 6cm, 높이 8cm인\n삼각형의 넓이는?',
    fraction: '0.3̄  을 분수로 나타내시오',
    choice:   '3/4  ○  5/8',
  };
  const question = text(qTexts[mode] || qTexts.unit, 24, 900, T.color.textPrimary,
    { align:'CENTER', w:496 });
  panel.appendChild(question);

  // 힌트 버튼
  const hintBtn = frame('HintBtn', 100, 28, { fills:[], radius:T.radius.sm, layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER' });
  hintBtn.strokes = [{ type:'SOLID', color:T.color.border200 }];
  hintBtn.strokeWeight = 1;
  const hintTxt = text('💡 힌트 보기', 11, 500, T.color.textMuted);
  hintBtn.appendChild(hintTxt);
  panel.appendChild(hintBtn);

  // 키패드
  const kp = buildKeypad(mode);
  panel.appendChild(kp);

  return panel;
}

// ─── 전체 레이아웃 빌드 ─────────────────────────────────────────
async function buildAll() {
  await loadFonts();

  const page = figma.currentPage;
  page.name = '개념 가챠 UI';

  // ── 1. 디자인 토큰 페이지 ──
  const tokenFrame = frame('🎨 Design Tokens', 900, 520, {
    fills:[{ type:'SOLID', color:T.color.bgPage }],
    layout:'VERTICAL',
    p:40, gap:32,
  });
  tokenFrame.x = 0; tokenFrame.y = 0;

  const tokenTitle = text('개념 가챠 — Design Tokens', 24, 900, T.color.textPrimary);
  tokenFrame.appendChild(tokenTitle);

  // 컬러 팔레트
  const palette = frame('ColorPalette', 820, 280, { fills:[], layout:'HORIZONTAL', gap:12 });
  const colorGroups = [
    { label:'Brand',    colors:[
      { name:'Orange 500', c:T.color.orange500 },
      { name:'Red 600',    c:T.color.red600    },
    ]},
    { label:'Indigo',   colors:[
      { name:'Indigo 50',  c:T.color.indigo50  },
      { name:'Indigo 500', c:T.color.indigo500 },
      { name:'Indigo 600', c:T.color.indigo600 },
    ]},
    { label:'Slate',    colors:[
      { name:'Slate 50',   c:T.color.bgPage     },
      { name:'Slate 100',  c:T.color.bgKeypad   },
      { name:'Slate 400',  c:T.color.textMuted  },
      { name:'Slate 800',  c:T.color.textPrimary},
    ]},
    { label:'State',    colors:[
      { name:'Emerald 500',c:T.color.emerald500 },
      { name:'Rose 500',   c:T.color.rose500    },
      { name:'Teal 700',   c:T.color.teal700    },
    ]},
    { label:'Box',      colors:[
      { name:'Box 1 (Red)',    c:T.color.box1 },
      { name:'Box 2 (Yellow)', c:T.color.box2 },
      { name:'Box 3 (Green)',  c:T.color.box3 },
    ]},
  ];

  colorGroups.forEach(group => {
    const col = frame(`Group-${group.label}`, 140, 260, { fills:[], layout:'VERTICAL', gap:8 });
    const gl  = text(group.label, 11, 700, T.color.textMuted);
    col.appendChild(gl);
    group.colors.forEach(({ name, c }) => {
      const swatch = frame(name, 120, 40, {
        fills:[{ type:'SOLID', color:c }],
        radius:8,
        layout:'HORIZONTAL',
        pl:10, crossAxis:'CENTER',
      });
      const sn = text(name, 9, 500, { r:1,g:1,b:1 });
      swatch.appendChild(sn);
      col.appendChild(swatch);
    });
    palette.appendChild(col);
  });
  tokenFrame.appendChild(palette);
  page.appendChild(tokenFrame);

  // ── 2. 태블릿 전체 레이아웃 (1024×768) ──
  const mainFrame = frame('📱 가챠 메인 (태블릿 1024×768)', 1024, 768, {
    fills:[{ type:'SOLID', color:T.color.bgPage }],
  });
  mainFrame.x = 960; mainFrame.y = 0;

  // 배경 원형 glow
  const glow = rect('BgGlow', 500, 500, { r:0.976,g:0.451,b:0.086 }, 250);
  glow.opacity = 0.08;
  glow.x = 450; glow.y = 130;
  mainFrame.appendChild(glow);

  // 사이드바
  const sidebar = buildSidebar();
  sidebar.x = 0; sidebar.y = 0;
  mainFrame.appendChild(sidebar);

  // 다크모드 토글 버튼 (우상단)
  const toggleBtn = frame('DarkModeBtn', 48, 48, {
    fills:[{ type:'SOLID', color:T.color.bgCard }],
    radius:T.radius.full,
    shadow:[{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.08}, offset:{x:0,y:2}, radius:8, visible:true, blendMode:'NORMAL' }],
    layout:'HORIZONTAL', mainAxis:'CENTER', crossAxis:'CENTER',
  });
  const moonIcon = text('dark_mode', 20, 400, T.color.textSecond, { family:'Material Symbols Outlined' });
  toggleBtn.appendChild(moonIcon);
  toggleBtn.x = 960; toggleBtn.y = 16;
  mainFrame.appendChild(toggleBtn);

  // 개념 카드
  const conceptCard = buildConceptCard();
  conceptCard.x = 316; conceptCard.y = 60;
  mainFrame.appendChild(conceptCard);

  // 연습 패널
  const practice = buildPracticePanel('unit');
  practice.x = 316; practice.y = 420;
  practice.resize(560, 300);
  mainFrame.appendChild(practice);

  // 가챠 버튼
  const gachaBtn = buildGachaButton();
  gachaBtn.x = 912; gachaBtn.y = 620;
  mainFrame.appendChild(gachaBtn);

  page.appendChild(mainFrame);

  // ── 3. 키패드 변형 4종 ──
  const variantsFrame = frame('⌨️ 키패드 변형 (4 Variants)', 2480, 600, {
    fills:[{ type:'SOLID', color:T.color.bgPage }],
    layout:'HORIZONTAL',
    p:40, gap:40,
  });
  variantsFrame.x = 0; variantsFrame.y = 580;

  const variants = [
    { label:'Numeric (숫자)', mode:'numeric' },
    { label:'Fraction (분수)', mode:'fraction' },
    { label:'Unit (단위)',    mode:'unit'     },
    { label:'Choice (선택)', mode:'choice'   },
  ];

  variants.forEach(({ label, mode }) => {
    const vf = frame(`Variant-${label}`, 560, 520, {
      fills:[{ type:'SOLID', color:T.color.bgCard }],
      radius:T.radius.xxl,
      shadow: T.shadow.card,
      layout:'VERTICAL',
      p:32, gap:16,
    });
    const vtitle = text(label, 16, 700, T.color.textSecond);
    vf.appendChild(vtitle);
    const kp = buildKeypad(mode);
    vf.appendChild(kp);
    variantsFrame.appendChild(vf);
  });
  page.appendChild(variantsFrame);

  // ── 4. 컴포넌트 스펙 ──
  const specFrame = frame('📐 Component Spec', 800, 480, {
    fills:[{ type:'SOLID', color:T.color.bgCard }],
    radius:T.radius.xxl,
    shadow:T.shadow.card,
    layout:'VERTICAL',
    p:40, gap:24,
  });
  specFrame.x = 0; specFrame.y = 1240;

  const specTitle = text('컴포넌트 스펙', 22, 900, T.color.textPrimary);
  specFrame.appendChild(specTitle);

  const specs = [
    { comp:'사이드바',        w:'288px',  h:'768px',  r:'0px',   font:'Inter 14px Semi Bold' },
    { comp:'개념 카드',       w:'560px',  h:'340px',  r:'32px',  font:'Inter 36px Extra Bold' },
    { comp:'연습 패널',       w:'560px',  h:'600px',  r:'32px',  font:'Inter 24px Extra Bold' },
    { comp:'키패드 버튼',     w:'1/3col', h:'64px',   r:'16px',  font:'Inter 24px Bold' },
    { comp:'단위 버튼',       w:'auto',   h:'44px',   r:'12px',  font:'Inter 15px Bold' },
    { comp:'채점 버튼',       w:'100%',   h:'56px',   r:'24px',  font:'Inter 18px Bold' },
    { comp:'가챠 버튼',       w:'128px',  h:'128px',  r:'64px',  font:'Material Symbols 52px' },
  ];

  const header = frame('SpecHeader', 720, 32, { fills:[], layout:'HORIZONTAL', gap:0 });
  ['컴포넌트','Width','Height','Radius','Typography'].forEach((h,i) => {
    const w = [180,100,100,80,260][i];
    const ht = text(h, 11, 700, T.color.textMuted);
    ht.resize(w, 20);
    header.appendChild(ht);
  });
  specFrame.appendChild(header);

  const divider = rect('Divider', 720, 1, T.color.border200);
  specFrame.appendChild(divider);

  specs.forEach(s => {
    const row = frame(`Spec-${s.comp}`, 720, 36, { fills:[], layout:'HORIZONTAL', gap:0, crossAxis:'CENTER' });
    [s.comp, s.w, s.h, s.r, s.font].forEach((val,i) => {
      const w = [180,100,100,80,260][i];
      const t2 = text(val, 12, i===0?600:400, i===0?T.color.textPrimary:T.color.textSecond);
      t2.resize(w, 20);
      row.appendChild(t2);
    });
    specFrame.appendChild(row);
  });
  page.appendChild(specFrame);

  // 뷰 이동
  figma.viewport.scrollAndZoomIntoView([mainFrame]);

  figma.notify('✅ 개념 가챠 UI 생성 완료! (토큰 + 메인 + 키패드 4종 + 스펙)');
  figma.closePlugin();
}

buildAll().catch(e => {
  figma.notify('❌ 오류: ' + e.message, { error: true });
  figma.closePlugin();
});
