# 개념 가챠 — 디자인 리팩토링 계획

> 작성일: 2026-03-25
> 목표: 모든 페이지를 일관된 디자인 시스템으로 통일. AI 슬롭 패턴 완전 제거.

---

## 1. 핵심 디자인 방향

**콘셉트: "교과서 + 게임팩"**
신뢰감 있는 학습 도구이면서, 카드 뽑기의 보상감이 느껴지는 UI.
과도한 게임화는 피하고 — 깔끔하고 구조적이되 생동감 있게.

**3단어**: 믿음직한 · 몰입감 · 보상적인

---

## 2. 디자인 토큰 (전 페이지 공통)

### 색상 팔레트
```
surface:                 #fdf6ec  (따뜻한 크림/페이퍼)
surface-container-lowest:#ffffff
surface-container-low:   #f5ead8
surface-container:       #ecdece
surface-container-high:  #e2d0be
primary:                 #c23800  (딥 번트 오렌지-레드)
primary-container:       #ff6535
primary-fixed:           #ffe8d9
on-primary:              #ffffff
secondary:               #2a2b96  (딥 인디고)
secondary-fixed:         #e0e1ff
on-secondary:            #ffffff
tertiary:                #00785a  (딥 에메랄드)
tertiary-container:      #00c893
on-tertiary:             #ffffff
on-surface:              #1c0a00  (따뜻한 거의 검정)
on-surface-variant:      #5c3820  (따뜻한 갈색)
outline:                 #9c6840
outline-variant:         #deb896
error:                   #ba1a1a
```

### 타이포그래피
- Headline font: `Plus Jakarta Sans` (Bold/Black)
- Body font: `Inter` + `Noto Sans KR`
- Scale:
  - 페이지 제목: `text-2xl font-black` (headline)
  - 카드 질문: `text-2xl font-bold leading-snug` (headline) → 지금보다 크게
  - 섹션 레이블: `text-[11px] font-bold uppercase tracking-[0.14em]` (label)
  - 본문: `text-sm font-medium`

### 보더 반경
```
sm: 6px / DEFAULT: 10px / lg: 14px / xl: 18px / 2xl: 24px / full: 9999px
```

### 그림자
반복되는 `shadow-[0px_Npx_Mpx_rgba(88,66,55,X)]` 대신 CSS 변수로 통일:
```css
--shadow-card: 0 2px 16px rgba(28,10,0,0.07);
--shadow-button: 0 4px 0 rgba(140,40,0,0.6), 0 6px 20px rgba(194,56,0,0.25);
```

---

## 3. 공통 컴포넌트 규칙

### Header (모든 페이지)
- **배경**: `bg-surface-container-lowest` (솔리드, glassmorphism 완전 금지)
- **보더**: `border-b border-outline-variant/30`
- **높이**: `h-14`
- **구조**: `[학생 아바타 + 페이지명] | [다크모드 토글]`

### Bottom Nav (gacha, dashboard, add, list)
- **배경**: `bg-surface-container-lowest border-t border-outline-variant/30`
- **glassmorphism 완전 금지**
- **Active 상태 통일**: 모든 페이지에서 동일한 패턴
  ```html
  <!-- 활성 -->
  <div class="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full bg-primary-fixed text-primary" aria-current="page">
  <!-- 비활성 -->
  <a class="flex flex-col items-center gap-0.5 p-2 text-outline hover:text-primary rounded-xl transition-colors active:scale-90">
  ```
- **레이블**: 한국어로 통일 (Students→학생, Gacha→뽑기, Add→추가, Cards→목록, Admin→관리, Stats→현황)

### Primary Button (뽑기, 채점 등)
- `bg-primary text-on-primary rounded-2xl font-headline font-black`
- 그라디언트 완전 금지
- 3D 느낌: `shadow-[0_4px_0_rgba(140,40,0,0.7),0_6px_20px_rgba(194,56,0,0.25)]`
- Active: `active:translate-y-1 active:shadow-[0_1px_0_rgba(140,40,0,0.7)]`

