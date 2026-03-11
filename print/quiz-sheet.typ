// ============================================================
// 개념 가챠 - 개념 확인 퀴즈 시트  (Typst 0.11 호환)
// 흑백 인쇄 최적화 / 타이포그래피+선 중심
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
//  데이터: (개념어, 정답, 단원, 이미지경로_or_none)
// ════════════════════════════════════════════════════════════
#let items = (
// ─── AUTO_ITEMS_START
  ("소수",     "1보다 큰 자연수 중에서 1과 자기자신만을 약수로 가지는 수",    "수와 연산", none),
  ("합성수",   "1보다 큰 자연수 중에서 1과 자기자신 이외의 약수를 가지는 수", "수와 연산", none),
  ("거듭제곱", "같은 수나 문자를 거듭하여 곱한 것을 간단히 나타낸 것",       "수와 연산", none),
  ("밑",       "거듭제곱에서 거듭하여 곱한 수 또는 문자",                   "수와 연산", none),
  ("지수",     "거듭제곱에서 거듭하여 곱해진 수 또는 문자의 개수",            "수와 연산", none),
  ("서로소",   "최대공약수가 1인 자연수",                                   "수와 연산", none),
  ("역수",     "두 수를 곱해서 1이 되는 수",                                "수와 연산", none),
  ("제곱근",   "제곱해서 a가 되는 수",                                      "수와 연산", none),
  ("동류항",   "문자와 차수가 각각 같은 항",                                 "문자식",   none),
  ("정수",     "양의정수, 0, 음의정수를 통틀어 이르는 말",                   "수와 연산", none),
// ─── AUTO_ITEMS_END
)

#let aname   = "와와 학습코칭센터 알파시티점"
#let subj    = "중1 수학"
#let chapter = "수와 연산"
#let rdate   = "2026. 02. 26."
#let n       = items.len()
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
      #text(size: 17pt, weight: "black", tracking: 4pt)[
        #if is-answer [정  답  지] else [개  념  확  인  퀴  즈]
      ]
      #linebreak()
      #text(size: 8pt, fill: mid)[#subj · #chapter]
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
      text(size: 8.5pt, fill: mid)[✅ 채점 후 틀린 개념은 개념 가챠 온라인에서 반복 복습하세요.],
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
    text(size: 8pt, fill: mid)[#if is-answer [📋 정답지입니다. 선생님 전용 또는 학생 확인용] else [✏ 각 개념어의 뜻을 빈칸에 직접 써보세요.]],
    text(size: 8pt, weight: "bold")[■ #str(n)문항 · #str(n * 10)점 만점],
  )

  v(2.5mm)
  line(length: 100%, stroke: 1pt + black)
  v(1mm)
}

// ════════════════════════════════════════════════════════════
//  문제 셀 / 정답 셀
// ════════════════════════════════════════════════════════════
#let q-cell(num, term, is-even) = {
  block(width: 100%, fill: if is-even { subtle } else { white }, inset: 0pt)[
    #grid(columns: (8mm, 30mm, 1fr), gutter: 0mm, align: bottom + left,
      pad(y: 3mm, left: 1mm)[#text(size: 9.5pt, weight: "black")[#str(num).]],
      pad(y: 3mm, left: 2mm)[#text(size: 11pt, weight: "black")[#term]],
      pad(bottom: 3mm, top: 3mm, left: 3mm, right: 2mm)[
        #align(bottom)[#line(length: 100%, stroke: 0.8pt + black)]
      ],
    )
  ]
  line(length: 100%, stroke: 0.25pt + light)
}

#let a-cell(num, term, answer, is-even) = {
  block(width: 100%, fill: if is-even { subtle } else { white }, inset: 0pt)[
    #grid(columns: (8mm, 30mm, 1fr), gutter: 0mm, align: bottom + left,
      pad(y: 3mm, left: 1mm)[#text(size: 9.5pt, weight: "black")[#str(num).]],
      pad(y: 3mm, left: 2mm)[#text(size: 11pt, weight: "black")[#term]],
      pad(bottom: 3mm, top: 2.5mm, left: 3mm, right: 2mm)[
        #text(size: 9pt, weight: "bold")[▶ #answer]
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
    let li     = items.at(row)
    let ri-idx = row + half
    let ri     = if ri-idx < n { items.at(ri-idx) } else { none }
    let even   = calc.rem(row, 2) == 0

    grid(
      columns: (1fr, 5mm, 1fr),
      column-gutter: 0mm, row-gutter: 0mm, align: top,
      if mode == "q" { q-cell(row + 1, li.at(0), even) }
      else           { a-cell(row + 1, li.at(0), li.at(1), even) },
      [],
      if ri != none {
        if mode == "q" { q-cell(ri-idx + 1, ri.at(0), even) }
        else           { a-cell(ri-idx + 1, ri.at(0), ri.at(1), even) }
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
      #text(size: 7.5pt, fill: light)[💡 틀린 개념은 🎴 개념 가챠에서 반복 복습하세요!]
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
