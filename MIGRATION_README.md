# Supabase Migration - README

이 문서는 Concept-Gacha 프로젝트의 Supabase 마이그레이션 과정을 안내합니다.

---

## 🚀 빠른 시작

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase/schema.sql` 파일을 SQL Editor에서 실행
3. Storage에서 `card-images` 버킷 생성 (Public)
4. Settings → API에서 URL과 anon 키 복사

자세한 내용은 [`supabase/SETUP_GUIDE.md`](supabase/SETUP_GUIDE.md) 참조

### 2. 프론트엔드 설정

`public/js/supabase-client.js` 파일에서 Supabase 정보 입력:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'  // 여기에 입력
const SUPABASE_ANON_KEY = 'eyJhbGci...'           // 여기에 입력
```

### 3. 데이터 마이그레이션 (선택사항)

기존 `data.json` 데이터를 Supabase로 이전:

```bash
cd scripts
npm install
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npm run migrate
```

> ⚠️ `SUPABASE_SERVICE_KEY`는 Settings → API → service_role secret에서 확인

### 4. 로컬 테스트

```bash
cd public
python3 -m http.server 8000
# 또는
npx serve .
```

브라우저에서 `http://localhost:8000` 접속하여 테스트

### 5. GitHub Pages 배포

1. GitHub 리포지토리 Settings → Pages
2. Source: **GitHub Actions** 선택
3. `main` 브랜치에 푸시하면 자동 배포

---

## 📁 파일 구조

```
concept-gacha/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 배포 워크플로우
├── public/
│   ├── js/
│   │   ├── supabase-client.js  # [NEW] Supabase 클라이언트
│   │   ├── api.js              # [MODIFIED] Supabase API로 변경
│   │   └── layout.js           # [NO CHANGE]
│   ├── index.html              # [MODIFIED] ES modules 사용
│   ├── gacha.html              # [MODIFIED] ES modules 사용
│   ├── add.html                # [MODIFIED] ES modules 사용
│   ├── list.html               # [MODIFIED] ES modules 사용
│   └── admin.html              # [MODIFIED] ES modules 사용
├── scripts/
│   ├── package.json            # [NEW] 마이그레이션 스크립트 의존성
│   └── migrate-to-supabase.js  # [NEW] 데이터 마이그레이션 스크립트
├── supabase/
│   ├── schema.sql              # [NEW] 데이터베이스 스키마
│   └── SETUP_GUIDE.md          # [NEW] Supabase 설정 가이드
├── server.js                   # [DEPRECATED] 더 이상 사용 안 함
├── data.json                   # [DEPRECATED] Supabase로 마이그레이션 후 삭제 가능
└── package.json                # [DEPRECATED] 서버용, 삭제 가능
```

---

## 🔄 주요 변경사항

### 백엔드
- ❌ Express.js 서버 제거
- ✅ Supabase PostgreSQL 사용
- ✅ Supabase Storage (이미지)
- ✅ Row Level Security (RLS)

### 프론트엔드
- ✅ ES Modules 사용
- ✅ Supabase JS Client 통합
- ✅ API 레이어 완전 재작성
- ✅ 이미지 업로드 → Supabase Storage

### 배포
- ❌ 로컬 서버 불필요
- ✅ GitHub Pages 정적 호스팅
- ✅ GitHub Actions 자동 배포

---

## 🧪 테스트 체크리스트

### Supabase 설정
- [ ] 데이터베이스 테이블 생성 확인 (students, cards)
- [ ] Storage 버킷 생성 확인 (card-images)
- [ ] RLS 정책 활성화 확인

### 프론트엔드 기능
- [ ] 학생 추가/삭제/수정
- [ ] 카드 추가/삭제/수정
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 랜덤 카드 뽑기
- [ ] 정답/오답 피드백
- [ ] 통계 표시

### 배포
- [ ] GitHub Actions 워크플로우 성공
- [ ] GitHub Pages 사이트 접속 가능
- [ ] CORS 에러 없음
- [ ] 모든 기능 정상 작동

---

## 🐛 문제 해결

### "RLS policy violation" 에러
- Supabase SQL Editor에서 RLS 정책 확인
- `supabase/schema.sql` 재실행

### 이미지 업로드 실패
- Storage 버킷이 Public인지 확인
- 파일 크기 제한 (10MB) 확인

### CORS 에러
- Supabase Settings → API → URL Configuration에 GitHub Pages URL 추가
- 브라우저 캐시 삭제

### API 호출 실패
- `supabase-client.js`에 올바른 URL/키 입력 확인
- 브라우저 콘솔에서 에러 메시지 확인

---

## 📚 참고 문서

- [Supabase 설정 가이드](supabase/SETUP_GUIDE.md)
- [구현 계획](../brain/implementation_plan.md)
- [Supabase 공식 문서](https://supabase.com/docs)
- [GitHub Pages 문서](https://docs.github.com/en/pages)

---

## 🎯 다음 단계

마이그레이션 완료 후:

1. **기존 파일 정리**
   - `server.js` 삭제
   - `data.json` 백업 후 삭제
   - 루트 `package.json` 삭제

2. **추가 기능 개발**
   - 사용자 인증 추가 (Supabase Auth)
   - 실시간 업데이트 (Supabase Realtime)
   - 통계 대시보드 개선

3. **성능 최적화**
   - 이미지 최적화 (WebP 변환)
   - 코드 스플리팅
   - Service Worker 캐싱
