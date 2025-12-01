import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

export const initializeFirebase = () => {
  try {
    // Firebase Admin SDK 초기화
    // 실제 사용 시 서비스 계정 키 JSON 파일 필요
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // 개발 환경에서는 기본 초기화
      console.warn('⚠️  Firebase credentials not found. Using default initialization.');
      admin.initializeApp();
    }

    db = admin.firestore();
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
};

export const getFirestore = (): admin.firestore.Firestore => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
};

export { admin };
