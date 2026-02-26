// ============================================================
// 개념 가챠 - 플래시카드 학습 시트  (Typst 0.11 호환)
// 시험지 스타일 헤더/푸터 + 2영역 카드 셀 (상: 문제 / 하: 공란·정답)
// ============================================================

#set page(paper: "a4", margin: (top: 15mm, bottom: 15mm, left: 18mm, right: 18mm))
#set text(font: ("Noto Sans CJK KR", "Noto Sans KR", "Arial"), lang: "ko", size: 10pt)

#let black  = rgb("#000000")
#let dark   = rgb("#1a1a1a")
#let mid    = rgb("#555555")
#let light  = rgb("#aaaaaa")
#let subtle = rgb("#f4f4f4")
#let white  = rgb("#ffffff")

// ── 등급 색상 ────────────────────────────────────────────
#let gi = (
  (c: rgb("#ef4444"), bg: rgb("#fff5f5"), lbl: "C", nm: "기초"),
  (c: rgb("#f97316"), bg: rgb("#fff7ed"), lbl: "B", nm: "초급"),
  (c: rgb("#3b82f6"), bg: rgb("#eff6ff"), lbl: "A", nm: "중급"),
  (c: rgb("#10b981"), bg: rgb("#f0fdf4"), lbl: "S", nm: "고급"),
  (c: rgb("#f59e0b"), bg: rgb("#fffbeb"), lbl: "SS", nm: "마스터"),
)
#let gc(lvl) = gi.at(lvl - 1)

// ════════════════════════════════════════════════════════════
//  데이터: (문제, 정답, 등급1~5, 성공, 실패)
// ════════════════════════════════════════════════════════════
#let cards = (
  ("소수란?",                    "1보다 큰 자연수 중에서 1과 자기자신만을 약수로 가지는 수",           3, 2, 1),
  ("합성수란?",                  "1보다 큰 자연수 중에서 1과 자기자신 이외의 수를 약수로 가지는 수",   3, 2, 0),
  ("거듭제곱이란?",              "같은 수나 문자를 거듭하여 곱한 것을 간단히 나타낸 것",              1, 1, 1),
  ("역수란?",                    "두 수를 곱해서 1이 되는 수",                                       1, 0, 0),
  ("동류항이란?",                "문자와 차수가 각각 같은 항",                                        1, 0, 0),
  ("서로소란?",                  "최대공약수가 1인 자연수",                                           1, 0, 0),
  ("지수란?",                    "거듭제곱에서 거듭하여 곱해진 수 또는 문자의 개수",                   1, 0, 0),
  ("유한소수를 다르게 표현하면?", "10의 거듭제곱으로 나타낼 수 있는 분수",                             2, 1, 0),
)

#let aname   = "매씨스 학원"
#let subj    = "중1 수학"
#let chapter = "수와 연산"
#let rdate   = "2026. 02. 26."
#let n       = cards.len()
#let half    = calc.ceil(n / 2)

