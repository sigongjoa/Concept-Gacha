// ============================================
// Supabase Client — GitHub Pages 전용
// 서버 모드(localhost)에서는 server.js가 직접 연결하므로 이 파일 미사용
// ============================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://cleefixlppjoblolvrmw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_DFQn9Ajl_LILMfhxdC9_sw_pDpbn316'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function uploadImage(file, studentId) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${studentId}/${fileName}`
    const { error } = await supabase.storage.from('card-images').upload(filePath, file, { cacheControl: '3600', upsert: false })
    if (error) throw new Error('이미지 업로드 실패: ' + error.message)
    const { data: { publicUrl } } = supabase.storage.from('card-images').getPublicUrl(filePath)
    return { filePath, publicUrl }
}

export async function deleteImage(filePath) {
    if (!filePath) return
    await supabase.storage.from('card-images').remove([filePath])
}
