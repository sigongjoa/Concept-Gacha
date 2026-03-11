// 문제 자동 생성기 - 수학 개념별 공식 적용 연습 문제

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function simplify(n, d) {
    const g = gcd(Math.abs(n), Math.abs(d));
    return [n / g, d / g];
}

// 분수 답안 정규화 비교 (1/3 == 2/6 등 동치 처리)
function checkFractionAnswer(userInput, correct) {
    const norm = s => s.replace(/\s/g, '');
    const u = norm(userInput);
    const c = norm(correct);
    if (u === c) return true;
    const parse = s => {
        const p = s.split('/');
        if (p.length !== 2) return null;
        const n = parseInt(p[0]), d = parseInt(p[1]);
        return (!isNaN(n) && !isNaN(d) && d !== 0) ? [n, d] : null;
    };
    const uf = parse(u), cf = parse(c);
    if (uf && cf) return uf[0] * cf[1] === uf[1] * cf[0];
    return false;
}

// ─── 개념별 문제 생성기 ───────────────────────────────────────
const PROBLEM_GENERATORS = {

    '순환소수': {
        label: '순환소수 → 분수 변환',
        checkAnswer: checkFractionAnswer,

        generate() {
            const pick = Math.random();

            // ① 순수순환소수 1자리: 0.d̄  →  d/9
            if (pick < 0.34) {
                const d = Math.floor(Math.random() * 9) + 1; // 1–9
                const [n, de] = simplify(d, 9);
                return {
                    question: `0.${d}${d}${d}…`,
                    questionSub: `순환마디: ${d}`,
                    answer: `${n}/${de}`,
                    steps: [
                        `x = 0.${d}${d}${d}… 로 놓으면`,
                        `10x = ${d}.${d}${d}…`,
                        `10x − x = ${d}   →   9x = ${d}`,
                        `x = ${d}/9` + (gcd(d, 9) > 1 ? `  =  ${n}/${de}` : ''),
                    ],
                };
            }

            // ② 순수순환소수 2자리: 0.d₁d₂̄  →  d₁d₂/99
            if (pick < 0.67) {
                const d1 = Math.floor(Math.random() * 9) + 1;
                const d2 = Math.floor(Math.random() * 10);
                const raw = d1 * 10 + d2;
                const [n, de] = simplify(raw, 99);
                return {
                    question: `0.${d1}${d2}${d1}${d2}…`,
                    questionSub: `순환마디: ${d1}${d2}`,
                    answer: `${n}/${de}`,
                    steps: [
                        `x = 0.${d1}${d2}${d1}${d2}… 로 놓으면`,
                        `100x = ${d1}${d2}.${d1}${d2}…`,
                        `100x − x = ${raw}   →   99x = ${raw}`,
                        `x = ${raw}/99` + (gcd(raw, 99) > 1 ? `  =  ${n}/${de}` : ''),
                    ],
                };
            }

            // ③ 혼합순환소수 1+1자리: 0.ad̄  →  (9a+b)/90
            const a = Math.floor(Math.random() * 8) + 1; // 1–8
            const b = Math.floor(Math.random() * 9) + 1; // 1–9
            const raw_n = 9 * a + b;
            const [n, de] = simplify(raw_n, 90);
            return {
                question: `0.${a}${b}${b}${b}…`,
                questionSub: `순환마디: ${b}  (비순환부: ${a})`,
                answer: `${n}/${de}`,
                steps: [
                    `x = 0.${a}${b}${b}${b}… 로 놓으면`,
                    `10x = ${a}.${b}${b}${b}…`,
                    `100x = ${a}${b}.${b}${b}…`,
                    `100x − 10x = ${a}${b} − ${a}   →   90x = ${raw_n}`,
                    `x = ${raw_n}/90` + (gcd(raw_n, 90) > 1 ? `  =  ${n}/${de}` : ''),
                ],
            };
        },
    },

    '속력': {
        label: '속력 · 거리 · 시간',
        checkAnswer(userInput, correct) {
            // 숫자 부분만 추출해서 비교 ("180km" → 180)
            const extract = s => parseFloat(s.replace(/\s/g, '').match(/^-?[\d.]+/)?.[0] ?? 'NaN');
            return extract(userInput) === extract(correct);
        },

        generate() {
            const SPEEDS = [40, 50, 60, 80, 100, 120];
            const TIMES  = [1, 2, 3, 4, 5];
            const s = SPEEDS[Math.floor(Math.random() * SPEEDS.length)];
            const t = TIMES[Math.floor(Math.random() * TIMES.length)];
            const d = s * t;
            const type = Math.floor(Math.random() * 3);

            if (type === 0) {
                return {
                    question: `시속 ${s}km로 ${t}시간 달린 거리는?`,
                    questionSub: '거리 = 속력 × 시간',
                    answer: `${d}`,
                    steps: [
                        '공식: 거리 = 속력 × 시간',
                        `거리 = ${s} × ${t} = ${d} (km)`,
                    ],
                };
            }
            if (type === 1) {
                return {
                    question: `${d}km를 시속 ${s}km/h로 달리면 몇 시간?`,
                    questionSub: '시간 = 거리 ÷ 속력',
                    answer: `${t}`,
                    steps: [
                        '공식: 시간 = 거리 ÷ 속력',
                        `시간 = ${d} ÷ ${s} = ${t} (시간)`,
                    ],
                };
            }
            return {
                question: `${d}km를 ${t}시간 만에 달렸을 때 평균 속력은?`,
                questionSub: '속력 = 거리 ÷ 시간',
                answer: `${s}`,
                steps: [
                    '공식: 속력 = 거리 ÷ 시간',
                    `속력 = ${d} ÷ ${t} = ${s} (km/h)`,
                ],
            };
        },
    },

    '동류항': {
        label: '동류항 정리',
        checkAnswer(userInput, correct) {
            const norm = s => s.replace(/\s/g, '').toLowerCase()
                .replace(/\+1([a-z])/g, '+$1')
                .replace(/^1([a-z])/,   '$1')
                .replace(/-1([a-z])/g,  '-$1');
            return norm(userInput) === norm(correct);
        },

        generate() {
            const coef = (c, v) => {
                if (c === 1)  return v;
                if (c === -1) return `-${v}`;
                return `${c}${v}`;
            };
            const VARS = ['x', 'y', 'a', 'n'];
            const v = VARS[Math.floor(Math.random() * VARS.length)];
            const type = Math.floor(Math.random() * 4);

            // ① av + bv 더하기
            if (type === 0) {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 7) + 2;
                return {
                    question: `${coef(a,v)} + ${coef(b,v)}`,
                    questionSub: `변수 ${v}끼리 계수를 더하세요`,
                    answer: coef(a+b, v),
                    steps: [`(${a}+${b})${v} = ${coef(a+b,v)}`],
                };
            }
            // ② av - bv 빼기 (a > b 보장)
            if (type === 1) {
                const b = Math.floor(Math.random() * 4) + 1;
                const a = b + Math.floor(Math.random() * 5) + 1;
                return {
                    question: `${coef(a,v)} - ${coef(b,v)}`,
                    questionSub: `변수 ${v}끼리 계수를 빼세요`,
                    answer: coef(a-b, v),
                    steps: [`(${a}-${b})${v} = ${coef(a-b,v)}`],
                };
            }
            // ③ av + bv - cv 세 항
            if (type === 2) {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 5) + 2;
                const c = Math.floor(Math.random() * Math.min(a+b-1, 5)) + 1;
                const r = a + b - c;
                return {
                    question: `${coef(a,v)} + ${coef(b,v)} - ${coef(c,v)}`,
                    questionSub: `동류항 세 항을 정리하세요`,
                    answer: coef(r, v),
                    steps: [`(${a}+${b}-${c})${v} = ${coef(r,v)}`],
                };
            }
            // ④ 이변수: av + bw + cv + dw
            const w = v === 'x' ? 'y' : 'x';
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 5) + 1;
            const c = Math.floor(Math.random() * 5) + 1;
            const d = Math.floor(Math.random() * 5) + 1;
            const rx = a+c, ry = b+d;
            return {
                question: `${coef(a,v)} + ${coef(b,w)} + ${coef(c,v)} + ${coef(d,w)}`,
                questionSub: `${v}끼리, ${w}끼리 모아서 정리 (${v}항 먼저)`,
                answer: `${coef(rx,v)} + ${coef(ry,w)}`,
                steps: [
                    `${v}항: ${a}${v}+${c}${v} = ${coef(rx,v)}`,
                    `${w}항: ${b}${w}+${d}${w} = ${coef(ry,w)}`,
                    `결과: ${coef(rx,v)} + ${coef(ry,w)}`,
                ],
            };
        },
    },

    '수체계': {
        label: '유리수의 수 체계',
        // checkAnswer은 gacha.html이 직접 처리 (multi-blank)
        checkAnswer: null,

        // 노드별 허용 답안 (유사 표현 허용)
        aliases: {
            rational:   ['유리수'],
            integer:    ['정수'],
            pos_int:    ['양의 정수 (자연수)', '양의 정수', '자연수'],
            zero:       ['0'],
            neg_int:    ['음의 정수'],
            non_int:    ['정수가 아닌 유리수'],
            finite:     ['유한소수'],
            repeating:  ['순환소수'],
        },

        generate() {
            // 빈칸 대상 풀 (루트 rational은 제외 — 너무 쉬움)
            const candidates = ['integer', 'pos_int', 'zero', 'neg_int', 'non_int', 'finite', 'repeating'];
            const shuffled = [...candidates].sort(() => Math.random() - 0.5);
            const blankCount = Math.random() < 0.45 ? 1 : 2;
            const blankIds = new Set(shuffled.slice(0, blankCount));

            return {
                type: 'fillblank',
                blankIds,
                questionSub: '빈칸에 알맞은 말을 쓰시오',
            };
        },
    },

};

// ─── 내보내기 (module 환경과 전역 둘 다 지원) ───────────────
if (typeof module !== 'undefined') {
    module.exports = { PROBLEM_GENERATORS, checkFractionAnswer };
} else {
    window.PROBLEM_GENERATORS = PROBLEM_GENERATORS;
    window.checkFractionAnswer = checkFractionAnswer;
}
