export type Language = 'en' | 'si' | 'ta';

export type Theme = 'light' | 'dark';

export interface CustomerAccount {
  accountNumber: string;
  nickname: string;
  customerName: string;
  tariffCategory: string;
  premisesAddress: string;
  billingMonth: string;
  outstandingBalance: number;
  dueDate: string;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  monthlyAverageKwh: number;
  isFictionalDemo: boolean;
}

export interface ConsumptionDataPoint {
  month: string;
  year: number;
  kwh: number;
  amount: number;
  units: number;
}

export interface OutageRecord {
  id: string;
  area: string;
  district: string;
  province: string;
  type: 'planned' | 'breakdown';
  status: 'active' | 'scheduled' | 'restoring' | 'resolved';
  affectedCustomers: number;
  startTime: string;
  estimatedRestoration: string;
  reason: string;
  feederName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language: Language;
  quickReplies?: string[];
  isMockResponse?: boolean;
}

export interface QuickServiceItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  action: 'view-bill' | 'check-outage' | 'report-breakdown' | 'solar-services';
  badge?: string;
}
