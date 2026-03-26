/**
 * fixtures.example.js — fixtures.local.js 템플릿
 *
 * 복사 후 실제 값으로 채워서 fixtures.local.js 로 저장하세요.
 * fixtures.local.js 는 .gitignore 처리됨 (PIN 포함).
 *
 *   cp tests/fixtures.example.js tests/fixtures.local.js
 */

'use strict';

const CONFIG = {
    baseUrl:      'https://sigongjoa.github.io/Concept-Gacha',
    teacherPin:   'XXXX',                              // ← 실제 PIN 입력
    supabaseUrl:  'https://YOUR_PROJECT.supabase.co',  // ← Supabase URL
    anonKey:      'sb_publishable_YOUR_ANON_KEY',      // ← anon key (공개 가능)
};

// 나머지 헬퍼는 fixtures.local.js 와 동일
// fixtures.local.js 복사 후 CONFIG 값만 교체하면 됩니다.

module.exports = { CONFIG };
