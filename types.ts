
export interface KeywordData {
  id: string;
  keyword: string;
  searchVolume: number;
  documentCount: number;
  competitionRatio: number;
  goldScore: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

export interface MiningLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface MiningStats {
  totalAnalyzed: number;
  goldenFound: number;
  averageCompetition: number;
}

export interface User {
  uid: string;
  plan: 'free' | 'pro';
  email: string;
  displayName: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  usageCount?: number; // 일일 사용 횟수
  lastUsageDate?: string; // 마지막 사용 날짜 (YYYY-MM-DD)
}
