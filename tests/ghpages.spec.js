// @ts-check
// GitHub Pages 배포 + Supabase 연동 E2E 테스트
const { test, expect } = require('@playwright/test');

const BASE = 'https://sigongjoa.github.io/Concept-Gacha';

function collectErrors(page) {
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const t = msg.text();
            if (!t.includes('favicon') && !t.includes('tailwindcss.com')) errors.push(t);
        }
    });
    page.on('pageerror', err => errors.push(err.message));
    return errors;
}

// PIN 키패드 입력 헬퍼
async function enterPin(page, pin) {
    for (const digit of pin) {
        await page.locator(`button`).filter({ hasText: new RegExp(`^${digit}$`) }).first().click();
        await page.waitForTimeout(80);
    }
}

// ── 1. 페이지 로딩 ────────────────────────────────────────────
test.describe('페이지 로딩', () => {
    for (const p of ['index.html', 'gacha.html', 'admin.html', 'dashboard.html']) {
        test(`${p} 200 OK`, async ({ page }) => {
            const res = await page.goto(`${BASE}/${p}`, { waitUntil: 'domcontentloaded' });
            expect(res.status()).toBe(200);
        });
    }
});

// ── 2. api.js 모듈 로드 확인 ─────────────────────────────────
test.describe('api.js 모듈 로드', () => {
    test('window.API 객체 존재', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });

        const hasAPI = await page.evaluate(() => typeof window.API === 'object' && window.API !== null);
        console.log('window.API 존재:', hasAPI);
        console.log('콘솔 에러:', errors);

        expect(hasAPI).toBe(true);
    });

    test('supabase 클라이언트 임포트 성공', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/admin.html`, { waitUntil: 'networkidle' });

        const fatal = errors.filter(e =>
            e.includes('SyntaxError') || e.includes('Failed to fetch') ||
            e.includes('Cannot read') || e.includes('is not defined')
        );
        console.log('치명적 에러:', fatal);
        expect(fatal).toHaveLength(0);
    });
});

// ── 3. 관리자 로그인 ─────────────────────────────────────────
test.describe('관리자 로그인', () => {
    test('PIN 1234로 로그인 시도 → Supabase 요청 발생', async ({ page }) => {
        const errors = collectErrors(page);
        const supabaseRequests = [];
        page.on('request', req => {
            if (req.url().includes('supabase.co')) supabaseRequests.push(req.url());
        });

        await page.goto(`${BASE}/admin.html`, { waitUntil: 'networkidle' });

        // PIN 입력 UI 확인 (admin은 .key-btn 클래스 사용)
        const pinButtons = page.locator('.key-btn');
        await expect(pinButtons.first()).toBeVisible({ timeout: 5000 });

        // PIN 1234 입력
        await enterPin(page, '1234');
        await page.waitForTimeout(2000);

        console.log('Supabase 요청:', supabaseRequests);
        console.log('콘솔 에러:', errors);

        // Supabase 요청이 발생해야 함
        expect(supabaseRequests.length).toBeGreaterThan(0);
    });

    test('PIN 1234 → 로그인 성공 or 실패 메시지 확인', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/admin.html`, { waitUntil: 'networkidle' });

        const supabaseResponses = [];
        page.on('response', res => {
            if (res.url().includes('supabase.co')) {
                supabaseResponses.push({ url: res.url(), status: res.status() });
            }
        });

        await enterPin(page, '1234');
        await page.waitForTimeout(3000);

        console.log('Supabase 응답:', supabaseResponses);
        console.log('현재 URL:', page.url());
        console.log('에러:', errors);

        // 에러 메시지 or 학생 관리 패널 확인
        const body = await page.locator('body').textContent();
        const loginFailed = body?.includes('올바르지') || body?.includes('실패') || body?.includes('찾을 수 없');
        const loginOk     = body?.includes('학생') || body?.includes('관리') || body?.includes('추가');
        console.log('로그인 실패 메시지:', loginFailed, '/ 로그인 성공 UI:', loginOk);

        // 어떤 응답이든 나와야 함
        expect(loginFailed || loginOk).toBe(true);
    });
});

// ── 4. 학생 로그인 ───────────────────────────────────────────
test.describe('학생 로그인 (index.html)', () => {
    test('이름 입력 + PIN 입력 UI 존재', async ({ page }) => {
        await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });

        const nameInput = page.locator('#nameInput, input[placeholder*="이름"]').first();
        await expect(nameInput).toBeVisible({ timeout: 5000 });
        console.log('이름 입력 필드 존재 ✓');
    });

    test('이름 입력 + PIN 0000 → Supabase 요청 발생', async ({ page }) => {
        const supabaseRequests = [];
        page.on('request', req => {
            if (req.url().includes('supabase.co')) supabaseRequests.push(req.url());
        });

        await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });

        // 이름 입력
        const nameInput = page.locator('#nameInput').first();
        await nameInput.fill('테스트');

        // PIN 0000 입력
        await enterPin(page, '0000');
        await page.waitForTimeout(2000);

        console.log('Supabase 요청 수:', supabaseRequests.length);
        console.log('요청 URL:', supabaseRequests.slice(0, 3));

        // Supabase에 요청이 가야 함 (학생이 없으면 에러 메시지)
        expect(supabaseRequests.length).toBeGreaterThan(0);
    });
});

// ── 5. JS 에러 없음 ──────────────────────────────────────────
test.describe('치명적 JS 에러 없음', () => {
    for (const p of ['index.html', 'gacha.html', 'admin.html', 'dashboard.html']) {
        test(p, async ({ page }) => {
            const fatal = [];
            page.on('pageerror', err => fatal.push(err.message));
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const t = msg.text();
                    if (
                        !t.includes('favicon') &&
                        !t.includes('tailwindcss.com') &&
                        (t.includes('SyntaxError') || t.includes('ReferenceError') || t.includes('is not defined'))
                    ) fatal.push(t);
                }
            });

            await page.goto(`${BASE}/${p}`, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2000);

            if (fatal.length) console.log(`[${p}] 치명적 에러:`, fatal);
            expect(fatal).toHaveLength(0);
        });
    }
});
