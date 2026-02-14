const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCREENSHOTS_DIR = '/tmp/auth_test_screenshots';
const OUTPUT_DIR = '/root/.gemini/antigravity/brain/c3bae362-a995-41e1-9523-e215def139f1';
const PDF_PATH = path.join(OUTPUT_DIR, 'auth_test_report.pdf');

// manifest.json 읽기
const manifestPath = path.join(SCREENSHOTS_DIR, 'manifest.json');
const screenshots = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// HTML 생성
let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Supabase Auth Implementation Test Report</title>
    <style>
        body {
            font-family: 'Noto Sans KR', Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 10px;
        }
        h2 {
            color: #6366f1;
            margin-top: 40px;
        }
        .screenshot-container {
            background: white;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }
        .screenshot-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .screenshot-description {
            color: #666;
            margin-bottom: 15px;
            font-size: 14px;
        }
        img {
            max-width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .summary {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
        .success {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
        }
        .error {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
        }
        .timestamp {
            color: #999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>🔐 Supabase Auth Implementation Test Report</h1>
    
    <div class="timestamp">
        Generated: ${new Date().toLocaleString('ko-KR')}
    </div>
    
    <div class="summary">
        <h3>📋 Test Summary</h3>
        <ul>
            <li><strong>Total Screenshots:</strong> ${screenshots.length}</li>
            <li><strong>Test URL:</strong> http://localhost:8000</li>
            <li><strong>Browser:</strong> Chromium (Playwright)</li>
        </ul>
    </div>
    
    <div class="error">
        <h3>⚠️ Test Result</h3>
        <p><strong>Authentication Failed:</strong> The test remained on the login page after attempting to log in. This indicates that the Supabase authentication is not working as expected.</p>
        <p><strong>Possible Causes:</strong></p>
        <ul>
            <li>Database migration (auth_migration.sql) not executed</li>
            <li>Supabase API keys not configured correctly</li>
            <li>RLS policies blocking authentication</li>
            <li>Database trigger not working</li>
        </ul>
    </div>
    
    <h2>📸 Screenshots</h2>
`;

// 각 스크린샷 추가
screenshots.forEach((screenshot, index) => {
    html += `
    <div class="screenshot-container">
        <div class="screenshot-title">${screenshot.title}</div>
        <div class="screenshot-description">${screenshot.description}</div>
        <img src="${screenshot.path}" alt="${screenshot.title}">
    </div>
    `;
});

html += `
    <h2>🔍 Next Steps</h2>
    <div class="success">
        <h3>Required Actions:</h3>
        <ol>
            <li><strong>Execute Database Migration:</strong> Run <code>supabase/auth_migration.sql</code> in Supabase SQL Editor</li>
            <li><strong>Verify Supabase Configuration:</strong> Check that <code>public/js/supabase-client.js</code> has correct API keys</li>
            <li><strong>Test Manually:</strong> Try signing up and logging in manually in the browser</li>
            <li><strong>Check Browser Console:</strong> Look for JavaScript errors or Supabase API errors</li>
        </ol>
    </div>
    
    <h2>📚 Documentation</h2>
    <ul>
        <li><a href="file:///mnt/d/progress/mathesis/node8_concept_gacha/AUTH_DEPLOYMENT_GUIDE.md">Deployment Guide</a></li>
        <li><a href="file:///mnt/d/progress/mathesis/node8_concept_gacha/supabase/auth_migration.sql">Database Migration SQL</a></li>
        <li><a href="file:///root/.gemini/antigravity/brain/c3bae362-a995-41e1-9523-e215def139f1/walkthrough.md">Implementation Walkthrough</a></li>
    </ul>
</body>
</html>
`;

// HTML 파일 저장
const htmlPath = path.join(OUTPUT_DIR, 'auth_test_report.html');
fs.writeFileSync(htmlPath, html);
console.log(`✅ HTML report saved: ${htmlPath}`);

// wkhtmltopdf로 PDF 생성 (설치되어 있다면)
try {
    execSync(`wkhtmltopdf ${htmlPath} ${PDF_PATH}`, { stdio: 'inherit' });
    console.log(`✅ PDF report saved: ${PDF_PATH}`);
} catch (error) {
    console.log('⚠️  wkhtmltopdf not available, HTML report generated instead');
    console.log(`   Install with: sudo apt-get install wkhtmltopdf`);
}

console.log('\n📄 Report generation complete!');
