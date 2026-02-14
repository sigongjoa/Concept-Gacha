const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/root/.gemini/antigravity/brain/c3bae362-a995-41e1-9523-e215def139f1/final_test_screenshots';
const BASE_URL = 'http://localhost:8000';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureScreenshot(page, name, description) {
    const filename = `${name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`✅ Screenshot: ${filename}`);
    return filepath;
}

async function comprehensiveAuthTest() {
    console.log('🚀 완전한 E2E 인증 테스트 시작\n');
    console.log('='.repeat(60));

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    const testLog = [];
    const consoleMessages = [];
    const networkErrors = [];

    // 콘솔 로그 캡처
    page.on('console', msg => {
        const logEntry = `[${msg.type()}] ${msg.text()}`;
        consoleMessages.push(logEntry);
        console.log(`  📝 Console: ${logEntry}`);
    });

    // 네트워크 에러 캡처
    page.on('requestfailed', request => {
        const error = `${request.url()} - ${request.failure().errorText}`;
        networkErrors.push(error);
        console.log(`  ❌ Network Error: ${error}`);
    });

    // 응답 캡처
    page.on('response', async response => {
        if (response.url().includes('supabase.co')) {
            const status = response.status();
            const url = response.url();
            if (status >= 400) {
                console.log(`  ⚠️  API Error: ${status} - ${url}`);
            }
        }
    });

    const timestamp = Date.now();
    const testEmail = `e2etest${timestamp}@example.com`;
    const testPassword = 'test123456';
    const testName = `E2E테스트${timestamp}`;

    try {
        // ============================================
        // 1. 회원가입 테스트
        // ============================================
        console.log('\n📝 1. 회원가입 테스트');
        console.log('-'.repeat(60));

        await page.goto(`${BASE_URL}/signup.html`);
        await page.waitForLoadState('networkidle');
        await captureScreenshot(page, '01_signup_page', '회원가입 페이지');

        await page.fill('#name', testName);
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.fill('#passwordConfirm', testPassword);
        await captureScreenshot(page, '02_signup_filled', '회원가입 폼 작성');

        console.log(`  이메일: ${testEmail}`);
        console.log(`  이름: ${testName}`);

        // 회원가입 버튼 클릭
        await page.click('#signupButton');
        console.log('  ⏳ 회원가입 요청 전송...');

        // 페이지 변화 대기 (로그인 페이지로 이동 또는 에러)
        await page.waitForTimeout(3000);
        await captureScreenshot(page, '03_signup_result', '회원가입 결과');

        const currentUrl = page.url();
        console.log(`  현재 URL: ${currentUrl}`);

        if (currentUrl.includes('login.html')) {
            console.log('  ✅ 회원가입 성공 - 로그인 페이지로 이동');
            testLog.push({ step: '회원가입', status: 'SUCCESS' });
        } else {
            console.log('  ⚠️  회원가입 후 페이지 이동 없음');
            testLog.push({ step: '회원가입', status: 'PARTIAL' });
        }

        // ============================================
        // 2. 로그인 테스트
        // ============================================
        console.log('\n🔐 2. 로그인 테스트');
        console.log('-'.repeat(60));

        await page.goto(`${BASE_URL}/login.html`);
        await page.waitForLoadState('networkidle');
        await captureScreenshot(page, '04_login_page', '로그인 페이지');

        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await captureScreenshot(page, '05_login_filled', '로그인 폼 작성');

        console.log(`  로그인 시도: ${testEmail}`);

        // 로그인 버튼 클릭
        await page.click('#loginButton');
        console.log('  ⏳ 로그인 요청 전송...');

        // 페이지 변화 대기
        await page.waitForTimeout(4000);
        await captureScreenshot(page, '06_login_result', '로그인 결과');

        const loginUrl = page.url();
        console.log(`  현재 URL: ${loginUrl}`);

        // 에러 메시지 확인
        const errorElement = await page.$('.error, [class*="error"], [class*="alert"]');
        if (errorElement) {
            const errorText = await errorElement.textContent();
            console.log(`  ❌ 에러 메시지: ${errorText}`);
            testLog.push({ step: '로그인', status: 'FAILED', error: errorText });
        } else if (loginUrl.includes('index.html') || loginUrl === `${BASE_URL}/`) {
            console.log('  ✅ 로그인 성공 - 대시보드로 이동');
            testLog.push({ step: '로그인', status: 'SUCCESS' });
        } else {
            console.log('  ❌ 로그인 실패 - 페이지 이동 없음');
            testLog.push({ step: '로그인', status: 'FAILED' });
        }

        // ============================================
        // 3. 대시보드 확인
        // ============================================
        if (loginUrl.includes('index.html') || loginUrl === `${BASE_URL}/`) {
            console.log('\n📊 3. 대시보드 확인');
            console.log('-'.repeat(60));

            await page.waitForLoadState('networkidle');
            await captureScreenshot(page, '07_dashboard', '대시보드');

            // 사용자 정보 표시 확인
            const userInfoElement = await page.$('#userInfo, [id*="user"]');
            if (userInfoElement) {
                const userInfoText = await userInfoElement.textContent();
                console.log(`  ✅ 사용자 정보: ${userInfoText}`);
                testLog.push({ step: '대시보드', status: 'SUCCESS' });
            } else {
                console.log('  ⚠️  사용자 정보 요소 없음');
                testLog.push({ step: '대시보드', status: 'PARTIAL' });
            }
        }

    } catch (error) {
        console.error('\n❌ 테스트 중 에러 발생:', error.message);
        testLog.push({ step: 'ERROR', status: 'FAILED', error: error.message });
        await captureScreenshot(page, '99_error', '에러 발생');
    } finally {
        await browser.close();
    }

    // ============================================
    // 결과 요약
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));

    testLog.forEach((log, index) => {
        const icon = log.status === 'SUCCESS' ? '✅' : log.status === 'FAILED' ? '❌' : '⚠️';
        console.log(`${index + 1}. ${log.step}: ${icon} ${log.status}`);
        if (log.error) {
            console.log(`   에러: ${log.error}`);
        }
    });

    console.log('\n📝 콘솔 로그 요약:');
    console.log(`  총 ${consoleMessages.length}개 메시지`);

    if (networkErrors.length > 0) {
        console.log('\n❌ 네트워크 에러:');
        networkErrors.forEach(err => console.log(`  - ${err}`));
    }

    // 결과 JSON 저장
    const report = {
        timestamp: new Date().toISOString(),
        testEmail,
        testLog,
        consoleMessages,
        networkErrors
    };

    const reportPath = path.join(SCREENSHOTS_DIR, 'test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 상세 리포트 저장: ${reportPath}`);

    console.log('\n✅ 테스트 완료!');
    console.log(`📁 스크린샷: ${SCREENSHOTS_DIR}`);

    return report;
}

comprehensiveAuthTest().catch(console.error);