### Section Label
- 모든 섹션 라벨: `text-[11px] font-bold text-outline uppercase tracking-[0.14em]`
- 섹션 타이틀이 tiny ALL CAPS만 있으면 안 됨 → 읽기 가능한 크기 필요

### 카드 컨테이너
- `bg-surface-container-lowest` + `rounded-2xl` + CSS var 그림자
- **한쪽에만 컬러 보더 금지** (left/right/top accent bar)
- **카드 안에 카드 금지** (nested cards)

---

## 4. 파일별 문제점 & 수정 계획

---

### 📄 index.html (로그인)
**현황**: 이미 재설계됨 (split layout, warm palette)
**남은 문제**: 없음 (완료)
**수정사항**: 없음 ✅

---

### 📄 gacha.html (카드 뽑기) ← 핵심 페이지
**현황 문제점:**
1. `#boxAccentBar`: 3px 좌측 세로 컬러바 → ❌ 가장 클리셰한 AI 패턴
2. `heroCardOuter`: 카드 안에 또 카드 (answer box)
3. `#mcqChoices`: `grid-cols-2` → 수학 텍스트에 너무 좁음
4. `#cardCategory`: `text-[10px]` ALL CAPS → 읽기 불가
5. `#cardQuestion`: `text-[1.6rem]` → 메인 콘텐츠 너무 작음
6. `#feedbackBtns`: 알았다/몰랐다 동일한 neutral 스타일 → 계층 없음
7. `#gachaBtn`: pill 모양 일반 버튼 → 뽑기의 특별함 없음
8. `dailyBanner`: 진행바가 카드 컨테이너 안에 불필요하게 감싸짐
9. `practiceSection`: 카드 안에 카드 (중첩)
10. Bottom nav: 영어 레이블, active 상태 불일치

**수정 계획:**
```
boxAccentBar:   3px 좌측바 제거 → JS는 색상만 설정하므로 element는 유지,
                단 크기/위치 변경: 카드 상단 전체 폭 h-1 stripe로 변경
heroCardOuter:  좌측바 flex 구조 제거 → 단순 block 구조
cardCategory:   text-[10px] ALL CAPS → rounded-full pill (text-xs, readable)
cardQuestion:   text-[1.6rem] → text-2xl (더 크게)
mcqChoices:     grid-cols-2 → flex flex-col (1열 스택)
mcq-btn:        height 증가, 더 명확한 선택 느낌
answerBox:      nested card 제거 → 인라인 텍스트 스타일 reveal
feedbackBtns:   알았다: tertiary 컬러 (초록), 몰랐다: error 컬러 (빨강)
gachaBtn:       더 크고 특별하게 — 3D press 효과, rounded-2xl, 더 큰 폰트
dailyBanner:    카드 컨테이너 제거 → 진행바만 (간결하게)
practiceSection: 중첩 카드 평탄화
Bottom nav:     한국어 레이블, active 상태 통일
```

---

### 📄 dashboard.html (학습 현황)
**현황 문제점:**
1. `h-1 bg-primary-fixed` 상단 accent stripe → ❌ 한쪽 컬러 보더 패턴
2. 빠른 이동 섹션: `grid-cols-2` 동일한 카드 2개 (icon + heading + text 패턴 반복)
3. Bottom nav: active 상태가 gacha.html과 동일 패턴 (OK) 이지만 레이블 영어

**수정 계획:**
```
h-1 accent stripe: 제거 → 오늘 학습 섹션 레이블을 더 크게/색상으로 구분
빠른 이동 섹션: grid-cols-2 카드 → 다른 레이아웃으로
Bottom nav 레이블: 한국어로 통일
```

---

