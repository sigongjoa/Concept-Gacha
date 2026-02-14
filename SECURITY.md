# 🔐 Supabase 보안 설정 가이드

## ⚠️ 중요: API 키 보안

Supabase의 `anon` (public) 키는 **공개되어도 안전합니다!**

### 왜 안전한가?

1. **RLS (Row Level Security)**: 데이터베이스 레벨에서 보호
2. **Public Key**: 클라이언트에서 사용하도록 설계됨
3. **제한된 권한**: 읽기/쓰기만 가능, 관리 작업 불가

### 노출되면 안 되는 키

- ❌ `service_role` 키 (절대 노출 금지!)
- ❌ Database 비밀번호
- ❌ JWT Secret

### 노출되어도 괜찮은 키

- ✅ `anon` 키 (public key)
- ✅ Supabase URL

---

## 📋 현재 상태

### supabase-client.js

```javascript
const SUPABASE_URL = 'https://cleefixlppjoblolvrmw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_U-yGTIklWPWWdCU5bqkvuQ_vFkJOt1Z'
```

**이 키들은 공개되어도 안전합니다!**

이유:
- `anon` 키는 클라이언트용 public key
- RLS 정책으로 데이터 보호됨
- GitHub Pages에서도 이 키를 사용해야 함

---

## 🔒 보안 검증

### RLS 정책 확인

```sql
-- Supabase Dashboard → SQL Editor
SELECT tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename IN ('students', 'cards');

-- 결과: 모든 테이블에 RLS 정책 적용됨 ✅
```

### 테스트

```bash
# 익명 사용자로 데이터 접근 시도
curl -X GET "https://cleefixlppjoblolvrmw.supabase.co/rest/v1/students?select=*" \
  -H "apikey: sb_publishable_U-yGTIklWPWWdCU5bqkvuQ_vFkJOt1Z"

# 결과: [] (빈 배열 - RLS로 차단됨) ✅
```

---

## 💡 결론

**현재 설정은 안전합니다!**

- ✅ Public key만 노출 (설계상 의도된 것)
- ✅ RLS로 데이터 보호
- ✅ GitHub Pages 배포 가능

**배포해도 됩니다!** 🚀

---

## 📚 참고

- [Supabase 공식 문서: API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase 공식 문서: RLS](https://supabase.com/docs/guides/auth/row-level-security)
