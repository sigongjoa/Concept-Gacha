// distractor-generators.js
// 개념 카드 MCQ용 매력적 오답(distractor) 생성기
//
// getDistractors(card) → { choices: string[], correctAnswer: string, source: string }
// choices: 정답 포함 4~6개, 이미 셔플됨

// ─── 주제별 Distractor Bank ────────────────────────────────────────────────────
const DISTRACTOR_BANKS = {

    // ── 복소수 ────────────────────────────────────────────────────────────────
    '복소수': {
        keywords: /복소수|허수|실수부|허수부|켤레|켤레복소수|순허수|complex/i,
        banks: {
            // 허수부/실수부 관련
            '허수부': ['bi', 'a', 'a+bi', 'a-bi', '√(a²+b²)', 'i', 'b²', 'ab', '2b', 'b/a', '-b', '|b|', 'b+i', 'b·a', 'b-a'],
            '실수부': ['bi', 'a+bi', 'a-bi', '√(a²+b²)', 'a²', '2a', 'a/b', '-a', '|a|', '0', 'a·b', 'a+b', 'a-b', 'bi+a', 'ab'],
            '켤레복소수': ['a+bi', 'a²+b²', '(a+bi)²', 'a²-b²', '2a', '2bi', 'a·b', 'i', 'a-b', 'b-a', '-a+bi', '-a-bi', 'a+b', 'bi-a', 'a²'],
            '곱': ['a²+b²', 'a²-b²', '2abi', 'a²+2abi-b²', '(a+b)²', 'a·b', 'a²·b²', 'a-b', '2ab', 'a²b²', 'a²-bi²', 'a+b', 'a·bi', '0', '1'],
            '허수단위': ['1', '-1', '0', 'i', '2i', '-i', 'i²', '√(-1)', '√i', 'i+1', '2', '-2', 'i-1', '1+i', 'i/2'],
            '크기': ['a+b', 'a-b', 'a²+b²', '√(a+b)', 'ab', 'a/b', '√a²', '√b²', 'a²-b²', '(a+b)²', 'a·b', '√(ab)', '|a|+|b|', '|a-b|', 'a+bi'],
            '정의': ['실수', '자연수', '유리수', '무리수', '순허수', '0', '정수', '허수', '복소수', '음수', '양수', '정수가 아닌 유리수', '이차식', '허수 단위', '켤레수'],
            default: ['a+bi', 'a-bi', 'bi', 'a', '√(a²+b²)', 'i', 'a²+b²', '2a', '2bi', '-b', 'ab', 'a·b', '|a|', '|b|', '0'],
        }
    },

    // ── 소수 / 합성수 ─────────────────────────────────────────────────────────
    '소수': {
        keywords: /(?<![복유무])소수|합성수|prime|composite/i,
        banks: {
            default: [
                '1과 자기자신만을 약수로 가지는 수',
                '약수가 정확히 2개인 수',
                '1을 포함한 약수가 2개인 수',
                '홀수인 자연수',
                '짝수가 아닌 자연수',
                '1보다 큰 자연수',
                '약수의 개수가 3개 이상인 수',
                '2의 배수가 아닌 수',
                '1도 소수이다',
                '소수는 무한히 많다 (거짓 선지로 사용)',
                '짝수인 소수는 없다',
                '모든 홀수는 소수이다',
                '소수', '합성수', '자연수',
            ]
        }
    },

    // ── 거듭제곱 / 지수 ───────────────────────────────────────────────────────
    '거듭제곱': {
        keywords: /거듭제곱|지수법칙|지수.*법칙|a\^|aⁿ|거듭제곱법칙/i,
        banks: {
            '곱법칙': ['aᵐ⁺ⁿ', 'aᵐ⁻ⁿ', 'aᵐ×ⁿ', 'aᵐ÷ⁿ', '(a+b)ᵐ⁺ⁿ', '2aᵐⁿ', 'aᵐ+aⁿ', 'aᵐ·bⁿ', 'a²ᵐⁿ', '(ab)ᵐ⁺ⁿ', 'aᵐn', 'aⁿm', 'aᵐ/aⁿ', 'aᵐ-aⁿ', 'a·mⁿ'],
            '나눗셈법칙': ['aᵐ⁺ⁿ', 'aᵐⁿ', 'aᵐ×ⁿ', '1/aᵐ⁻ⁿ', 'aⁿ⁻ᵐ', 'aᵐ÷n', '(a÷b)ᵐ', 'aᵐ-aⁿ', 'a/mⁿ', 'aⁿ/aᵐ', 'aᵐ+ⁿ', '(a-b)ᵐ⁻ⁿ', 'a·bᵐ⁻ⁿ', 'aⁿ·aᵐ', 'a⁰'],
            '거듭제곱법칙': ['aᵐ⁺ⁿ', 'aᵐ⁻ⁿ', 'aᵐ/ⁿ', '(a+m)ⁿ', '(aⁿ)ᵐ', 'aᵐ·n', 'aⁿm', '(am)ⁿ', 'a·mⁿ', '(a+n)ᵐ', 'aⁿ⁺ᵐ', 'aⁿ⁻ᵐ', 'n·aᵐ', 'a²mn', 'aᵐ+n'],
            default: ['aᵐ⁺ⁿ', 'aᵐ⁻ⁿ', 'aᵐⁿ', 'aᵐ×ⁿ', 'aⁿᵐ', '(a+b)ᵐⁿ', 'a+mⁿ', 'n·aᵐ', 'a·(mn)', '(ab)ᵐ', 'a²ᵐ', 'aⁿ+aᵐ', 'aᵐ-n', 'a/nᵐ', '(aⁿ)ᵐ'],
        }
    },

    // ── 순환소수 ──────────────────────────────────────────────────────────────
    '순환소수': {
        keywords: /순환소수|순환마디|유한소수|반복소수|recurring/i,
        banks: {
            '분수변환': ['1/9', '1/3', '1/99', '10/9', '1/90', '1/11', '2/9', '5/9', '7/9', '4/9', '1/999', '10/99', '100/9', '1/6', '1/12'],
            '정의': ['유한소수', '무한소수', '순환하지 않는 무한소수', '정수', '유리수', '자연수', '이진소수', '반복하지 않는 소수', '순환마디가 1자리인 소수', '무리수', '분수로 나타낼 수 없는 수', '유한소수이면서 순환소수', '순환하지 않는 유리수', '소수점 아래 유한한 수', '무한히 계속되는 수'],
            default: ['유한소수', '무한소수', '무리수', '자연수', '정수', '1/9', '1/99', '1/3', '1/11', '2/9', '유리수', '이진소수', '반복수', '분수', '소수'],
        }
    },

    // ── 수체계 ────────────────────────────────────────────────────────────────
    '수체계': {
        keywords: /유리수|무리수|정수|자연수|실수|수체계|수의 분류/i,
        banks: {
            default: ['자연수', '정수', '유리수', '무리수', '실수', '복소수', '허수', '순환소수', '유한소수', '음의 정수', '양의 정수', '0', '분수', '소수', '정수가 아닌 유리수'],
        }
    },

    // ── 제곱근 ────────────────────────────────────────────────────────────────
    '제곱근': {
        keywords: /제곱근|√|루트|square root/i,
        banks: {
            '정의': ['제곱하면 a가 되는 수', '√a', 'a의 절반', 'a²', '±a', '√(a²)', 'a/2', '루트 a', 'a의 역수', '|a|', 'a를 2로 나눈 수', '2√a', '√a·2', 'a+√a', '-√a'],
            '성질': ['√a·√b = √(ab)', '√a+√b = √(a+b)', '√a/√b = √(a/b)', '(√a)² = a', '√a² = a', '√a² = ±a', '√a·√a = a²', '√(a+b) = √a+√b', '√a² = |a|', 'a = (√a)²', '2√a = √(2a)', '√(a·b) = √a·b', '√a·2 = 2√a', '√a-√b = √(a-b)', '(√a)² = √a'],
            default: ['√a', 'a²', '±a', 'a/2', '|a|', '2√a', '-√a', 'a+1', 'a-1', '1/√a', '√(a+1)', '√(2a)', 'a³', '√(a²)', 'a·√a'],
        }
    },

    // ── 역수 ─────────────────────────────────────────────────────────────────
    '역수': {
        keywords: /역수/i,
        banks: {
            default: ['두 수의 합이 1이 되는 수', '두 수의 차가 0이 되는 수', '분자와 분모를 바꾼 수', '분모와 분자를 더한 수', '절댓값이 같고 부호가 반대인 수', '두 수를 더해서 0이 되는 수', '곱해서 2가 되는 수', '나누어서 1이 되는 수', '분자를 2배 한 수', '분모에 1을 더한 수', '소수점을 이동시킨 수', '제곱해서 1이 되는 수', '두 수를 빼서 1이 되는 수', '나누어서 0이 되는 수', '합이 2가 되는 수'],
        }
    },

    // ── 동류항 ────────────────────────────────────────────────────────────────
    '동류항': {
        keywords: /동류항|문자부분|차수.*같|같은.*차수/i,
        banks: {
            default: ['계수가 같은 항', '상수항이 같은 항', '부호가 같은 항', '문자가 같고 계수가 다른 항', '차수만 같은 항', '문자가 없는 항', '계수와 문자가 모두 같은 항', '지수가 같은 항', '분수 계수를 가진 항', '음수 계수를 가진 항', '문자와 차수 중 하나만 같은 항', '같은 문자를 포함하는 모든 항', '상수항끼리', '최고차항이 같은 항', '절댓값이 같은 계수를 가진 항'],
        }
    },

    // ── 대소관계 ──────────────────────────────────────────────────────────────
    '대소관계': {
        keywords: /대소관계|크기.*비교|비교.*크기|부등호|크다.*작다|양수.*음수|음수.*양수/i,
        banks: {
            default: ['크다, 작다, 같다', '양수 > 0 > 음수', '절댓값이 큰 수가 항상 크다', '음수끼리는 절댓값이 클수록 크다', '분수의 크기는 분모로 결정된다', '양수는 음수보다 항상 작다', '0은 모든 음수보다 작다', '음수끼리는 절댓값이 클수록 작다', '분모가 같으면 분자로 비교', '정수는 자연수보다 항상 크다', '부등호 방향은 항상 고정이다', '무리수는 유리수보다 항상 크다', '음의 분수는 양의 정수보다 크다', '절댓값이 같으면 대소관계 없다', '소수점 이하 자리가 많을수록 크다'],
        }
    },

    // ── 약분 / 분수 ───────────────────────────────────────────────────────────
    '약분': {
        keywords: /약분|기약분수|통분|공약수|최대공약수|서로소/i,
        banks: {
            default: ['분자와 분모를 2로 나눈다', '분자만 약수로 나눈다', '분모만 약수로 나눈다', '분자+분모를 공약수로 나눈다', '최소공배수로 나눈다', '분자÷분모', '공배수로 나눈다', '분자×분모', '최대공약수로 곱한다', '분모를 분자로 나눈다', '공약수로 곱한다', '소인수로 나눈다', '분자-분모를 나눈다', '2의 배수로만 나눈다', '분수 자체를 역수로'],
        }
    },

    // ── 방정식 / 대수 ─────────────────────────────────────────────────────────
    '방정식': {
        keywords: /방정식|등식|일차방정식|이차방정식|항등식|해|근/i,
        banks: {
            default: ['x = 0', 'x = 1', 'x = -1', 'x = 2', 'x = -2', 'x = ±1', '해 없음', '무한히 많은 해', 'x = 1/2', 'x = -1/2', 'x² = 0', '근이 2개', '항등식', '부등식', '함수'],
        }
    },

    // ── 도형 / 넓이 ───────────────────────────────────────────────────────────
    '도형': {
        keywords: /삼각형|직사각형|마름모|사다리꼴|원|넓이|둘레|다각형|꼭짓점|모서리|사각형|평행사변|대각선|선분/i,
        banks: {
            '삼각형넓이': ['밑변×높이', '밑변×높이×2', '밑변+높이', '(밑변+높이)/2', '밑변²', '높이²', '밑변/높이', '밑변×높이/3', '3×밑변', '밑변²×높이', '밑변×높이²', '√(밑변×높이)', '밑변+높이×2', '밑변×(높이/4)', '(밑변×높이)²'],
            '직사각형넓이': ['(가로+세로)×2', '가로+세로', '가로²', '세로²', '가로×세로×2', '가로/세로', '2가로×세로', '가로+세로×2', '(가로-세로)×2', 'π×가로', '가로²×세로', '√(가로×세로)', '가로×2+세로', '(가로×세로)²', '가로÷세로'],
            '원넓이': ['2πr', 'πr', 'πr³', '4πr²', '2πr²', 'πd', '2πd', 'πr/2', '(πr)²', '4π/r', 'r²', '2r²', 'πr²/2', 'π²r', 'πd²'],
            default: ['밑변×높이', '(밑변+높이)/2', '밑변×높이/3', '가로+세로', '(가로+세로)×2', '2πr', 'πr²', '변의 합', '대각선×2', '대각선/2', '대각선의 곱/2', '밑변²', '높이²', 'πr', '가로÷세로'],
        }
    },

    // ── 비율 / 비례 ───────────────────────────────────────────────────────────
    '비례': {
        keywords: /비율|비례|닮음|닮음비|비|축척/i,
        banks: {
            default: ['a:b = b:a', 'a/b = c/d → ad = bc', 'a/b = c/d → ac = bd', 'a+b:c+d', 'a-b:c-d', 'a:b = c:d → a×d = b×c', '비례식의 외항=내항', '내항의 곱=외항의 곱', 'a:b에서 a가 전항', 'a:b에서 b가 후항', 'a/b × c/d = ac/bd', 'a/b + c/d = (a+c)/(b+d)', 'a:b = (a+c):(b+d)', 'a:b에서 a+b가 비의 합', '비의 값은 a÷b'],
        }
    },

    // ── 속력 ─────────────────────────────────────────────────────────────────
    '속력': {
        keywords: /속력|속도|거리|시간|km\/h/i,
        banks: {
            default: ['거리÷시간', '거리×시간', '시간÷거리', '거리+시간', '속력÷시간', '속력×거리', '(거리+속력)/2', '거리²/시간', '시간/속력', '속력+거리', '√(거리×시간)', '거리-시간', '거리×속력', '거리/(속력²)', '속력²/거리'],
        }
    },

    // ── 곱셈공식 / 전개 / 인수분해 ───────────────────────────────────────────
    '곱셈공식': {
        keywords: /곱셈공식|전개|인수분해|완전제곱|합차공식|\(a\+b\)|\(a-b\)|합의.제곱|차의.제곱|이차식|다항식/i,
        banks: {
            '(a+b)²':  ['a²+b²', 'a²+ab+b²', 'a²+2ab-b²', 'a²-2ab+b²', '(a+b)(a+b)', '2ab+a²+b²', 'a²+b²+ab', 'a²+3ab+b²', 'a²+2ab', 'a²+b²+2', 'a²b²', '(a+b)·2', 'a+2ab+b', 'a²-b²', 'a²+4ab+b²'],
            '(a-b)²':  ['a²+b²', 'a²-b²', 'a²-ab+b²', 'a²+2ab+b²', '(a-b)(a-b)', 'a²-2ab', 'a²+b²-2ab', 'a²-3ab+b²', 'a-2ab+b', 'a²-b', '(a+b)²', 'a²b²', 'a²-4ab+b²', 'a²-ab-b²', '2a²-2ab+b²'],
            '(a+b)(a-b)': ['a²+b²', 'a²+2ab-b²', '(a+b)²', '(a-b)²', 'a²-2ab+b²', 'a+b·a-b', 'a²+ab-b²', 'a·b', '(ab)²', 'a²-ab+b²', 'a²-b', 'a-b²', 'a²·b²', '2ab', 'a²+b'],
            '(a+b)³':  ['a³+b³', 'a³+3ab+b³', 'a³+3a²b+b³', 'a³+2a²b+2ab²+b³', 'a³-3a²b+3ab²-b³', '3a³+3a²b+3ab²+3b³', 'a³+3a²b+3ab+b³', 'a³+a²b+ab²+b³', '(a+b)(a²+ab+b²)', 'a³+b³+3ab', 'a³+6a²b+3ab²+b³', 'a³+3a²b+3ab²', 'a³+3ab²+b³', '(a+b)²·(a+b)', 'a³+3a²+3b²+b³'],
            '(a-b)³':  ['a³-b³', 'a³-3ab-b³', 'a³-3a²b-b³', 'a³+3a²b+3ab²+b³', 'a³-2a²b+2ab²-b³', 'a³-3a²b+3ab²+b³', 'a³-a²b+ab²-b³', 'a³-3ab²+b³', '(a-b)(a²-ab+b²)', 'a³-b³-3ab', 'a³-6a²b+3ab²-b³', 'a³-3a²b+3ab', '(a-b)²·(a-b)', 'a³-3a+b³', 'a³-3b²-b³'],
            'a²-b²':   ['(a+b)²', '(a-b)²', 'a²+b²', '(a-b)(a+b)', 'a·b', '(a+b)(a+b)', '(ab)²', 'a²+2ab-b²', 'a²-2ab+b²', 'a+b·a-b', 'a²·b²', '2a-2b', '(a²)(b²)', 'a²+ab-b²', 'a-b·a+b'],
            'a³+b³':   ['(a+b)³', '(a+b)(a+b)', 'a³-b³', '(a+b)(a²+ab+b²)', '(a+b)(a²-ab+b²)', '(a-b)(a²+ab+b²)', 'a²b+ab²', '(a+b)²·a', 'a³+2ab+b³', 'a³+3a²b+3ab²+b³', '(a+b)(a²+b²)', 'a²+b²', '3a²b+3ab²', 'a·b·(a+b)', '(a+b)(a-b)·(a+b)'],
            'a³-b³':   ['(a-b)³', '(a-b)(a-b)', 'a³+b³', '(a-b)(a²+ab+b²)', '(a+b)(a²-ab+b²)', '(a-b)(a²-ab-b²)', 'a²b-ab²', '(a-b)²·a', 'a³-2ab-b³', 'a³-3a²b+3ab²-b³', '(a-b)(a²+b²)', 'a²-b²', '3a²b-3ab²', 'a·b·(a-b)', '(a+b)(a-b)·(a-b)'],
            default:   ['a²+b²', 'a²-b²', '(a+b)²', '(a-b)²', 'a³+b³', 'a³-b³', '2ab', 'a²+2ab+b²', 'a²-2ab+b²', 'a³+3a²b+b³', 'a³-3ab+b³', 'a²+ab+b²', 'a²-ab+b²', '(a+b)(a-b)', 'a·b'],
        }
    },

    // ── 연산법칙 (교환·결합·분배) ─────────────────────────────────────────────
    '연산법칙': {
        keywords: /교환법칙|결합법칙|분배법칙|commutative|associative|distributive|a\+b.*b\+a|a×b.*b×a|a\(b\+c\)|a\(b-c\)/i,
        banks: {
            '교환법칙': ['b-a', 'a-b', '2a+b', 'a+b+1', 'a×b', 'a÷b', 'b÷a', 'a²+b', 'a+2b', 'a-b+1'],
            '결합법칙': ['a+(b-c)', '(a-b)+c', 'a+b-c', '(a×b)+c', 'a-(b+c)', 'a+b+c+1', '(a+b)×c', 'a+b×c', 'a×b+c', 'a-b×c'],
            '분배법칙': ['a×b×c', 'a×(b×c)', 'a+b+c', 'a×b+c', '(a+b)×c', 'a×b-a×c', 'a²×b+c', 'a×b+a+c', 'a×b+a-c', '(a×b)+(a+c)'],
            '성립여부': ['덧셈', '곱셈', '덧셈과 곱셈', '모든 사칙연산', '뺄셈만', '나눗셈만', '덧셈과 뺄셈', '뺄셈과 나눗셈', '곱셈과 나눗셈', '덧셈과 나눗셈'],
            default: ['b-a', 'a-b', 'a×b+c', '(a+b)×c', 'a+b×c', 'a×b×c', 'a+(b×c)', 'a×b+a+c', 'a-b-c', 'a²+b+c', '(a-b)×c', 'a+b-c'],
        }
    },

    // ── 방정식 근의 공식 / 판별식 ─────────────────────────────────────────────
    '이차방정식': {
        keywords: /이차방정식|근의.공식|판별식|근과.계수|짝수공식|완전제곱식/i,
        banks: {
            default: ['(-b±√(b²-4ac))/2a', '(-b±√(b²+4ac))/2a', '(b±√(b²-4ac))/2a', '(-b±√(b²-4ac))/a', '(-b²±√(b²-4ac))/2a', '(-b±√(4ac-b²))/2a', '(-b±√(b²-4ac))/2', '(-b∓√(b²-4ac))/2a', '(b²-4ac)/2a', '√(b²-4ac)', 'b²-4ac', '(-b)/2a', '4ac-b²', '-b/a', 'c/a'],
        }
    },
};

