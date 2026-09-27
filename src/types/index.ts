export type DeviceStatus = 
  | 'تم استلام الجهاز'
  | 'جاري الفحص'
  | 'جاري الإصلاح'
  | 'جاهز للتسليم'
  | 'تم التسليم';

export type FaultType = 
  | 'شاشة'
  | 'سوكت'
  | 'بوردة'
  | 'فلاتة'
  | 'IC'
  | 'عطل آخر';

export interface PaymentRecord {
  id: string;
  deviceId: string;
  amount: number;
  note: string;
  timestamp: string; // ISO string
  totalPaidSoFar: number;
  remainingBalanceSoFar: number;
}

export interface DeviceRecord {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  countryCode: string;
  countryName: string;
  deviceName: string;
  faultType: FaultType;
  customFault?: string;
  basePrice: number; // إجمالي تكلفة الإصلاح
  deposit: number; // العربون
  status: DeviceStatus;
  notes: string;
  receivedAt: string; // ISO string
  deliveredAt?: string; // ISO string when status becomes 'تم التسليم'
  updatedAt: string;
}

export interface BackupData {
  appName: string;
  version: string;
  exportDate: string;
  devices: DeviceRecord[];
  payments: PaymentRecord[];
}
