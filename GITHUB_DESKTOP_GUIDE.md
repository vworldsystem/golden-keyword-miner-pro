# GitHub Desktop 사용 가이드

## 📥 GitHub Desktop 설치

### 1. 다운로드
1. [GitHub Desktop 공식 사이트](https://desktop.github.com/) 접속
2. **"Download for Windows"** 클릭
3. 설치 파일 실행

### 2. 로그인
1. GitHub Desktop 실행
2. **"Sign in to GitHub.com"** 클릭
3. GitHub 계정으로 로그인
4. 브라우저에서 권한 승인

---

## 📂 프로젝트 추가하기

### 방법 1: 로컬 저장소 추가 (이미 Git 초기화된 경우)
1. GitHub Desktop 실행
2. **"File"** → **"Add Local Repository"** 클릭
3. **"Choose..."** 클릭
4. 프로젝트 폴더 선택: `D:\GrewTools_v1.0\golden-keyword-miner-pro`
5. **"Add repository"** 클릭

### 방법 2: 새 저장소로 만들기
1. GitHub Desktop 실행
2. **"File"** → **"New Repository"** 클릭
3. 설정:
   - **Name**: `golden-keyword-miner-pro`
   - **Local path**: `D:\GrewTools_v1.0\golden-keyword-miner-pro`
   - **Git ignore**: `None` (이미 `.gitignore` 파일이 있음)
   - **License**: 선택사항
4. **"Create repository"** 클릭

---

## 🔗 GitHub 저장소와 연결

### 이미 GitHub에 저장소를 만들었다면
1. GitHub Desktop에서 프로젝트 선택
2. **"Repository"** → **"Repository settings"** 클릭
3. **"Remote"** 탭 클릭
4. **"Primary remote repository"**에 GitHub 저장소 URL 입력:
   ```
   https://github.com/your-username/golden-keyword-miner-pro.git
   ```
5. **"Save"** 클릭

### 아직 GitHub에 저장소를 만들지 않았다면
1. GitHub Desktop에서 **"Publish repository"** 버튼 클릭
   - 또는 **"Repository"** → **"Publish repository"** 메뉴
2. 설정:
   - **Name**: `golden-keyword-miner-pro`
   - **Description**: `AI 기반 황금 키워드 채굴기` (선택사항)
   - **Keep this code private**: 원하는 대로 선택
3. **"Publish repository"** 클릭
4. GitHub에 저장소가 자동으로 생성됩니다

---

## 💾 파일 커밋하기

### 1. 변경사항 확인
1. GitHub Desktop 왼쪽 패널에서 변경된 파일 목록 확인
2. 각 파일 옆의 체크박스로 커밋할 파일 선택

### 2. .env.local 파일 제외 확인
- `.env.local` 파일이 목록에 있으면:
  - ✅ 체크박스를 해제하여 커밋에서 제외
  - 또는 `.gitignore`에 이미 포함되어 있어야 함

### 3. 커밋 메시지 작성
1. 하단 **"Summary"** 필드에 커밋 메시지 입력:
   ```
   Initial commit: Golden Keyword Miner Pro
   ```
2. 필요시 **"Description"**에 상세 설명 추가

### 4. 커밋 실행
1. **"Commit to main"** 버튼 클릭
2. 커밋 완료 확인

---

## 🚀 GitHub에 푸시하기

### 첫 푸시
1. 상단의 **"Push origin"** 버튼 클릭
2. 또는 **"Repository"** → **"Push"** 메뉴
3. 푸시 완료 확인

### 이후 변경사항 푸시
1. 파일 수정 후 GitHub Desktop에서 변경사항 확인
2. 커밋 메시지 작성
3. **"Commit to main"** 클릭
4. **"Push origin"** 클릭

---

## ✅ 커밋 전 체크리스트

### 반드시 확인할 것
- [ ] `.env.local` 파일이 커밋 목록에 없는지 확인
- [ ] `.gitignore` 파일이 있는지 확인
- [ ] 커밋 메시지가 명확한지 확인
- [ ] 불필요한 파일이 포함되지 않았는지 확인

### 커밋하면 안 되는 파일
- ❌ `.env.local` (환경변수)
- ❌ `node_modules/` (의존성)
- ❌ `dist/` (빌드 결과물)
- ❌ 개인 정보가 포함된 파일

---

## 🔍 GitHub Desktop 주요 기능

### 1. 변경사항 확인
- 왼쪽 패널: 변경된 파일 목록
- 오른쪽 패널: 파일별 변경 내용 (diff)

### 2. 히스토리 보기
- **"History"** 탭: 모든 커밋 히스토리 확인
- 특정 커밋 클릭: 해당 시점의 변경사항 확인

### 3. 브랜치 관리
- 상단에서 브랜치 선택/생성
- **"Branch"** → **"New branch"** 메뉴

### 4. Pull Request
- **"Branch"** → **"Create Pull Request"** 메뉴
- GitHub 웹사이트에서 PR 생성

---

## 🛠️ 문제 해결

### 문제 1: "Repository not found"
**해결**:
1. **"Repository"** → **"Repository settings"** 클릭
2. **"Remote"** 탭에서 URL 확인
3. 올바른 GitHub 저장소 URL인지 확인

### 문제 2: .env.local 파일이 커밋 목록에 나타남
**해결**:
1. 파일 체크박스 해제
2. `.gitignore` 파일에 `.env.local` 추가 확인
3. 이미 커밋했다면:
   - GitHub Desktop에서 해당 커밋 선택
   - **"Revert this commit"** 클릭

### 문제 3: 푸시가 안 됨
**해결**:
1. 인터넷 연결 확인
2. GitHub 인증 확인
3. 저장소 권한 확인

---

## 💡 유용한 팁

### 1. 커밋 전 미리보기
- 파일을 클릭하면 변경 내용을 미리 볼 수 있습니다
- 불필요한 변경사항은 제외할 수 있습니다

### 2. 부분 커밋
- 여러 파일을 수정했을 때
- 필요한 파일만 선택해서 커밋 가능

### 3. 커밋 메시지 템플릿
```
[타입] 간단한 설명

상세 설명 (선택사항)
```

예시:
```
[추가] 키워드 채굴 기능 구현

- Gemini API 연동
- 키워드 분석 로직 추가
- 결과 테이블 표시
```

---

## 🎯 다음 단계

GitHub에 푸시가 완료되면:
1. ✅ GitHub 웹사이트에서 저장소 확인
2. ✅ Vercel 배포 진행 (DEPLOYMENT_GUIDE.md 참고)
3. ✅ 환경변수 설정
4. ✅ 배포 완료!

**이제 Vercel에서 배포를 시작할 수 있습니다!** 🚀

