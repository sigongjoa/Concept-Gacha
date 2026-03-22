# Concept Gacha — Design Guidelines v2
**"The Curated Collector" Design System**

> 교육 콘텐츠를 프리미엄 수집품처럼 — 학습이 보상처럼 느껴지는 경험

---

## 목차
1. [핵심 원칙](#1-핵심-원칙)
2. [색상 시스템](#2-색상-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [레이아웃 & 간격](#4-레이아웃--간격)
5. [Elevation & Depth](#5-elevation--depth)
6. [컴포넌트 명세](#6-컴포넌트-명세)
7. [인터랙션 & 상태](#7-인터랙션--상태)
8. [금지 사항 (Don'ts)](#8-금지-사항-donts)
9. [Breakpoint 전략](#9-breakpoint-전략)

---

## 1. 핵심 원칙

### 1-1. The Curated Collector
학습을 단순 반복이 아닌 **희귀 카드 수집**처럼 만든다. 카드를 뽑는 순간이 "발견"처럼 느껴져야 한다.

- 카드의 등장은 단순 렌더링이 아닌 **수집 애니메이션**
- 정답 확인은 "정답임을 알림"이 아닌 **보물 공개 의식**
- 상자 승급은 **레벨업 경험**

### 1-2. Intentional Asymmetry (의도적 비대칭)
중심 정렬 그리드를 거부한다. "살아있는" 레이아웃을 만든다.

```
✅ 카테고리 라벨이 카드 모서리를 넘쳐 올라가도록 (absolute overlap)
✅ 다양한 spacing 값 혼용 (gap-3.5 옆에 gap-6)
✅ 카드 내 텍스트 좌측 정렬 + 오른쪽 즐겨찾기 아이콘 (비대칭 구도)

❌ 모든 요소를 중앙 정렬 + 균등 간격
❌ 모든 섹션 동일한 padding
```

### 1-3. No-Line Rule (경계선 금지)
**1px solid line으로 영역을 나누지 않는다.**

경계는 다음 두 가지로만 표현한다:
1. **배경 색상 전환** — `surface-container-low` 위에 `surface-container-lowest` 카드
2. **Tonal Transition** — `surface-dim`으로 스크롤 영역의 끝을 표현

```
❌ border border-slate-100
❌ border-r border-slate-100 (사이드바 구분선)
❌ divide-y divide-slate-100
✅ bg-surface-container-low 배경 위 bg-surface-container-lowest 카드
✅ ghost border: outline-variant 색상을 15% opacity로 (접근성 필수 시만)
```

### 1-4. Glass & Gradient Rule
최상위 레이어(nav, FAB)는 **Glassmorphism**, 핵심 CTA는 **Gradient**.

```css
/* Glass 적용 공식 */
background: rgba(255, 255, 255, 0.70);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

/* CTA Gradient 공식 */
background: linear-gradient(135deg, #9d4300, #f97316); /* primary → primary-container */
```

---

## 2. 색상 시스템

### 2-1. Surface Hierarchy (밝기 순)

```
surface-container-lowest : #ffffff   ← 카드, 입력 필드 (가장 밝음)
surface-container-low    : #f2f4f6   ← 패널, 키패드 영역
surface / surface-bright : #f7f9fb   ← 페이지 배경
surface-container        : #eceef0   ← 중간 구분 영역
surface-container-high   : #e6e8ea   ← 호버 상태, DEL 버튼
surface-container-highest: #e0e3e5   ← 강조 영역
surface-dim              : #d8dadc   ← 스크롤 edge (어두움)
```

**사용 원칙:**
- 카드를 `surface-container-low` 배경 위에 놓으면 테두리 없이도 구분됨
- 중첩 카드는 한 단계씩 밝게 (low → lowest)
- dark mode: 동일 계층 관계 유지, 각 토큰의 dark 버전 사용

### 2-2. Brand Colors

| 역할 | 토큰 | HEX | 사용처 |
|---|---|---|---|
| 브랜드 메인 | `primary` | `#9d4300` | 로고, 카테고리 라벨, 아이콘 |
| 브랜드 밝음 | `primary-container` | `#f97316` | CTA gradient 끝, accent bar |
| 브랜드 연함 | `primary-fixed` | `#ffdbca` | 활성 nav 배경, 아바타 배경 |
| 보조 | `secondary-container` | `#6063ee` | Series 칩, 아이콘 원형 배경 |
| 성공/정답 | `tertiary-container` | `#00b07a` | 정답 아이콘, 체크 배경 |
| 성공 텍스트 | `tertiary` | `#006c49` | 정답 텍스트, 마스터드 상태 |
| 오류 배경 | `error-container` | `#ffdad6` | 오답 배경 (punishing 금지) |
| 오류 텍스트 | `on-error-container` | `#93000a` | 오답 텍스트 |

### 2-3. 학습 상자 색상 (Box Colors)

| 상자 | 배경 | 텍스트/도트 | 비고 |
|---|---|---|---|
| 상자 1 (C급) | `error-container` `#ffdad6` | `on-error-container` `#93000a` | 요복습 필요 |
| 상자 2 (B급) | `#fff8e1` (amber-50) | `#f59e0b` (amber-500) | 복습 중 |
| 상자 3 (A급) | `tertiary-container/15` | `tertiary` | 잘 알고 있음 |
| 상자 4 (S급) | `secondary-fixed` `#e1e0ff` | `secondary` | 마스터드 |
| 상자 5 (SS급) | `primary-fixed` `#ffdbca` | `primary` | 완벽 마스터 |

### 2-4. 금지 색상 조합

```
❌ 순수 black (#000000) 텍스트 → on-surface (#191c1e) 사용
❌ 순수 gray border (#e5e7eb) 섹션 구분 → No-Line Rule 적용
❌ error (#ba1a1a) 직접 사용 → error-container + on-error-container 사용
❌ blue focus ring (ring-blue-500) → primary ghost border 사용
```

---

## 3. 타이포그래피

### 3-1. 폰트 패밀리

```css
/* 헤드라인 — 프리미엄, 약간 넓음, 개성 있음 */
font-family: 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif;
/* .font-headline 클래스로 적용 */

/* 본문/레이블 — 고가독성, 기능적 */
font-family: 'Inter', 'Noto Sans KR', sans-serif;
/* .font-body, .font-label 클래스로 적용 */
```

### 3-2. 타이포그래피 스케일

| 레벨 | 토큰 | 폰트 | 크기 | 굵기 | 자간 | 사용처 |
|---|---|---|---|---|---|---|
| Display | `display-lg` | Plus Jakarta Sans | 3.5rem | 700 | -0.02em | 카드 발견 순간 (전체화면) |
| Headline | `headline-md` | Plus Jakarta Sans | 1.75rem | 600 | -0.01em | 카드 질문 텍스트 |
| Title | `title-lg` | Inter | 1.375rem | 600 | 0 | 섹션 헤더, 패널 제목 |
| Body | `body-lg` | Inter | 1rem | 400 | 0.01em | 일반 설명 텍스트 |
| Label | `label-md` | Inter | 0.75rem | 500 | 0.05em | 카테고리 태그, 버튼 내 텍스트 |

### 3-3. 사용 규칙

```
✅ 카드 질문: font-headline text-3xl font-bold (headline-md)
✅ 정답 텍스트: font-headline text-2xl font-bold
✅ 카테고리 라벨: font-label text-xs font-bold uppercase tracking-widest text-primary
✅ 버튼 텍스트: font-label font-bold uppercase tracking-widest
✅ nav 탭 라벨: font-bold text-[10px] uppercase tracking-widest

❌ 카드 질문에 Inter 사용 (Plus Jakarta Sans만)
❌ 버튼 텍스트에 lowercase 사용
❌ heading에 font-weight 400 사용
```

---

## 4. 레이아웃 & 간격

### 4-1. 페이지 구조 (모바일 기본)

```
┌─────────────────────────────────────────┐
│  [TopAppBar] fixed top-0 h-16           │
├─────────────────────────────────────────┤
│                                         │
│  [Main Content]                         │
│  pt-20 pb-32 px-6 max-w-2xl mx-auto    │
│  space-y-8                              │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  HeroCard                        │   │
│  │  rounded-xl (3rem)               │   │
│  │  shadow-[ambient]                │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  PracticePanel                   │   │
│  │  bg-surface-container-low        │   │
│  │  rounded-lg (2rem)               │   │
│  └──────────────────────────────────┘   │
│                                         │
│  [Keypad] grid grid-cols-4             │
│                                         │
├─────────────────────────────────────────┤
│  [FAB] fixed bottom-28 right-6          │
│  [BottomNav] fixed bottom-0            │
│  pb-8 pt-4 rounded-t-[3rem]           │
└─────────────────────────────────────────┘
```

### 4-2. 핵심 간격 값

```css
/* DESIGN.md 명시 간격 */
spacing-8:  2.75rem (44px) — 주요 개념 주변 여백
spacing-10: 3.5rem  (56px) — 섹션 간 최대 여백

/* 컴포넌트 내부 */
p-8:  2rem (32px) — HeroCard, 폼 내부 패딩
p-6:  1.5rem (24px) — 패널 내부 패딩
gap-3: 0.75rem (12px) — 키패드 버튼 간격
```

### 4-3. 최대 너비

```
본문 컨텐츠: max-w-2xl (672px)
폼/카드:     max-w-xl (576px)
태블릿 전체: max-w-4xl (896px)
```

---

## 5. Elevation & Depth

### 5-1. Tonal Layering 원칙

**구조적 그림자 사용 금지** — 깊이는 색상 계층으로 표현한다.

```
배경(surface) → 섹션(surface-container-low) → 카드(surface-container-lowest)
     낮음                  중간                        높음 (물리적 상단)
```

### 5-2. Shadow 명세

```css
/* HeroCard — ambient light, on-surface-variant 색상 기반 */
box-shadow: 0px 20px 40px rgba(88, 66, 55, 0.06);
/* Tailwind: shadow-[0px_20px_40px_rgba(88,66,55,0.06)] */

/* FAB — primary 컬러 그림자 */
box-shadow: 0px 10px 30px rgba(157, 67, 0, 0.30);
/* Tailwind: shadow-[0_10px_30px_rgba(157,67,0,0.3)] */

/* 미묘한 리스트 아이템 */
box-shadow: 0px 4px 12px rgba(88, 66, 55, 0.04);

/* BottomNav 위 오렌지 ambient */
box-shadow: 0px -10px 40px rgba(249, 115, 22, 0.08);
```

### 5-3. 정답/오답 피드백 표현

```
정답: 카드 배경을 tertiary-container/10으로 shift (테두리 X)
오답: error-container 배경으로 shift (punishing red 직접 사용 금지)
마스터드: 전체 카드 배경을 tertiary-container/15로 "embedded" 느낌
```

---

## 6. 컴포넌트 명세

### 6-1. TopAppBar

```html
<header class="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
  <div class="flex justify-between items-center px-6 py-3">
    <!-- Left: Student Avatar + Brand Name -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden">
        <!-- 학생 아바타 이미지 or 이니셜 -->
      </div>
      <h1 class="text-xl font-bold tracking-tight text-primary font-headline">
        Concept Gacha
      </h1>
    </div>
    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <!-- 알림 버튼 -->
      <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary-fixed/50 transition-colors">
        <span class="material-symbols-outlined text-primary">notifications</span>
      </button>
    </div>
  </div>
  <!-- 하단 구분선 (No-Line Rule 예외: 접근성) -->
  <div class="bg-surface-dim/30 h-px w-full"></div>
</header>
```

**규칙:**
- Glass: `bg-white/70 backdrop-blur-xl`
- 높이: 64px (`py-3` + content)
- z-index: 50 (키패드 위, FAB 아래)
- safe-area: `pt-[env(safe-area-inset-top)]` 적용 (iOS)

---

### 6-2. BottomNav

```html
<nav class="fixed bottom-0 left-0 w-full z-50
            flex justify-around items-center
            px-4 pb-8 pt-4
            bg-white/70 backdrop-blur-xl
            rounded-t-[3rem]
            shadow-[0_-10px_40px_rgba(249,115,22,0.08)]">

  <!-- 비활성 탭 -->
  <button class="flex flex-col items-center justify-center
                 text-slate-400 p-2
                 hover:text-primary transition-all active:scale-90">
    <span class="material-symbols-outlined">group</span>
    <span class="font-bold text-[10px] uppercase tracking-widest mt-1">Students</span>
  </button>

  <!-- 활성 탭 (pill 스타일) -->
  <button class="flex flex-col items-center justify-center
                 bg-primary-fixed text-primary
                 rounded-full px-5 py-2 scale-110 shadow-inner">
    <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">
      auto_awesome
    </span>
    <span class="font-bold text-[10px] uppercase tracking-widest mt-1">Gacha</span>
  </button>
</nav>
```

**규칙:**
- 탭 순서: Students / **Gacha** / Add / Cards / Admin
- 활성 탭: `bg-primary-fixed` + pill shape + `scale-110`
- safe-area: `pb-[calc(2rem+env(safe-area-inset-bottom))]`
- 높이 예약: main content에 `pb-32` 필수

---

### 6-3. HeroCard (Concept Flashcard)

```html
<section class="relative">
  <!-- 오버랩 시리즈 태그 (카드 밖으로 튀어나옴) -->
  <div class="absolute -top-4 -right-2 z-10">
    <span class="bg-secondary-container text-on-secondary-container
                 px-4 py-1.5 rounded-full
                 text-[10px] font-bold uppercase tracking-widest shadow-lg">
      Series 01
    </span>
  </div>

  <div class="bg-surface-container-lowest rounded-xl overflow-hidden
              shadow-[0px_20px_40px_rgba(88,66,55,0.06)]
              transition-all duration-500">
    <div class="p-8 space-y-6">
      <!-- 카테고리 라벨 + 즐겨찾기 (비대칭) -->
      <div class="flex justify-between items-start">
        <span class="text-primary font-bold font-label text-xs uppercase tracking-widest">
          Geometry Concept
        </span>
        <span class="material-symbols-outlined text-surface-variant">star</span>
      </div>

      <!-- 질문 -->
      <div class="space-y-4">
        <h2 class="font-headline text-3xl font-bold leading-tight text-on-surface">
          삼각형의 넓이 공식은?
        </h2>
        <!-- Orange accent underline (비대칭 위치) -->
        <div class="w-12 h-1.5 bg-primary-container rounded-full opacity-30"></div>
      </div>

      <!-- 정답 공개 영역 (토글) -->
      <div class="mt-8 p-6 bg-tertiary-container/10 rounded-lg
                  border border-tertiary-container/20">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-tertiary text-sm"
                style="font-variation-settings:'FILL' 1">check_circle</span>
          <span class="text-xs font-bold text-tertiary font-label uppercase tracking-tighter">
            Answer Revealed
          </span>
        </div>
        <p class="font-headline text-2xl font-bold text-on-tertiary-container">
          밑변 × 높이 ÷ 2
        </p>
      </div>
    </div>

    <!-- 하단 Brand Gradient Accent Bar -->
    <div class="h-2 bg-gradient-to-r from-primary to-primary-container w-full"></div>
  </div>
</section>
```

**상태 전환:**

| 상태 | 배경 | 변경 사항 |
|---|---|---|
| 질문만 | `surface-container-lowest` | 기본 |
| 정답 공개 | `surface-container-lowest` | answer box 슬라이드인 |
| 정답 | `surface-container-lowest` | confirm 버튼 → tertiary green |
| 오답 | `surface-container-lowest` | answer box → `error-container/10` |
| 마스터드 | `tertiary-container/10` | 전체 카드 배경 shift |

---

### 6-4. PracticePanel

```html
<section class="bg-surface-container-low rounded-lg p-6 space-y-4">
  <!-- 헤더 -->
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
      <span class="material-symbols-outlined text-white text-sm">edit_note</span>
    </div>
    <h3 class="font-headline font-bold text-lg">Practice Problem</h3>
  </div>

  <!-- 문제 카드 -->
  <div class="bg-surface-container-lowest rounded-lg p-5 shadow-sm">
    <p class="text-on-surface font-medium leading-relaxed">
      밑변 6cm, 높이 8cm인 삼각형의 넓이는?
    </p>

    <!-- 입력 행 -->
    <div class="mt-4 flex items-center gap-3">
      <div class="flex-1 bg-surface-container-low h-12 rounded-md
                  border-2 border-transparent
                  flex items-center px-4">
        <span class="text-on-surface-variant font-bold text-xl">24</span>
        <span class="ml-auto text-on-surface-variant font-label text-sm">cm²</span>
      </div>
      <!-- 채점 버튼 -->
      <div class="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
        <span class="material-symbols-outlined text-white"
              style="font-variation-settings:'FILL' 1">done</span>
      </div>
    </div>
  </div>
</section>
```

---

### 6-5. Keypad (4열 그리드)

```
배치:
  Row 1: [1] [2] [3] [DEL]
  Row 2: [4] [5] [6] [단위]   ← 문제 타입별 동적 (cm², π, etc.)
  Row 3: [7] [8] [9] [ 0 ]
```

```html
<section class="grid grid-cols-4 gap-3">
  <!-- 숫자 버튼 -->
  <button class="col-span-1 h-14
                 bg-surface-container-lowest rounded-md
                 font-bold text-xl shadow-sm
                 hover:bg-surface-container active:scale-95
                 transition-all">1</button>

  <!-- DEL 버튼 -->
  <button class="col-span-1 h-14
                 bg-surface-container-high rounded-md
                 font-bold text-sm
                 text-on-surface-variant shadow-sm
                 hover:bg-surface-dim active:scale-95
                 transition-all">DEL</button>

  <!-- 단위 버튼 (문맥별 동적 변경) -->
  <button class="col-span-1 h-14
                 bg-surface-container-high rounded-md
                 font-bold text-sm
                 text-on-surface-variant shadow-sm
                 hover:bg-surface-dim active:scale-95
                 transition-all">cm²</button>
</section>
```

**단위 토큰:**

| 문제 타입 | 4번째 열 버튼 |
|---|---|
| 넓이 (기본) | `cm²` → `m²` 토글 or 롤링 |
| 길이 | `cm` → `m` |
| 부피 | `cm³` → `L` |
| 각도 | `°` |
| 순수 숫자 | 없음 (0으로 대체) |
| 분수 | `―` (분수 구분선) |

---

### 6-6. FAB (Gacha DRAW)

```html
<div class="fixed bottom-28 right-6 z-50">
  <button class="w-20 h-20 rounded-full
                 bg-gradient-to-br from-primary to-primary-container
                 shadow-[0_10px_30px_rgba(157,67,0,0.3)]
                 flex flex-col items-center justify-center text-white
                 active:scale-90 transition-all group">
    <span class="material-symbols-outlined text-3xl mb-0.5
                 group-hover:rotate-12 transition-transform"
          style="font-variation-settings:'FILL' 1">auto_awesome</span>
    <span class="text-[10px] font-bold font-label uppercase tracking-widest">Draw</span>
  </button>
</div>
```

**규칙:**
- 크기: `w-20 h-20` (80px) 모바일 / `w-24 h-24` 태블릿
- 위치: `bottom-28 right-6` (BottomNav 위 16px)
- Gradient: `from-primary(#9d4300) to-primary-container(#f97316)` at 135°
- 컬러 그림자: primary 색상 기반 (`rgba(157,67,0,0.30)`)
- 로딩 중: scale pulse animation + spinner 아이콘 전환

---

### 6-7. 배경 Ambient Orbs

```html
<!-- 좌상단 — primary-fixed 오렌지 orb -->
<div class="fixed top-20 -left-20 w-64 h-64
            bg-primary-fixed/30 rounded-full
            blur-[100px] -z-10 pointer-events-none"></div>

<!-- 우하단 — secondary-fixed 인디고 orb -->
<div class="fixed bottom-40 -right-20 w-80 h-80
            bg-secondary-fixed/20 rounded-full
            blur-[100px] -z-10 pointer-events-none"></div>
```

**목적:** 흰 배경에 미묘한 브랜드 컬러 ambient light 효과. "살아있는" 공간감.

---

## 7. 인터랙션 & 상태

### 7-1. 기본 인터랙션 패턴

```css
/* 버튼 탭 */
active:scale-95    /* 대부분의 버튼 */
active:scale-90    /* FAB */
transition-all duration-150 ease-out

/* 카드 뒤집기 / 정답 공개 */
transition-all duration-500

/* 아이콘 hover rotate (FAB) */
group-hover:rotate-12 transition-transform
```

### 7-2. 카드 뽑기 애니메이션

```
1. DRAW 버튼 탭 → FAB scale-90 + pulse
2. HeroCard: opacity-0 → opacity-100 + translateY(20px) → 0
   duration: 600ms, easing: cubic-bezier(0.34, 1.56, 0.64, 1) (spring)
3. Series 태그: 약간 지연 후 등장 (delay: 200ms)
4. Category 라벨 → 질문 순서로 순차 등장
```

### 7-3. 정답 확인 상태

```
입력 중:
  border-2 border-transparent (기본)
  focus 시: border-primary/20 bg-surface-container-lowest

정답:
  confirm 버튼 → bg-tertiary-container (check icon)
  입력 필드 → bg-tertiary-container/10 border-tertiary-container/30
  0.3s delay 후 → 정답 텍스트 슬라이드인

오답:
  confirm 버튼 → bg-error-container (close icon)
  입력 필드 → bg-error-container/20 border-error/30
  HeroCard answer box → error-container/10 (punishing 금지)
  "다시 시도" 안내 (soft, 격려 톤)
```

### 7-4. 피드백 텍스트 톤

```
❌ "틀렸습니다!"  → 처벌적, 금지
✅ "한 번 더 확인해볼까요?" → 격려적

❌ "오답" 빨간 배너  → 금지
✅ error-container 배경 + 힌트 텍스트 → 허용
```

---

## 8. 금지 사항 (Don'ts)

### 8-1. 색상

```
❌ #000000 또는 text-black     → on-surface (#191c1e) 사용
❌ border-slate-100/200/300    → No-Line Rule 적용
❌ error (#ba1a1a) 직접 사용   → error-container + on-error-container
❌ ring-blue-500 focus ring    → primary ghost border로 대체
❌ bg-gray-* 직접 사용        → surface-container-* 사용
```

### 8-2. 레이아웃

```
❌ 모든 섹션 동일한 padding    → 의도적 비대칭 적용
❌ 모든 요소 중앙 정렬        → 좌측 정렬 기본, 의미 있는 곳만 중앙
❌ 1px 구분선 남발           → No-Line Rule
❌ 사이드바 레이아웃 (모바일) → BottomNav 사용
```

### 8-3. 타이포그래피

```
❌ 카드 질문에 Inter 사용     → Plus Jakarta Sans (font-headline)
❌ 버튼에 lowercase          → uppercase + tracking-widest
❌ font-weight 400 heading   → minimum 600
❌ line-height 기본값 body   → leading-relaxed 또는 leading-snug 명시
```

### 8-4. 인터랙션

```
❌ 오답을 빨간 border로 강조  → error-container 배경으로만
❌ hover:opacity-80           → hover:bg-*-container 색상 shift로
❌ transition 없는 상태 변화 → 최소 150ms transition-all
```

---

## 9. Breakpoint 전략

### 9-1. 기준점

```
mobile:  < 768px  → BottomNav, 1열 레이아웃, full-width 컴포넌트
tablet: >= 768px  → BottomNav floating pill, 2열 그리드 확장
desktop:>= 1024px → 선택적 사이드바 복원 or 3열 확장
```

### 9-2. 핵심 컴포넌트별 분기

**BottomNav:**
```html
<!-- 모바일: full-width, 붙어있음 -->
<nav class="
  fixed bottom-0 left-0 w-full rounded-t-[3rem]
  md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-[560px] md:rounded-[3rem]
">
```

**Main Layout:**
```html
<main class="
  pt-20 pb-32 px-6 max-w-2xl mx-auto space-y-8
  md:max-w-4xl md:grid md:grid-cols-2 md:gap-6 md:items-start md:space-y-0
">
```

**FAB:**
```html
<div class="
  fixed bottom-28 right-6
  md:bottom-20 md:right-[calc(50%-320px)]
  z-50
">
```

**HeroCard:**
```html
<div class="
  rounded-xl p-8
  md:rounded-xl md:p-10
  md:sticky md:top-24
">
```

### 9-3. 태블릿 2열 레이아웃 (Gacha 페이지)

```
[768px+]
┌────────────────────────┬────────────────────────┐
│  HeroCard              │  PracticePanel          │
│  (sticky top-24)       │  + Keypad               │
│                        │  (overflow-y-auto)      │
└────────────────────────┴────────────────────────┘
     [FAB]  [BottomNav floating pill]
```

---

## 참고 파일

| 파일 | 내용 |
|---|---|
| `figma/DESIGN.md` | 디자인 철학 원본 (Creative North Star) |
| `figma/design-tokens.js` | 색상/타이포/그림자 토큰 정의 |
| `figma/code.html` | 모바일 구현 레퍼런스 코드 |
| `figma/screen.png` | 완성 화면 스크린샷 |
| `figma/concept-gacha-figma.js` | Figma 플러그인 코드 |
