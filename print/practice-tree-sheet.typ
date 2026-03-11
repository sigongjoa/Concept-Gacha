// ============================================================
// 유리수 수 체계 빈칸 문제 시트  (Typst 0.11 호환)
// ============================================================

#set page(paper: "a4", margin: (top: 15mm, bottom: 20mm, left: 20mm, right: 20mm))
#set text(font: ("Noto Sans CJK KR", "Noto Sans KR", "Arial"), lang: "ko", size: 11pt)

#let black  = rgb("#000000")
#let dark   = rgb("#1a1a1a")
#let mid    = rgb("#555555")
#let light  = rgb("#aaaaaa")
#let subtle = rgb("#f5f5f5")

// ─── 빈칸 노드 목록 (서버에서 주입) ─────────────────────────
#let blank_nodes = (
// ─── AUTO_BLANKS_START
"integer"
// ─── AUTO_BLANKS_END
)

#let aname  = "와와 학습코칭센터 알파시티점"
#let rdate  = "2026. 01. 01."
#let n_prob = blank_nodes.len()

// ─── 헬퍼 ────────────────────────────────────────────────────
#let is-blank(id) = blank_nodes.contains(id)

#let node-box(id, label) = {
  if is-blank(id) {
    rect(width: 38mm, height: 9mm, stroke: 1.5pt + black, fill: white, radius: 2pt)[
      #align(center + horizon)[#text(size: 8pt, fill: light)[( 빈칸 )]]
    ]
  } else {
    rect(width: 38mm, height: 9mm, stroke: 0.8pt + dark, fill: subtle, radius: 2pt)[
      #align(center + horizon)[#text(size: 10pt, weight: "bold")[#label]]
    ]
  }
}

// ─── 헤더 ────────────────────────────────────────────────────
#line(length: 100%, stroke: 2.5pt + black)
#v(0.8mm)
#line(length: 100%, stroke: 0.5pt + black)
#v(1.5mm)

#grid(columns: (auto, 1fr, auto), align: center + horizon,
  text(size: 8pt, fill: mid)[🎴 #aname],
  align(center)[
    #text(size: 17pt, weight: "black", tracking: 3pt)[유  리  수  의  수  체  계]
    #linebreak()
    #text(size: 8pt, fill: mid)[빈칸 채우기 · 수와 연산]
  ],
  text(size: 8pt, fill: mid)[#rdate],
)

#v(2mm)
#line(length: 100%, stroke: 0.5pt + black)
#v(0.8mm)
#line(length: 100%, stroke: 2.5pt + black)
#v(3mm)

// 이름/날짜/점수 행
#grid(
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

#v(4mm)
#line(length: 100%, stroke: 0.5pt + black)
#v(1mm)

#grid(columns: (1fr, auto), align: center + horizon,
  text(size: 8.5pt, fill: mid)[✏ 아래 수 체계 다이어그램의 빈칸에 알맞은 말을 쓰시오.],
  text(size: 8pt, weight: "bold")[■ #str(n_prob)문항 · #str(n_prob * 10)점 만점],
)

#v(4mm)
#line(length: 100%, stroke: 1pt + black)
#v(8mm)

// ─── 수 체계 다이어그램 ───────────────────────────────────────
#let lw = 0.6pt

// 중앙 정렬 컨테이너
#align(center)[
  #block(width: 160mm)[

    // 루트: 유리수
    #align(center)[#node-box("rational", "유리수")]
    #v(0mm)

    // 루트에서 두 가지로 분기
    #align(center)[
      #grid(columns: (1fr, 6mm, 1fr), column-gutter: 0mm, row-gutter: 0mm, align: top,

        // 왼쪽: 정수 branch
        align(center)[
          #line(start: (50%, 0%), end: (50%, 6mm), stroke: lw + dark)
          #v(0mm)
          #node-box("integer", "정수")
          #v(0mm)
          // 정수 → 세 자식
          #grid(columns: (1fr, 1fr, 1fr), column-gutter: 2mm, row-gutter: 0mm, align: top,
            align(center)[
              #line(start: (50%, 0%), end: (50%, 5mm), stroke: lw + dark)
              #v(0mm)
              #node-box("pos_int", "양의 정수\n(자연수)")
            ],
            align(center)[
              #line(start: (50%, 0%), end: (50%, 5mm), stroke: lw + dark)
              #v(0mm)
              #node-box("zero", "0")
            ],
            align(center)[
              #line(start: (50%, 0%), end: (50%, 5mm), stroke: lw + dark)
              #v(0mm)
              #node-box("neg_int", "음의 정수")
            ],
          )
        ],

        // 가운데 간격 + 수직선
        align(center)[
          #line(start: (50%, 0%), end: (50%, 100%), stroke: 0pt)
        ],

        // 오른쪽: 정수가 아닌 유리수 branch
        align(center)[
          #line(start: (50%, 0%), end: (50%, 6mm), stroke: lw + dark)
          #v(0mm)
          #node-box("non_int", "정수가 아닌\n유리수")
          #v(0mm)
          // 정수가 아닌 유리수 → 두 자식
          #grid(columns: (1fr, 1fr), column-gutter: 2mm, row-gutter: 0mm, align: top,
            align(center)[
              #line(start: (50%, 0%), end: (50%, 5mm), stroke: lw + dark)
              #v(0mm)
              #node-box("finite", "유한소수")
            ],
            align(center)[
              #line(start: (50%, 0%), end: (50%, 5mm), stroke: lw + dark)
              #v(0mm)
              #node-box("repeating", "순환소수")
            ],
          )
        ],
      )
    ]

  ]
]

// ─── 정답란 ──────────────────────────────────────────────────
#v(8mm)
#line(length: 100%, stroke: 0.5pt + light)
#v(3mm)

#text(size: 9pt, weight: "bold")[정답란]
#h(4mm)
#for i in range(n_prob) {
  rect(width: 40mm, height: 8mm, stroke: 0.7pt + black, inset: 0mm, radius: 2pt)[
    #align(center + horizon)[#text(size: 7pt, fill: light)[빈칸 #str(i+1)]]
  ]
  h(3mm)
}

// ─── 푸터 ────────────────────────────────────────────────────
#v(4mm)
#line(length: 100%, stroke: 1pt + black)
#v(2mm)
#align(center)[
  #text(size: 7.5pt, fill: light)[💡 틀린 개념은 🎴 개념 가챠에서 반복 복습하세요! · #aname · 자동 생성]
]
