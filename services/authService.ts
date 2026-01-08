import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  Unsubscribe,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './firebase';
import { User } from '../types';

// Google Auth Provider 설정
const getGoogleProvider = (): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account', // 항상 계정 선택 화면 표시
  });
  return provider;
};

/**
 * Google 로그인
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const auth = getFirebaseAuth();
  const provider = getGoogleProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Firestore에 사용자 문서 생성 또는 업데이트
    await createOrUpdateUserDocument(user);

    return user;
  } catch (error: any) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const signOut = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
};

/**
 * Firestore에 사용자 문서 생성 또는 업데이트
 * - 기본값: { plan: "free", email, displayName, createdAt }
 */
export const createOrUpdateUserDocument = async (
  firebaseUser: FirebaseUser
): Promise<void> => {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', firebaseUser.uid);

  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // 새 사용자: 기본값으로 문서 생성
      const newUserData: Omit<User, 'uid'> = {
        plan: 'free',
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, newUserData);
      console.log('✅ 새 사용자 문서 생성:', firebaseUser.uid);
    } else {
      // 기존 사용자: email, displayName 업데이트 (plan은 유지)
      const existingData = userSnap.data();
      await setDoc(
        userRef,
        {
          email: firebaseUser.email || existingData.email,
          displayName: firebaseUser.displayName || existingData.displayName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log('✅ 사용자 정보 업데이트:', firebaseUser.uid);
    }
  } catch (error) {
    console.error('❌ 사용자 문서 생성/업데이트 실패:', error);
    throw error;
  }
};

/**
 * Firestore에서 사용자 데이터 가져오기
 */
export const getUserData = async (uid: string): Promise<User | null> => {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', uid);

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return {
        uid,
        ...userSnap.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error('❌ 사용자 데이터 조회 실패:', error);
    return null;
  }
};

/**
 * 인증 상태 변경 감지
 */
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
): Unsubscribe => {
  try {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('onAuthStateChange 초기화 실패:', error);
    // Firebase가 초기화되지 않았을 때 빈 unsubscribe 함수 반환
    return () => {};
  }
};

/**
 * 업그레이드 코드로 Pro 플랜 활성화
 * 간단한 코드 시스템 (실제로는 더 복잡한 검증 필요)
 */
export const upgradeToProWithCode = async (
  uid: string,
  code: string
): Promise<boolean> => {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', uid);

  try {
    // 간단한 코드 검증 (실제로는 Firestore에 코드 목록을 저장하고 검증해야 함)
    // 여기서는 예시로 특정 형식의 코드만 허용
    const validCodePattern = /^GKM-PRO-[A-Z0-9]{8}$/;
    
    if (!validCodePattern.test(code.toUpperCase())) {
      throw new Error('유효하지 않은 코드 형식입니다.');
    }

    // 사용자 문서 업데이트
    await updateDoc(userRef, {
      plan: 'pro',
      upgradeCode: code.toUpperCase(),
      upgradedAt: serverTimestamp(),
    });

    console.log('✅ Pro 플랜으로 업그레이드 완료:', uid);
    return true;
  } catch (error) {
    console.error('❌ 업그레이드 실패:', error);
    throw error;
  }
};

