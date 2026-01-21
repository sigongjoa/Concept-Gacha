require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function testConnection() {
  console.log('🔍 Notion 연결 테스트 중...\n');

  try {
    // 데이터베이스 정보 조회
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    console.log('✅ 연결 성공!\n');
    console.log('📊 데이터베이스 정보:');
    console.log('   제목:', database.title?.[0]?.plain_text || '(제목 없음)');
    console.log('   ID:', database.id);
    console.log('\n📋 속성 목록:');

    Object.entries(database.properties).forEach(([name, prop]) => {
      console.log(`   - ${name}: ${prop.type}`);
    });

    // 필요한 속성 확인
    const required = ['질문', '정답', '상자', '성공횟수', '실패횟수', '생성일', '마지막복습'];
    const existing = Object.keys(database.properties);
    const missing = required.filter(r => !existing.includes(r));

    if (missing.length > 0) {
      console.log('\n⚠️  누락된 속성:', missing.join(', '));
      console.log('   위 속성들을 Notion 데이터베이스에 추가해주세요.');
    } else {
      console.log('\n✅ 모든 필수 속성이 있습니다!');
    }

  } catch (error) {
    console.log('❌ 연결 실패!\n');
    console.log('오류:', error.message);

    if (error.code === 'unauthorized') {
      console.log('\n💡 해결 방법: API 키가 올바른지 확인하세요.');
    } else if (error.code === 'object_not_found') {
      console.log('\n💡 해결 방법:');
      console.log('   1. 데이터베이스 ID가 올바른지 확인');
      console.log('   2. Notion에서 데이터베이스 → "..." → "연결 추가"에서 통합을 연결했는지 확인');
    }
  }
}

testConnection();
