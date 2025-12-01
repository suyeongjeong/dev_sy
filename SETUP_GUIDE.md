# 설치 가이드

이 문서는 대량 문자발송 애플리케이션의 상세 설치 과정을 안내합니다.

## 목차

1. [개발 환경 설정](#1-개발-환경-설정)
2. [AWS SNS 설정](#2-aws-sns-설정)
3. [Firebase 설정](#3-firebase-설정)
4. [백엔드 서버 설정](#4-백엔드-서버-설정)
5. [모바일 앱 설정](#5-모바일-앱-설정)
6. [테스트 실행](#6-테스트-실행)

---

## 1. 개발 환경 설정

### Node.js 설치

```bash
# Node.js 16 이상 설치
# macOS (Homebrew)
brew install node@18

# Windows (Chocolatey)
choco install nodejs

# 확인
node --version
npm --version
```

### React Native 개발 환경

#### Android 개발 환경

1. **Java Development Kit (JDK) 11 설치**
   ```bash
   # macOS
   brew install openjdk@11

   # Windows
   choco install openjdk11
   ```

2. **Android Studio 설치**
   - [Android Studio 다운로드](https://developer.android.com/studio)
   - Android SDK, Android SDK Platform, Android Virtual Device 설치

3. **환경 변수 설정**
   ```bash
   # macOS/Linux (~/.bash_profile 또는 ~/.zshrc)
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools

   # Windows (시스템 환경 변수)
   ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```

#### iOS 개발 환경 (Mac만 해당)

1. **Xcode 설치**
   ```bash
   # App Store에서 Xcode 설치
   xcode-select --install
   ```

2. **CocoaPods 설치**
   ```bash
   sudo gem install cocoapods
   ```

---

## 2. AWS SNS 설정

### 2.1. AWS 계정 생성

1. [AWS 콘솔](https://aws.amazon.com/)에서 계정 생성
2. 신용카드 등록 (무료 티어 사용)

### 2.2. IAM 사용자 생성

1. AWS Console → IAM → 사용자 → 사용자 추가
2. 사용자 이름: `bulk-sms-user`
3. 액세스 유형: **프로그래밍 방식 액세스**
4. 권한 설정: **기존 정책 직접 연결**
   - `AmazonSNSFullAccess` 선택
5. 사용자 생성 완료
6. **Access Key ID**와 **Secret Access Key** 저장 (다시 볼 수 없음!)

### 2.3. SNS 설정

1. AWS Console → SNS → SMS 메시징
2. SMS 설정
   - **기본 메시지 유형**: Transactional (중요 메시지용)
   - **계정 지출 한도**: 원하는 월 예산 설정

### 2.4. SMS 발송 한도 증가 신청 (선택)

기본 한도는 일 1 USD (약 150건)입니다. 더 많은 발송이 필요한 경우:

1. AWS Support Center → Create Case
2. Service Limit Increase 요청
3. 케이스 세부 정보:
   - **Limit Type**: SNS
   - **Use Case Description**: 비즈니스 목적 설명
   - **원하는 한도**: 일 발송 금액 입력

---

## 3. Firebase 설정

### 3.1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름: `bulk-sms-app`
4. Google Analytics 설정 (선택)

### 3.2. Firestore Database 생성

1. 프로젝트 → Firestore Database → 데이터베이스 만들기
2. **테스트 모드로 시작** (나중에 보안 규칙 설정)
3. 리전 선택: `asia-northeast3 (Seoul)`

### 3.3. 서비스 계정 키 생성

1. 프로젝트 설정 (톱니바퀴 아이콘) → 서비스 계정
2. **새 비공개 키 생성** 클릭
3. JSON 파일 다운로드
4. 파일 저장 위치: `server/firebase-service-account.json`

### 3.4. Firebase 모바일 앱 등록 (선택)

#### Android 앱 추가

1. 프로젝트 개요 → Android 앱 추가
2. 패키지 이름: `com.bulksmsapp`
3. `google-services.json` 다운로드
4. `mobile/android/app/` 폴더에 복사

#### iOS 앱 추가 (Mac에서만)

1. 프로젝트 개요 → iOS 앱 추가
2. 번들 ID: `com.bulksmsapp`
3. `GoogleService-Info.plist` 다운로드
4. Xcode에서 프로젝트에 추가

---

## 4. 백엔드 서버 설정

### 4.1. 의존성 설치

```bash
cd server
npm install
```

### 4.2. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 편집:

```env
PORT=3000
NODE_ENV=development

# AWS SNS 설정 (IAM 사용자에서 발급받은 키)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-northeast-2

# Firebase 설정
# 방법 1: JSON 파일 경로 사용 (권장)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# 방법 2: JSON 문자열 사용
# FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
```

### 4.3. Firebase 서비스 계정 파일 배치

다운로드한 `firebase-service-account.json` 파일을 `server/` 폴더에 복사합니다.

```bash
# 예시
cp ~/Downloads/bulk-sms-app-xxxxx.json ./firebase-service-account.json
```

### 4.4. 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

서버가 정상적으로 실행되면:
```
🚀 Server is running on port 3000
📱 SMS Service ready with AWS SNS
✅ Firebase initialized successfully
✅ AWS SNS configured
```

### 4.5. API 테스트

```bash
# Health check
curl http://localhost:3000/health

# 응답
{"status":"OK","timestamp":"2025-12-01T..."}
```

---

## 5. 모바일 앱 설정

### 5.1. 의존성 설치

```bash
cd mobile
npm install
```

#### iOS 전용 (Mac에서만)

```bash
cd ios
pod install
cd ..
```

### 5.2. API 엔드포인트 설정

`mobile/src/config/api.ts` 파일 수정:

```typescript
// 로컬 개발 (에뮬레이터/시뮬레이터)
const API_BASE_URL = 'http://localhost:3000/api';

// Android 에뮬레이터에서 로컬 서버 접속
// const API_BASE_URL = 'http://10.0.2.2:3000/api';

// 실제 디바이스 (같은 Wi-Fi 네트워크)
// const API_BASE_URL = 'http://192.168.1.100:3000/api';

// 배포된 서버
// const API_BASE_URL = 'https://your-server.com/api';
```

### 5.3. 권한 설정

#### Android

`mobile/android/app/src/main/AndroidManifest.xml`에 이미 추가되어 있습니다:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />
```

#### iOS

`mobile/ios/BulkSMSApp/Info.plist`에 추가:

```xml
<key>NSContactsUsageDescription</key>
<string>연락처에 접근하여 문자를 발송합니다.</string>
```

---

## 6. 테스트 실행

### 6.1. 백엔드 서버 실행 확인

```bash
cd server
npm run dev
```

### 6.2. 모바일 앱 실행

#### Android

```bash
cd mobile

# 에뮬레이터 실행 (Android Studio에서)
# 또는
npm run android
```

#### iOS (Mac에서만)

```bash
cd mobile
npm run ios
```

### 6.3. 기능 테스트

1. **연락처 추가**
   - "연락처" 탭 → "+" 버튼
   - 이름: 테스트
   - 전화번호: 01012345678 (실제 번호 입력)

2. **문자 발송 테스트**
   - "문자발송" 탭
   - 메시지 입력
   - 연락처 선택
   - "발송하기" 버튼

3. **발송 이력 확인**
   - "발송이력" 탭
   - 발송 결과 확인

### 6.4. 문제 해결

#### 백엔드 오류

```bash
# 로그 확인
npm run dev

# AWS 자격 증명 확인
aws configure list

# Firebase 연결 테스트
# server/src/config/firebase.ts의 초기화 로그 확인
```

#### 모바일 앱 오류

```bash
# Metro Bundler 캐시 삭제
npm start -- --reset-cache

# Android 빌드 정리
cd android
./gradlew clean
cd ..

# iOS Pod 재설치
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

---

## 다음 단계

- 실제 디바이스에서 테스트
- Firestore 보안 규칙 설정
- 사용자 인증 구현
- 앱 아이콘 및 스플래시 화면 추가
- 배포 준비

## 도움이 필요하신가요?

- GitHub Issues에 질문 등록
- README.md의 "문제 해결" 섹션 참고
