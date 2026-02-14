# ============================================
# Supabase 데이터 마이그레이션 스크립트
# ============================================
# 기존 data.json을 Supabase로 마이그레이션

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 환경 변수에서 Supabase 정보 로드
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 환경 변수가 설정되지 않았습니다!')
    console.error('사용법: SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/migrate-to-supabase.js')
    process.exit(1)
}

// Supabase 클라이언트 생성 (Service Role 키 사용 - RLS 우회)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function migrate() {
    console.log('🚀 Supabase 마이그레이션 시작...\n')

    // 1. data.json 로드
    const dataPath = path.join(__dirname, '..', 'data.json')
    if (!fs.existsSync(dataPath)) {
        console.error('❌ data.json 파일을 찾을 수 없습니다!')
        process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    console.log(`📊 로드된 데이터: 학생 ${data.students.length}명, 카드 ${data.cards.length}개\n`)

    // 2. 학생 마이그레이션
    console.log('👥 학생 마이그레이션 중...')
    const studentIdMap = new Map() // 기존 ID → 새 UUID 매핑
    let studentSuccessCount = 0
    let studentFailCount = 0

    for (const student of data.students) {
        try {
            const { data: newStudent, error } = await supabase
                .from('students')
                .insert({ name: student.name })
                .select()
                .single()

            if (error) {
                console.error(`  ❌ ${student.name}: ${error.message}`)
                studentFailCount++
                continue
            }

            studentIdMap.set(student.id, newStudent.id)
            console.log(`  ✓ ${student.name} (${student.id} → ${newStudent.id})`)
            studentSuccessCount++
        } catch (err) {
            console.error(`  ❌ ${student.name}: ${err.message}`)
            studentFailCount++
        }
    }

    console.log(`\n학생 마이그레이션 완료: ${studentSuccessCount}/${data.students.length} 성공, ${studentFailCount} 실패\n`)

    // 3. 카드 마이그레이션
    console.log('🎴 카드 마이그레이션 중...')
    let cardSuccessCount = 0
    let cardFailCount = 0

    for (const card of data.cards) {
        try {
            const newStudentId = studentIdMap.get(card.studentId)
            if (!newStudentId) {
                console.error(`  ❌ 카드 ${card.id}: 학생 ID ${card.studentId}를 찾을 수 없음`)
                cardFailCount++
                continue
            }

            const { error } = await supabase
                .from('cards')
                .insert({
                    student_id: newStudentId,
                    type: card.type,
                    question: card.question,
                    question_image: card.questionImage,
                    answer: card.answer,
                    box: card.box,
                    success_count: card.successCount,
                    fail_count: card.failCount,
                    last_review: card.lastReview
                })

            if (error) {
                console.error(`  ❌ 카드 ${card.id}: ${error.message}`)
                cardFailCount++
                continue
            }

            console.log(`  ✓ 카드 ${card.id} (학생: ${card.studentId})`)
            cardSuccessCount++
        } catch (err) {
            console.error(`  ❌ 카드 ${card.id}: ${err.message}`)
            cardFailCount++
        }
    }

    console.log(`\n카드 마이그레이션 완료: ${cardSuccessCount}/${data.cards.length} 성공, ${cardFailCount} 실패\n`)

    // 4. 최종 결과
    console.log('='.repeat(50))
    console.log('✅ 마이그레이션 완료!')
    console.log('='.repeat(50))
    console.log(`학생: ${studentSuccessCount}/${data.students.length} 성공`)
    console.log(`카드: ${cardSuccessCount}/${data.cards.length} 성공`)
    console.log('\n💡 다음 단계:')
    console.log('1. Supabase 대시보드에서 데이터 확인')
    console.log('2. 이미지 마이그레이션 실행 (scripts/migrate-images.js)')
    console.log('3. 프론트엔드에서 Supabase URL/키 설정')
}

migrate().catch(err => {
    console.error('\n❌ 마이그레이션 실패:', err)
    process.exit(1)
})
