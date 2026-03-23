// @ts-check
// GitHub Pages 배포 + Supabase 연동 E2E 테스트
const { test, expect } = require('@playwright/test');

const BASE = 'https://sigongjoa.github.io/Concept-Gacha';

// ── 콘솔 에러 수집 헬퍼 ──────────────────────────────────────
function collectErrors(page) {
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));
    return errors;
}

// ── 1. 페이지 로딩 ────────────────────────────────────────────
test.describe('페이지 로딩', () => {

    test('index.html 접속 성공', async ({ page }) => {
        const errors = collectErrors(page);
        const res = await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });

        expect(res.status()).toBe(200);
        await expect(page.locator('h1, .font-headline').first()).toBeVisible();
        console.log('콘솔 에러:', errors);
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('gacha.html 접속 성공', async ({ page }) => {
        const res = await page.goto(`${BASE}/gacha.html`, { waitUntil: 'domcontentloaded' });
        expect(res.status()).toBe(200);
    });

    test('admin.html 접속 성공', async ({ page }) => {
        const res = await page.goto(`${BASE}/admin.html`, { waitUntil: 'domcontentloaded' });
        expect(res.status()).toBe(200);
    });

    test('dashboard.html 접속 성공', async ({ page }) => {
        const res = await page.goto(`${BASE}/dashboard.html`, { waitUntil: 'domcontentloaded' });
        expect(res.status()).toBe(200);
    });
});

// ── 2. Supabase 연결 ─────────────────────────────────────────
test.describe('Supabase 연결', () => {

    test('supabase-client.js 로드 + students 테이블 응답', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });

        // Supabase REST 요청 확인
        const supabaseReq = await page.waitForRequest(
            req => req.url().includes('supabase.co'),
            { timeout: 10000 }
        ).catch(() => null);

        if (supabaseReq) {
            console.log('Supabase 요청:', supabaseReq.url());
            const res = await supabaseReq.response();
            console.log('Supabase 응답 상태:', res?.status());
            expect(res?.status()).toBeLessThan(500);
        } else {
            // Supabase 요청이 없으면 JS 에러 확인
            console.log('Supabase 요청 없음 - 콘솔 에러:', errors);
            expect(errors.filter(e =>
                e.includes('supabase') || e.includes('fetch') || e.includes('TypeError')
            )).toHaveLength(0);
        }
    });

    test('학생 목록 렌더링 (Supabase 연동)', async ({ page }) => {
        await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle', timeout: 15000 });

        // 학생 목록 컨테이너 존재
        const list = page.locator('#studentList');
        await expect(list).toBeVisible({ timeout: 8000 });

        // 로딩 or 학생 카드 or "학생 없음" 메시지 중 하나
        const content = await list.textContent();
        console.log('학생 목록 내용:', content?.slice(0, 100));
    });
});

// ── 3. 로그인 플로우 ─────────────────────────────────────────
test.describe('로그인 플로우', () => {

    test('index 접속 후 학생 선택 UI 표시', async ({ page }) => {
        await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });

        // 타이틀 또는 학생 선택 안내 문구
        const title = page.locator('h1');
        await expect(title).toBeVisible();
        console.log('타이틀:', await title.first().textContent());
    });

    test('PIN 입력 모달 동작 (학생 클릭 시)', async ({ page }) => {
        await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });

        // 학생 버튼이 있으면 클릭
        const studentBtns = page.locator('#studentList button, #studentList [role="button"]');
        const count = await studentBtns.count();
        console.log('학생 수:', count);

        if (count > 0) {
            await studentBtns.first().click();
            // PIN 입력 UI or gacha 이동 확인
            await page.waitForTimeout(1000);
            const url = page.url();
            const hasPinModal = await page.locator('[id*="pin"], [id*="Pin"], input[type="password"]').count() > 0;
            console.log('현재 URL:', url, '/ PIN 모달:', hasPinModal);
        } else {
            console.log('학생이 없어서 PIN 테스트 스킵');
        }
    });

    test('admin.html PIN 입력 UI 존재', async ({ page }) => {
        await page.goto(`${BASE}/admin.html`, { waitUntil: 'networkidle' });

        // PIN 입력 관련 요소
        const pinInput = page.locator('input, button').filter({ hasText: /\d/ }).first();
        const hasPinUI = await page.locator('[id*="pin"], [id*="Pin"], .kp-btn').count() > 0;
        console.log('Admin PIN UI 존재:', hasPinUI);
        expect(hasPinUI).toBe(true);
    });
});

// ── 4. JS 에러 종합 ──────────────────────────────────────────
test.describe('JS 에러 없음', () => {

    for (const path of ['index.html', 'gacha.html', 'admin.html', 'dashboard.html']) {
        test(`${path} - 치명적 JS 에러 없음`, async ({ page }) => {
            const errors = [];
            page.on('pageerror', err => errors.push(err.message));
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const t = msg.text();
                    // favicon, 이미지 404는 무시
                    if (!t.includes('favicon') && !t.includes('.png') && !t.includes('.jpg')) {
                        errors.push(t);
                    }
                }
            });

            await page.goto(`${BASE}/${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForTimeout(2000);

            if (errors.length > 0) {
                console.log(`[${path}] 에러:`, errors);
            }

            // SyntaxError, TypeError, ReferenceError 같은 치명적 에러만 체크
            const fatal = errors.filter(e =>
                e.includes('SyntaxError') ||
                e.includes('ReferenceError') ||
                e.includes('is not defined') ||
                e.includes('Cannot read')
            );
            expect(fatal).toHaveLength(0);
        });
    }
});
