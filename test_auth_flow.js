const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/tmp/auth_test_screenshots';
const BASE_URL = 'http://localhost:8000';

// 스크린샷 디렉토리 생성
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureScreenshot(page, name, description) {
    const filename = `${name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`✅ Screenshot saved: ${filename} - ${description}`);
    return filepath;
}

async function testAuthFlow() {
    console.log('🚀 Starting Playwright Auth Test...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    const screenshots = [];

    try {
        // ============================================
        // 1. 회원가입 페이지 테스트
        // ============================================
        console.log('📝 Testing Signup Page...');
        await page.goto(`${BASE_URL}/signup.html`);
        await page.waitForLoadState('networkidle');

        screenshots.push({
            path: await captureScreenshot(page, '01_signup_page', '회원가입 페이지'),
            title: '1. 회원가입 페이지',
            description: '이메일/비밀번호 입력 폼'
        });

        // 회원가입 폼 작성
        const timestamp = Date.now();
        const testEmail = `test${timestamp}@example.com`;
        const testPassword = 'test123456';
        const testName = `테스트사용자${timestamp}`;

        await page.fill('#name', testName);
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);
        await page.fill('#passwordConfirm', testPassword);

        screenshots.push({
            path: await captureScreenshot(page, '02_signup_filled', '회원가입 폼 작성 완료'),
            title: '2. 회원가입 폼 작성',
            description: `이름: ${testName}, 이메일: ${testEmail}`
        });

        // 회원가입 제출
        console.log('   Submitting signup form...');
        await page.click('#signupButton');

        // 성공 메시지 또는 리다이렉트 대기
        await page.waitForTimeout(2000);

        screenshots.push({
            path: await captureScreenshot(page, '03_signup_result', '회원가입 결과'),
            title: '3. 회원가입 결과',
            description: '성공 메시지 또는 로그인 페이지로 리다이렉트'
        });

        // ============================================
        // 2. 로그인 페이지 테스트
        // ============================================
        console.log('\n🔐 Testing Login Page...');
        await page.goto(`${BASE_URL}/login.html`);
        await page.waitForLoadState('networkidle');

        screenshots.push({
            path: await captureScreenshot(page, '04_login_page', '로그인 페이지'),
            title: '4. 로그인 페이지',
            description: '이메일/비밀번호 입력 폼'
        });

        // 로그인 폼 작성
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);

        screenshots.push({
            path: await captureScreenshot(page, '05_login_filled', '로그인 폼 작성 완료'),
            title: '5. 로그인 폼 작성',
            description: `이메일: ${testEmail}`
        });

        // 로그인 제출
        console.log('   Submitting login form...');
        await page.click('#loginButton');

        // 대시보드로 리다이렉트 대기
        await page.waitForTimeout(3000);

        screenshots.push({
            path: await captureScreenshot(page, '06_login_result', '로그인 결과'),
            title: '6. 로그인 후',
            description: '대시보드로 리다이렉트 또는 에러 메시지'
        });

        // ============================================
        // 3. 대시보드 테스트
        // ============================================
        console.log('\n📊 Testing Dashboard...');

        // 현재 URL 확인
        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);

        if (!currentUrl.includes('login.html')) {
            // 대시보드에 있음
            await page.waitForLoadState('networkidle');

            screenshots.push({
                path: await captureScreenshot(page, '07_dashboard', '대시보드'),
                title: '7. 사용자 대시보드',
                description: '사용자 정보, 액션 버튼, 통계 표시'
            });

            // ============================================
            // 4. 카드 추가 페이지 테스트
            // ============================================
            console.log('\n➕ Testing Add Card Page...');
            await page.goto(`${BASE_URL}/add.html`);
            await page.waitForLoadState('networkidle');

            screenshots.push({
                path: await captureScreenshot(page, '08_add_card_page', '카드 추가 페이지'),
                title: '8. 카드 추가 페이지',
                description: '텍스트/이미지 카드 추가 폼'
            });

            // 텍스트 카드 추가
            await page.fill('#inputQuestion', '1+1=?');
            await page.fill('#inputAnswer', '2');

            screenshots.push({
                path: await captureScreenshot(page, '09_add_card_filled', '카드 정보 입력'),
                title: '9. 카드 정보 입력',
                description: '질문: 1+1=?, 정답: 2'
            });

            // ============================================
            // 5. 가챠 페이지 테스트
            // ============================================
            console.log('\n🎴 Testing Gacha Page...');
            await page.goto(`${BASE_URL}/gacha.html`);
            await page.waitForLoadState('networkidle');

            screenshots.push({
                path: await captureScreenshot(page, '10_gacha_page', '가챠 페이지'),
                title: '10. 가챠 페이지',
                description: '카드 뽑기 화면'
            });

            // ============================================
            // 6. 카드 목록 페이지 테스트
            // ============================================
            console.log('\n📋 Testing Card List Page...');
            await page.goto(`${BASE_URL}/list.html`);
            await page.waitForLoadState('networkidle');

            screenshots.push({
                path: await captureScreenshot(page, '11_card_list', '카드 목록'),
                title: '11. 카드 목록 페이지',
                description: '본인 카드 목록 표시'
            });

        } else {
            console.log('   ⚠️  Still on login page - authentication may have failed');
        }

        // ============================================
        // 7. 브라우저 콘솔 로그 확인
        // ============================================
        console.log('\n📝 Browser Console Logs:');
        page.on('console', msg => {
            console.log(`   [${msg.type()}] ${msg.text()}`);
        });

    } catch (error) {
        console.error('❌ Error during test:', error);
        screenshots.push({
            path: await captureScreenshot(page, '99_error', '에러 발생'),
            title: 'Error',
            description: error.message
        });
    } finally {
        await browser.close();
    }

    console.log('\n✅ Test completed!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);

    // 스크린샷 목록 JSON 저장
    const manifestPath = path.join(SCREENSHOTS_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(screenshots, null, 2));
    console.log(`📄 Manifest saved to: ${manifestPath}`);

    return screenshots;
}

// 실행
testAuthFlow().catch(console.error);
