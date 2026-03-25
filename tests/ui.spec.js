// @ts-check
const { test, expect } = require('@playwright/test');

// ── 공통 헬퍼 ────────────────────────────────────────────────────────────────

async function setStudent(page, id = 'test-student-1', name = '홍길동') {
    await page.addInitScript(({ id, name }) => {
        sessionStorage.setItem('currentStudent', JSON.stringify({ id, name }));
    }, { id, name });
}

async function checkMD3Colors(page) {
    return await page.evaluate(() => {
        const cfg = window.tailwind?.config?.theme?.extend?.colors;
        return !!(cfg && cfg['primary'] === '#c23800' && cfg['secondary'] === '#2a2b96');
    });
}

// ── index.html ────────────────────────────────────────────────────────────────

test.describe('index.html - 로그인', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html');
    });

    test('브랜드 패널 - 개념 가챠 헤드라인', async ({ page }) => {
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
        await expect(h1).toContainText('개념 가챠');
    });

    test('이름 입력 필드 존재', async ({ page }) => {
        await expect(page.locator('#nameInput')).toBeVisible();
    });

    test('PIN 키패드 존재', async ({ page }) => {
        await expect(page.locator('#keypad')).toBeVisible();
    });

    test('PIN 도트 표시', async ({ page }) => {
        await expect(page.locator('#pinDots')).toBeVisible();
    });

    test('MD3 색상 토큰 로드', async ({ page }) => {
        const ok = await checkMD3Colors(page);
        expect(ok).toBe(true);
    });

    test('에러 메시지 초기 숨김', async ({ page }) => {
        await expect(page.locator('#errorMsg')).toBeHidden();
    });
});

// ── add.html ──────────────────────────────────────────────────────────────────

