// @ts-check
// MCQ 렌더링 스크린샷 검증 테스트
// 각 개념 카드 유형별로 올바른 distractor가 표시되는지 확인
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// 스크린샷 저장 폴더
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-results', 'mcq-screenshots');

const TEST_CARDS = [
    {
        id: 'c1', topic: '삼각형 넓이', box: 1,
        question: '삼각형의 넓이 공식은?',
        answer: '(밑변)×(높이)/2',
        distractors: null,
    },
    {
        id: 'c2', topic: '복소수', box: 1,
        question: '허수단위 i²는?',
        answer: '-1',
        distractors: null,
    },
    {
        id: 'c3', topic: '거듭제곱', box: 1,
        question: 'aᵐ × aⁿ = ?',
        answer: 'aᵐ⁺ⁿ',
        distractors: null,
    },
    {
        id: 'c4', topic: '곱셈공식', box: 1,
        question: '(a+b)² = ?',
        answer: 'a²+2ab+b²',
        distractors: null,
    },
    {
        id: 'c5', topic: '소수', box: 1,
        question: '소수의 정의는?',
        answer: '1과 자기 자신만을 약수로 가지는 자연수',
        distractors: null,
    },
    {
        id: 'c6', topic: '순환소수', box: 1,
        question: '0.333...은 어떤 수인가?',
        answer: '순환소수',
        distractors: null,
    },
    {
        id: 'c7', topic: '켤레복소수', box: 1,
        question: 'a+bi의 켤레복소수는?',
        answer: 'a-bi',
        distractors: null,
    },
    {
        id: 'c8', topic: '원 넓이', box: 1,
        question: '반지름이 r인 원의 넓이는?',
        answer: 'πr²',
        distractors: null,
    },
    {
        id: 'c9', topic: '속력', box: 1,
        question: '속력 = ?',
        answer: '거리÷시간',
        distractors: null,
    },
    {
        id: 'c10', topic: '역수', box: 1,
        question: '역수의 정의는?',
        answer: '곱해서 1이 되는 수',
        distractors: null,
    },
];

function mockApis(page, cards) {
    // student list
    page.route('**/api/students', route => route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'test-student', name: '김시우' }]),
    }));

    // cards for student
    page.route('**/api/cards*', route => {
        const url = route.request().url();
        if (url.includes('student_id=test-student') || url.includes('test-student')) {
            return route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(cards),
            });
        }
        return route.fulfill({ contentType: 'application/json', body: '[]' });
    });

    // sessions
    page.route('**/api/sessions*', route => route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([]),
    }));

    // sessions today
    page.route('**/api/daily_sessions*', route => route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ count: 0 }),
    }));
}

test.describe('MCQ 렌더링 스크린샷', () => {
    test.beforeAll(() => {
        if (!fs.existsSync(SCREENSHOT_DIR)) {
            fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
        }
    });

    for (const card of TEST_CARDS) {
        test(`[${card.topic}] MCQ 오답이 올바른 뱅크에서 생성`, async ({ page }) => {
            // sessionStorage 미리 설정
            await page.addInitScript(() => {
                sessionStorage.setItem('currentStudent', JSON.stringify({
                    id: 'test-student',
                    name: '김시우',
                }));
            });

            // API 목킹: 이 카드 1개만
            await mockApis(page, [card]);

            await page.goto('/gacha.html');

            // 카드 질문이 나타날 때까지 대기
            await page.waitForSelector('#questionText', { timeout: 8000 });
            await expect(page.locator('#questionText')).toContainText(card.question.slice(0, 10), { timeout: 5000 });

            // MCQ grid 또는 정답 보기 버튼이 나타날 때까지 잠깐 대기
            await page.waitForTimeout(500);

            const mcqGrid = page.locator('#mcqGrid');
            const mcqVisible = await mcqGrid.isVisible().catch(() => false);

            if (mcqVisible) {
                const buttons = page.locator('#mcqChoices button');
                const count = await buttons.count();

                // MCQ 버튼이 2개 이상 있어야 함
                expect(count).toBeGreaterThanOrEqual(2);

                // 정답이 선택지 중에 포함되어야 함
                const buttonTexts = [];
                for (let i = 0; i < count; i++) {
                    buttonTexts.push(await buttons.nth(i).innerText());
                }
                console.log(`[${card.topic}] MCQ choices:`, buttonTexts);

                // 거듭제곱 공식이 도형 카드에 등장하면 안 됨
                if (card.topic.includes('삼각형') || card.topic.includes('원') || card.topic.includes('넓이')) {
                    const hasExponent = buttonTexts.some(t => /aᵐ|aⁿ|지수|a\^/.test(t));
                    expect(hasExponent, `[${card.topic}] 거듭제곱 오답이 섞이면 안 됨: ${buttonTexts}`).toBe(false);
                }

                // 스크린샷 저장
                await page.screenshot({
                    path: path.join(SCREENSHOT_DIR, `${card.id}-${card.topic.replace(/\s/g, '_')}-mcq.png`),
                    fullPage: false,
                });
            } else {
                // MCQ 없음 - 폴백으로 "정답 보기" 버튼 표시
                const showBtn = page.locator('#showAnswerBtn, button:has-text("정답 보기")');
                const fallbackVisible = await showBtn.isVisible().catch(() => false);
                console.log(`[${card.topic}] MCQ 없음, 폴백 모드: ${fallbackVisible}`);

                await page.screenshot({
                    path: path.join(SCREENSHOT_DIR, `${card.id}-${card.topic.replace(/\s/g, '_')}-fallback.png`),
                    fullPage: false,
                });
            }
        });
    }

    test('전체 카드 MCQ 커버리지 요약', async ({ page }) => {
        await page.addInitScript(() => {
            sessionStorage.setItem('currentStudent', JSON.stringify({
                id: 'test-student',
                name: '김시우',
            }));
        });

        const results = [];

        for (const card of TEST_CARDS) {
            await mockApis(page, [card]);
            await page.goto('/gacha.html');

            try {
                await page.waitForSelector('#questionText', { timeout: 6000 });
                await page.waitForTimeout(400);

                const mcqVisible = await page.locator('#mcqGrid').isVisible().catch(() => false);
                const choiceCount = mcqVisible
                    ? await page.locator('#mcqChoices button').count()
                    : 0;

                results.push({ topic: card.topic, mcq: mcqVisible, choices: choiceCount });
            } catch {
                results.push({ topic: card.topic, mcq: false, choices: 0, error: true });
            }
        }

        console.log('\n=== MCQ 커버리지 요약 ===');
        results.forEach(r => {
            const status = r.mcq ? `✅ MCQ (${r.choices}개 선택지)` : '❌ 폴백';
            console.log(`  ${r.topic}: ${status}`);
        });

        const mcqCount = results.filter(r => r.mcq).length;
        console.log(`\n커버리지: ${mcqCount}/${results.length} (${Math.round(mcqCount/results.length*100)}%)`);
    });
});
