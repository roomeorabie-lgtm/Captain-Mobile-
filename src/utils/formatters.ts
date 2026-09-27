import { DeviceRecord } from '../types';

export const OFFICIAL_LOGO_URL = 'https://i.postimg.cc/qMQnjWKx/1000254376-removebg-preview.png';

/**
 * Format currency in Egyptian Pounds (EGP / جنيه)
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded) + ' ج.م';
}

/**
 * Format date & time nicely in Arabic
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Sanitize international phone number for WhatsApp wa.me link
 */
export function sanitizeWhatsAppPhone(countryCode: string, phoneNumber: string): string {
  // Strip non-digits from both
  const cleanCode = countryCode.replace(/\D/g, '');
  let cleanNumber = phoneNumber.replace(/\D/g, '');

  // If local number starts with leading 0 and country code is present, strip leading 0 (common in Egypt e.g. 010 -> 10)
  if (cleanNumber.startsWith('0')) {
    cleanNumber = cleanNumber.substring(1);
  }

  return `${cleanCode}${cleanNumber}`;
}

/**
 * WhatsApp message templates matching exact specifications
 */
export function generateWhatsAppMessage(
  type: 'receipt' | 'deposit' | 'ready' | 'delivered',
  device: DeviceRecord,
  totalPaid: number,
  remaining: number,
  depositOrPaymentAmount?: number
): string {
  const faultText = device.faultType === 'عطل آخر' ? (device.customFault || 'عطل آخر') : device.faultType;
  const depositVal = depositOrPaymentAmount ?? device.deposit;

  switch (type) {
    case 'receipt':
      return `مرحبًا ${device.customerName}، تم استلام جهازك ${device.deviceName} في Captain Mobile للصيانة. العطل المسجل: ${faultText}. العربون: ${depositVal} جنيه. السعر الإجمالي: ${device.basePrice} جنيه. المتبقي: ${remaining} جنيه.`;

    case 'deposit':
      return `مرحبًا ${device.customerName}، تم تسجيل دفع العربون الخاص بجهازك ${device.deviceName} في Captain Mobile بقيمة ${depositVal} جنيه. إجمالي تكلفة الإصلاح: ${device.basePrice} جنيه، والمتبقي: ${remaining} جنيه.`;

    case 'ready':
      return `مرحبًا ${device.customerName}، جهازك ${device.deviceName} أصبح جاهزًا للاستلام من Captain Mobile. المتبقي المستحق: ${remaining} جنيه.`;

    case 'delivered':
      return `مرحبًا ${device.customerName}، تم تسليم جهازك ${device.deviceName} من Captain Mobile. إجمالي المدفوع: ${totalPaid} جنيه. شكرًا لتعاملك معنا.`;

    default:
      return '';
  }
}

/**
 * Generate sequential receipt number if not present
 */
export function generateReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CM-${year}${month}-${randomSuffix}`;
}