test.describe('add.html - 카드 추가', () => {
    test.beforeEach(async ({ page }) => {
        await setStudent(page);
        await page.goto('/add.html');
    });

    test('TopAppBar - 솔리드 배경 (glassmorphism 없음)', async ({ page }) => {
        const header = page.locator('header.fixed');
        await expect(header).toBeVisible();
        const cls = await header.getAttribute('class');
        expect(cls).not.toContain('glass');
        expect(cls).toContain('bg-surface-container-lowest');
        expect(cls).toContain('border-b');
    });

    test('TopAppBar - 페이지명 표시', async ({ page }) => {
        await expect(page.locator('header.fixed')).toContainText('카드 추가');
    });

    test('학생 이니셜 아바타 표시', async ({ page }) => {
        await expect(page.locator('#studentInitial')).toHaveText('홍');
    });

    test('BottomNav - 추가 탭 활성화 (한국어)', async ({ page }) => {
        const activeTab = page.locator('nav.fixed [aria-current="page"]');
        await expect(activeTab).toBeVisible();
        await expect(activeTab).toContainText('추가');
    });

    test('BottomNav - 비활성 탭 4개 존재', async ({ page }) => {
        const links = page.locator('nav.fixed a');
        await expect(links).toHaveCount(4);
    });

    test('BottomNav - 한국어 레이블 확인', async ({ page }) => {
        const nav = page.locator('nav.fixed');
        await expect(nav).toContainText('학생');
        await expect(nav).toContainText('뽑기');
        await expect(nav).toContainText('목록');
        await expect(nav).toContainText('관리');
    });

    test('BottomNav - glassmorphism 없음', async ({ page }) => {
        const nav = page.locator('nav.fixed');
        const cls = await nav.getAttribute('class');
        expect(cls).not.toContain('glass');
        expect(cls).toContain('bg-surface-container-lowest');
    });

    test('Page Title 섹션', async ({ page }) => {
        await expect(page.locator('h2:has-text("새 카드 추가")')).toBeVisible();
    });

    test('타입 탭 - 기본 텍스트 탭 활성', async ({ page }) => {
        const textTab = page.locator('[data-type="text"]');
        const cls = await textTab.getAttribute('class');
        expect(cls).toContain('bg-primary-fixed');
        await expect(page.locator('#textInput')).toBeVisible();
        await expect(page.locator('#imageInput')).toBeHidden();
    });

    test('타입 탭 - 이미지 탭 클릭 시 전환', async ({ page }) => {
        await page.locator('[data-type="image"]').click();
        await expect(page.locator('#imageInput')).toBeVisible();
        await expect(page.locator('#textInput')).toBeHidden();
    });

    test('폼 필드 존재 확인', async ({ page }) => {
        await expect(page.locator('#inputQuestion')).toBeVisible();
        await expect(page.locator('#inputAnswer')).toBeVisible();
        await expect(page.locator('#inputTopic')).toBeVisible();
        await expect(page.locator('#addCardBtn')).toBeVisible();
    });

    test('카드 추가 버튼 - 솔리드 bg-primary (그라디언트 없음)', async ({ page }) => {
        const btn = page.locator('#addCardBtn');
        const style = await btn.getAttribute('style');
        expect(style ?? '').not.toContain('gradient');
        const cls = await btn.getAttribute('class');
        expect(cls).toContain('bg-primary');
    });

    test('카드 추가 성공 플로우 (API 모킹)', async ({ page }) => {
        await page.route('**/rest/v1/cards**', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([{ id: 'new-card', answer: '광합성' }]),
        }));
        await page.locator('#inputQuestion').fill('산소가 생성되는 반응은?');
        await page.locator('#inputAnswer').fill('광합성');
        await page.locator('#addCardBtn').click();
        await expect(page.locator('#inputAnswer')).toHaveValue('', { timeout: 5000 });
    });

    test('카드 추가 중 버튼 disabled 처리', async ({ page }) => {
        await page.route('**/rest/v1/cards**', async route => {
            await new Promise(r => setTimeout(r, 500));
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify([{ id: 'new-card', answer: '광합성' }]),
            });
        });
        await page.locator('#inputQuestion').fill('산소가 생성되는 반응은?');
        await page.locator('#inputAnswer').fill('광합성');
        await page.locator('#addCardBtn').click();
        await expect(page.locator('#addCardBtn')).toBeDisabled();
        await expect(page.locator('#addCardBtn')).toHaveText('추가 중...');
        await expect(page.locator('#addCardBtn')).toBeEnabled({ timeout: 3000 });
        await expect(page.locator('#addCardBtn')).toHaveText('카드 추가');
    });

    test('BottomNav - 학생 탭 클릭 시 index로 이동', async ({ page }) => {
        await page.locator('nav.fixed a:has-text("학생")').click();
        // serve는 index.html을 /로 리다이렉트
        await expect(page).toHaveURL(/index|localhost:3002\/$/);
    });

    test('BottomNav - 링크 4개 href 무결성', async ({ page }) => {
        const links = page.locator('nav.fixed a[href]');
        const count = await links.count();
        expect(count).toBe(4);
        const hrefs = await Promise.all(
            Array.from({ length: count }, (_, i) => links.nth(i).getAttribute('href'))
        );
        expect(hrefs.some(h => h?.includes('index.html'))).toBe(true);
        expect(hrefs.some(h => h?.includes('gacha.html'))).toBe(true);
        expect(hrefs.some(h => h?.includes('list.html'))).toBe(true);
        expect(hrefs.some(h => h?.includes('admin.html'))).toBe(true);
    });
});

// ── list.html ─────────────────────────────────────────────────────────────────

