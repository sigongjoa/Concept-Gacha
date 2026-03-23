// @ts-check
const { test, expect } = require('@playwright/test');

// ── 공통 헬퍼 ────────────────────────────────────────────────────────────────

/** sessionStorage에 테스트용 학생 세팅 */
async function setStudent(page, id = 'test-student-1', name = '홍길동') {
    await page.addInitScript(({ id, name }) => {
        sessionStorage.setItem('currentStudent', JSON.stringify({ id, name }));
    }, { id, name });
}

/** MD3 디자인 토큰이 Tailwind config에 등록되었는지 확인 */
async function checkMD3Colors(page) {
    return await page.evaluate(() => {
        // tailwind.config 객체에서 직접 확인
        const cfg = window.tailwind?.config?.theme?.extend?.colors;
        return !!(cfg && cfg['primary'] === '#9d4300' && cfg['secondary-container'] === '#6063ee');
    });
}

// ── index.html ────────────────────────────────────────────────────────────────

test.describe('index.html - 학생 선택', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.html');
    });

    test('브랜드 Hero 렌더링', async ({ page }) => {
        // Plus Jakarta Sans 헤드라인
        const title = page.locator('h1:has-text("Concept Gacha")');
        await expect(title).toBeVisible();

        // 그라디언트 FAB 아이콘
        const icon = page.locator('.material-symbols-outlined:has-text("auto_awesome")');
        await expect(icon).toBeVisible();
    });

    test('학생 카드 컨테이너 표시', async ({ page }) => {
        const card = page.locator('#studentList').locator('..');
        await expect(card).toBeVisible();
    });

    test('학생 추가 입력 필드 존재', async ({ page }) => {
        await expect(page.locator('#newStudentName')).toBeVisible();
        await expect(page.locator('button:has-text("추가")')).toBeVisible();
    });

    test('Ambient Orbs - 2개 배경 오브 존재', async ({ page }) => {
        const orbs = page.locator('.fixed.rounded-full.pointer-events-none');
        await expect(orbs).toHaveCount(2);
    });

    test('MD3 색상 토큰 로드', async ({ page }) => {
        const ok = await checkMD3Colors(page);
        expect(ok).toBe(true);
    });

    test('학생 목록 로드 (API 응답 모킹)', async ({ page }) => {
        await page.route('**/api/students', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 's1', name: '홍길동' },
                { id: 's2', name: '김철수' },
            ]),
        }));
        await page.reload();
        await expect(page.locator('text=홍길동')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=김철수')).toBeVisible({ timeout: 5000 });
    });

    test('학생 클릭 시 gacha.html로 이동', async ({ page }) => {
        await page.route('**/api/students', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([{ id: 's1', name: '홍길동' }]),
        }));
        await page.reload();
        await page.locator('button:has-text("홍길동")').click();
        await expect(page).toHaveURL(/gacha\.html/);
    });
});

// ── add.html ──────────────────────────────────────────────────────────────────

