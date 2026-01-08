# Firebase 설정 완벽 가이드

## 📋 목차
1. [Firebase 프로젝트 생성](#1-firebase-프로젝트-생성)
2. [웹 앱 등록](#2-웹-앱-등록)
3. [Authentication 활성화](#3-authentication-활성화)
4. [Firestore 데이터베이스 설정](#4-firestore-데이터베이스-설정)
5. [환경변수 설정](#5-환경변수-설정)
6. [테스트](#6-테스트)

---

## 1. Firebase 프로젝트 생성

### 1-1. Firebase Console 접속
1. 브라우저에서 [Firebase Console](https://console.firebase.google.com) 접속
2. Google 계정으로 로그인

### 1-2. 프로젝트 추가
1. 화면 상단의 **"프로젝트 추가"** 또는 **"Add project"** 클릭
2. **프로젝트 이름** 입력 (예: `golden-keyword-miner-pro`)
3. **계속** 클릭
4. **Google Analytics 설정** (선택사항)
   - 사용 안 함 선택 가능 (나중에 추가 가능)
   - 사용하려면 Google Analytics 계정 선택
5. **프로젝트 만들기** 클릭
6. 프로젝트 생성 완료까지 대기 (약 30초)

---

## 2. 웹 앱 등록

### 2-1. 웹 앱 추가
1. Firebase Console에서 방금 만든 프로젝트 선택
2. 프로젝트 개요 페이지에서 **웹 아이콘 (`</>`)** 클릭
   - 또는 왼쪽 메뉴에서 **프로젝트 설정** (톱니바퀴 아이콘) → **내 앱** 섹션
3. **앱 닉네임** 입력 (예: `Golden Keyword Miner`)
4. **"Firebase Hosting도 설정"** 체크박스는 **선택하지 않아도 됩니다**
5. **앱 등록** 클릭

### 2-2. Firebase SDK 설정 복사
1. 다음 화면에서 **Firebase SDK 설정** 섹션 확인
2. `firebaseConfig` 객체가 보입니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

3. **이 값들을 복사해두세요!** (다음 단계에서 사용)

---

## 3. Authentication 활성화

### 3-1. Authentication 메뉴 접속
1. Firebase Console 왼쪽 메뉴에서 **"Authentication"** 클릭
2. **"시작하기"** 또는 **"Get started"** 클릭

### 3-2. Google 로그인 활성화
1. **"Sign-in method"** 탭 클릭
2. 제공업체 목록에서 **"Google"** 클릭
3. **"사용 설정"** 토글을 **켜기** (ON)
4. **프로젝트 지원 이메일** 선택
   - 기본값 사용 가능 (Firebase가 자동으로 생성한 이메일)
5. **저장** 클릭

### 3-3. 승인된 도메인 확인
1. **Authentication** → **Settings** (설정) 탭
2. **승인된 도메인** 섹션 확인
3. 기본적으로 다음 도메인들이 자동으로 추가되어 있습니다:
   - `localhost`
   - 프로젝트 도메인 (예: `your-project.firebaseapp.com`)
4. 추가 도메인이 필요하면 **"도메인 추가"** 클릭

---

## 4. Firestore 데이터베이스 설정

### 4-1. Firestore 생성
1. Firebase Console 왼쪽 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. **보안 규칙 모드 선택**:
   - **"프로덕션 모드에서 시작"** (권장) - 보안 규칙 필요
   - **"테스트 모드에서 시작"** (개발용) - 30일 후 만료
4. **다음** 클릭

### 4-2. 위치 선택
1. **Cloud Firestore 위치** 선택
   - 한국: `asia-northeast3 (Seoul)` 권장
   - 또는 가장 가까운 리전 선택
2. **사용 설정** 클릭
3. 데이터베이스 생성 완료까지 대기 (약 1분)

### 4-3. 보안 규칙 설정 (프로덕션 모드인 경우)
1. Firestore Database → **"규칙"** 탭 클릭
2. 다음 규칙 입력:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // users 컬렉션: 사용자는 자신의 문서만 읽고 쓸 수 있음
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. **게시** 클릭

---

## 5. 환경변수 설정

### 5-1. .env.local 파일 열기
1. 프로젝트 루트 디렉토리에서 `.env.local` 파일 열기
2. 파일이 없으면 생성

### 5-2. Firebase 설정 값 입력
2단계에서 복사한 `firebaseConfig` 값을 다음 형식으로 변환하여 입력:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=AIzaSy여기에실제API키값
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**예시:**
```env
# Firebase 설정
VITE_FIREBASE_API_KEY=AIzaSyAlmEzIcRRwPiei5nDGj_bp3EpElcy5y_c
VITE_FIREBASE_AUTH_DOMAIN=golden-miner-ba31f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=golden-miner-ba31f
VITE_FIREBASE_STORAGE_BUCKET=golden-miner-ba31f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=913827316386
VITE_FIREBASE_APP_ID=1:913827316386:web:38f0de7bb959cfd2d80dfb
```

### 5-3. 값 매핑 방법
- `apiKey` → `VITE_FIREBASE_API_KEY`
- `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
- `projectId` → `VITE_FIREBASE_PROJECT_ID`
- `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `VITE_FIREBASE_APP_ID`

### 5-4. 파일 저장
- `.env.local` 파일 저장
- **중요**: 이 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함되어 있어야 함)

---

## 6. 테스트

### 6-1. 개발 서버 재시작
1. 터미널에서 개발 서버 중지 (Ctrl+C)
2. 다시 시작:
```bash
npm run dev
```

### 6-2. 브라우저에서 테스트
1. 브라우저에서 `http://localhost:3000` 접속
2. **"구글로 1초 가입하기"** 버튼 클릭
3. Google 로그인 팝업이 정상적으로 열리는지 확인
4. Google 계정 선택 후 로그인
5. 로그인 성공 후 메인 화면으로 이동하는지 확인

### 6-3. Firestore 확인
1. Firebase Console → Firestore Database
2. `users` 컬렉션이 자동으로 생성되었는지 확인
3. 사용자 문서가 생성되었는지 확인:
   - 문서 ID: 사용자의 UID
   - 필드: `plan: "free"`, `email`, `displayName`, `createdAt`

---

## 🔧 문제 해결

### 문제 1: "API key not valid" 에러
**해결 방법:**
- `.env.local` 파일의 `VITE_FIREBASE_API_KEY` 값이 올바른지 확인
- Firebase Console에서 다시 복사하여 입력
- 서버 재시작

### 문제 2: "Unauthorized domain" 에러
**해결 방법:**
1. Firebase Console → Authentication → Settings
2. "승인된 도메인"에 `localhost`가 있는지 확인
3. 없으면 "도메인 추가" 클릭하여 `localhost` 추가

### 문제 3: 로그인은 되는데 Firestore 에러
**해결 방법:**
1. Firestore Database가 생성되었는지 확인
2. 보안 규칙이 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 문제 4: 환경변수가 적용되지 않음
**해결 방법:**
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 파일 이름이 정확히 `.env.local`인지 확인 (`.env.local.txt` 아님)
3. 개발 서버 재시작
4. 브라우저 캐시 삭제 후 새로고침

---

## ✅ 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] Firebase 프로젝트 생성 완료
- [ ] 웹 앱 등록 완료
- [ ] Firebase SDK 설정 값 복사 완료
- [ ] Google Authentication 활성화 완료
- [ ] Firestore Database 생성 완료
- [ ] 보안 규칙 설정 완료 (프로덕션 모드인 경우)
- [ ] `.env.local` 파일에 실제 값 입력 완료
- [ ] 개발 서버 재시작 완료
- [ ] 로그인 테스트 성공
- [ ] Firestore에 사용자 문서 생성 확인

---

## 📚 추가 리소스

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firebase Authentication 가이드](https://firebase.google.com/docs/auth)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)

---

**설정이 완료되면 앱을 새로고침하고 로그인을 시도해보세요!** 🚀