test.describe('list.html - 전체 목록', () => {
    test.beforeEach(async ({ page }) => {
        await setStudent(page);
        await page.goto('/list.html');
    });

    test('TopAppBar - 솔리드 배경', async ({ page }) => {
        const header = page.locator('header.fixed');
        await expect(header).toBeVisible();
        const cls = await header.getAttribute('class');
        expect(cls).not.toContain('glass');
        expect(cls).toContain('bg-surface-container-lowest');
    });

    test('TopAppBar - 페이지명 표시', async ({ page }) => {
        await expect(page.locator('header.fixed')).toContainText('전체 목록');
    });

    test('학생 이니셜 아바타', async ({ page }) => {
        await expect(page.locator('#studentInitial')).toHaveText('홍');
    });

    test('BottomNav - 목록 탭 활성화 (한국어)', async ({ page }) => {
        const activeTab = page.locator('nav.fixed [aria-current="page"]');
        await expect(activeTab).toBeVisible();
        await expect(activeTab).toContainText('목록');
    });

    test('BottomNav - glassmorphism 없음', async ({ page }) => {
        const nav = page.locator('nav.fixed');
        const cls = await nav.getAttribute('class');
        expect(cls).not.toContain('glass');
    });

    test('Page Title 섹션', async ({ page }) => {
        await expect(page.locator('h2:has-text("전체 카드 목록")')).toBeVisible();
    });

    test('Stats 바 - 카드 수 표시', async ({ page }) => {
        await expect(page.locator('#cardCount')).toBeVisible();
    });

    test('카드 목록 로드 (API 모킹)', async ({ page }) => {
        await page.route('**/rest/v1/cards**', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 'c1', type: 'text', question: '광합성이란?', answer: '빛에너지', box: 1 },
                { id: 'c2', type: 'text', question: '세포분열의 종류?', answer: '체세포분열', box: 3 },
            ]),
        }));
        await page.reload();
        await expect(page.locator('text=광합성이란?')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#cardCount')).toContainText('2개');
    });

    test('빈 목록 처리', async ({ page }) => {
        await page.route('**/rest/v1/cards**', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([]),
        }));
        await page.reload();
        await expect(page.locator('text=등록된 카드가 없습니다')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#cardCount')).toContainText('0개');
    });

    test('삭제 버튼 존재', async ({ page }) => {
        await page.route('**/rest/v1/cards**', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 'c1', type: 'text', question: '테스트', answer: '정답', box: 1 },
            ]),
        }));
        await page.reload();
        const deleteBtn = page.locator('[onclick*="deleteCard"]').first();
        await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    });

    test('BottomNav - 뽑기 탭 클릭 시 이동', async ({ page }) => {
        await page.locator('nav.fixed a:has-text("뽑기")').click();
        await expect(page).toHaveURL(/gacha/);
    });
});

// ── gacha.html ────────────────────────────────────────────────────────────────

