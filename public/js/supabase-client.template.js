# Supabase Client Configuration
# ============================================
# 이 파일을 복사하여 supabase - client.js로 사용하세요
# cp supabase - client.template.js supabase - client.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ⚠️ 여기에 Supabase 프로젝트 정보를 입력하세요
// Settings → API에서 확인 가능
const SUPABASE_URL = 'YOUR_SUPABASE_URL'  // 예: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'  // 예: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Supabase 클라이언트 생성
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 이미지 업로드 헬퍼 함수
export async function uploadImage(file, studentId) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${studentId}/${fileName}`

    const { data, error } = await supabase.storage
        .from('card-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        console.error('Image upload error:', error)
        throw new Error('이미지 업로드 실패: ' + error.message)
    }

    const { data: { publicUrl } } = supabase.storage
        .from('card-images')
        .getPublicUrl(filePath)

    return { filePath, publicUrl }
}

// 이미지 삭제 헬퍼 함수
export async function deleteImage(filePath) {
    if (!filePath) return

    const { error } = await supabase.storage
        .from('card-images')
        .remove([filePath])

    if (error) {
        console.error('Image delete error:', error)
    }
}

// 연결 테스트 함수
export async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('count')
            .limit(1)

        if (error) throw error

        console.log('✅ Supabase 연결 성공!')
        return true
    } catch (error) {
        console.error('❌ Supabase 연결 실패:', error)
        return false
    }
}

// 개발 모드에서 자동 연결 테스트
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    testConnection()
}
