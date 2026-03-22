/**
 * Concept Gacha — Design Tokens v2
 * "The Curated Collector" Design System
 *
 * Material Design 3 기반 색상 체계
 * Tailwind config에 직접 적용 가능한 형태로 정의
 */

// ─── Color Tokens ─────────────────────────────────────────────────
export const colors = {

  // ── Surface Hierarchy ──────────────────────────────────────────
  // 페이지 → 패널 → 카드 순으로 밝아지는 계층
  'surface':                    '#f7f9fb',   // 페이지 배경
  'surface-bright':             '#f7f9fb',   // 부유 레이어 배경
  'surface-dim':                '#d8dadc',   // 스크롤 영역 edge, 비활성
  'surface-container-lowest':   '#ffffff',   // 카드, 입력 필드
  'surface-container-low':      '#f2f4f6',   // 패널, 키패드 영역
  'surface-container':          '#eceef0',   // 섹션 구분
  'surface-container-high':     '#e6e8ea',   // 호버 상태, DEL/액션 버튼
  'surface-container-highest':  '#e0e3e5',   // 최상위 강조

  // ── Primary (Orange / Brand) ───────────────────────────────────
  'primary':                    '#9d4300',   // 진한 오렌지 — 텍스트, 아이콘
  'primary-container':          '#f97316',   // 밝은 오렌지 — CTA 버튼, gradient 끝
  'primary-fixed':              '#ffdbca',   // 연한 오렌지 — 활성 nav 배경
  'primary-fixed-dim':          '#ffb690',   // 중간 오렌지 — hover 상태
  'on-primary':                 '#ffffff',   // 흰색 — primary 위 텍스트
  'on-primary-container':       '#582200',   // 어두운 오렌지 — primary-container 위 텍스트
  'on-primary-fixed':           '#341100',
  'on-primary-fixed-variant':   '#783200',
  'inverse-primary':            '#ffb690',

  // ── Secondary (Indigo / Accent) ────────────────────────────────
  'secondary':                  '#4648d4',   // 인디고 — 텍스트, 활성 상태
  'secondary-container':        '#6063ee',   // 밝은 인디고 — 태그, 칩, 아이콘 배경
  'secondary-fixed':            '#e1e0ff',   // 연한 인디고 — 선택된 칩 배경
  'secondary-fixed-dim':        '#c0c1ff',
  'on-secondary':               '#ffffff',
  'on-secondary-container':     '#fffbff',
  'on-secondary-fixed':         '#07006c',
  'on-secondary-fixed-variant': '#2f2ebe',

  // ── Tertiary (Emerald / Success) ──────────────────────────────
  'tertiary':                   '#006c49',   // 에메랄드 — 정답, 마스터드 텍스트
  'tertiary-container':         '#00b07a',   // 밝은 에메랄드 — 정답 배경, 아이콘
  'tertiary-fixed':             '#6ffbbe',
  'tertiary-fixed-dim':         '#4edea3',
  'on-tertiary':                '#ffffff',
  'on-tertiary-container':      '#003b26',   // 에메랄드 위 텍스트
  'on-tertiary-fixed':          '#002113',
  'on-tertiary-fixed-variant':  '#005236',

  // ── Error (오답, 경고) ─────────────────────────────────────────
  // ※ 주의: error 색상은 "punishing red"가 되지 않도록 container를 사용
  'error':                      '#ba1a1a',   // 직접 사용 최소화
  'error-container':            '#ffdad6',   // 오답 배경 — on-error-container 텍스트와 함께 사용
  'on-error':                   '#ffffff',
  'on-error-container':         '#93000a',   // 오답 텍스트

  // ── Text & Outline ─────────────────────────────────────────────
  'on-surface':                 '#191c1e',   // 본문 텍스트 (100% black 사용 금지)
  'on-background':              '#191c1e',
  'on-surface-variant':         '#584237',   // 보조 텍스트, shadow tint
  'outline':                    '#8c7164',   // 힌트, 비활성, placeholder
  'outline-variant':            '#e0c0b1',   // Ghost border (15% opacity로 사용)
  'inverse-surface':            '#2d3133',
  'inverse-on-surface':         '#eff1f3',

  // ── Surface Tint ──────────────────────────────────────────────
  'surface-tint':               '#9d4300',
  'surface-variant':            '#e0e3e5',

  // ── Background ────────────────────────────────────────────────
  'background':                 '#f7f9fb',
};

// ─── Typography Tokens ────────────────────────────────────────────
export const typography = {
  fontFamily: {
    headline: ['Plus Jakarta Sans', 'Noto Sans KR', 'sans-serif'],
    body:     ['Inter', 'Noto Sans KR', 'sans-serif'],
    label:    ['Inter', 'Noto Sans KR', 'sans-serif'],
  },

  // 크기 / 굵기 / 자간 스케일
  scale: {
    'display-lg':  { size: '3.5rem',   weight: 700, tracking: '-0.02em', family: 'headline' },
    'headline-md': { size: '1.75rem',  weight: 600, tracking: '-0.01em', family: 'headline' },
    'title-lg':    { size: '1.375rem', weight: 600, tracking: '0',       family: 'body'     },
    'body-lg':     { size: '1rem',     weight: 400, tracking: '0.01em',  family: 'body'     },
    'label-md':    { size: '0.75rem',  weight: 500, tracking: '0.05em',  family: 'label'    },
  },
};

