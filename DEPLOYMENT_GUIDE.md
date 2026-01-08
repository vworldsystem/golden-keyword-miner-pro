# GitHub + Vercel 배포 가이드

## 📋 목차
1. [GitHub 저장소 생성](#1-github-저장소-생성)
2. [코드 푸시](#2-코드-푸시)
3. [Vercel 배포](#3-vercel-배포)
4. [환경변수 설정](#4-환경변수-설정)
5. [Firebase 도메인 추가](#5-firebase-도메인-추가)
6. [배포 확인](#6-배포-확인)

---

## 1. GitHub 저장소 생성

### 1-1. GitHub에서 새 저장소 생성
1. [GitHub](https://github.com) 로그인
2. 우측 상단 **"+"** → **"New repository"** 클릭
3. 저장소 정보 입력:
   - **Repository name**: `golden-keyword-miner-pro`
   - **Description**: `AI 기반 황금 키워드 채굴기`
   - **Visibility**: Public 또는 Private 선택
   - **Initialize this repository with**: 체크하지 않음
4. **"Create repository"** 클릭

### 1-2. .gitignore 확인
프로젝트 루트에 `.gitignore` 파일이 있는지 확인하고, 없으면 생성:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

---

## 2. 코드 푸시 (GitHub Desktop 사용)

### 2-1. GitHub Desktop 설치
1. [GitHub Desktop 다운로드](https://desktop.github.com/)
2. 설치 후 GitHub 계정으로 로그인

### 2-2. 저장소 추가
1. GitHub Desktop 실행
2. **"File"** → **"Add Local Repository"** 클릭
3. **"Choose..."** 클릭
4. 프로젝트 폴더 선택: `D:\GrewTools_v1.0\golden-keyword-miner-pro`
5. **"Add repository"** 클릭

### 2-3. GitHub 저장소와 연결
1. GitHub Desktop에서 **"Publish repository"** 버튼 클릭
   - 또는 **"Repository"** → **"Publish repository"** 메뉴
2. 설정:
   - **Name**: `golden-keyword-miner-pro`
   - **Description**: `AI 기반 황금 키워드 채굴기` (선택사항)
   - **Keep this code private**: 원하는 대로 선택
3. **"Publish repository"** 클릭

**또는 이미 GitHub에 저장소를 만들었다면:**
1. GitHub Desktop에서 **"Repository"** → **"Repository settings"** 클릭
2. **"Remote"** 탭 클릭
3. **"Primary remote repository"**에 GitHub 저장소 URL 입력:
   ```
   https://github.com/your-username/golden-keyword-miner-pro.git
   ```
4. **"Save"** 클릭

### 2-4. 파일 커밋 및 푸시
1. GitHub Desktop 왼쪽 패널에서 변경된 파일 확인
2. **"Summary"**에 커밋 메시지 입력:
   ```
   Initial commit: Golden Keyword Miner Pro
   ```
3. **"Commit to main"** 클릭
4. **"Push origin"** 클릭 (또는 상단의 **"Push"** 버튼)

**주의**: 
- `.env.local` 파일은 절대 커밋하지 마세요!
- GitHub Desktop에서 `.env.local`이 보이면 체크박스를 해제하세요
- `.gitignore`에 이미 포함되어 있어야 합니다

---

## 3. Vercel 배포

### 3-1. Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. **"Sign Up"** 클릭
3. **"Continue with GitHub"** 선택
4. GitHub 계정으로 로그인 및 권한 승인

### 3-2. 프로젝트 가져오기
1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. GitHub 저장소 목록에서 `golden-keyword-miner-pro` 선택
3. **"Import"** 클릭

### 3-3. 프로젝트 설정
1. **Framework Preset**: `Vite` 선택 (자동 감지됨)
2. **Root Directory**: `./` (기본값)
3. **Build Command**: `npm run build` (자동 설정됨)
4. **Output Directory**: `dist` (자동 설정됨)
5. **Install Command**: `npm install` (자동 설정됨)

### 3-4. 환경변수 설정 (중요!)
**"Environment Variables"** 섹션에서 다음 변수 추가:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
GEMINI_API_KEY=your_gemini_api_key
```

**각 환경변수 추가 방법**:
1. **Name** 입력
2. **Value** 입력
3. **Environment** 선택:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. **"Add"** 클릭

### 3-5. 배포 시작
1. 모든 환경변수 추가 완료 후
2. **"Deploy"** 클릭
3. 배포 진행 상황 확인 (약 2-3분 소요)

---

## 4. Firebase 도메인 추가

### 4-1. Vercel 배포 URL 확인
배포 완료 후 Vercel이 제공하는 URL 확인:
```
https://golden-keyword-miner-pro.vercel.app
```
또는 커스텀 도메인:
```
https://your-custom-domain.com
```

### 4-2. Firebase Console에서 도메인 추가
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. **Authentication** → **Settings** (설정) 탭
4. **승인된 도메인** 섹션으로 스크롤
5. **"도메인 추가"** 클릭
6. 다음 도메인들 추가:
   - `your-project.vercel.app` (Vercel 기본 도메인)
   - `your-custom-domain.com` (커스텀 도메인 사용 시)
   - `www.your-custom-domain.com` (www 서브도메인 사용 시)

---

## 5. 배포 확인

### 5-1. 배포 상태 확인
1. Vercel 대시보드에서 배포 상태 확인
2. **"Ready"** 상태가 되면 배포 완료

### 5-2. 사이트 접속
1. Vercel이 제공한 URL 클릭
2. 사이트가 정상적으로 로드되는지 확인
3. 로그인 기능 테스트
4. 키워드 채굴 기능 테스트

### 5-3. 문제 해결
**문제 1: 빌드 실패**
- Vercel 로그 확인
- 환경변수 누락 확인
- `package.json`의 빌드 스크립트 확인

**문제 2: Firebase 인증 오류**
- Firebase Console에서 도메인 추가 확인
- 환경변수 값 확인

**문제 3: API 키 오류**
- 환경변수가 제대로 설정되었는지 확인
- Vercel에서 환경변수 재설정

---

## 6. 자동 배포 설정

### 6-1. GitHub 푸시 시 자동 배포
기본적으로 설정되어 있습니다:
- `main` 브랜치에 푸시 → Production 배포
- 다른 브랜치에 푸시 → Preview 배포

### 6-2. 커스텀 도메인 설정 (선택사항)
1. Vercel 대시보드 → 프로젝트 → **Settings** → **Domains**
2. 도메인 입력
3. DNS 설정 안내 따르기

---

## ✅ 체크리스트

### 배포 전
- [ ] `.gitignore`에 `.env.local` 포함 확인
- [ ] `.env.local` 파일이 커밋되지 않았는지 확인
- [ ] GitHub에 코드 푸시 완료
- [ ] Vercel 계정 생성 완료

### 배포 중
- [ ] Vercel 프로젝트 생성 완료
- [ ] 모든 환경변수 추가 완료
- [ ] 빌드 성공 확인

### 배포 후
- [ ] 사이트 정상 접속 확인
- [ ] Firebase 도메인 추가 완료
- [ ] 로그인 기능 테스트
- [ ] 키워드 채굴 기능 테스트

---

## 🔧 추가 설정

### Vercel 빌드 설정 최적화

`vercel.json` 파일 생성 (선택사항):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 환경변수 관리 팁

1. **프로덕션과 개발 환경 분리**
   - Production: 실제 API 키
   - Preview: 테스트 API 키
   - Development: 로컬 개발용

2. **보안**
   - 환경변수는 절대 코드에 하드코딩하지 않기
   - `.env.local`은 Git에 커밋하지 않기

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## 🚀 빠른 시작 (GitHub Desktop 사용)

### 1. GitHub Desktop으로 푸시
1. GitHub Desktop 설치 및 로그인
2. **"Add Local Repository"** → 프로젝트 폴더 선택
3. **"Publish repository"** 클릭
4. 커밋 메시지 입력 후 **"Commit to main"** 클릭
5. **"Push origin"** 클릭

### 2. Vercel에서 프로젝트 가져오기
1. Vercel 대시보드에서 GitHub 저장소 선택
2. 환경변수 설정
3. Deploy 클릭

**배포 완료!** 🎉

---

## 📝 GitHub Desktop 사용 팁

### 커밋 전 확인사항
1. 왼쪽 패널에서 변경된 파일 목록 확인
2. `.env.local` 파일이 목록에 있으면:
   - 체크박스 해제 (커밋 제외)
   - 또는 `.gitignore`에 추가되어 있는지 확인

### 커밋 메시지 작성 팁
- 간단명료하게: "Initial commit"
- 기능 추가: "Add keyword mining feature"
- 버그 수정: "Fix login issue"
- 디자인 개선: "Improve UI design"

### 푸시 후 확인
1. GitHub 웹사이트에서 저장소 확인
2. 파일이 올바르게 업로드되었는지 확인
3. `.env.local` 파일이 없는지 확인 (보안)