// ─── 답 패턴 기반 자동 distractor 생성 ───────────────────────────────────────

function generateFromPattern(answer) {
    const a = answer.trim();

    // 순수 숫자 답 (예: "3", "12", "-5")
    if (/^-?\d+(\.\d+)?$/.test(a)) {
        const n = parseFloat(a);
        const variants = [n+1, n-1, n*2, n/2, -n, n+2, n-2, n*3, Math.abs(n)+1, Math.abs(n)-1]
            .filter(v => v !== n)
            .map(v => Number.isInteger(v) ? String(v) : v.toFixed(1));
        return [...new Set(variants)].slice(0, 10);
    }

    // 분수 답 (예: "1/3", "2/5")
    if (/^\d+\/\d+$/.test(a)) {
        const [num, den] = a.split('/').map(Number);
        return [
            `${num+1}/${den}`, `${num}/${den+1}`, `${num-1}/${den}`,
            `${num}/${den-1}`, `${num*2}/${den}`, `${num}/${den*2}`,
            `${den}/${num}`, `${num+1}/${den+1}`, `${num-1}/${den-1}`,
            `${num}/${den+2}`
        ].filter(d => d !== a && !d.includes('/0') && !d.includes('-'));
    }

    // 단위 포함 답 (예: "6 cm²", "3.5 m")
    if (/\d+.*?(cm|m|km|g|kg|L|mL)/i.test(a)) {
        const num = parseFloat(a);
        const unit = a.replace(/[\d.\s]/g, '');
        if (!isNaN(num)) {
            return [num+1, num-1, num*2, num/2, num+0.5, num-0.5, num*3, num+3, num-3, num*4]
                .filter(v => v > 0 && v !== num)
                .slice(0, 10)
                .map(v => Number.isInteger(v) ? `${v} ${unit}` : `${v.toFixed(1)} ${unit}`);
        }
    }

    return [];
}

