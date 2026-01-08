import React, { useState, useCallback, useEffect } from 'react';
import {
  Search,
  Zap,
  RefreshCw,
  X,
  Crown,
  CheckCircle2,
  Star,
  Wand2,
  Copy,
  Sparkles,
  LogIn,
  LogOut,
  Ghost,
  AlertTriangle,
  User as UserIcon,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

import { mineKeywords, expandLongTail } from './services/geminiService';
import {
  signInWithGoogle,
  signOut,
  onAuthStateChange,
  getUserData,
  upgradeToProWithCode,
} from './services/authService';
import { isFirebaseConfigured, initializeFirebase } from './services/firebase';
import { KeywordData, MiningLog, User } from './types';
import ConsoleLog from './components/ConsoleLog';
import KeywordTable from './components/KeywordTable';

const App: React.FC = () => {
  // 인증 상태
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // UI 상태
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [upgradeCode, setUpgradeCode] = useState('');
  const [seed, setSeed] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [logs, setLogs] = useState<MiningLog[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(
    null
  );
  const [longTails, setLongTails] = useState<any[]>([]);
  const [isExpanding, setIsExpanding] = useState(false);
  const [detectedHostname, setDetectedHostname] = useState('');

  // 도메인 감지
  const detectDomain = useCallback(() => {
    try {
      let h = window.location.hostname;
      if (!h || h === 'localhost' || h === '127.0.0.1') {
        h = new URL(window.location.href).hostname;
      }
      if (h && h !== detectedHostname) setDetectedHostname(h);
    } catch (e) {
      // ignore
    }
  }, [detectedHostname]);

  useEffect(() => {
    detectDomain();
    const timer = setInterval(detectDomain, 2000);
    return () => clearInterval(timer);
  }, [detectDomain]);

  // 로그 추가 함수
  const addLog = useCallback(
    (message: string, type: MiningLog['type'] = 'info') => {
      setLogs((prev) =>
        [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
            message,
            type,
          },
        ].slice(-50)
      );
    },
    []
  );

  // Firebase 초기화
  useEffect(() => {
    let isMounted = true;

    const initFirebase = async () => {
      try {
        console.log('🔥 Firebase 초기화 시작...');
        const configured = isFirebaseConfigured();
        console.log('🔥 Firebase 설정 확인:', configured);
        
        if (configured) {
          try {
            initializeFirebase();
            if (isMounted) {
              setIsFirebaseReady(true);
              console.log('✅ Firebase 초기화 성공!');
            }
          } catch (initError: any) {
            // Firebase 초기화 실패해도 앱은 계속 작동
            console.error('❌ Firebase 초기화 실패:', initError);
            if (isMounted) {
              setIsFirebaseReady(false);
              console.warn('⚠️ Firebase가 설정되지 않았거나 잘못된 설정입니다.');
            }
          }
        } else {
          console.warn('⚠️ Firebase 설정이 검증되지 않았습니다.');
          if (isMounted) {
            setIsFirebaseReady(false);
          }
        }
      } catch (error) {
        console.error('❌ Firebase 초기화 중 예상치 못한 오류:', error);
        if (isMounted) {
          setIsFirebaseReady(false);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initFirebase();

    return () => {
      isMounted = false;
    };
  }, []);

  // 인증 상태 감지
  useEffect(() => {
    if (!isFirebaseReady) {
      // Firebase가 준비되지 않았으면 초기화 완료 처리
      setIsInitializing(false);
      return;
    }

    let isMounted = true;

    const unsubscribe = onAuthStateChange(async (user) => {
      if (!isMounted) return;

      if (user) {
        setFirebaseUser(user);
        try {
          // Firestore에서 사용자 데이터 가져오기
          const data = await getUserData(user.uid);
          if (data && isMounted) {
            setUserData(data);
            addLog(
              `${data.displayName || user.email}님, 환영합니다! ${
                data.plan === 'pro' ? '프리미엄' : '무료'
              } 플랜이 활성화되었습니다.`,
              'success'
            );
          } else if (isMounted) {
            // 문서가 없으면 새로 생성 (authService에서 자동 생성되지만 안전장치)
            addLog('사용자 정보를 불러오는 중...', 'info');
          }
        } catch (error) {
          console.error('사용자 데이터 조회 실패:', error);
          if (isMounted) {
            addLog('사용자 정보를 불러오는데 실패했습니다.', 'error');
          }
        }
      } else if (isMounted) {
        setFirebaseUser(null);
        setUserData(null);
      }
      
      if (isMounted) {
        setIsInitializing(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isFirebaseReady]);

  // Google 로그인
  const handleLogin = async () => {
    console.log('🔐 로그인 버튼 클릭, isFirebaseReady:', isFirebaseReady);
    
    // Firebase가 준비되지 않았을 때만 설정 가이드 표시
    if (!isFirebaseReady) {
      console.warn('⚠️ Firebase가 준비되지 않아 설정 가이드를 표시합니다.');
      setShowDomainGuide(true);
      return;
    }

    try {
      await signInWithGoogle();
      // onAuthStateChange에서 자동으로 처리됨
    } catch (error: any) {
      console.error('로그인 실패:', error);
      // 특정 오류일 때만 가이드 표시
      if (error.code === 'auth/unauthorized-domain') {
        // 도메인 승인 오류: 도메인 추가 안내만 표시
        setShowDomainGuide(true);
        addLog('도메인이 승인되지 않았습니다. Firebase Console에서 도메인을 추가해주세요.', 'error');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // 사용자가 팝업을 닫은 경우: 가이드 표시 안 함
        addLog('로그인 창이 닫혔습니다.', 'warning');
      } else if (error.code === 'auth/api-key-not-valid' || error.message?.includes('API key')) {
        // API 키 오류: 설정 가이드 표시
        setShowDomainGuide(true);
        addLog('Firebase API 키가 유효하지 않습니다. .env.local 파일을 확인해주세요.', 'error');
      } else {
        // 기타 오류: 가이드 표시 안 함
        addLog('로그인에 실패했습니다. 다시 시도해주세요.', 'error');
      }
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut();
      setFirebaseUser(null);
      setUserData(null);
      setKeywords([]);
      setLogs([]);
      addLog('로그아웃되었습니다.', 'info');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      addLog('로그아웃에 실패했습니다.', 'error');
    }
  };

  // 업그레이드 코드 입력
  const handleUpgradeCode = async () => {
    if (!firebaseUser || !upgradeCode.trim()) {
      addLog('코드를 입력해주세요.', 'warning');
      return;
    }

    try {
      await upgradeToProWithCode(firebaseUser.uid, upgradeCode.trim());
      // 사용자 데이터 다시 불러오기
      const updatedData = await getUserData(firebaseUser.uid);
      if (updatedData) {
        setUserData(updatedData);
      }
      setUpgradeCode('');
      setShowCodeInput(false);
      setShowUpgradeModal(false);
      addLog('Pro 플랜으로 업그레이드되었습니다!', 'success');
    } catch (error: any) {
      console.error('업그레이드 실패:', error);
      addLog(error.message || '업그레이드에 실패했습니다. 코드를 확인해주세요.', 'error');
    }
  };

  // 키워드 채굴 시작
  const handleStartMining = async () => {
    // 로그인 체크
    if (!firebaseUser || !userData) {
      setShowUpgradeModal(true);
      addLog('로그인이 필요합니다.', 'warning');
      return;
    }

    if (!seed.trim()) {
      addLog('키워드를 입력해주세요.', 'warning');
      return;
    }

    // 사용량 제한 체크 (Free 플랜만)
    if (userData.plan === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const lastUsageDate = userData.lastUsageDate || '';
      const usageCount = (userData.usageCount || 0);
      
      // 날짜가 바뀌면 카운트 리셋
      if (lastUsageDate !== today) {
        // Firestore 업데이트는 나중에
      } else if (usageCount >= 10) {
        setShowUpgradeModal(true);
        addLog('무료 플랜 일일 사용량(10회)을 초과했습니다. Pro 플랜으로 업그레이드하세요.', 'warning');
        return;
      }
    }

    setIsMining(true);
    setKeywords([]);
    addLog(`"${seed}" 분석 엔진 가동 중...`, 'info');

    // 플랜에 따른 채굴 개수 제한
    const keywordCount = userData.plan === 'pro' ? 15 : 5;
    
    try {
      const results = await mineKeywords(seed, keywordCount);
      setKeywords(results);
      addLog(
        `분석 완료! ${results.length}개의 황금 키워드를 발견했습니다.${userData.plan === 'free' ? ' (Pro 플랜에서는 15개 제공)' : ''}`,
        'success'
      );
      
      // 사용량 업데이트 (Free 플랜만)
      if (userData.plan === 'free' && firebaseUser) {
        const today = new Date().toISOString().split('T')[0];
        const lastUsageDate = userData.lastUsageDate || '';
        const newCount = lastUsageDate === today ? (userData.usageCount || 0) + 1 : 1;
        
        // Firestore 업데이트
        try {
          const { getFirebaseDb } = await import('./services/firebase');
          const { doc, updateDoc } = await import('firebase/firestore');
          const db = getFirebaseDb();
          const userRef = doc(db, 'users', firebaseUser.uid);
          await updateDoc(userRef, {
            usageCount: newCount,
            lastUsageDate: today,
          });
          
          // 로컬 상태 업데이트
          setUserData({
            ...userData,
            usageCount: newCount,
            lastUsageDate: today,
          });
        } catch (err) {
          console.error('사용량 업데이트 실패:', err);
        }
      }
    } catch (err: any) {
      console.error('채굴 오류:', err);
      const errorMessage = err?.message || '데이터 엔진 오류가 발생했습니다.';
      if (errorMessage.includes('API 키')) {
        addLog('Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.', 'error');
      } else {
        addLog(errorMessage, 'error');
      }
    } finally {
      setIsMining(false);
    }
  };

  // 롱테일 확장
  const handleExpandLongTail = async (kw: KeywordData) => {
    // 로그인 체크
    if (!firebaseUser || !userData) {
      setShowUpgradeModal(true);
      addLog('로그인이 필요합니다.', 'warning');
      return;
    }

    setSelectedKeyword(kw);
    setIsExpanding(true);
    setLongTails([]);

    try {
      const results = await expandLongTail(kw.keyword);
      setLongTails(results);
    } catch (err: any) {
      console.error('롱테일 확장 오류:', err);
      const errorMessage = err?.message || '롱테일 확장에 실패했습니다.';
      if (errorMessage.includes('API 키')) {
        addLog('Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.', 'error');
      } else {
        addLog(errorMessage, 'error');
      }
    } finally {
      setIsExpanding(false);
    }
  };

  // 로딩 화면
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-amber-500 w-12 h-12 mx-auto" />
          <p className="text-white font-bold">초기화 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 화면
  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 font-sans relative overflow-hidden">
        {/* 황금 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1)_0%,transparent_70%)]"></div>
        
        {/* 황금 입자 효과 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="gold-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        <header className="relative z-20 px-10 py-8 flex items-center gap-3">
          <div className="relative">
            <Zap className="w-10 h-10 text-amber-400 fill-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse" />
            <div className="absolute inset-0 w-10 h-10 bg-amber-400 blur-xl opacity-50"></div>
          </div>
          <span className="text-white font-black text-2xl italic tracking-tighter uppercase">
            Golden Keyword{' '}
            <span className="text-amber-400">Miner</span>{' '}
            <span className="text-amber-500 text-lg">Pro</span>
          </span>
        </header>
        
        <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center space-y-12">
          <div className="space-y-6">
            <h1 className="hero-title">
              키워드 속에 숨겨진
              <br />
              <span className="hero-title-gold italic">
                황금
              </span>을 캐내세요
            </h1>
            <p className="text-slate-300 font-black text-2xl md:text-3xl tracking-tight">
              국내 유일 <span className="text-amber-400">AI 기반</span> 실시간
              <br />
              <span className="gold-gradient bg-clip-text text-transparent">황금 키워드</span> 자동 분석기
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button
              onClick={handleLogin}
              className="gold-button text-slate-900 py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-7 h-7 relative z-10"
                alt="G"
              />
              <span className="relative z-10">구글로 1초 가입하기</span>
            </button>
          </div>
        </section>
        {showDomainGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl">
            <div
              className="absolute inset-0 bg-slate-950/90"
              onClick={() => setShowDomainGuide(false)}
            ></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black italic">Firebase 설정 가이드</h3>
                <button
                  onClick={() => setShowDomainGuide(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X />
                </button>
              </div>
              <div className="space-y-4">
                {!isFirebaseReady ? (
                  <>
                    <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <p className="text-sm font-black text-red-900">
                          Firebase 설정이 필요합니다
                        </p>
                      </div>
                      <p className="text-xs font-bold text-red-700 leading-relaxed">
                        현재 .env.local 파일에 플레이스홀더 값(your_firebase_api_key 등)이 설정되어 있어 로그인 기능을 사용할 수 없습니다.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 space-y-4">
                      <h4 className="text-lg font-black text-slate-900">설정 방법</h4>
                      <div className="space-y-3 text-sm font-bold text-slate-700">
                        <div className="flex gap-3">
                          <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                            1
                          </span>
                          <div>
                            <p className="font-black">Firebase Console 접속</p>
                            <p className="text-xs text-slate-500 mt-1">
                              <a
                                href="https://console.firebase.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-600 hover:underline"
                              >
                                https://console.firebase.google.com
                              </a>
                              에서 프로젝트 생성 또는 선택
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                            2
                          </span>
                          <div>
                            <p className="font-black">웹 앱 등록</p>
                            <p className="text-xs text-slate-500 mt-1">
                              프로젝트 설정 → 일반 탭 → 웹 앱 추가
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                            3
                          </span>
                          <div>
                            <p className="font-black">설정 값 복사</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Firebase SDK 설정에서 firebaseConfig 값 복사
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                            4
                          </span>
                          <div>
                            <p className="font-black">.env.local 파일 수정</p>
                            <p className="text-xs text-slate-500 mt-1">
                              프로젝트 루트의 .env.local 파일을 열고 실제 값으로 교체
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                            5
                          </span>
                          <div>
                            <p className="font-black">Authentication 활성화</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Firebase Console → Authentication → Sign-in method → Google 활성화
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                            6
                          </span>
                          <div>
                            <p className="font-black">페이지 새로고침</p>
                            <p className="text-xs text-slate-500 mt-1">
                              브라우저에서 F5를 눌러 페이지를 새로고침하세요
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-3">
                      <p className="text-xs font-black text-amber-400">.env.local 파일 예시:</p>
                      <pre className="text-[10px] font-mono bg-slate-800 p-4 rounded-xl overflow-x-auto">
{`VITE_FIREBASE_API_KEY=AIzaSy실제값...
VITE_FIREBASE_AUTH_DOMAIN=프로젝트ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=프로젝트ID
VITE_FIREBASE_STORAGE_BUCKET=프로젝트ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef`}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-100 space-y-3">
                    <p className="text-xs font-black text-amber-900 leading-tight">
                      자동 감지된 주소입니다. Firebase 콘솔에서 '승인된 도메인'에
                      추가해주세요.
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-900 text-amber-400 p-4 rounded-xl font-mono text-[10px] break-all font-bold">
                        {detectedHostname}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(detectedHostname);
                          alert('복사완료!');
                        }}
                        className="bg-amber-500 text-slate-900 px-4 rounded-xl font-black text-xs"
                      >
                        복사
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 메인 화면
  const isPro = userData?.plan === 'pro';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b-2 border-amber-200/50 px-8 h-20 flex items-center justify-between shadow-lg shadow-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="w-7 h-7 text-amber-500 fill-amber-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
            <div className="absolute inset-0 w-7 h-7 bg-amber-400 blur-md opacity-30"></div>
          </div>
          <h1 className="text-xl font-black italic uppercase gold-glow tracking-tight">
            <span className="gold-gradient bg-clip-text text-transparent">GOLDEN</span>{' '}
            KEYWORD MINER
          </h1>
          {isPro ? (
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ml-4 shadow-lg shadow-emerald-500/30">
              <Crown className="w-3 h-3 inline mr-1" /> PRO Activated
            </span>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-2 gold-button text-slate-900 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-tight transition-all ml-4"
            >
              <Crown className="w-4 h-4" /> Pro로 업그레이드
            </button>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-black text-slate-900">
              {userData?.displayName || firebaseUser.displayName || '사용자'}
            </span>
            <span className="text-[10px] font-black text-slate-400">
              {userData?.email || firebaseUser.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
            title="로그아웃"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-8 py-12 space-y-12">
        <section className="max-w-3xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            </div>
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-[1.1] text-slate-900">
              <span className="text-amber-600 italic">
                Find Your Gold
              </span>
            </h2>
            <p className="text-slate-600 font-black text-lg md:text-xl leading-relaxed">
              블로그, 유튜브, 쇼핑몰 성장의 핵심{' '}
              <span className="text-amber-600">'검색 의도'</span>를 분석합니다.
            </p>
          </div>
          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border-2 border-amber-200/50 flex flex-col md:flex-row gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 via-transparent to-amber-50/50"></div>
            <div className="flex-1 flex items-center gap-4 pl-6 relative z-10">
              <Search className="w-8 h-8 text-amber-400" />
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartMining()}
                className="w-full py-6 text-2xl font-black bg-transparent border-0 outline-none placeholder:text-slate-400"
                placeholder="주제나 핵심 단어를 입력..."
                disabled={!firebaseUser}
              />
            </div>
            <button
              onClick={handleStartMining}
              disabled={isMining || !firebaseUser}
              className="gold-button text-slate-900 px-12 py-6 rounded-[2rem] font-black text-xl flex items-center gap-3 transition-all active:scale-95 disabled:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 relative z-10"
            >
              {isMining ? (
                <RefreshCw className="w-7 h-7 animate-spin" />
              ) : (
                <Sparkles className="w-7 h-7" />
              )}{' '}
              채굴하기
            </button>
          </div>
          {!isPro && userData && (
            <div className="space-y-2 bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  무료 플랜 제한
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-xs font-black text-amber-600 hover:text-amber-700 underline"
                >
                  Pro로 업그레이드
                </button>
              </div>
              <div className="space-y-1 text-xs font-bold text-slate-600">
                <p>• 일일 사용량: {userData.usageCount || 0}/10회</p>
                <p>• 키워드 채굴: 5개 (Pro: 15개)</p>
                <p>• 롱테일 확장: 사용 불가 (Pro 전용)</p>
              </div>
              {userData.usageCount && userData.usageCount >= 8 && (
                <p className="text-xs font-black text-amber-600 mt-2">
                  ⚠️ 일일 사용량이 거의 소진되었습니다!
                </p>
              )}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
            <KeywordTable data={keywords} onSelectKeyword={handleExpandLongTail} />
          </div>
          <aside className="lg:col-span-4 flex flex-col gap-8">
            <ConsoleLog logs={logs} />
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl space-y-4">
              <h4 className="text-xl font-black italic flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Today's Tip
              </h4>
              <p className="text-sm font-bold text-slate-400 leading-loose">
                검색량 대비 문서수가 적은 '추천 점수 80점' 이상의 키워드만 골라
                제목의 맨 앞에 배치하세요. 이것이 바로 상위 노출의 핵심 비결입니다.
              </p>
            </div>
            {/* Pro 전용 UI 예시 */}
            {isPro && (
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-[2.5rem] text-white shadow-xl space-y-4">
                <h4 className="text-xl font-black italic flex items-center gap-2">
                  <Crown className="w-5 h-5" /> Pro Benefits
                </h4>
                <ul className="text-sm font-bold space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> 무제한 키워드 채굴
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> 고급 분석 기능
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> 우선 지원
                  </li>
                </ul>
              </div>
            )}
          </aside>
        </section>
      </main>

      {/* 업그레이드 모달 */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-xl">
          <div
            className="absolute inset-0 bg-slate-950/90"
            onClick={() => setShowUpgradeModal(false)}
          ></div>
          <div className="relative bg-gradient-to-br from-white via-amber-50/30 to-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border-2 border-amber-200/50 animate-in zoom-in duration-300">
            {/* 황금 배경 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-amber-100/20"></div>
            <div className="absolute top-0 left-0 w-full h-1 gold-gradient"></div>
            
            <div className="relative p-10 text-center space-y-8">
              {/* 황금 왕관 아이콘 */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50">
                  <Crown className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tight text-slate-900">
                  <span className="text-amber-600">
                    PREMIUM UPGRADE
                  </span>
                </h3>
                <p className="text-slate-600 font-black text-lg">
                  Pro 플랜으로 업그레이드하여{' '}
                  <span className="text-amber-600">모든 혜택</span>을 누리세요.
                </p>
              </div>
              
              {/* 혜택 리스트 */}
              <div className="space-y-3 bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-amber-200/50 text-left shadow-xl">
                <div className="flex items-center gap-4 text-base font-black text-slate-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span>모든 검색 히스토리 영구 저장</span>
                </div>
                <div className="flex items-center gap-4 text-base font-black text-slate-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span>무제한 키워드 채굴</span>
                </div>
                <div className="flex items-center gap-4 text-base font-black text-slate-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span>AI 롱테일 확장 제목 무제한 생성</span>
                </div>
                <div className="flex items-center gap-4 text-base font-black text-slate-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span>고급 분석 기능 및 우선 지원</span>
                </div>
              </div>
              
              {/* Gumroad 결제 버튼 */}
              <div className="space-y-4">
                <a
                  href="https://your-store.gumroad.com/l/golden-keyword-miner-pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full gold-button text-slate-900 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <CreditCard className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Pro 플랜 구매하기</span>
                  <ExternalLink className="w-5 h-5 relative z-10" />
                </a>
                <p className="text-xs text-slate-500 font-bold">
                  안전한 결제 시스템을 통해 구매하세요
                </p>
              </div>
              
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                다음에 할게요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 코드 입력 모달 */}
      {showCodeInput && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-xl">
          <div
            className="absolute inset-0 bg-slate-950/90"
            onClick={() => {
              setShowCodeInput(false);
              setUpgradeCode('');
            }}
          ></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border-2 border-amber-200/50">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  Pro 플랜 활성화
                </h3>
                <p className="text-slate-600 font-bold text-sm">
                  Gumroad에서 구매하신 코드를 입력해주세요
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={upgradeCode}
                  onChange={(e) => setUpgradeCode(e.target.value.toUpperCase())}
                  placeholder="GKM-PRO-XXXXXXXX"
                  className="w-full px-6 py-4 text-center font-mono font-black text-lg border-2 border-amber-200 rounded-2xl focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleUpgradeCode()}
                />
                <button
                  onClick={handleUpgradeCode}
                  className="w-full gold-button text-slate-900 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3"
                >
                  활성화하기
                </button>
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setUpgradeCode('');
                  }}
                  className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 롱테일 모달 */}
      {selectedKeyword && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md">
          <div
            className="absolute inset-0 bg-slate-950/80"
            onClick={() => setSelectedKeyword(null)}
          ></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-amber-500" /> "
                {selectedKeyword.keyword}" Expansion
              </h3>
              <button
                onClick={() => setSelectedKeyword(null)}
                className="p-3 hover:bg-white/10 rounded-full transition-all"
              >
                <X />
              </button>
            </div>
            <div className="p-10 overflow-y-auto bg-slate-50 space-y-5">
              {isExpanding ? (
                <div className="text-center py-24 space-y-4">
                  <RefreshCw className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
                  <p className="text-slate-400 font-black">
                    AI가 황금 롱테일을 추출하고 있습니다...
                  </p>
                </div>
              ) : (
                longTails.map((lt, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-400 transition-all"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-lg">
                        {lt.intent}
                      </span>
                      <p className="font-black text-slate-900 text-lg leading-tight">
                        {lt.phrase}
                      </p>
                      <p className="text-xs text-slate-400 font-bold">
                        {lt.why}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lt.phrase);
                        alert('복사되었습니다!');
                      }}
                      className="p-4 bg-slate-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-500 hover:text-slate-900 shadow-lg"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
