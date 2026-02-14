// ============================================
// Authentication Helper Functions
// ============================================
// 목적: 인증 상태 관리 및 헬퍼 함수 제공

import { supabase } from './supabase-client.js'

// ============================================
// 현재 로그인 사용자 가져오기
// ============================================
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
        console.error('Error getting user:', error)
        return null
    }

    return user
}

// ============================================
// 로그인 필요 페이지 보호
// ============================================
export async function requireAuth() {
    const user = await getCurrentUser()

    if (!user) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        const currentPath = window.location.pathname
        // 상대 경로 사용 (GitHub Pages 호환)
        window.location.href = `./login.html?redirect=${encodeURIComponent(currentPath)}`
        return false
    }

    return true
}

// ============================================
// 로그아웃
// ============================================
export async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error signing out:', error)
        alert('로그아웃 실패: ' + error.message)
        return false
    }

    // 로그인 페이지로 리다이렉트 (상대 경로)
    window.location.href = './login.html'
    return true
}

// ============================================
// 세션 확인 및 자동 갱신
// ============================================
export async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
        console.error('Error checking session:', error)
        return null
    }

    return session
}

// ============================================
// 인증 상태 변경 리스너
// ============================================
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session)
        callback(event, session)
    })
}

// ============================================
// 사용자 정보 표시 헬퍼
// ============================================
export async function displayUserInfo(elementId) {
    const user = await getCurrentUser()
    const element = document.getElementById(elementId)

    if (!element) return

    if (user) {
        // raw_user_meta_data에서 이름 가져오기, 없으면 이메일 사용
        const displayName = user.user_metadata?.name || user.email.split('@')[0]
        element.textContent = `안녕하세요, ${displayName}님!`
    } else {
        element.textContent = ''
    }
}

// ============================================
// 로그인 상태 확인 (boolean)
// ============================================
export async function isAuthenticated() {
    const user = await getCurrentUser()
    return user !== null
}

// ============================================
// 개발 모드 디버깅
// ============================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 인증 상태 변경 로깅
    onAuthStateChange((event, session) => {
        console.log('🔐 Auth Event:', event)
        console.log('👤 Session:', session)
    })
}
