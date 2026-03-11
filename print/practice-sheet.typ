// ============================================================
// 개념 가챠 - 공식 적용 연습 문제 시트  (Typst 0.11 호환)
// 흑백 인쇄 최적화
// ============================================================

#set page(paper: "a4", margin: (top: 15mm, bottom: 15mm, left: 18mm, right: 18mm))
#set text(font: ("Noto Sans CJK KR", "Noto Sans KR", "Arial"), lang: "ko", size: 10pt)

#let black  = rgb("#000000")
#let dark   = rgb("#1a1a1a")
#let mid    = rgb("#555555")
#let light  = rgb("#aaaaaa")
#let subtle = rgb("#f0f0f0")
#let white  = rgb("#ffffff")

// ════════════════════════════════════════════════════════════
//  데이터: (문제, 정답)
// ════════════════════════════════════════════════════════════
#let problems = (
// ─── AUTO_PROBLEMS_START
  ("0.333…  (순환마디: 3)", "1/3"),
// ─── AUTO_PROBLEMS_END
)

#let aname   = "와와 학습코칭센터 알파시티점"
#let topic   = "순환소수"
#let rdate   = "2026. 01. 01."
#let n       = problems.len()
#let half    = calc.ceil(n / 2)

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
      #text(size: 17pt, weight: "black", tracking: 3pt)[
        #if is-answer [정  답  지] else [공  식  적  용  연  습]
      ]
      #linebreak()
      #text(size: 8pt, fill: mid)[#topic · 공식 적용 연습]
    ],
    text(size: 8pt, fill: mid)[#rdate],
  )

  v(2mm)
  line(length: 100%, stroke: 0.5pt + black)
  v(0.8mm)
  line(length: 100%, stroke: 2.5pt + black)
  v(2.5mm)

  if is-answer {
    grid(columns: (1fr, auto), gutter: 4mm, align: center + horizon,
      text(size: 8.5pt, fill: mid)[✅ 채점 후 틀린 문제는 개념 가챠 온라인에서 연습하세요.],
      text(size: 8.5pt, weight: "bold")[총 #str(n)문항 · 만점 #str(n * 10)점],
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

  v(2.5mm)
  line(length: 100%, stroke: 0.5pt + black)
  v(1.5mm)

  grid(columns: (1fr, auto), gutter: 3mm, align: center + horizon,
    text(size: 8pt, fill: mid)[#if is-answer [📋 정답지입니다.] else [✏ 각 문제를 풀어 답을 쓰세요.]],
    text(size: 8pt, weight: "bold")[■ #str(n)문항 · #str(n * 10)점 만점],
  )

  v(2.5mm)
  line(length: 100%, stroke: 1pt + black)
  v(1mm)
}

// ════════════════════════════════════════════════════════════
//  문제 셀 / 정답 셀
// ════════════════════════════════════════════════════════════
#let q-cell(num, prob, is-even) = {
  block(width: 100%, fill: if is-even { subtle } else { white }, inset: 0pt)[
    #grid(columns: (8mm, 1fr, 40mm), gutter: 0mm, align: bottom + left,
      pad(y: 4mm, left: 1mm)[#text(size: 9.5pt, weight: "black")[#str(num).]],
      pad(y: 4mm, left: 2mm)[
        #text(size: 12pt, weight: "black")[#prob.at(0)]
      ],
      pad(y: 4mm, left: 3mm, right: 2mm)[
        #align(bottom)[#line(length: 100%, stroke: 0.8pt + black)]
      ],
    )
  ]
  line(length: 100%, stroke: 0.25pt + light)
}

#let a-cell(num, prob, is-even) = {
  block(width: 100%, fill: if is-even { subtle } else { white }, inset: 0pt)[
    #grid(columns: (8mm, 1fr, 40mm), gutter: 0mm, align: bottom + left,
      pad(y: 4mm, left: 1mm)[#text(size: 9.5pt, weight: "black")[#str(num).]],
      pad(y: 4mm, left: 2mm)[
        #text(size: 12pt, weight: "black")[#prob.at(0)]
      ],
      pad(y: 3mm, left: 3mm, right: 2mm)[
        #text(size: 11pt, weight: "bold")[▶ #prob.at(1)]
        #line(length: 100%, stroke: 0.8pt + black)
      ],
    )
  ]
  line(length: 100%, stroke: 0.25pt + light)
}

// ════════════════════════════════════════════════════════════
//  2열 렌더러
// ════════════════════════════════════════════════════════════
#let render-rows(mode) = {
  for row in range(half) {
    let li     = problems.at(row)
    let ri-idx = row + half
    let ri     = if ri-idx < n { problems.at(ri-idx) } else { none }
    let even   = calc.rem(row, 2) == 0

    grid(
      columns: (1fr, 5mm, 1fr),
      column-gutter: 0mm, row-gutter: 0mm, align: top,
      if mode == "q" { q-cell(row + 1, li, even) }
      else           { a-cell(row + 1, li, even) },
      [],
      if ri != none {
        if mode == "q" { q-cell(ri-idx + 1, ri, even) }
        else           { a-cell(ri-idx + 1, ri, even) }
      } else { [] },
    )
  }
}

// ════════════════════════════════════════════════════════════
//  푸터
// ════════════════════════════════════════════════════════════
#let sheet-footer(is-answer) = {
  v(2mm)
  line(length: 100%, stroke: 1pt + black)
  v(2mm)

  if is-answer {
    align(center)[
      #line(length: 100%, stroke: 0.8pt + black)
      #v(0.8mm)
      #line(length: 100%, stroke: 2.5pt + black)
      #v(2mm)
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
      text(size: 8pt)[1문항 = 10점 · 만점 #str(n * 10)점],
    )
    v(2mm)
    line(length: 100%, stroke: 0.5pt + light)
    v(1.5mm)
    align(center)[
      #text(size: 7.5pt, fill: light)[💡 틀린 문제는 🎴 개념 가챠에서 연습하세요!]
    ]
  }
}

// ════════════════════════════════════════════════════════════
//  PAGE 1 — 문제지
// ════════════════════════════════════════════════════════════
#sheet-header(false)
#render-rows("q")
#sheet-footer(false)

// ════════════════════════════════════════════════════════════
//  PAGE 2 — 정답지
// ════════════════════════════════════════════════════════════
#pagebreak()
#sheet-header(true)
#render-rows("a")
#sheet-footer(true)
