# 대량 문자발송 애플리케이션

React Native + Node.js 기반의 크로스플랫폼(Android/iOS) 대량 문자발송 애플리케이션입니다.
AWS SNS를 활용하여 저렴한 비용으로 대량 SMS 발송이 가능합니다.

## 주요 기능

- ✅ 연락처 관리 (추가, 수정, 삭제, 그룹 관리)
- ✅ 대량 문자 발송 (다중 선택, 전체 선택)
- ✅ 발송 이력 조회 (성공/실패 통계, 상세 결과)
- ✅ 실시간 발송 상태 확인
- ✅ 메시지 길이 계산 (SMS 건수 자동 계산)

## 기술 스택

### 모바일 앱 (mobile/)
- **프레임워크**: React Native 0.72.6
- **언어**: TypeScript
- **네비게이션**: React Navigation
- **상태관리**: React Hooks
- **HTTP 클라이언트**: Axios
- **UI**: React Native Vector Icons

### 백엔드 서버 (server/)
- **런타임**: Node.js 16+
- **프레임워크**: Express.js
- **언어**: TypeScript
- **SMS 서비스**: AWS SNS
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Auth (선택)

## 비용 정보

### AWS SNS 요금
- 한국 기준: 건당 약 $0.00645 (~8-9원)
- 무료 티어: 월 100건 무료
- 1,000건 발송 시: 약 8,000원
- 10,000건 발송 시: 약 80,000원

### Firebase 요금
- Firestore: 무료 티어 내에서 충분 (읽기/쓰기 제한적)
- 저장소: 1GB 무료
- 무료 할당량: 읽기 50,000건/일, 쓰기 20,000건/일

## 프로젝트 구조

```
dev_sy/
├── mobile/                 # React Native 모바일 앱
│   ├── src/
│   │   ├── config/        # API 설정
│   │   ├── screens/       # 화면 컴포넌트
│   │   │   ├── ContactsScreen.tsx    # 연락처 관리
│   │   │   ├── SendSMSScreen.tsx     # 문자 발송
│   │   │   └── HistoryScreen.tsx     # 발송 이력
│   │   └── services/      # API 서비스
│   ├── App.tsx            # 메인 앱 컴포넌트
│   └── package.json
│
└── server/                # Node.js 백엔드 서버
    ├── src/
    │   ├── config/        # AWS, Firebase 설정
    │   ├── routes/        # API 라우트
    │   ├── services/      # 비즈니스 로직
    │   └── index.ts       # 서버 진입점
    └── package.json
```

## 설치 및 실행

### 사전 요구사항

