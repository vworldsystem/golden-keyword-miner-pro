<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fRjbJO5sc73jB8tCPaLOUy4ptuNhwCiu

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Firebase 설정 (필수)
   - `.env.local` 파일을 생성하고 `env.example` 파일을 참고하여 다음 환경변수를 설정하세요:
     ```
     VITE_FIREBASE_API_KEY=your_api_key_here
     VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
     VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
     ```
   - Firebase 설정 방법은 아래 "Firebase 설정 가이드" 섹션을 참고하세요.

3. Gemini API 설정
   - `.env.local` 파일에 `GEMINI_API_KEY`를 추가하세요:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. Run the app:
   ```bash
   npm run dev
   ```

## Firebase 설정 가이드

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `golden-keyword-miner-pro`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. 웹 앱 등록

1. Firebase Console에서 프로젝트 선택
2. 왼쪽 메뉴에서 "프로젝트 설정" (톱니바퀴 아이콘) 클릭
3. "내 앱" 섹션에서 "웹" 아이콘 (`</>`) 클릭
4. 앱 닉네임 입력 (예: `Golden Keyword Miner`)
5. "Firebase Hosting도 설정" 체크박스는 선택하지 않아도 됩니다
6. "앱 등록" 클릭
7. **Firebase SDK 설정** 화면에서 설정 정보 복사:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### 3. Google Cloud Console 설정 (Google 로그인 활성화)

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. Firebase 프로젝트와 동일한 프로젝트 선택
3. 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 클릭
4. "OAuth 2.0 클라이언트 ID" 섹션 확인
   - Firebase에서 자동으로 생성됨
   - 없으면 Firebase Console에서 Authentication > Sign-in method > Google 활성화

### 4. Firebase Authentication 설정

1. Firebase Console에서 "Authentication" 메뉴 클릭
2. "Sign-in method" 탭 클릭
3. "Google" 제공업체 클릭
4. "사용 설정" 토글을 켜기
5. 프로젝트 지원 이메일 선택 (기본값 사용 가능)
6. "저장" 클릭

### 5. 승인된 도메인 추가

1. Firebase Console > Authentication > Settings
2. "승인된 도메인" 섹션으로 스크롤
3. "도메인 추가" 클릭
4. 다음 도메인들을 추가:
   - `localhost` (개발용)
   - `127.0.0.1` (개발용)
   - 배포할 실제 도메인 (예: `yourdomain.com`, `www.yourdomain.com`)

### 6. Firestore 데이터베이스 설정

1. Firebase Console에서 "Firestore Database" 메뉴 클릭
2. "데이터베이스 만들기" 클릭
3. "프로덕션 모드에서 시작" 선택 (또는 "테스트 모드" - 개발용)
4. 위치 선택 (가장 가까운 리전 선택, 예: `asia-northeast3 (Seoul)`)
5. "사용 설정" 클릭

### 7. Firestore 보안 규칙 설정 (선택사항)

개발 단계에서는 테스트 모드로 시작할 수 있지만, 프로덕션에서는 보안 규칙을 설정해야 합니다:

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

### 8. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고, Firebase SDK 설정에서 복사한 값들을 입력:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**중요:** 
- `.env.local` 파일은 Git에 커밋하지 마세요 (`.gitignore`에 포함되어 있어야 함)
- `env.example` 파일을 참고하여 필요한 모든 변수를 설정하세요

### 9. 테스트

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000` 접속
3. "구글로 1초 가입하기" 버튼 클릭
4. Google 계정으로 로그인
5. Firestore Console에서 `users/{uid}` 문서가 생성되었는지 확인

## 기능 설명

### 인증 기능
- ✅ Google 로그인 (Firebase Authentication)
- ✅ 로그인 상태 유지 (새로고침해도 유지)
- ✅ 자동 사용자 문서 생성 (Firestore)

### 플랜 시스템
- **Free 플랜**: 기본 기능 사용 가능
- **Pro 플랜**: 모든 기능 무제한 사용
- 사용자 문서 구조: `{ plan: "free" | "pro", email, displayName, createdAt }`

### 보안
- 로그인하지 않으면 키워드 채굴 기능 사용 불가
- Firestore 보안 규칙으로 사용자 데이터 보호
