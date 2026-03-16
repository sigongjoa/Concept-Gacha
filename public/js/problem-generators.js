// 문제 자동 생성기 - 수학 개념별 공식 적용 연습 문제

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// 단위 정규화: cm², cm2, cm^2 → cm² 로 통일 후 비교
function normUnit(s) {
    return s.replace(/\s/g, '')
            .replace(/cm\^?2/gi, 'cm²')
            .replace(/m\^?2/gi,  'm²')
            .replace(/km\^?2/gi, 'km²');
}
function checkUnitAnswer(u, c) { return normUnit(u) === normUnit(c); }

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
        instruction: '을 분수로 나타내시오',
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
            const blanks = shuffled.slice(0, blankCount);
            const blankIds = Object.fromEntries(blanks.map(b => [b, b]));

            return {
                type: 'fillblank',
                blankIds,
                questionSub: '빈칸에 알맞은 말을 쓰시오',
            };
        },
    },

    '거듭제곱': {
        label: '거듭제곱 계산',
        checkAnswer(u, c) { return u.trim() === c.trim(); },
        generate() {
            const BASE = [2,3,4,5,6,7];
            const EXP  = [2,3,4];
            const base = BASE[Math.floor(Math.random()*BASE.length)];
            const exp  = EXP[Math.floor(Math.random()*EXP.length)];
            const val  = Math.pow(base, exp);
            const type = Math.floor(Math.random()*3);
            if (type === 0) return { question: `${base}^${exp}`, questionSub: '거듭제곱 값을 계산하세요', answer: `${val}`, steps: [`${base}를 ${exp}번 곱하면`, `${Array(exp).fill(base).join(' × ')} = ${val}`] };
            if (type === 1) return { question: `${val} = ${base}^□`, questionSub: '□에 알맞은 수(지수)를 구하세요', answer: `${exp}`, steps: [`${base}^? = ${val}`, `${base}를 ${exp}번 곱하면 ${val}`] };
            return { question: `${val} = □^${exp}`, questionSub: '□에 알맞은 수(밑)를 구하세요', answer: `${base}`, steps: [`?^${exp} = ${val}`, `${val}의 ${exp}제곱근 = ${base}`] };
        },
    },

    '역수': {
        label: '역수 구하기',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const type = Math.floor(Math.random()*3);
            if (type === 0) {
                const n = Math.floor(Math.random()*7)+2, d = Math.floor(Math.random()*7)+2;
                return { question: `${n}/${d}의 역수`, questionSub: '분자와 분모를 바꾸세요', answer: `${d}/${n}`, steps: [`역수 = 분자↔분모`, `${n}/${d} → ${d}/${n}`] };
            }
            if (type === 1) {
                const n = Math.floor(Math.random()*8)+2;
                return { question: `${n}의 역수`, questionSub: '정수를 분수로 나타낸 뒤 뒤집으세요', answer: `1/${n}`, steps: [`${n} = ${n}/1`, `역수 = 1/${n}`] };
            }
            const n = Math.floor(Math.random()*7)+2, d = Math.floor(Math.random()*7)+2;
            return { question: `${n}/${d} × □ = 1`, questionSub: '□에 역수를 넣으세요', answer: `${d}/${n}`, steps: [`역수 = ${d}/${n}`, `${n}/${d} × ${d}/${n} = 1`] };
        },
    },

    '약분': {
        label: '약분 / 기약분수',
        checkAnswer: checkFractionAnswer,
        generate() {
            const GCDS = [2,3,4,5,6];
            const g = GCDS[Math.floor(Math.random()*GCDS.length)];
            let n, d;
            do { n = Math.floor(Math.random()*7)+2; d = Math.floor(Math.random()*7)+2; } while(n===d);
            const [rn,rd] = simplify(n*g, d*g);
            return { question: `${n*g}/${d*g}`, questionSub: '기약분수로 나타내세요', answer: `${rn}/${rd}`, steps: [`GCD(${n*g},${d*g}) = ${g}`, `${n*g}÷${g} / ${d*g}÷${g} = ${rn}/${rd}`] };
        },
    },

    '서로소': {
        label: '서로소 판별',
        checkAnswer(u, c) { return u.trim().startsWith(c.trim().split(' ')[0]); },
        generate() {
            const pairs = [[8,15,'서로소'],[4,9,'서로소'],[7,12,'서로소'],[5,13,'서로소'],[4,6,'서로소 아님'],[9,12,'서로소 아님'],[10,15,'서로소 아님']];
            const [a,b,ans] = pairs[Math.floor(Math.random()*pairs.length)];
            return { question: `${a}과 ${b}는 서로소?`, questionSub: '최대공약수가 1이면 서로소', answer: ans, steps: [`GCD(${a},${b}) = ${gcd(a,b)}`, gcd(a,b)===1?'서로소 ○':'서로소 ✕'] };
        },
    },

    '소수': {
        label: '소수 / 합성수 판별',
        checkAnswer(u, c) { return u.trim() === c.trim(); },
        generate() {
            const PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37];
            const COMPOS = [4,6,8,9,10,12,14,15,16,18,20,21,22,24,25];
            const all = [...PRIMES.slice(0,8), ...COMPOS.slice(0,8)];
            const n = all[Math.floor(Math.random()*all.length)];
            const isPrime = PRIMES.includes(n);
            return { question: `${n}은 소수? 합성수?`, questionSub: '1과 자기 자신만을 약수로 가지면 소수', answer: isPrime?'소수':'합성수', steps: isPrime?[`약수: 1, ${n}`,`약수가 2개 → 소수`]:[`${n} = ${n}의 소인수분해`, `약수 2개 초과 → 합성수`] };
        },
    },

    '제곱근': {
        label: '제곱근 계산',
        checkAnswer(u, c) { return u.trim() === c.trim(); },
        generate() {
            const PERFECT = [1,4,9,16,25,36,49,64,81,100,121,144];
            const n = PERFECT[Math.floor(Math.random()*PERFECT.length)];
            const sq = Math.sqrt(n);
            const type = Math.floor(Math.random()*2);
            if (type === 0) return { question: `√${n}`, questionSub: '양의 제곱근을 구하세요', answer: `${sq}`, steps: [`${sq}² = ${n}`, `∴ √${n} = ${sq}`] };
            return { question: `제곱해서 ${n}이 되는 양수는?`, questionSub: '양의 제곱근을 구하세요', answer: `${sq}`, steps: [`□² = ${n}`, `□ = ${sq}`] };
        },
    },

    '대소관계': {
        label: '분수 대소관계',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const fracs = [[1,2],[1,3],[2,3],[3,4],[1,4],[3,5],[2,5],[4,5],[1,6],[5,6]];
            let n1, d1, n2, d2;
            do {
                [n1,d1] = fracs[Math.floor(Math.random()*fracs.length)];
                [n2,d2] = fracs[Math.floor(Math.random()*fracs.length)];
            } while(n1===n2 && d1===d2);
            const v1=n1/d1, v2=n2/d2;
            const sym = v1>v2 ? '>' : v1<v2 ? '<' : '=';
            return { question: `${n1}/${d1}  ○  ${n2}/${d2}`, questionSub: '○ 안에 >, <, = 를 쓰세요', answer: sym, steps: [`통분: ${n1*d2}/${d1*d2}  vs  ${n2*d1}/${d1*d2}`, `${n1*d2} ${sym} ${n2*d1}  →  ${sym}`] };
        },
    },

    '삼각형': {
        label: '삼각형 넓이',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const b = Math.floor(Math.random()*8)+2, h = Math.floor(Math.random()*8)+2;
            const area = b*h/2;
            return { question: `밑변 ${b}cm, 높이 ${h}cm인 삼각형의 넓이는?`, questionSub: '넓이 = 밑변×높이÷2', answer: `${area}cm²`, steps: [`${b} × ${h} ÷ 2 = ${area}`, `넓이 = ${area}cm²`] };
        },
    },

    '직사각형': {
        label: '직사각형 둘레/넓이',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const w = Math.floor(Math.random()*8)+2, h = Math.floor(Math.random()*8)+2;
            const type = Math.floor(Math.random()*2);
            if (type===0) return { question: `가로 ${w}cm, 세로 ${h}cm 직사각형의 둘레는?`, questionSub: '둘레 = (가로+세로)×2', answer: `${2*(w+h)}cm`, steps: [`(${w}+${h}) × 2 = ${2*(w+h)}`] };
            return { question: `가로 ${w}cm, 세로 ${h}cm 직사각형의 넓이는?`, questionSub: '넓이 = 가로×세로', answer: `${w*h}cm²`, steps: [`${w} × ${h} = ${w*h}cm²`] };
        },
    },

    '마름모': {
        label: '마름모 넓이',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const d1 = (Math.floor(Math.random()*5)+2)*2;
            const d2 = (Math.floor(Math.random()*5)+2)*2;
            return { question: `대각선이 ${d1}cm, ${d2}cm인 마름모의 넓이는?`, questionSub: '넓이 = 대각선×대각선÷2', answer: `${d1*d2/2}cm²`, steps: [`${d1} × ${d2} ÷ 2 = ${d1*d2/2}`, `넓이 = ${d1*d2/2}cm²`] };
        },
    },

    '사다리꼴': {
        label: '사다리꼴 넓이',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const top = Math.floor(Math.random()*5)+2;
            const bot = top + Math.floor(Math.random()*5)+1;
            const h   = Math.floor(Math.random()*6)+2;
            const area = (top+bot)*h/2;
            return { question: `윗변 ${top}cm, 아랫변 ${bot}cm, 높이 ${h}cm인 사다리꼴의 넓이는?`, questionSub: '넓이 = (윗변+아랫변)×높이÷2', answer: `${area}cm²`, steps: [`(${top}+${bot}) × ${h} ÷ 2 = ${area}`, `넓이 = ${area}cm²`] };
        },
    },

    '복잡한도형': {
        label: '복잡한 도형 넓이 (보조선 분할)',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const r = () => Math.floor(Math.random()*5)+2;
            const type = Math.floor(Math.random()*4);

            if (type === 0) {
                // ㄱ자: 전체 큰 직사각형 - 잘린 부분
                const W = r()+4, H = r()+4;
                const w = Math.floor(Math.random()*(W-2))+1;
                const h = Math.floor(Math.random()*(H-2))+1;
                const area = W*H - w*h;
                return {
                    question: `전체 가로 ${W}cm, 세로 ${H}cm인 직사각형에서 오른쪽 위 가로 ${w}cm, 세로 ${h}cm를 잘라낸 ㄱ자 도형의 넓이는?`,
                    questionSub: '보조선을 그어 두 직사각형으로 나눠 보세요',
                    answer: `${area}cm²`,
                    steps: [`큰 직사각형: ${W}×${H} = ${W*H}cm²`, `잘린 부분: ${w}×${h} = ${w*h}cm²`, `넓이 = ${W*H} - ${w*h} = ${area}cm²`],
                    shape: { type: 'L', W, H, w, h },
                };
            }
            if (type === 1) {
                // 계단(2단): 아래 큰 + 위 작은
                const W1 = r()+3, H1 = r()+1;
                const W2 = Math.floor(W1/2)+1, H2 = r()+1;
                const area = W1*H1 + W2*H2;
                return {
                    question: `아래 가로 ${W1}cm×세로 ${H1}cm, 위 가로 ${W2}cm×세로 ${H2}cm인 계단 모양 도형의 넓이는?`,
                    questionSub: '두 직사각형으로 나눠 각각 구한 뒤 더하세요',
                    answer: `${area}cm²`,
                    steps: [`아래: ${W1}×${H1} = ${W1*H1}cm²`, `위: ${W2}×${H2} = ${W2*H2}cm²`, `합계 = ${area}cm²`],
                    shape: { type: 'stair', W1, H1, W2, H2 },
                };
            }
            if (type === 2) {
                // ㄷ자: 전체 - 안쪽 빈 직사각형
                const W = r()+4, H = r()+4;
                const w = Math.floor(Math.random()*(W-3))+1;
                const h = Math.floor(Math.random()*(H-3))+1;
                const area = W*H - w*h;
                return {
                    question: `전체 가로 ${W}cm, 세로 ${H}cm 직사각형에서 안쪽 가로 ${w}cm, 세로 ${h}cm가 뚫린 ㄷ자 도형의 넓이는?`,
                    questionSub: '전체 넓이에서 빈 부분을 빼세요',
                    answer: `${area}cm²`,
                    steps: [`전체: ${W}×${H} = ${W*H}cm²`, `빈 부분: ${w}×${h} = ${w*h}cm²`, `넓이 = ${W*H} - ${w*h} = ${area}cm²`],
                    shape: { type: 'U', W, H, w, h },
                };
            }
            // 십자 모양
            const hw = r()+3, hh = r();
            const vw = r(), vh = r()+3;
            const area = hw*hh + vw*vh - vw*hh;
            return {
                question: `가로막대(${hw}×${hh}cm)와 세로막대(${vw}×${vh}cm)가 겹쳐진 십자 도형의 넓이는? (겹친 부분 ${vw}×${hh}cm)`,
                questionSub: '두 막대 넓이의 합에서 겹친 부분을 빼세요',
                answer: `${area}cm²`,
                steps: [`가로막대: ${hw}×${hh} = ${hw*hh}cm²`, `세로막대: ${vw}×${vh} = ${vw*vh}cm²`, `겹침: ${vw}×${hh} = ${vw*hh}cm²`, `합계 = ${hw*hh}+${vw*vh}-${vw*hh} = ${area}cm²`],
                shape: { type: 'cross', hw, hh, vw, vh },
            };
        },
    },

    // ── 김시우 특화 — 초5 다각형 취약 유형 ────────────────────

    '원내접마름모': {
        label: '원에 내접하는 마름모 넓이',
        instruction: '넓이를 구하시오 (단위 포함)',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const r = [5, 6, 7, 8, 9, 10][Math.floor(Math.random()*6)];
            const d = 2 * r;
            const area = d * d / 2; // 2r²
            return {
                question: `반지름이 ${r}cm인 원에 꼭 맞게 들어가는 마름모의 넓이는?`,
                questionSub: `핵심: 원에 내접하는 마름모의 대각선 = 원의 지름`,
                answer: `${area}cm²`,
                steps: [
                    `원의 지름 = 반지름 × 2 = ${r} × 2 = ${d}cm`,
                    `원에 내접하는 마름모 → 두 대각선이 모두 지름`,
                    `두 대각선 = ${d}cm`,
                    `마름모 넓이 = ${d} × ${d} ÷ 2 = ${area}cm²`,
                ],
                shape: { type: 'circle_rhombus', r },
            };
        },
    },

    '종이접기': {
        label: '종이접기 — 합동 삼각형 넓이',
        instruction: '넓이를 구하시오 (단위 포함)',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            // W:foldH(=H/2) 비율이 너무 납작하지 않도록 W≤H 조합만 사용
            const pairs = [[6,6],[6,8],[8,8],[8,10],[10,10],[10,12],[12,12]];
            const [W, H] = pairs[Math.floor(Math.random()*pairs.length)];
            const type = Math.floor(Math.random()*2);
            if (type === 0) {
                // 대각선으로 접기 → 삼각형 = 직사각형 / 2
                const area = W * H / 2;
                return {
                    question: `가로 ${W}cm, 세로 ${H}cm인 직사각형 종이를 대각선으로 접었을 때 생기는 삼각형의 넓이는?`,
                    questionSub: '접힌 두 삼각형은 합동 — 각 삼각형 = 직사각형의 절반',
                    answer: `${area}cm²`,
                    steps: [
                        `직사각형을 대각선으로 접으면 합동인 삼각형 2개`,
                        `삼각형 넓이 = 직사각형 넓이 ÷ 2`,
                        `= ${W} × ${H} ÷ 2 = ${area}cm²`,
                    ],
                    shape: { type: 'paper_fold_diag', W, H },
                };
            } else {
                // 반으로 접고 대각선 → 접힌 삼각형 높이 = H/2
                const foldH = H / 2;
                const area = W * foldH / 2;
                return {
                    question: `가로 ${W}cm, 세로 ${H}cm인 직사각형 종이를 가로로 반 접은 뒤 대각선으로 잘랐을 때 생기는 삼각형의 넓이는?`,
                    questionSub: '종이를 반 접으면 높이가 절반으로 줄어듭니다',
                    answer: `${area}cm²`,
                    steps: [
                        `반으로 접으면 높이 = ${H} ÷ 2 = ${foldH}cm`,
                        `삼각형 밑변 = ${W}cm, 높이 = ${foldH}cm`,
                        `넓이 = ${W} × ${foldH} ÷ 2 = ${area}cm²`,
                    ],
                    shape: { type: 'paper_fold', W, H: foldH, origH: H },
                };
            }
        },
    },

    '넓이역산': {
        label: '넓이 역산 — 변의 길이 구하기',
        instruction: '변의 길이를 구하시오 (단위 포함)',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const type = Math.floor(Math.random()*3);
            if (type === 0) {
                // 삼각형 높이 역산
                const h = [4,6,8,10,12][Math.floor(Math.random()*5)];
                const b = [4,6,8,10,12][Math.floor(Math.random()*5)];
                const A = b * h / 2;
                return {
                    question: `넓이가 ${A}cm²이고 밑변이 ${b}cm인 삼각형의 높이는?`,
                    questionSub: '공식: 넓이 = 밑변 × 높이 ÷ 2',
                    answer: `${h}cm`,
                    steps: [
                        `넓이 = 밑변 × 높이 ÷ 2`,
                        `${A} = ${b} × 높이 ÷ 2`,
                        `높이 = ${A} × 2 ÷ ${b} = ${h}cm`,
                    ],
                };
            }
            if (type === 1) {
                // 직사각형 세로 역산
                const w = Math.floor(Math.random()*6)+3;
                const h = Math.floor(Math.random()*6)+3;
                const A = w * h;
                return {
                    question: `넓이가 ${A}cm²이고 가로가 ${w}cm인 직사각형의 세로는?`,
                    questionSub: '공식: 넓이 = 가로 × 세로',
                    answer: `${h}cm`,
                    steps: [
                        `넓이 = 가로 × 세로`,
                        `${A} = ${w} × 세로`,
                        `세로 = ${A} ÷ ${w} = ${h}cm`,
                    ],
                };
            }
            // 사다리꼴 높이 역산
            const top = Math.floor(Math.random()*4)+2;
            const bot = top + Math.floor(Math.random()*4)+2;
            const h = [4,6,8,10][Math.floor(Math.random()*4)];
            const A = (top + bot) * h / 2;
            return {
                question: `넓이가 ${A}cm²이고 윗변 ${top}cm, 아랫변 ${bot}cm인 사다리꼴의 높이는?`,
                questionSub: '공식: 넓이 = (윗변+아랫변) × 높이 ÷ 2',
                answer: `${h}cm`,
                steps: [
                    `넓이 = (윗변+아랫변) × 높이 ÷ 2`,
                    `${A} = (${top}+${bot}) × 높이 ÷ 2`,
                    `높이 = ${A} × 2 ÷ ${top+bot} = ${h}cm`,
                ],
            };
        },
    },

    '색칠부분': {
        label: '색칠된 부분의 넓이 (★★★)',
        instruction: '색칠된 부분의 넓이를 구하시오 (단위 포함)',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() {
            const pick = a => a[Math.floor(Math.random()*a.length)];
            const type = Math.floor(Math.random()*5);

            if (type === 0) {
                // ① 두 직사각형 겹침 합집합 (포함-배제 원리)
                const W1=pick([8,10,12,14]), H1=pick([6,7,8]);
                const W2=pick([6,8,10]),     H2=pick([5,6,7]);
                const ow=pick([2,3,4]),       oh=pick([2,3,4]);
                const area = W1*H1 + W2*H2 - ow*oh;
                return {
                    question: `가로 ${W1}cm·세로 ${H1}cm인 직사각형 ①과 가로 ${W2}cm·세로 ${H2}cm인 직사각형 ②가 가로 ${ow}cm·세로 ${oh}cm 크기로 겹쳐 있습니다. 두 직사각형이 덮는 전체 색칠 넓이는?`,
                    questionSub: '전체 = ① + ② − 겹친 부분 (겹친 부분을 두 번 더했으므로 한 번 뺌)',
                    answer: `${area}cm²`,
                    steps: [
                        `직사각형① = ${W1} × ${H1} = ${W1*H1}cm²`,
                        `직사각형② = ${W2} × ${H2} = ${W2*H2}cm²`,
                        `겹친 부분 = ${ow} × ${oh} = ${ow*oh}cm²`,
                        `색칠 = ${W1*H1} + ${W2*H2} − ${ow*oh} = ${area}cm²`,
                    ],
                };
            }

            if (type === 1) {
                // ② 네 모서리 직각삼각형 4개 제거 → 팔각형 넓이
                const W=pick([10,12,14,16]), H=pick([8,10,12]);
                const a=pick([2,4]); // 정수 보장
                const corners = 4*(a*a/2);
                const area = W*H - corners;
                return {
                    question: `가로 ${W}cm, 세로 ${H}cm인 직사각형의 네 모서리에서 각각 밑변 ${a}cm·높이 ${a}cm인 직각삼각형을 잘라냈습니다. 남은 육각형의 넓이는?`,
                    questionSub: '4개 모서리 삼각형을 모두 빼세요',
                    answer: `${area}cm²`,
                    steps: [
                        `직사각형 전체 = ${W} × ${H} = ${W*H}cm²`,
                        `삼각형 1개 = ${a} × ${a} ÷ 2 = ${a*a/2}cm²`,
                        `삼각형 4개 = ${a*a/2} × 4 = ${corners}cm²`,
                        `색칠 = ${W*H} − ${corners} = ${area}cm²`,
                    ],
                };
            }

            if (type === 2) {
                // ③ 사다리꼴 − 내부 직사각형 (빈 공간)
                const top=pick([4,6,8]), add=pick([4,6,8]);
                const bot=top+add, H=pick([6,8,10]);
                const iW=pick([3,4,5]), iH=pick([2,3]);
                const trapArea=(top+bot)*H/2, rectArea=iW*iH;
                const area=trapArea-rectArea;
                return {
                    question: `윗변 ${top}cm, 아랫변 ${bot}cm, 높이 ${H}cm인 사다리꼴에서 안쪽에 가로 ${iW}cm·세로 ${iH}cm인 직사각형이 뚫려 있습니다. 색칠된 부분의 넓이는?`,
                    questionSub: '색칠 = 사다리꼴 − 빈 직사각형',
                    answer: `${area}cm²`,
                    steps: [
                        `사다리꼴 = (${top}+${bot}) × ${H} ÷ 2 = ${top+bot} × ${H} ÷ 2 = ${trapArea}cm²`,
                        `빈 직사각형 = ${iW} × ${iH} = ${rectArea}cm²`,
                        `색칠 = ${trapArea} − ${rectArea} = ${area}cm²`,
                    ],
                };
            }

            if (type === 3) {
                // ④ ㄱ자 도형에서 삼각형 추가 빼기 (3단계)
                const W=pick([10,12,14]), H=pick([8,10,12]);
                const cw=pick([3,4,5]),   ch=pick([3,4,5]);
                const Larea=W*H-cw*ch;
                const bT=pick([4,6,8]),  hT=pick([4,6]);
                const triArea=bT*hT/2;
                const area=Larea-triArea;
                return {
                    question: `가로 ${W}cm·세로 ${H}cm 직사각형의 오른쪽 위에서 가로 ${cw}cm·세로 ${ch}cm를 잘라낸 ㄱ자 도형이 있습니다. 이 도형에서 밑변 ${bT}cm·높이 ${hT}cm인 삼각형도 빈 공간일 때, 색칠된 넓이는?`,
                    questionSub: '① ㄱ자 넓이 → ② 삼각형(빈 부분) 빼기 — 2단계',
                    answer: `${area}cm²`,
                    steps: [
                        `ㄱ자 = ${W}×${H} − ${cw}×${ch} = ${W*H} − ${cw*ch} = ${Larea}cm²`,
                        `삼각형(빈 부분) = ${bT} × ${hT} ÷ 2 = ${triArea}cm²`,
                        `색칠 = ${Larea} − ${triArea} = ${area}cm²`,
                    ],
                    shape: { type: 'L', W, H, w: cw, h: ch },
                };
            }

            // ⑤ 직사각형 − 삼각형 2개 − 작은 직사각형 (4단계)
            const W=pick([12,14,16]), H=pick([8,10]);
            const b1=pick([4,6]),     t1=b1*H/2;
            const b2=pick([4,6]),     h2=pick([4,6]); const t2=b2*h2/2;
            const iW=pick([3,4]),     iH=pick([2,3]); const r=iW*iH;
            const area=W*H-t1-t2-r;
            return {
                question: `가로 ${W}cm·세로 ${H}cm 직사각형에서 삼각형①(밑변 ${b1}cm·높이 ${H}cm), 삼각형②(밑변 ${b2}cm·높이 ${h2}cm), 직사각형(가로 ${iW}cm·세로 ${iH}cm)을 빈 공간으로 제외할 때 색칠 넓이는?`,
                questionSub: '색칠 = 전체 − 삼각형① − 삼각형② − 직사각형 (4단계)',
                answer: `${area}cm²`,
                steps: [
                    `전체 = ${W} × ${H} = ${W*H}cm²`,
                    `삼각형① = ${b1} × ${H} ÷ 2 = ${t1}cm²`,
                    `삼각형② = ${b2} × ${h2} ÷ 2 = ${t2}cm²`,
                    `직사각형 = ${iW} × ${iH} = ${r}cm²`,
                    `색칠 = ${W*H} − ${t1} − ${t2} − ${r} = ${area}cm²`,
                ],
            };
        },
    },

    '보조선': {
        label: '복잡한 도형 넓이 (보조선 분할)',
        checkAnswer(u, c) { return checkUnitAnswer(u, c); },
        generate() { return PROBLEM_GENERATORS['복잡한도형'].generate(); },
    },

    // ── 서버 alias와 동기화 ────────────────────────────────────
    '밑':       { label: '거듭제곱', checkAnswer(u,c){return u===c;}, generate(){return PROBLEM_GENERATORS['거듭제곱'].generate();} },
    '지수':     { label: '거듭제곱', checkAnswer(u,c){return u===c;}, generate(){return PROBLEM_GENERATORS['거듭제곱'].generate();} },
    '통분':     { label: '약분/통분', checkAnswer(u,c){return u.replace(/\s/g,'')===c.replace(/\s/g,'');}, generate(){return PROBLEM_GENERATORS['약분'].generate();} },
    '합성수':   { label: '소수/합성수', checkAnswer(u,c){return u.replace(/\s/g,'')===c.replace(/\s/g,'');}, generate(){return PROBLEM_GENERATORS['소수'].generate();} },
    '정사각형': { label: '직사각형/정사각형', checkAnswer(u,c){return u.replace(/\s/g,'')===c.replace(/\s/g,'');}, generate(){return PROBLEM_GENERATORS['직사각형'].generate();} },

    '단위변환': {
        label: '넓이 단위 변환 (km²↔m², m²↔cm²)',
        checkAnswer(u, c) { return u.replace(/[\s,]/g,'') === c.replace(/[\s,]/g,''); },
        generate() {
            const type = Math.floor(Math.random()*6);
            const fmt = n => n.toLocaleString('ko-KR');

            if (type === 0) {
                const n = Math.floor(Math.random()*5)+1;
                return { question: `${n}km² = ______ m²`, questionSub: '1km=1000m 이므로 1km²=1000²=1,000,000m²', answer: `${fmt(n*1_000_000)}m²`, steps: [`1km² = 1000×1000 = 1,000,000m²`, `${n}km² = ${n}×1,000,000 = ${fmt(n*1_000_000)}m²`] };
            }
            if (type === 1) {
                const vals = [500_000, 1_000_000, 2_000_000, 3_000_000];
                const n = vals[Math.floor(Math.random()*vals.length)];
                return { question: `${fmt(n)}m² = ______ km²`, questionSub: '1,000,000m² = 1km²', answer: `${n/1_000_000}km²`, steps: [`${fmt(n)} ÷ 1,000,000 = ${n/1_000_000}km²`] };
            }
            if (type === 2) {
                const n = Math.floor(Math.random()*5)+1;
                return { question: `${n}m² = ______ cm²`, questionSub: '1m=100cm 이므로 1m²=100²=10,000cm²', answer: `${fmt(n*10_000)}cm²`, steps: [`1m² = 100×100 = 10,000cm²`, `${n}m² = ${n}×10,000 = ${fmt(n*10_000)}cm²`] };
            }
            if (type === 3) {
                const vals = [10_000, 20_000, 50_000];
                const n = vals[Math.floor(Math.random()*vals.length)];
                return { question: `${fmt(n)}cm² = ______ m²`, questionSub: '10,000cm² = 1m²', answer: `${n/10_000}m²`, steps: [`${fmt(n)} ÷ 10,000 = ${n/10_000}m²`] };
            }
            if (type === 4) {
                const n = Math.floor(Math.random()*5)+1;
                return { question: `${n}cm² = ______ mm²`, questionSub: '1cm=10mm 이므로 1cm²=10²=100mm²', answer: `${n*100}mm²`, steps: [`1cm² = 10×10 = 100mm²`, `${n}cm² = ${n}×100 = ${n*100}mm²`] };
            }
            // 원리 확인
            return { question: `1km = 1000m 일 때, 1km² = (______)² m² = ______ m²`, questionSub: '단위를 제곱하면 변환 배수도 제곱됩니다', answer: `1000² = 1,000,000m²`, steps: [`가로 1km = 1000m, 세로 1km = 1000m`, `넓이 = 1000×1000 = 1,000,000m²`] };
        },
    },

    '넓이단위': {
        label: '넓이 단위 변환 (km²↔m², m²↔cm²)',
        checkAnswer(u, c) { return u.replace(/[\s,]/g,'') === c.replace(/[\s,]/g,''); },
        generate() { return PROBLEM_GENERATORS['단위변환'].generate(); },
    },

};

// ─── 내보내기 (module 환경과 전역 둘 다 지원) ───────────────
if (typeof module !== 'undefined') {
    module.exports = { PROBLEM_GENERATORS, checkFractionAnswer };
} else {
    window.PROBLEM_GENERATORS = PROBLEM_GENERATORS;
    window.checkFractionAnswer = checkFractionAnswer;
}
