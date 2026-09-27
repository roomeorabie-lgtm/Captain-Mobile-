import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { DeviceRecord } from '../types';
import { formatCurrency, formatDateTime, OFFICIAL_LOGO_URL } from '../utils/formatters';

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceRecord | null;
  totalPaid: number;
  remaining: number;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  device,
  totalPaid,
  remaining,
}) => {
  if (!isOpen || !device) return null;

  const handlePrint = () => {
    window.print();
  };

  const faultText = device.faultType === 'عطل آخر' ? (device.customFault || 'عطل آخر') : device.faultType;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0f0f13]">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Printer size={18} className="text-amber-400" />
            <span>إيصال استلام وصيانة - Captain Mobile</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer size={14} />
              <span>طباعة الإيصال</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Area */}
        <div id="printable-receipt" className="p-6 bg-white text-zinc-900 printable-card">
          {/* Header with Logo */}
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={OFFICIAL_LOGO_URL}
                alt="Captain Mobile Logo"
                className="w-14 h-14 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-xl font-black text-black tracking-tight">Captain Mobile</h1>
                <p className="text-xs text-zinc-600 font-medium">مركز صيانة أجهزة الموبايل المعتمد</p>
              </div>
            </div>
            <div className="text-left font-mono">
              <div className="text-xs text-zinc-500">رقم الإيصال</div>
              <div className="text-sm font-bold text-black">{device.receiptNumber}</div>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <div>
              <span className="text-zinc-500 block">اسم العميل:</span>
              <span className="font-bold text-zinc-900 text-sm">{device.customerName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">رقم الهاتف:</span>
              <span className="font-bold text-zinc-900 font-mono text-sm" dir="ltr">
                {device.countryCode} {device.customerPhone}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">تاريخ ووقت الاستلام:</span>
              <span className="font-medium text-zinc-800">{formatDateTime(device.receivedAt)}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">حالة الجهاز:</span>
              <span className="font-bold text-zinc-900">{device.status}</span>
            </div>
          </div>

          {/* Device & Fault Details */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden mb-4">
            <div className="bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-800 flex justify-between">
              <span>تفاصيل الجهاز المسلم</span>
              <span>بيان العطل</span>
            </div>
            <div className="p-3 text-xs flex justify-between items-center bg-white">
              <div>
                <span className="font-bold text-sm text-zinc-900 block">{device.deviceName}</span>
                {device.notes && (
                  <span className="text-zinc-500 text-[11px] block mt-0.5">
                    ملاحظات: {device.notes}
                  </span>
                )}
              </div>
              <div className="text-left">
                <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                  {faultText}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-xs text-right">
              <tbody>
                <tr className="border-b border-zinc-200">
                  <td className="p-2.5 text-zinc-600">إجمالي تكلفة الإصلاح الأساسية:</td>
                  <td className="p-2.5 text-left font-bold text-sm text-zinc-900 tabular-nums">
                    {formatCurrency(device.basePrice)}
                  </td>
                </tr>
                <tr className="border-b border-zinc-200 bg-zinc-50/50">
                  <td className="p-2.5 text-zinc-600">إجمالي المبالغ المدفوعة (العربون والمسدد):</td>
                  <td className="p-2.5 text-left font-bold text-sm text-emerald-700 tabular-nums">
                    {formatCurrency(totalPaid)}
                  </td>
                </tr>
                <tr className="bg-amber-50/60 font-bold">
                  <td className="p-2.5 text-zinc-800 text-sm">المتبقي المستحق عند الاستلام:</td>
                  <td className="p-2.5 text-left font-black text-base text-amber-900 tabular-nums">
                    {formatCurrency(remaining)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-zinc-200 pt-3 text-[10px] text-zinc-500 leading-normal space-y-1">
            <p className="font-bold text-zinc-700">شروط الاستلام والضمان:</p>
            <p>1. الاستلام بموجب هذا الإيصال أو إثبات هوية صاحب الجهاز.</p>
            <p>2. الضمان يسري على قطع الغيار المستبدلة والعيوب الفنية الناتجة عن الصيانة فقط.</p>
            <p>3. المحل غير مسؤول عن الأجهزة المتروكة لأكثر من 30 يوماً من تاريخ الإبلاغ بجاهزيتها.</p>
          </div>

          {/* Footer signature */}
          <div className="mt-4 pt-3 border-t border-dashed border-zinc-300 flex justify-between items-center text-xs text-zinc-600">
            <span>توقيع العميل: ..............................</span>
            <span className="font-bold text-zinc-800">Captain Mobile ©</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="no-print p-4 bg-[#0f0f13] border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
