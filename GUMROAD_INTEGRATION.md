# Gumroad 결제 연동 가이드

## 📋 개요

Gumroad를 통해 Pro 플랜을 판매하고, 결제 완료 후 자동으로 사용자의 플랜을 업그레이드하는 시스템입니다.

## 🎯 구현 단계

### 1단계: Gumroad 제품 생성

1. [Gumroad](https://gumroad.com)에 로그인
2. **"Add a product"** 클릭
3. 제품 정보 입력:
   - **Name**: "Golden Keyword Miner Pro"
   - **Price**: 원하는 가격 설정 (예: $29, ₩39,000)
   - **Description**: Pro 플랜 혜택 설명
   - **Product Type**: "Digital Product"
4. **"Save"** 클릭

### 2단계: Gumroad Webhook 설정

1. Gumroad 대시보드 → **Settings** → **Advanced** → **Webhooks**
2. **"Add webhook"** 클릭
3. Webhook URL 입력:
   ```
   https://your-domain.com/api/gumroad-webhook
   ```
   (또는 로컬 테스트용: ngrok 등을 사용)
4. **Events to listen for**: `sale` 선택
5. **"Save"** 클릭

### 3단계: Firebase Functions 설정 (서버리스 함수)

#### 3-1. Firebase Functions 초기화

```bash
# 프로젝트 루트에서
npm install -g firebase-tools
firebase login
firebase init functions
```

#### 3-2. Functions 코드 작성

`functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

admin.initializeApp();

interface GumroadSale {
  sale_id: string;
  email: string;
  product_id: string;
  permalink: string;
  price: number;
  gumroad_fee: number;
  currency: string;
  sale_timestamp: string;
}

export const gumroadWebhook = functions.https.onRequest(async (req, res) => {
  // Gumroad webhook 검증
  const signature = req.headers['x-gumroad-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  // Gumroad에서 제공한 시크릿 키로 검증
  const secret = functions.config().gumroad.secret;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  const sale: GumroadSale = req.body;
  
  try {
    // 이메일로 사용자 찾기
    const userRecord = await admin.auth().getUserByEmail(sale.email);
    
    // Firestore에서 사용자 문서 업데이트
    const userRef = admin.firestore().doc(`users/${userRecord.uid}`);
    await userRef.update({
      plan: 'pro',
      upgradedAt: admin.firestore.FieldValue.serverTimestamp(),
      gumroadSaleId: sale.sale_id,
      gumroadProductId: sale.product_id,
    });
    
    console.log(`User ${userRecord.uid} upgraded to Pro`);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error');
  }
});
```

#### 3-3. Gumroad Secret 설정

```bash
firebase functions:config:set gumroad.secret="your-gumroad-webhook-secret"
```

#### 3-4. Functions 배포

```bash
firebase deploy --only functions
```

### 4단계: 클라이언트에서 Gumroad 결제 링크 연결

`App.tsx`의 업그레이드 모달에 Gumroad 결제 링크 추가:

```tsx
const GUMROAD_PRODUCT_URL = 'https://your-store.gumroad.com/l/your-product-permalink';

// 업그레이드 모달에서
<a
  href={GUMROAD_PRODUCT_URL}
  target="_blank"
  rel="noopener noreferrer"
  className="gold-button text-slate-900 px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3"
>
  <CreditCard className="w-6 h-6" />
  Pro 플랜 구매하기
</a>
```

### 5단계: 결제 완료 후 처리

#### 옵션 1: Webhook 자동 처리 (권장)
- Gumroad → Webhook → Firebase Functions → Firestore 업데이트
- 사용자는 결제 후 자동으로 Pro 플랜 활성화

#### 옵션 2: 수동 확인 링크
- Gumroad에서 "Thank you" 페이지에 리다이렉트 URL 설정
- 예: `https://your-app.com/upgrade-success?email={email}`
- 해당 페이지에서 이메일로 사용자 확인 후 업그레이드

## 🔧 대안: 간단한 수동 업그레이드 시스템

Firebase Functions가 복잡하다면, 간단한 수동 시스템도 가능합니다:

### 방법 1: Gumroad 구매 후 이메일 확인
1. 사용자가 Gumroad에서 구매
2. 구매 이메일을 받음
3. 앱에서 "구매 확인" 페이지에 이메일 입력
4. 관리자가 수동으로 Firestore에서 `plan: "pro"`로 업데이트

### 방법 2: 구매 코드 시스템
1. Gumroad에서 구매 시 고유 코드 발급
2. 앱에서 코드 입력하면 자동 업그레이드
3. Firestore에 코드 검증 로직 추가

## 📝 Firestore 보안 규칙 업데이트

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // 사용자는 자신의 문서만 읽을 수 있음
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // plan 필드는 Functions에서만 수정 가능
      allow write: if request.auth != null && 
                     request.auth.uid == userId &&
                     !('plan' in request.resource.data.diff(resource.data).keys());
    }
  }
}
```

## ✅ 체크리스트

- [ ] Gumroad 제품 생성 완료
- [ ] Gumroad Webhook URL 설정
- [ ] Firebase Functions 배포 완료
- [ ] Gumroad Secret 설정 완료
- [ ] 클라이언트에 결제 링크 추가
- [ ] 테스트 결제 진행
- [ ] Webhook 수신 확인
- [ ] Firestore 업데이트 확인

## 🧪 테스트 방법

1. Gumroad에서 테스트 모드로 결제 시뮬레이션
2. Webhook이 정상적으로 수신되는지 확인
3. Firestore에서 사용자 문서의 `plan` 필드가 `"pro"`로 변경되는지 확인
4. 앱에서 Pro 기능이 활성화되는지 확인

## 📚 참고 자료

- [Gumroad Webhook 문서](https://help.gumroad.com/article/280-webhooks)
- [Firebase Functions 문서](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)