### 📄 admin.html (관리자)
**현황 문제점:**
1. PIN 게이트: 모달 스타일 (overlay) → 허용 가능 (admin 특수 케이스)
2. 본체: 색상 팔레트는 이미 업데이트됨
3. 영역별 섹션이 모두 동일한 rounded-2xl 카드 스타일

**수정 계획:**
```
색상 팔레트: 이미 완료 ✅
구조: 큰 변경 없음 (admin은 기능 우선)
세부: 섹션 헤더 스타일 일관성 확인
```

---

### 📄 add.html (카드 추가)
**현황 문제점:**
1. Header에 `.glass` 클래스 (backdrop-filter blur) → ❌ glassmorphism
2. CSS `field-input` 클래스에 하드코딩 색상 (`#f2f4f6`, `#ffffff`, `#191c1e`)
3. Bottom nav에 `.glass` + `rounded-t-xl` → ❌ glassmorphism
4. Bottom nav active 상태: `scale-110 shadow-inner` 방식 → gacha.html과 불일치

**수정 계획:**
```
Header glass: → bg-surface-container-lowest border-b border-outline-variant/30
CSS field-input 색상: → Tailwind 토큰 클래스로 교체
Bottom nav glass: → bg-surface-container-lowest border-t border-outline-variant/30
Bottom nav active: → gacha.html과 동일한 rounded-full bg-primary-fixed 패턴
```

---

### 📄 list.html (전체 목록)
**현황 문제점:**
1. Header에 `.glass` 클래스 → ❌ glassmorphism
2. Bottom nav에 `.glass` + `rounded-t-xl` → ❌ glassmorphism
3. 카드 목록 하단에 인라인 그라디언트: `style="background: linear-gradient(to right, #9d4300, #f97316)"` → ❌
4. Bottom nav active 상태: `scale-110 shadow-inner` 방식 → gacha.html과 불일치

**수정 계획:**
```
Header/nav glass: → 솔리드 배경으로 교체
인라인 그라디언트: → bg-primary 또는 제거
Bottom nav active: → 통일된 패턴
```

---

### 📄 js/layout.js (사이드바, 공통)
**현황 문제점:**
1. 사이드바는 데스크탑 전용 — 모바일에서 unused
2. Toast className에 `bg-slate-900` 잔재는 이미 수정됨 ✅
3. 사이드바 내 nav 스타일이 페이지 bottom nav와 별도 관리

**수정 계획:**
```
큰 구조 변경 없음
토스트 스타일 확인
```

---

## 5. 수정 우선순위 & 순서

```
1단계 (고임팩트, 전 페이지):
  - add.html, list.html: glass 제거 + bottom nav 통일

2단계 (핵심 페이지 재설계):
  - gacha.html: 카드 구조, 버튼, MCQ, 진행바 전면 개편

3단계 (대시보드 polish):
  - dashboard.html: accent stripe 제거, quick actions 개선
```

---

## 6. 금지 목록 (전 페이지)

| 금지 | 대신 |
|------|------|
| `backdrop-filter: blur()` | 솔리드 배경 |
| `linear-gradient()` in style attr | Tailwind 토큰 클래스 |
| 한쪽만 컬러 보더 (left/right/top 3px bar) | 없애거나 전체 보더 |
| `grid-cols-2` MCQ 선택지 | `flex flex-col` |
| 카드 안에 카드 | 평탄화 |
| 영어 nav 레이블 | 한국어 |
| 모든 primary 버튼 동일 스타일 | 계층 구분 |
| `text-[10px]` ALL CAPS 섹션 헤더 | 읽기 가능한 크기 |

---

## 7. 건드리지 않을 것들

- 모든 element ID (JS 훅)
- JS 로직 전체
- MCQ `.correct` / `.wrong` 클래스 토글
- kp-btn, blank-slot 등 JS가 직접 조작하는 요소들
- Supabase, daily-session, problem-generators 등 모든 모듈

---

*이 계획을 기반으로 각 파일을 순서대로 수정한다.*
