// ============================================================
// 개념 가챠 - 통합 학습 시트  (Typst 0.11 호환)
// 개념 카드 빈칸 + 공식 적용 연습 문제 한 장 통합
// ============================================================

#set page(paper: "a4", margin: (top: 13mm, bottom: 13mm, left: 18mm, right: 18mm))
#set text(font: ("Noto Sans CJK KR", "Noto Sans KR", "Arial"), lang: "ko", size: 10pt)

#let black        = rgb("#000000")
#let dark         = rgb("#1a1a1a")
#let mid          = rgb("#555555")
#let light        = rgb("#aaaaaa")
#let subtle       = rgb("#f4f4f4")
#let white        = rgb("#ffffff")
#let indigo       = rgb("#6366f1")
#let indigo-light = rgb("#e0e7ff")
#let indigo-bg    = rgb("#f5f3ff")

// ── 등급 색상 ────────────────────────────────────────────
#let gi = (
  (c: rgb("#ef4444"), lbl: "C", nm: "기초"),
  (c: rgb("#f97316"), lbl: "B", nm: "초급"),
  (c: rgb("#3b82f6"), lbl: "A", nm: "중급"),
  (c: rgb("#10b981"), lbl: "S", nm: "고급"),
  (c: rgb("#f59e0b"), lbl: "SS", nm: "마스터"),
)
#let gc(lvl) = gi.at(lvl - 1)

// ════════════════════════════════════════════════════════════
//  데이터
// ════════════════════════════════════════════════════════════
#let cards = (
// ─── AUTO_CARDS_START
  ("소수란?", "1보다 큰 자연수 중에서 1과 자기자신만을 약수로 가지는 수", 3, 2, 1, ""),
  ("합성수란?", "1보다 큰 자연수 중에서 1과 자기자신 이외의 수를 약수로 가지는 수", 3, 2, 0, ""),
// ─── AUTO_CARDS_END
)

#let problems = (
// ─── AUTO_PROBLEMS_START
  ("예시 문제", "예시 답"),
// ─── AUTO_PROBLEMS_END
)

#let aname   = "와와 학습코칭센터 알파시티점"
#let subj    = "중1 수학"
#let chapter = "수와 연산"
#let rdate   = "2026. 02. 26."
#let n       = cards.len()
#let half    = calc.ceil(n / 2)
#let np      = problems.len()
#let phalf   = calc.ceil(np / 2)

// ════════════════════════════════════════════════════════════
//  헤더
// ════════════════════════════════════════════════════════════
#let sheet-header(is-answer) = {
  line(length: 100%, stroke: 2.5pt + black)
  v(0.8mm)
  line(length: 100%, stroke: 0.5pt + black)
  v(1.5mm)

  grid(columns: (auto, 1fr, auto), gutter: 0mm, align: center + horizon,
    text(size: 8pt, fill: mid)[🎴 #aname],
    align(center)[
      #text(size: 16pt, weight: "black", tracking: 3pt)[
        #if is-answer [정  답  확  인] else [개  념  +  연  습  시  트]
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

  if is-answer {
    grid(columns: (1fr, auto), gutter: 3mm, align: center + horizon,
      text(size: 8pt, fill: mid)[📋 채점 후 틀린 개념은 개념 가챠에서 반복 복습하세요.],
      text(size: 8pt, weight: "bold")[개념 #str(n)문항 + 연습 #str(np)문항],
    )
  } else {
    grid(
      columns: (auto, 44mm, 6mm, auto, 6mm, 1fr, 5mm, 22mm),
      gutter: 0mm, align: bottom + left,
      text(size: 9pt, weight: "bold")[이름],
      pad(bottom: 1.5mm, left: 3mm)[#line(length: 100%, stroke: 0.8pt + black)],
      [],
      text(size: 9pt, weight: "bold")[날짜],
      [],
      pad(bottom: 1.5mm, left: 3mm)[#line(length: 100%, stroke: 0.8pt + black)],
      [],
      rect(width: 100%, height: 8mm, stroke: 1pt + black, fill: none, inset: 0mm)[
        #align(center + horizon)[#text(size: 7pt, fill: light)[점수]]
      ],
    )
  }

  v(1mm)
  line(length: 100%, stroke: 1pt + black)
  v(1mm)
}

// ════════════════════════════════════════════════════════════
//  섹션 구분 헤더
// ════════════════════════════════════════════════════════════
#let section-bar(label, color) = {
  v(2.5mm)
  block(width: 100%, fill: color, inset: (x: 6mm, y: 2mm), radius: 1.5mm)[
    #text(size: 8.5pt, weight: "black", fill: if color == indigo-light { indigo } else { dark })[#label]
  ]
  v(2mm)
}

// ════════════════════════════════════════════════════════════
//  카드 셀
// ════════════════════════════════════════════════════════════
#let card-cell(num, q, a, lvl, show-answer, img) = {
  let g = gc(lvl)
  rect(width: 100%, stroke: 1.2pt + g.c, fill: white, inset: 0pt, radius: 2mm)[
    #block(width: 100%, fill: g.c, inset: 0pt,
      radius: (top-left: 1.5mm, top-right: 1.5mm, bottom-left: 0mm, bottom-right: 0mm))[
      #pad(x: 3mm, y: 1mm)[
        #grid(columns: (auto, 1fr, auto), gutter: 2mm, align: center + horizon,
          text(size: 8pt, weight: "black", fill: white)[#str(num)],
          text(size: 6.5pt, fill: white.transparentize(30%))[#g.nm 등급],
          rect(fill: white.transparentize(20%), radius: 1.5mm, inset: (x: 2mm, y: 0.5mm))[
            #text(size: 6.5pt, fill: g.c, weight: "black")[#g.lbl]
          ],
        )
      ]
    ]
    #pad(x: 4mm, top: 2mm, bottom: 1.5mm)[
      #if img != "" [
        #image(img, width: 100%, fit: "contain")
        #if q != "" [ #v(1mm) #text(size: 9pt, fill: mid)[#q] ]
      ] else [
        #text(size: 10pt, weight: "bold", fill: dark)[#q]
      ]
    ]
    #line(length: 100%, stroke: (paint: g.c, dash: "dashed", thickness: 0.7pt))
    #pad(x: 4mm, top: 2mm, bottom: 2.5mm)[
      #if show-answer [
        #text(size: 9pt, weight: "bold", fill: g.c)[#a]
      ] else [
        #line(length: 100%, stroke: 0.7pt + rgb("#cccccc"))
        #v(4mm)
        #line(length: 100%, stroke: 0.7pt + rgb("#cccccc"))
      ]
    ]
  ]
}