test.describe('add.html - 카드 추가', () => {
    test.beforeEach(async ({ page }) => {
        await setStudent(page);
        await page.goto('/add.html');
    });

    test('TopAppBar 렌더링', async ({ page }) => {
        const header = page.locator('header.fixed');
        await expect(header).toBeVisible();
        // glass 효과 (backdrop-filter)
        const style = await header.getAttribute('class');
        expect(style).toContain('glass');
        // 브랜드 타이틀
        await expect(header.locator('h1')).toContainText('Concept Gacha');
    });

    test('학생 이니셜 아바타 표시', async ({ page }) => {
        const initial = page.locator('#studentInitial');
        await expect(initial).toHaveText('홍');
    });

    test('BottomNav - Add 탭 활성화', async ({ page }) => {
        // Add 탭 button (link가 아닌 button, bg-primary-fixed 클래스)
        const activeTab = page.locator('nav.fixed button:has-text("Add")');
        await expect(activeTab).toBeVisible();
        const cls = await activeTab.getAttribute('class');
        expect(cls).toContain('bg-primary-fixed');
        expect(cls).toContain('text-primary');
    });

    test('BottomNav - 비활성 탭들은 text-outline', async ({ page }) => {
        const inactiveTabs = page.locator('nav.fixed a');
        const count = await inactiveTabs.count();
        expect(count).toBe(4); // Students, Gacha, Cards, Admin
        for (let i = 0; i < count; i++) {
            const cls = await inactiveTabs.nth(i).getAttribute('class');
            expect(cls).toContain('text-outline');
        }
    });

    test('Page Title 섹션', async ({ page }) => {
        await expect(page.locator('h2:has-text("새 카드 추가")')).toBeVisible();
        // accent underline
        const bar = page.locator('.bg-primary-container.rounded-full');
        await expect(bar).toBeVisible();
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
        // 이미지 탭이 활성화
        const cls = await page.locator('[data-type="image"]').getAttribute('class');
        expect(cls).toContain('bg-primary-fixed');
    });

    test('폼 필드 존재 확인', async ({ page }) => {
        await expect(page.locator('#inputQuestion')).toBeVisible();
        await expect(page.locator('#inputAnswer')).toBeVisible();
        await expect(page.locator('#inputTopic')).toBeVisible();
        await expect(page.locator('#addCardBtn')).toBeVisible();
    });

    test('카드 추가 버튼 - 그라디언트 스타일', async ({ page }) => {
        const btn = page.locator('#addCardBtn');
        const style = await btn.getAttribute('style');
        expect(style).toContain('gradient');
    });

    test('빈 필드 제출 시 오류 처리', async ({ page }) => {
        await page.locator('#addCardBtn').click();
        // toast가 뜨거나 아무 일도 일어나지 않음 (redirect 없음)
        await expect(page).toHaveURL(/add\.html/);
    });

    test('카드 추가 성공 플로우 (API 모킹)', async ({ page }) => {
        await page.route('**/api/students/*/cards', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ id: 'new-card', message: 'ok' }),
        }));
        await page.route('**/api/students/*/stats', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ total: 1, boxes: [0, 1, 0, 0, 0] }),
        }));

        await page.locator('#inputQuestion').fill('산소가 생성되는 반응은?');
        await page.locator('#inputAnswer').fill('광합성');
        await page.locator('#addCardBtn').click();

        // 입력 필드 초기화 확인
        await expect(page.locator('#inputAnswer')).toHaveValue('');
    });

    test('BottomNav 링크 - Students로 이동', async ({ page }) => {
        await page.locator('nav.fixed a:has-text("Students")').click();
        await expect(page).toHaveURL(/index\.html/);
    });

    test('하단 gradient accent bar', async ({ page }) => {
        const bar = page.locator('.h-1\\.5').last();
        const style = await bar.getAttribute('style');
        expect(style).toContain('gradient');
    });
});

// ── list.html ─────────────────────────────────────────────────────────────────

test.describe('list.html - 전체 목록', () => {
    test.beforeEach(async ({ page }) => {
        await setStudent(page);
        await page.goto('/list.html');
    });

    test('TopAppBar 렌더링', async ({ page }) => {
        await expect(page.locator('header.fixed')).toBeVisible();
        await expect(page.locator('header.fixed h1')).toContainText('Concept Gacha');
    });

    test('학생 이니셜 아바타', async ({ page }) => {
        await expect(page.locator('#studentInitial')).toHaveText('홍');
    });

    test('BottomNav - Cards 탭 활성화', async ({ page }) => {
        const activeTab = page.locator('nav.fixed button:has-text("Cards")');
        await expect(activeTab).toBeVisible();
        const cls = await activeTab.getAttribute('class');
        expect(cls).toContain('bg-primary-fixed');
    });

    test('Page Title 섹션', async ({ page }) => {
        await expect(page.locator('h2:has-text("전체 카드 목록")')).toBeVisible();
    });

    test('Stats 바 - 카드 수 표시', async ({ page }) => {
        await expect(page.locator('#cardCount')).toBeVisible();
    });

    test('카드 목록 로드 (API 모킹)', async ({ page }) => {
        await page.route('**/api/students/*/cards', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 'c1', type: 'text', question: '광합성이란?', answer: '빛에너지', box: 1 },
                { id: 'c2', type: 'text', question: '세포분열의 종류?', answer: '체세포분열', box: 3 },
            ]),
        }));
        await page.reload();
        await expect(page.locator('text=광합성이란?')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=세포분열의 종류?')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#cardCount')).toContainText('2개');
    });

    test('상자 뱃지 렌더링', async ({ page }) => {
        await page.route('**/api/students/*/cards', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 'c1', type: 'text', question: '테스트', answer: '정답', box: 2 },
            ]),
        }));
        await page.reload();
        await expect(page.locator('#cardList').locator('text=상자 2')).toBeVisible({ timeout: 5000 });
    });

    test('삭제 버튼 존재', async ({ page }) => {
        await page.route('**/api/students/*/cards', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 'c1', type: 'text', question: '테스트', answer: '정답', box: 1 },
            ]),
        }));
        await page.reload();
        const deleteBtn = page.locator('[onclick*="deleteCard"]').first();
        await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    });

    test('빈 목록 처리', async ({ page }) => {
        await page.route('**/api/students/*/cards', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([]),
        }));
        await page.reload();
        await expect(page.locator('text=등록된 카드가 없습니다')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#cardCount')).toContainText('0개');
    });

    test('BottomNav - Gacha 탭 클릭 시 이동', async ({ page }) => {
        await page.locator('nav.fixed a:has-text("Gacha")').click();
        await expect(page).toHaveURL(/gacha\.html/);
    });
});