// ════════════════════════════════════════════════════════════
//  헤더 (quiz-sheet 스타일)
// ════════════════════════════════════════════════════════════
#let sheet-header(is-answer) = {
  line(length: 100%, stroke: 2.5pt + black)
  v(0.8mm)
  line(length: 100%, stroke: 0.5pt + black)
  v(1.5mm)

  grid(columns: (auto, 1fr, auto), gutter: 0mm, align: center + horizon,
    text(size: 8pt, fill: mid)[🎴 #aname],
    align(center)[
      #text(size: 17pt, weight: "black", tracking: 4pt)[
        #if is-answer [개  념  정  답  확  인] else [개  념  플  래  시  카  드]
      ]
      #linebreak()
      #text(size: 8pt, fill: mid)[#subj · #chapter]
    ],
    text(size: 8pt, fill: mid)[#rdate],
  )

  v(1.5mm)
  line(length: 100%, stroke: 0.5pt + black)
  v(0.8mm)
  line(length: 100%, stroke: 2.5pt + black)
  v(1.5mm)

  grid(columns: (1fr, auto), gutter: 3mm, align: center + horizon,
    text(size: 8pt, fill: mid)[#if is-answer [📋 각 카드 하단에서 정답을 확인하세요.] else [✏ 각 카드 하단 빈칸에 개념의 뜻을 직접 써보세요.]],
    text(size: 8pt, weight: "bold")[■ #str(n)문항],
  )

  v(1mm)
  line(length: 100%, stroke: 1pt + black)
  v(1mm)
}

// ════════════════════════════════════════════════════════════
//  카드 셀 — 상단: 문제 / 하단: 공란(문제지) 또는 정답(답지)
// ════════════════════════════════════════════════════════════
#let card-cell(num, q, a, lvl, show-answer) = {
  let g = gc(lvl)

  rect(width: 100%, stroke: 1.5pt + g.c, fill: white, inset: 0pt, radius: 2mm)[
    // ── 상단 헤더 바 ───────────────────────────────────
    #block(
      width: 100%, fill: g.c, inset: 0pt,
      radius: (top-left: 1.5mm, top-right: 1.5mm, bottom-left: 0mm, bottom-right: 0mm),
    )[
      #pad(x: 3.5mm, y: 1.2mm)[
        #grid(columns: (auto, 1fr, auto), gutter: 2mm, align: center + horizon,
          text(size: 8.5pt, weight: "black", fill: white)[#str(num)],
          text(size: 7pt, fill: white.transparentize(30%))[#g.nm 등급],
          rect(fill: white.transparentize(20%), radius: 1.5mm, inset: (x: 2.5mm, y: 0.8mm))[
            #text(size: 7pt, fill: g.c, weight: "black")[#g.lbl]
          ],
        )
      ]
    ]
    // ── 문제 영역 ─────────────────────────────────────
    #pad(x: 4mm, top: 2.5mm, bottom: 2mm)[
      #text(size: 10.5pt, weight: "bold", fill: dark)[#q]
    ]
    // ── 구분선 ────────────────────────────────────────
    #line(length: 100%, stroke: (paint: g.c, dash: "dashed", thickness: 0.8pt))
    // ── 정답/공란 영역 ────────────────────────────────
    #pad(x: 4mm, top: 2.5mm, bottom: 3mm)[
      #if show-answer [
        #text(size: 9.5pt, weight: "bold", fill: g.c)[#a]
      ] else [
        #line(length: 100%, stroke: 0.7pt + rgb("#bbbbbb"))
        #v(4mm)
        #line(length: 100%, stroke: 0.7pt + rgb("#bbbbbb"))
      ]
    ]
  ]
}

// ════════════════════════════════════════════════════════════
//  카드 그리드 렌더러
// ════════════════════════════════════════════════════════════
#let render-cards(show-answer) = {
  for row in range(half) {
    let li     = cards.at(row)
    let ri-idx = row + half
    let ri     = if ri-idx < n { cards.at(ri-idx) } else { none }

    grid(
      columns: (1fr, 4mm, 1fr),
      column-gutter: 0mm, row-gutter: 0mm, align: top,
      card-cell(row + 1,    li.at(0), li.at(1), li.at(2), show-answer),
      [],
      if ri != none {
        card-cell(ri-idx + 1, ri.at(0), ri.at(1), ri.at(2), show-answer)
      } else { [] },
    )
    v(1.5mm)
  }
}

// ════════════════════════════════════════════════════════════
//  푸터
// ════════════════════════════════════════════════════════════
#let sheet-footer(is-answer) = {
  v(1mm)
  line(length: 100%, stroke: 1pt + black)
  v(2mm)

  if is-answer {
    align(center)[
      #text(size: 7pt, fill: light)[🎴 개념 가챠 학습 시스템 · #aname · 자동 생성된 문서입니다]
    ]
  } else {
    grid(columns: (1fr, auto), gutter: 5mm, align: center + horizon,
      [
        #text(size: 8.5pt, weight: "bold")[채점]
        #h(3mm)
        #for i in range(n) {
          box(width: 5.5mm, height: 5.5mm, stroke: 0.7pt + black, baseline: -0.5mm)[]
          text(size: 6pt, fill: light, baseline: -0.5mm)[ #str(i+1) ]
          h(1mm)
        }
      ],
      text(size: 8pt)[총 #str(n)문항],
    )
    v(1.5mm)
    align(center)[
      #text(size: 7.5pt, fill: light)[💡 틀린 개념은 🎴 개념 가챠에서 반복 복습하세요!]
    ]
  }
  v(1.5mm)
  line(length: 100%, stroke: 2.5pt + black)
}

// ════════════════════════════════════════════════════════════
//  PAGE 1 — 문제지 (하단 공란)
// ════════════════════════════════════════════════════════════
#sheet-header(false)
#render-cards(false)
#sheet-footer(false)

// ════════════════════════════════════════════════════════════
//  PAGE 2 — 정답지 (하단 정답 표시)
// ════════════════════════════════════════════════════════════
#pagebreak()
#sheet-header(true)
#render-cards(true)
#sheet-footer(true)