// ════════════════════════════════════════════════════════════
//  연습 문제 셀
// ════════════════════════════════════════════════════════════
#let prob-cell(num, prob, show-answer, is-even) = {
  block(width: 100%, fill: if is-even { indigo-bg } else { white },
        stroke: 0.5pt + indigo-light, radius: 1.5mm, inset: 0pt)[
    #grid(columns: (7mm, 1fr, 38mm), gutter: 0mm, align: horizon + left,
      pad(y: 3.5mm, left: 2mm)[
        #text(size: 9pt, weight: "black", fill: indigo)[#str(num).]
      ],
      pad(y: 3.5mm, left: 2mm, right: 1mm)[
        #text(size: 9pt, weight: "bold")[#prob.at(0)]
      ],
      pad(y: 3mm, left: 2mm, right: 2.5mm)[
        #if show-answer [
          #text(size: 9pt, weight: "bold", fill: indigo)[▶ #prob.at(1)]
          #line(length: 100%, stroke: 0.5pt + indigo-light)
        ] else [
          #align(bottom)[#line(length: 100%, stroke: 0.8pt + black)]
        ]
      ],
    )
  ]
}

// ════════════════════════════════════════════════════════════
//  렌더러
// ════════════════════════════════════════════════════════════
#let render-cards(show-answer) = {
  for row in range(half) {
    let li     = cards.at(row)
    let ri-idx = row + half
    let ri     = if ri-idx < n { cards.at(ri-idx) } else { none }
    grid(
      columns: (1fr, 4mm, 1fr),
      column-gutter: 0mm, row-gutter: 0mm, align: top,
      card-cell(row + 1, li.at(0), li.at(1), li.at(2), show-answer, li.at(5)),
      [],
      if ri != none {
        card-cell(ri-idx + 1, ri.at(0), ri.at(1), ri.at(2), show-answer, ri.at(5))
      } else { [] },
    )
    v(1.5mm)
  }
}

#let render-problems(show-answer) = {
  for row in range(phalf) {
    let li     = problems.at(row)
    let ri-idx = row + phalf
    let ri     = if ri-idx < np { problems.at(ri-idx) } else { none }
    let even   = calc.rem(row, 2) == 0
    grid(
      columns: (1fr, 4mm, 1fr),
      column-gutter: 0mm, row-gutter: 0mm, align: top,
      prob-cell(row + 1, li, show-answer, even),
      [],
      if ri != none { prob-cell(ri-idx + 1, ri, show-answer, even) } else { [] },
    )
    v(1mm)
  }
}

// ════════════════════════════════════════════════════════════
//  푸터
// ════════════════════════════════════════════════════════════
#let sheet-footer(is-answer) = {
  v(1mm)
  line(length: 100%, stroke: 1pt + black)
  v(1.5mm)
  if is-answer {
    align(center)[
      #text(size: 7pt, fill: light)[🎴 개념 가챠 학습 시스템 · #aname · 자동 생성된 문서입니다]
    ]
  } else {
    grid(columns: (1fr, auto), gutter: 5mm, align: center + horizon,
      [
        #text(size: 8pt, weight: "bold")[채점]
        #h(3mm)
        #for i in range(n) {
          box(width: 5.5mm, height: 5.5mm, stroke: 0.7pt + black, baseline: -0.5mm)[]
          text(size: 6pt, fill: light, baseline: -0.5mm)[ #str(i+1) ]
          h(1mm)
        }
      ],
      text(size: 7.5pt)[개념 #str(n) + 연습 #str(np)문항],
    )
    v(1mm)
    align(center)[
      #text(size: 7pt, fill: light)[💡 틀린 개념은 🎴 개념 가챠에서 반복 복습하세요!]
    ]
  }
  v(1mm)
  line(length: 100%, stroke: 2.5pt + black)
}

// ════════════════════════════════════════════════════════════
//  PAGE 1 — 문제지
// ════════════════════════════════════════════════════════════
#sheet-header(false)
#section-bar("📚  개념 카드 — 빈칸에 뜻을 써보세요", rgb("#f1f5f9"))
#render-cards(false)
#section-bar("✏  공식 적용 연습 — 계산해서 답을 쓰세요", indigo-light)
#render-problems(false)
#sheet-footer(false)

// ════════════════════════════════════════════════════════════
//  PAGE 2 — 정답지
// ════════════════════════════════════════════════════════════
#pagebreak()
#sheet-header(true)
#section-bar("📚  개념 카드 정답", rgb("#f1f5f9"))
#render-cards(true)
#section-bar("✏  공식 적용 연습 정답", indigo-light)
#render-problems(true)
#sheet-footer(true)