// ─── topic 추론 (카드의 topic 필드 또는 question/answer 패턴) ─────────────────

function inferDistractorTopic(card) {
    const topic = (card.topic || '').toLowerCase();
    const q = (card.question || '').toLowerCase();
    const a = (card.answer || '').toLowerCase();

    // 1차: topic 필드만으로 매칭 (더 정확 - 오매칭 방지)
    for (const [key, bank] of Object.entries(DISTRACTOR_BANKS)) {
        if (bank.keywords.test(topic)) return key;
    }
    // 2차: question까지 포함해서 매칭
    const qOnly = topic + ' ' + q;
    for (const [key, bank] of Object.entries(DISTRACTOR_BANKS)) {
        if (bank.keywords.test(qOnly)) return key;
    }
    // 3차: answer까지 포함 (최후 수단)
    const all = qOnly + ' ' + a;
    for (const [key, bank] of Object.entries(DISTRACTOR_BANKS)) {
        if (bank.keywords.test(all)) return key;
    }
    return null;
}

function pickBestSubBank(bankEntry, card) {
    const haystack = (card.question || '') + ' ' + (card.answer || '');
    const banks = bankEntry.banks;
    for (const [subKey, items] of Object.entries(banks)) {
        if (subKey === 'default') continue;
        if (haystack.includes(subKey)) return items;
    }
    return banks.default;
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

/**
 * getDistractors(card, count=5)
 * @param {object} card  - cards 테이블 행 (question, answer, topic, distractors)
 * @param {number} count - 정답 포함 총 선택지 수 (기본 5)
 * @returns {{ choices: string[], correctAnswer: string, source: string } | null}
 *   null이면 distractors 생성 불가 → 기존 "정답 보기" 방식 사용
 */
function getDistractors(card, count = 5) {
    // 다중정답 모드: card.answers 배열이 2개 이상이면 N:M 모드
    if (Array.isArray(card.answers) && card.answers.length > 1) {
        const corrects = card.answers.map(a => String(a).trim()).filter(Boolean);
        const pool = Array.isArray(card.distractors)
            ? card.distractors.map(d => String(d).trim()).filter(d => d && !corrects.includes(d))
            : [];
        if (pool.length < 1) return null;
        const wrongCount = Math.min(pool.length, Math.max(count - corrects.length, 1));
        const shuffledPool = pool.slice().sort(() => Math.random() - 0.5);
        const choices = [...corrects, ...shuffledPool.slice(0, wrongCount)]
            .sort(() => Math.random() - 0.5);
        return { choices, correctAnswers: corrects, isMulti: true, source: 'db' };
    }

    const correct = (card.answer || '').trim();
    if (!correct) return null;

    let pool = [];
    let source = 'pattern';

    // 1순위: DB에 저장된 distractors
    if (Array.isArray(card.distractors) && card.distractors.length >= 2) {
        pool = card.distractors.map(d => String(d).trim()).filter(d => d && d !== correct);
        source = 'db';
    }

    // 2순위: topic bank
    if (pool.length < 3) {
        const topicKey = inferDistractorTopic(card);
        if (topicKey && DISTRACTOR_BANKS[topicKey]) {
            const bankItems = pickBestSubBank(DISTRACTOR_BANKS[topicKey], card);
            const topicPool = bankItems.filter(d => d !== correct);
            pool = [...pool, ...topicPool];
            if (source !== 'db') source = 'topic-bank';
        }
    }

    // 3순위: answer 패턴 자동 생성
    if (pool.length < 3) {
        const patternPool = generateFromPattern(correct);
        pool = [...pool, ...patternPool];

        // "25 — 설명..." 형태: 앞 숫자로 numeric distractors 보충
        const leadingNum = correct.match(/^(-?\d+(?:,\d+)*(?:\.\d+)?)\s*[—\-–]/);
        if (leadingNum && pool.length < 3) {
            const n = parseFloat(leadingNum[1].replace(/,/g, ''));
            if (!isNaN(n)) {
                const numPool = [n+1,n-1,n*2,n/2,n+2,n-2,n+5,n-5,n*3,n+10]
                    .filter(v => v !== n && Number.isFinite(v))
                    .map(v => Number.isInteger(v) ? String(v) : v.toFixed(1));
                pool = [...pool, ...numPool];
            }
        }

        if (source === 'pattern' && pool.length < 2) return null; // 생성 불가
    }

    // "NUM — 설명" 패턴: MCQ 선택지는 숫자만 표시 (answerBox엔 전체 표시)
    let mcqCorrect = correct;
    const leadingNumDisplay = correct.match(/^(-?\d+(?:,\d+)*(?:\.\d+)?)\s*[—\-–]/);
    if (leadingNumDisplay && pool.some(d => /^-?\d/.test(d))) {
        mcqCorrect = leadingNumDisplay[1];
        pool = pool.filter(d => /^-?\d/.test(d) || d === mcqCorrect);
    }

    // 중복 제거, 정답 제외, 셔플
    const unique = [...new Set(pool)].filter(d => d !== mcqCorrect);
    const shuffled = unique.sort(() => Math.random() - 0.5);

    // count-1개 오답 + 정답 → 셔플
    const selected = shuffled.slice(0, count - 1);
    const choices = [...selected, mcqCorrect].sort(() => Math.random() - 0.5);

    return { choices, correctAnswer: mcqCorrect, fullAnswer: correct, source };
}

// 전역 노출 (non-module 스크립트에서 사용)
window.getDistractors = getDistractors;