1. **Node.js** 16 이상
2. **React Native 개발 환경**
   - [React Native 공식 문서](https://reactnative.dev/docs/environment-setup) 참고
3. **AWS 계정** (SNS 사용)
4. **Firebase 프로젝트** (Firestore 사용)

### 1. 저장소 클론

```bash
git clone <repository-url>
cd dev_sy
```

### 2. 백엔드 서버 설정

```bash
cd server
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 AWS 및 Firebase 자격 증명 입력
```

#### .env 파일 설정

```env
PORT=3000
NODE_ENV=development

# AWS SNS 설정
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-northeast-2

# Firebase 설정
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

#### 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

### 3. 모바일 앱 설정

```bash
cd mobile
npm install

# iOS 의존성 설치 (Mac에서만)
cd ios && pod install && cd ..
```

#### API 엔드포인트 설정

`mobile/src/config/api.ts` 파일에서 서버 URL을 수정하세요:

```typescript
const API_BASE_URL = 'http://your-server-url:3000/api';
```

#### 앱 실행

```bash
# Android
npm run android

# iOS (Mac에서만)
npm run ios
```

## AWS SNS 설정

### 1. AWS 계정 생성 및 IAM 사용자 생성

1. [AWS Console](https://aws.amazon.com/)에서 계정 생성
2. IAM에서 새 사용자 생성
3. SNS 권한 부여: `AmazonSNSFullAccess`
4. Access Key와 Secret Key 발급

### 2. SMS 발신 번호 등록 (선택)

- AWS SNS에서 발신 번호를 등록하면 수신자에게 표시됩니다
- 등록하지 않으면 임의의 번호로 표시됩니다

### 3. SMS 발송 한도 증가 신청

- 기본 한도: 일 1 USD (약 150건)
- 한도 증가 신청: AWS Support Center에서 요청

## Firebase 설정

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)
2. 새 프로젝트 생성
3. Firestore Database 활성화

### 2. 서비스 계정 키 생성

1. 프로젝트 설정 > 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. JSON 내용을 문자열로 변환하여 `.env`에 추가

### 3. 보안 규칙 설정

Firestore 보안 규칙을 설정하여 데이터를 보호하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /sms_history/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## API 문서

### SMS 발송

**POST** `/api/sms/send`

```json
{
  "phoneNumbers": ["+821012345678", "+821098765432"],
  "message": "안녕하세요! 문자 발송 테스트입니다.",
  "userId": "user_001"
}
```

**응답**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "phoneNumber": "+821012345678",
        "messageId": "xxx-xxx-xxx",
        "status": "success"
      }
    ],
    "totalSent": 2,
    "totalFailed": 0
  }
}
```

### 연락처 관리

**GET** `/api/contacts?userId=user_001`

**POST** `/api/contacts`

```json
{
  "name": "홍길동",
  "phoneNumber": "01012345678",
  "email": "hong@example.com",
  "group": "고객",
  "userId": "user_001"
}
```

**PUT** `/api/contacts/:id`

**DELETE** `/api/contacts/:id`

### 발송 이력

**GET** `/api/history?userId=user_001&limit=50`

## 개발 가이드

### 전화번호 형식

- 입력: `01012345678` (하이픈 없이)
- 변환: `+821012345678` (E.164 형식)
- 한국 번호만 지원 (확장 가능)

### 메시지 길이 제한

- SMS: 70자 (한글 기준)
- 초과 시 자동으로 여러 건으로 분할 (추가 비용 발생)

### 보안 고려사항

1. **환경 변수 보호**: `.env` 파일을 절대 커밋하지 마세요
2. **API 인증**: 실제 배포 시 JWT 또는 Firebase Auth 구현 권장
3. **Rate Limiting**: Express Rate Limit 적용 권장
4. **입력 검증**: 전화번호 및 메시지 유효성 검사 강화

## 배포

### 백엔드 배포 옵션

1. **AWS EC2**: 직접 서버 관리
2. **AWS Elastic Beanstalk**: 자동 스케일링
3. **Heroku**: 간편한 배포
4. **Google Cloud Run**: 컨테이너 기반

### 모바일 앱 배포

#### Android

```bash
cd mobile/android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS

Xcode에서 Archive 생성 후 App Store Connect에 업로드

## 문제 해결

### AWS SNS 오류

- **Throttling Error**: 발송 속도 제한 초과. 지연 추가 필요
- **InvalidParameter**: 전화번호 형식 확인 (E.164)
- **OptedOut**: 수신자가 차단 (테스트 시 AWS Console에서 해제)

### Firebase 오류

- **Permission Denied**: Firestore 보안 규칙 확인
- **Quota Exceeded**: 무료 할당량 초과. 요금제 업그레이드 필요

### React Native 오류

- **Metro Bundler**: 캐시 삭제 `npm start -- --reset-cache`
- **Pod Install 실패**: `cd ios && pod deintegrate && pod install`

## 향후 개발 계획

- [ ] CSV/Excel 파일로 연락처 일괄 업로드
- [ ] 메시지 템플릿 관리
- [ ] 발송 예약 기능
- [ ] 그룹별 필터링 및 검색 강화
- [ ] 통계 대시보드 (일별/월별 발송 현황)
- [ ] 다국어 지원
- [ ] 사용자 인증 시스템 (Firebase Auth)
- [ ] 푸시 알림 (발송 완료 시)

## 라이선스

MIT License

## 기여

이슈 및 PR을 환영합니다!

## 문의

프로젝트 관련 문의사항은 이슈로 등록해주세요.