test.describe('gacha.html - 카드 뽑기', () => {
    test.beforeEach(async ({ page }) => {
        await setStudent(page);
        await page.goto('/gacha.html');
    });

    test('TopAppBar - 솔리드 배경', async ({ page }) => {
        const header = page.locator('header.fixed');
        await expect(header).toBeVisible();
        const cls = await header.getAttribute('class');
        expect(cls).not.toContain('glass');
        expect(cls).toContain('bg-surface-container-lowest');
    });

    test('학생 이름 레이블 표시', async ({ page }) => {
        await expect(page.locator('#studentNameLabel')).toBeVisible();
    });

    test('HeroCard 초기 상태', async ({ page }) => {
        await expect(page.locator('#heroCardSection')).toBeVisible();
        await expect(page.locator('#cardQuestion')).toBeVisible();
        await expect(page.locator('#answerBox')).toBeHidden();
    });

    test('boxAccentBar - 상단 stripe (h-1 w-full)', async ({ page }) => {
        const bar = page.locator('#boxAccentBar');
        await expect(bar).toBeAttached();
        const cls = await bar.getAttribute('class');
        expect(cls).toContain('h-1');
        expect(cls).toContain('w-full');
        // 구버전 좌측 3px 세로바 아님
        expect(cls).not.toContain('w-[3px]');
    });

    test('가챠 버튼 - 3D press 스타일', async ({ page }) => {
        const btn = page.locator('#gachaBtn');
        await expect(btn).toBeVisible();
        const cls = await btn.getAttribute('class');
        expect(cls).toContain('bg-primary');
        expect(cls).toContain('active:translate-y-1');
    });

    test('BottomNav - 뽑기 탭 활성화 (한국어)', async ({ page }) => {
        const activeTab = page.locator('nav.fixed [aria-current="page"]');
        await expect(activeTab).toBeVisible();
        await expect(activeTab).toContainText('뽑기');
    });

    test('BottomNav - 한국어 레이블', async ({ page }) => {
        const nav = page.locator('nav.fixed');
        await expect(nav).toContainText('학생');
        await expect(nav).toContainText('추가');
        await expect(nav).toContainText('목록');
        await expect(nav).toContainText('관리');
    });

    test('카드 뽑기 - API 모킹', async ({ page }) => {
        await page.route('**/rest/v1/cards**', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([{
                id: 'c1', type: 'text',
                question: '빛에너지를 화학에너지로 바꾸는 과정은?',
                answer: '광합성', box: 2, topic: null, distractors: null,
            }]),
        }));
        await page.locator('#gachaBtn').click();
        await expect(page.locator('#cardQuestion')).toContainText('빛에너지', { timeout: 5000 });
    });

    test('정답 보기 버튼 클릭 시 answerBox 표시', async ({ page }) => {
        await page.route('**/rest/v1/cards**', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([{
                id: 'c1', type: 'text',
                question: '테스트 질문', answer: '테스트 정답', box: 1, topic: null, distractors: null,
            }]),
        }));
        await page.locator('#gachaBtn').click();
        await expect(page.locator('#showAnswerBtn')).toBeVisible({ timeout: 5000 });
        await page.locator('#showAnswerBtn').click();
        await expect(page.locator('#answerBox')).toBeVisible();
        await expect(page.locator('#cardAnswer')).toContainText('테스트 정답');
    });

    test('feedbackBtns - 알았다/몰랐다 색상 계층 구분', async ({ page }) => {
        const successBtn = page.locator('#successBtn');
        const failBtn = page.locator('#failBtn');
        const successCls = await successBtn.getAttribute('class');
        const failCls = await failBtn.getAttribute('class');
        // 알았다: tertiary (초록)
        expect(successCls).toContain('tertiary');
        // 몰랐다: error (빨강)
        expect(failCls).toContain('error');
        // 동일한 neutral 스타일이 아님
        expect(successCls).not.toEqual(failCls);
    });

    test('MCQ 선택지 - flex-col (1열)', async ({ page }) => {
        const choices = page.locator('#mcqChoices');
        await expect(choices).toBeAttached();
        const cls = await choices.getAttribute('class');
        expect(cls).toContain('flex-col');
        expect(cls).not.toContain('grid-cols-2');
    });

    test('PracticeSection 숨김 상태 (카드 없을 때)', async ({ page }) => {
        await expect(page.locator('#practiceSection')).toBeHidden();
    });

    test('4열 키패드 존재', async ({ page }) => {
        const keypad = page.locator('#numericKeypad');
        await expect(keypad).toBeAttached();
        const cls = await keypad.getAttribute('class');
        expect(cls).toContain('grid-cols-4');
    });
});

// ── 공통: 다크모드 토글 ────────────────────────────────────────────────────────

test.describe('다크모드 토글', () => {
    for (const path of ['/add.html', '/list.html', '/gacha.html']) {
        test(`${path} - 다크모드 토글`, async ({ page }) => {
            await setStudent(page);
            await page.goto(path);
            const btn = page.locator('button[aria-label="다크모드 전환"]').first();
            await expect(btn).toBeVisible();
            await btn.click();
            await expect(page.locator('html')).toHaveClass(/dark/);
        });
    }
});

// ── 공통: MD3 색상 토큰 ────────────────────────────────────────────────────────

test.describe('MD3 색상 토큰', () => {
    for (const path of ['/add.html', '/list.html', '/gacha.html']) {
        test(`${path} - primary #c23800, secondary #2a2b96`, async ({ page }) => {
            await setStudent(page);
            await page.goto(path);
            const ok = await checkMD3Colors(page);
            expect(ok).toBe(true);
        });
    }
});
