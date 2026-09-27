import React from 'react';
import { 
  Smartphone, 
  Clock, 
  MessageSquare, 
  ChevronLeft, 
  AlertCircle,
  Phone,
  User
} from 'lucide-react';
import { DeviceRecord, DeviceStatus } from '../types';
import { formatCurrency, formatDateTime, sanitizeWhatsAppPhone } from '../utils/formatters';

interface DeviceCardProps {
  device: DeviceRecord;
  totalPaid: number;
  remaining: number;
  onClick: () => void;
  onQuickWhatsApp: (e: React.MouseEvent) => void;
}

export const getStatusBadgeConfig = (status: DeviceStatus) => {
  switch (status) {
    case 'تم استلام الجهاز':
      return {
        label: 'تم استلام الجهاز',
        bg: 'bg-blue-950/40 text-blue-300 border-blue-800/60',
        dot: 'bg-blue-400',
      };
    case 'جاري الفحص':
      return {
        label: 'جاري الفحص',
        bg: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60',
        dot: 'bg-indigo-400',
      };
    case 'جاري الإصلاح':
      return {
        label: 'جاري الإصلاح',
        bg: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
        dot: 'bg-amber-400 animate-pulse',
      };
    case 'جاهز للتسليم':
      return {
        label: 'جاهز للتسليم',
        bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
        dot: 'bg-emerald-400',
      };
    case 'تم التسليم':
      return {
        label: 'تم التسليم',
        bg: 'bg-purple-950/40 text-purple-300 border-purple-800/60',
        dot: 'bg-purple-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-zinc-800/60 text-zinc-300 border-zinc-700',
        dot: 'bg-zinc-400',
      };
  }
};

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  totalPaid,
  remaining,
  onClick,
  onQuickWhatsApp,
}) => {
  const statusCfg = getStatusBadgeConfig(device.status);
  const faultText = device.faultType === 'عطل آخر' ? (device.customFault || 'عطل آخر') : device.faultType;

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#121215] hover:bg-[#16161b] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl flex flex-col justify-between"
    >
      <div>
        {/* Top Row: Customer Name & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0 group-hover:border-amber-500/40 transition-colors">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                {device.customerName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mt-0.5">
                <Phone size={12} className="text-zinc-500" />
                <span dir="ltr">{device.countryCode} {device.customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 ${statusCfg.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            <span>{statusCfg.label}</span>
          </div>
        </div>

        {/* Device Name & Fault */}
        <div className="bg-[#0b0b0e] border border-zinc-800/60 rounded-xl p-3 my-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-200 truncate">
              <Smartphone size={16} className="text-amber-500 shrink-0" />
              <span className="truncate">{device.deviceName}</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 shrink-0">
              {device.receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-zinc-500">العطل:</span>
            <span className="font-medium text-amber-300/90 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30">
              {faultText}
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-3 gap-2 text-center py-2 px-1 border-t border-b border-zinc-800/60">
          <div>
            <span className="text-[11px] text-zinc-500 block mb-0.5">السعر الأساسي</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-200 tabular-nums">
              {formatCurrency(device.basePrice)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 block mb-0.5">العربون / المدفوع</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 block mb-0.5">المتبقي</span>
            <span className={`text-xs sm:text-sm font-bold tabular-nums ${remaining > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Date & Quick Actions */}
      <div className="flex items-center justify-between pt-3 mt-2 text-xs text-zinc-500">
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <Clock size={12} className="text-zinc-600" />
          <span>{formatDateTime(device.receivedAt)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onQuickWhatsApp}
            title="مراسلة واتساب سريعة"
            className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-400 transition-colors"
          >
            <MessageSquare size={14} />
          </button>
          <div className="p-1 text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <ChevronLeft size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