// ─── Border Radius Tokens ─────────────────────────────────────────
export const borderRadius = {
  'DEFAULT': '1rem',    // 16px — 기본 카드 내부
  'lg':      '2rem',    // 32px — 카드 내부 answer box
  'xl':      '3rem',    // 48px — HeroCard 외부 컨테이너
  'full':    '9999px',  // 완전 원형 — FAB, 아바타, pill 칩
};

// ─── Shadow Tokens ────────────────────────────────────────────────
// on-surface-variant (#584237) 색상 기반 — 순수 black 사용 금지
export const shadows = {
  // HeroCard ambient shadow
  'card':   '0px 20px 40px rgba(88, 66, 55, 0.06)',
  // FAB — primary 색상 기반 컬러 그림자
  'fab':    '0px 10px 30px rgba(157, 67, 0, 0.30)',
  // 미묘한 카드 그림자
  'subtle': '0px 4px 12px rgba(88, 66, 55, 0.04)',
  // TopBar/BottomNav
  'nav':    '0px -10px 40px rgba(249, 115, 22, 0.08)',
};

// ─── Glass (Glassmorphism) Tokens ─────────────────────────────────
export const glass = {
  // TopAppBar, BottomNav 에 적용
  standard: {
    background: 'rgba(255, 255, 255, 0.70)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  // dark mode
  dark: {
    background: 'rgba(30, 33, 36, 0.70)',
    backdropFilter: 'blur(20px)',
  },
};

// ─── Gradient Tokens ──────────────────────────────────────────────
export const gradients = {
  // 가챠 FAB, 저장 버튼 등 고-CTA 액션
  'primary-cta': 'linear-gradient(135deg, #9d4300, #f97316)',
  // 카드 하단 accent 바
  'card-accent': 'linear-gradient(to right, #9d4300, #f97316)',
  // 진행률 바
  'progress':    'linear-gradient(to right, #006c49, #00b07a)',
  // 배경 ambient (semi-transparent)
  'orb-primary': 'radial-gradient(circle, rgba(255, 219, 202, 0.30) 0%, transparent 70%)',
  'orb-secondary':'radial-gradient(circle, rgba(225, 224, 255, 0.20) 0%, transparent 70%)',
};

// ─── Spacing Tokens ───────────────────────────────────────────────
// DESIGN.md: spacing-8 (2.75rem), spacing-10 (3.5rem) 핵심 간격
export const spacing = {
  'xs':  '0.5rem',    //  8px
  'sm':  '1rem',      // 16px
  'md':  '1.5rem',    // 24px
  'lg':  '2rem',      // 32px
  'xl':  '2.75rem',   // 44px — spacing-8 (핵심 여백)
  'xxl': '3.5rem',    // 56px — spacing-10 (키 개념 주변 여백)
};

// ─── Figma Plugin용 RGB 변환 ──────────────────────────────────────
// hex → {r, g, b} (0~1 범위)
function hex2rgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

// Figma 플러그인에서 사용하는 T 객체 형식
export const T = {
  color: Object.fromEntries(
    Object.entries(colors).map(([k, v]) => [
      k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),  // kebab → camelCase
      hex2rgb(v),
    ])
  ),
  radius: {
    sm:   16,   // DEFAULT
    md:   32,   // lg
    lg:   48,   // xl
    full: 9999,
  },
  shadow: {
    card:   [{ type: 'DROP_SHADOW', color: { r: 0.345, g: 0.259, b: 0.216, a: 0.06 }, offset: { x: 0, y: 20 }, radius: 40, spread: 0, visible: true, blendMode: 'NORMAL' }],
    fab:    [{ type: 'DROP_SHADOW', color: { r: 0.616, g: 0.263, b: 0.000, a: 0.30 }, offset: { x: 0, y: 10 }, radius: 30, spread: 0, visible: true, blendMode: 'NORMAL' }],
    subtle: [{ type: 'DROP_SHADOW', color: { r: 0.345, g: 0.259, b: 0.216, a: 0.04 }, offset: { x: 0,  y:  4 }, radius: 12, spread: 0, visible: true, blendMode: 'NORMAL' }],
    nav:    [{ type: 'DROP_SHADOW', color: { r: 0.976, g: 0.451, b: 0.086, a: 0.08 }, offset: { x: 0, y: -10 }, radius: 40, spread: 0, visible: true, blendMode: 'NORMAL' }],
  },
};

// ─── Tailwind Config 스니펫 ───────────────────────────────────────
// tailwind.config.js 의 theme.extend 에 그대로 붙여넣기
export const tailwindTheme = {
  colors,
  fontFamily: typography.fontFamily,
  borderRadius,
};
