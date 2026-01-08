import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase 설정 타입
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// 환경변수에서 Firebase 설정 가져오기
const getFirebaseConfig = (): FirebaseConfig => {
  const config: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  // 필수 값 검증
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    console.warn(
      `⚠️ Firebase 설정이 불완전합니다. 누락된 필드: ${missingFields.join(', ')}`
    );
    console.warn('💡 .env.local 파일을 확인해주세요.');
  }

  return config;
};

// Firebase 앱 초기화 (싱글톤 패턴)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const initializeFirebase = (): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
} => {
  // 이미 초기화된 앱이 있으면 재사용
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db };
  }

  // 새로 초기화
  const config = getFirebaseConfig();
  
  // 필수 값이 없거나 플레이스홀더 값이면 에러
  if (!config.apiKey || !config.projectId) {
    throw new Error(
      'Firebase 설정이 없습니다. .env.local 파일에 Firebase 환경변수를 설정해주세요.'
    );
  }

  // 플레이스홀더 값 체크
  if (
    config.apiKey.includes('your_') ||
    config.apiKey.includes('본인의_') ||
    config.projectId.includes('your_') ||
    config.projectId.includes('본인의_')
  ) {
    throw new Error(
      'Firebase 설정에 플레이스홀더 값이 포함되어 있습니다. .env.local 파일에 실제 Firebase 설정 값을 입력해주세요.'
    );
  }

  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error: any) {
    console.error('Firebase 초기화 중 오류:', error);
    throw new Error(
      `Firebase 초기화 실패: ${error.message || '알 수 없는 오류'}. .env.local 파일의 Firebase 설정을 확인해주세요.`
    );
  }

  return { app, auth, db };
};

// Firebase 인스턴스 가져오기
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    const { app: initializedApp } = initializeFirebase();
    return initializedApp;
  }
  return app;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    try {
      const { auth: initializedAuth } = initializeFirebase();
      return initializedAuth;
    } catch (error) {
      console.error('Firebase Auth 초기화 실패:', error);
      throw error;
    }
  }
  return auth;
};

export const getFirebaseDb = (): Firestore => {
  if (!db) {
    const { db: initializedDb } = initializeFirebase();
    return initializedDb;
  }
  return db;
};

// Firebase 설정 검증 함수
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  
  // 모든 필수 필드가 있는지 확인
  const hasAllFields = !!(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );

  if (!hasAllFields) {
    return false;
  }

  // 플레이스홀더 값이 있는지 확인
  const hasPlaceholder = 
    config.apiKey.includes('your_') ||
    config.apiKey.includes('본인의_') ||
    config.projectId.includes('your_') ||
    config.projectId.includes('본인의_') ||
    config.apiKey === '' ||
    config.projectId === '';

  return !hasPlaceholder;
};

