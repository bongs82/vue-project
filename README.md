# Vue 프로젝트

Vue 3 + Vite 기반의 웹 애플리케이션입니다.

## 🔧 기술 스택

- **Vue 3** - 프레임워크
- **Vite** - 빌드 도구
- **Firebase** - 인증 및 데이터베이스
- **Naver API** - 뉴스 검색
- **Chart.js** - 데이터 시각화
- **Swiper** - 슬라이더

## 🚀 시작하기

### 1. 저장소 클론

```sh
git clone <repository-url>
cd vue-project
```

### 2. 의존성 설치

```sh
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Naver API
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_NAVER_CLIENT_SECRET=your_naver_client_secret
```

> 💡 **참고**: `.env.example` 파일을 복사하여 사용할 수 있습니다.

### 4. 개발 서버 실행

```sh
npm run dev
```

### 5. 프로덕션 빌드

```sh
npm run build
```

## 📝 추가 스크립트

```sh
# 코드 포맷팅
npm run format

# 코드 포맷 검사
npm run format:check

# 프로덕션 미리보기
npm run preview
```

## 🔑 API 키 설정 방법

### Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 생성 또는 선택
3. 프로젝트 설정 > 일반 탭에서 앱 추가
4. 웹 앱 선택 후 Firebase SDK 구성 정보 복사
5. `.env` 파일에 해당 정보 입력

### Naver API 설정

1. [Naver Developers](https://developers.naver.com/)에 접속
2. 애플리케이션 등록
3. 검색 API 사용 설정
4. Client ID와 Client Secret 복사
5. `.env` 파일에 해당 정보 입력

## 🛠️ 권장 IDE 설정

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Vetur는 비활성화)

## 📚 추가 문서

자세한 설정은 [Vite 공식 문서](https://vite.dev/config/)를 참고하세요.

## ⚠️ 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요!
- API 키는 안전하게 관리하세요.
- 프로덕션 환경에서는 환경 변수를 서버에 직접 설정하세요.