// ── gacha.html ────────────────────────────────────────────────────────────────

test.describe('gacha.html - 카드 뽑기', () => {
    test.beforeEach(async ({ page }) => {
        await setStudent(page);
        await page.goto('/gacha.html');
    });

    test('TopAppBar 렌더링', async ({ page }) => {
        await expect(page.locator('header.fixed')).toBeVisible();
        await expect(page.locator('#studentNameLabel')).toBeVisible();
    });

    test('HeroCard 초기 상태', async ({ page }) => {
        await expect(page.locator('#heroCardSection')).toBeVisible();
        await expect(page.locator('#cardQuestion')).toBeVisible();
        // 정답 박스는 숨김
        await expect(page.locator('#answerBox')).toBeHidden();
    });

    test('BottomNav - Gacha 탭 활성화', async ({ page }) => {
        // div or button — bg-primary-fixed로 활성 표시
        const activeTab = page.locator('nav.fixed [class*="bg-primary-fixed"]:has-text("Gacha")');
        await expect(activeTab).toBeVisible();
    });

    test('FAB 가챠 버튼', async ({ page }) => {
        const fab = page.locator('#gachaBtn');
        await expect(fab).toBeVisible();
    });

    test('카드 뽑기 - FAB 클릭 (API 모킹)', async ({ page }) => {
        await page.route('**/api/students/*/cards/random', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'c1', type: 'text',
                question: '빛에너지를 화학에너지로 바꾸는 과정은?',
                answer: '광합성', box: 2, topic: null,
            }),
        }));
        await page.locator('#gachaBtn').click();
        await expect(page.locator('#cardQuestion')).toContainText('빛에너지', { timeout: 5000 });
    });

    test('정답 보기 버튼 클릭 시 answerBox 표시', async ({ page }) => {
        await page.route('**/api/students/*/cards/random', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'c1', type: 'text',
                question: '테스트 질문', answer: '테스트 정답', box: 1, topic: null,
            }),
        }));
        await page.locator('#gachaBtn').click();
        await expect(page.locator('#showAnswerBtn')).toBeVisible({ timeout: 5000 });
        await page.locator('#showAnswerBtn').click();
        await expect(page.locator('#answerBox')).toBeVisible();
        await expect(page.locator('#cardAnswer')).toContainText('테스트 정답');
    });

    test('상자 accent bar 존재', async ({ page }) => {
        // 뱃지 제거됨 → 좌측 accent bar로 대체
        await expect(page.locator('#boxAccentBar')).toBeAttached();
    });

    test('Ambient Orbs 2개', async ({ page }) => {
        const orbs = page.locator('.fixed.rounded-full.pointer-events-none.-z-10');
        await expect(orbs).toHaveCount(2);
    });

    test('PracticePanel 숨김 상태 (카드 없을 때)', async ({ page }) => {
        await expect(page.locator('#practicePanel')).toBeHidden();
    });

    test('4열 키패드 렌더링 확인', async ({ page }) => {
        // numericKeypad는 기본 hidden이지만 DOM에는 존재
        const keypad = page.locator('#numericKeypad');
        await expect(keypad).toBeAttached();
        // 4열 grid-cols-4
        const cls = await keypad.getAttribute('class');
        expect(cls).toContain('grid-cols-4');
    });
});

// ── 공통: 다크모드 토글 ────────────────────────────────────────────────────────

test.describe('다크모드 토글', () => {
    for (const path of ['/add.html', '/list.html', '/gacha.html']) {
        test(`${path} - 다크모드 토글 버튼`, async ({ page }) => {
            await setStudent(page);
            await page.goto(path);
            const btn = page.locator('button:has(span.material-symbols-outlined:text("dark_mode"))').first();
            await expect(btn).toBeVisible();
            await btn.click();
            const html = page.locator('html');
            await expect(html).toHaveClass(/dark/);
        });
    }
});

// ── 공통: BottomNav 링크 무결성 ───────────────────────────────────────────────

test.describe('BottomNav 링크', () => {
    test('add.html BottomNav 링크 4개 모두 href 존재', async ({ page }) => {
        await setStudent(page);
        await page.goto('/add.html');
        const links = page.locator('nav.fixed a[href]');
        const count = await links.count();
        expect(count).toBe(4);
        const hrefs = await Promise.all(
            Array.from({ length: count }, (_, i) => links.nth(i).getAttribute('href'))
        );
        expect(hrefs).toContain('/index.html');
        expect(hrefs).toContain('/gacha.html');
        expect(hrefs).toContain('/list.html');
        expect(hrefs).toContain('/admin.html');
    });
});
