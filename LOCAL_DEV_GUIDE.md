# ============================================
# 로컬 개발 환경 설정 가이드
# ============================================

## 옵션 1: 직접 코드에 입력 (권장 - 간단함)

`public/js/supabase-client.js` 파일에서:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGci...'
```

**장점**: 설정 간단, 빌드 도구 불필요  
**단점**: Git에 커밋 시 주의 필요 (anon 키는 공개되어도 안전하지만)

---

## 옵션 2: .env 파일 사용 (Vite 빌드 필요)

### 1. Vite 설정

```bash
npm install -D vite
```

`vite.config.js` 생성:

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
```

### 2. .env 파일 생성

`.env.example`을 복사하여 `.env` 생성:

```bash
cp .env.example .env
```

`.env` 파일에 실제 값 입력:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. supabase-client.js 수정

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 4. package.json 스크립트 추가

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 5. 개발 서버 실행

```bash
npm run dev
```

### 6. GitHub Actions 배포 수정

`.github/workflows/deploy.yml`에 빌드 스텝 추가:

```yaml
- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: './dist'  # public → dist로 변경
```

GitHub Secrets 설정:
- Settings → Secrets → Actions
- `SUPABASE_URL` 추가
- `SUPABASE_ANON_KEY` 추가

**장점**: 환경 변수 관리 깔끔, Git에 안전  
**단점**: 빌드 스텝 추가, 설정 복잡

---

## 권장 방법

### 개발 중
- **옵션 1** 사용 (직접 입력)
- `.gitignore`에 `public/js/supabase-client.js` 추가하고 템플릿 파일 별도 관리

### 프로덕션
- **옵션 2** 사용 (환경 변수)
- GitHub Secrets로 안전하게 관리

---

## 현재 구현 상태

현재는 **옵션 1 (직접 입력)** 방식으로 구현되어 있습니다.

빌드 도구 없이 바로 사용 가능하도록 설계했습니다.

필요 시 옵션 2로 전환 가능합니다.
