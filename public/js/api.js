// ============================================
// API Layer - Supabase Integration
// ============================================
// 기존 fetch 기반 API를 Supabase 클라이언트로 변경
import { supabase, uploadImage, deleteImage } from './supabase-client.js'

const API = {
    // ============================================
    // 현재 로그인 사용자의 Student 가져오기
    // ============================================
    async getCurrentStudent() {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            throw new Error('로그인이 필요합니다.')
        }

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('Error getting current student:', error)
            throw error
        }

        return data
    },

    // ============================================
    // 학생 관리 API
    // ============================================

    /**
     * 모든 학생 목록 조회
     * @returns {Promise<Array>}
     */
    async getStudents() {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Get students error:', error)
            throw new Error('학생 목록 조회 실패')
        }

        return data
    },

    /**
     * 특정 학생 정보 조회
     * @param {string} id - 학생 ID
     * @returns {Promise<Object>}
     */
    async getStudent(id) {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Get student error:', error)
            throw new Error('학생을 찾을 수 없습니다')
        }

        return data
    },

    /**
     * 새 학생 추가
     * @param {string} name - 학생 이름
     * @returns {Promise<Object>}
     */
    async addStudent(name) {
        const { data, error } = await supabase
            .from('students')
            .insert({ name: name.trim() })
            .select()
            .single()

        if (error) {
            console.error('Add student error:', error)
            if (error.code === '23505') { // Unique constraint violation
                throw new Error('이미 존재하는 이름입니다')
            }
            throw new Error('등록 실패')
        }

        return data
    },

    /**
     * 학생 정보 수정
     * @param {string} id - 학생 ID
     * @param {string} name - 새 이름
     * @returns {Promise<Object>}
     */
    async updateStudent(id, name) {
        const { data, error } = await supabase
            .from('students')
            .update({ name: name.trim() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Update student error:', error)
            if (error.code === '23505') {
                throw new Error('이미 존재하는 이름입니다')
            }
            throw new Error('업데이트 실패')
        }

        return data
    },

    /**
     * 학생 삭제 (관련 카드도 자동 삭제 - CASCADE)
     * @param {string} id - 학생 ID
     * @returns {Promise<Object>}
     */
    async deleteStudent(id) {
        // 먼저 해당 학생의 이미지들을 삭제
        const cards = await this.getCards(id)
        for (const card of cards) {
            if (card.question_image) {
                await deleteImage(card.question_image)
            }
        }

        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Delete student error:', error)
            throw new Error('삭제 실패')
        }

        return { success: true }
    },

    // ============================================
    // 카드 관리 API
    // ============================================

    /**
     * 특정 학생의 모든 카드 조회
     * @param {string} studentId - 학생 ID
     * @returns {Promise<Array>}
     */
    async getCards(studentId) {
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Get cards error:', error)
            throw new Error('카드 목록 조회 실패')
        }

        return data
    },

    /**
     * 새 카드 추가
     * @param {string} studentId - 학생 ID
     * @param {Object} cardData - 카드 데이터 {type, question, questionImage, answer}
     * @returns {Promise<Object>}
     */
    async addCard(studentId, cardData) {
        const { data, error } = await supabase
            .from('cards')
            .insert({
                student_id: studentId,
                type: cardData.type || 'text',
                question: cardData.question || '',
                question_image: cardData.questionImage || null,
                answer: cardData.answer || '',
                box: 1,
                success_count: 0,
                fail_count: 0
            })
            .select()
            .single()

        if (error) {
            console.error('Add card error:', error)
            throw new Error('카드 추가 실패')
        }

        return data
    },

    /**
     * 카드 정보 수정
     * @param {string} cardId - 카드 ID
     * @param {Object} updates - 수정할 데이터
     * @returns {Promise<Object>}
     */
    async updateCard(cardId, updates) {
        // snake_case로 변환
        const supabaseUpdates = {}
        if (updates.question !== undefined) supabaseUpdates.question = updates.question
        if (updates.answer !== undefined) supabaseUpdates.answer = updates.answer
        if (updates.type !== undefined) supabaseUpdates.type = updates.type
        if (updates.questionImage !== undefined) supabaseUpdates.question_image = updates.questionImage
        if (updates.box !== undefined) supabaseUpdates.box = updates.box
        if (updates.successCount !== undefined) supabaseUpdates.success_count = updates.successCount
        if (updates.failCount !== undefined) supabaseUpdates.fail_count = updates.failCount
        if (updates.lastReview !== undefined) supabaseUpdates.last_review = updates.lastReview

        const { data, error } = await supabase
            .from('cards')
            .update(supabaseUpdates)
            .eq('id', cardId)
            .select()
            .single()

        if (error) {
            console.error('Update card error:', error)
            throw new Error('업데이트 실패')
        }

        return data
    },

    /**
     * 카드 삭제
     * @param {string} cardId - 카드 ID
     * @returns {Promise<Object>}
     */
    async deleteCard(cardId) {
        // 먼저 카드 정보를 가져와서 이미지 삭제
        const { data: card } = await supabase
            .from('cards')
            .select('question_image')
            .eq('id', cardId)
            .single()

        if (card && card.question_image) {
            await deleteImage(card.question_image)
        }

        const { error } = await supabase
            .from('cards')
            .delete()
            .eq('id', cardId)

        if (error) {
            console.error('Delete card error:', error)
            throw new Error('삭제 실패')
        }

        return { success: true }
    },

    /**
     * 정답/오답 피드백 제출 (상자 이동)
     * @param {string} cardId - 카드 ID
     * @param {boolean} success - 정답 여부
     * @returns {Promise<Object>}
     */
    async submitFeedback(cardId, success) {
        // 먼저 현재 카드 정보 조회
        const { data: card, error: fetchError } = await supabase
            .from('cards')
            .select('*')
            .eq('id', cardId)
            .single()

        if (fetchError) {
            console.error('Fetch card error:', fetchError)
            throw new Error('카드 조회 실패')
        }

        // 상자 이동 로직
        let newBox = card.box
        let newSuccessCount = card.success_count
        let newFailCount = card.fail_count

        if (success) {
            newBox = Math.min(card.box + 1, 4)
            newSuccessCount++
        } else {
            newBox = 1
            newFailCount++
        }

        // 업데이트
        const { data, error } = await supabase
            .from('cards')
            .update({
                box: newBox,
                success_count: newSuccessCount,
                fail_count: newFailCount,
                last_review: new Date().toISOString()
            })
            .eq('id', cardId)
            .select()
            .single()

        if (error) {
            console.error('Submit feedback error:', error)
            throw new Error('피드백 제출 실패')
        }

        return data
    },

    // ============================================
    // 가챠 및 통계 API
    // ============================================

    /**
     * 랜덤 카드 뽑기 (가중치 기반)
     * @param {string} studentId - 학생 ID
     * @returns {Promise<Object>}
     */
    async getRandomCard(studentId) {
        const cards = await this.getCards(studentId)

        if (cards.length === 0) {
            throw new Error('NO_CARDS')
        }

        // 가중치 기반 랜덤 (box 1=4, box 2=3, box 3=2, box 4=1)
        const weighted = []
        cards.forEach(card => {
            const weight = 5 - card.box
            for (let i = 0; i < weight; i++) {
                weighted.push(card)
            }
        })

        const randomCard = weighted[Math.floor(Math.random() * weighted.length)]
        return randomCard
    },

    /**
     * 특정 학생의 통계 조회
     * @param {string} studentId - 학생 ID
     * @returns {Promise<Object>}
     */
    async getStats(studentId) {
        const cards = await this.getCards(studentId)

        const stats = {
            total: cards.length,
            box1: 0,
            box2: 0,
            box3: 0,
            box4: 0
        }

        cards.forEach(card => {
            stats[`box${card.box}`]++
        })

        return stats
    },

    // ============================================
    // 이미지 업로드 API
    // ============================================

    /**
     * 이미지 업로드
     * @param {File} file - 이미지 파일
     * @param {string} studentId - 학생 ID (선택사항, 폴더 구분용)
     * @returns {Promise<Object>} {filename: string}
     */
    async uploadImage(file, studentId = 'general') {
        const { filePath, publicUrl } = await uploadImage(file, studentId)

        // 기존 API와 호환성을 위해 filename 반환
        return {
            filename: filePath,  // Supabase Storage 경로
            url: publicUrl       // 공개 URL
        }
    }
}

// 전역 객체로 노출 (기존 코드 호환성)
window.API = API

// ES Module export
export default API
