import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  User, 
  Phone, 
  Clock, 
  Wrench, 
  MessageSquare, 
  Printer, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  Coins,
  Receipt,
  FileText
} from 'lucide-react';
import { DeviceRecord, DeviceStatus, PaymentRecord } from '../types';
import { formatCurrency, formatDateTime, sanitizeWhatsAppPhone } from '../utils/formatters';
import { getStatusBadgeConfig } from './DeviceCard';

interface DeviceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceRecord | null;
  payments: PaymentRecord[];
  onUpdateStatus: (deviceId: string, newStatus: DeviceStatus) => Promise<void>;
  onAddPayment: (deviceId: string, amount: number, note: string) => Promise<void>;
  onDeletePayment: (paymentId: string) => Promise<void>;
  onEditDevice: (device: DeviceRecord) => void;
  onDeleteDevice: (deviceId: string) => Promise<void>;
  onOpenWhatsApp: (device: DeviceRecord, latestPaymentAmount?: number) => void;
  onOpenPrintReceipt: (device: DeviceRecord) => void;
}

const ALL_STATUSES: { id: DeviceStatus; label: string; desc: string }[] = [
  { id: 'تم استلام الجهاز', label: 'تم استلام الجهاز', desc: 'تم استلام الهاتف من العميل وتسجيله' },
  { id: 'جاري الفحص', label: 'جاري الفحص', desc: 'يقوم الفني بفحص الدوائر والأعطال' },
  { id: 'جاري الإصلاح', label: 'جاري الإصلاح', desc: 'عمليات الصيانة واستبدال القطع جارية' },
  { id: 'جاهز للتسليم', label: 'جاهز للتسليم', desc: 'تم الانتهاء بنجاح والهاتف جاهز للاستلام' },
  { id: 'تم التسليم', label: 'تم التسليم', desc: 'تم تسليم الجهاز للعميل واستلام الحساب' },
];

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  isOpen,
  onClose,
  device,
  payments,
  onUpdateStatus,
  onAddPayment,
  onDeletePayment,
  onEditDevice,
  onDeleteDevice,
  onOpenWhatsApp,
  onOpenPrintReceipt,
}) => {
  // New payment form
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState<number | ''>('');
  const [newPaymentNote, setNewPaymentNote] = useState('');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !device) return null;

  // Financial calculations
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.max(0, device.basePrice - totalPaid);
  const faultText = device.faultType === 'عطل آخر' ? (device.customFault || 'عطل آخر') : device.faultType;
  const currentStatusCfg = getStatusBadgeConfig(device.status);

  const handleStatusChange = async (newStatus: DeviceStatus) => {
    if (newStatus === device.status) return;
    await onUpdateStatus(device.id, newStatus);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    const amount = Number(newPaymentAmount);

    if (!amount || amount <= 0) {
      setPaymentError('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (amount > remaining) {
      setPaymentError('المبلغ المدخل أكبر من المتبقي المستحق');
      return;
    }

    setIsAddingPayment(true);
    try {
      await onAddPayment(
        device.id,
        amount,
        newPaymentNote.trim() || 'سداد دفعة صيانة'
      );
      setNewPaymentAmount('');
      setNewPaymentNote('');
      setShowAddPaymentForm(false);
    } catch (err: any) {
      setPaymentError(err.message || 'حدث خطأ أثناء إضافة الدفعة');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteDevice(device.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0f0f13]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100">{device.deviceName}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {device.receiptNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                العميل: <span className="text-zinc-200 font-semibold">{device.customerName}</span> · تم الاستلام: {formatDateTime(device.receivedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintReceipt(device)}
              title="طباعة إيصال"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Printer size={17} />
            </button>
            <button
              onClick={() => onEditDevice(device)}
              title="تعديل بيانات الجهاز"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Edit3 size={17} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="حذف الجهاز"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 size={17} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Quick Action Toolbar (WhatsApp & Status) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0a0a0c] border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">الحالة الحالية:</span>
              <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${currentStatusCfg.bg}`}>
                {currentStatusCfg.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenWhatsApp(device)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
              >
                <MessageSquare size={16} />
                <span>مراسلة عبر WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Section: Status Progression Changer */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-zinc-300 tracking-wider">
              تغيير حالة الجهاز السريع:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ALL_STATUSES.map((st) => {
                const isActive = device.status === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm'
                        : 'bg-[#0a0a0c] border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{st.label}</span>
                      {isActive && <CheckCircle2 size={14} className="text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{st.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device & Customer Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="p-4 rounded-xl bg-[#0a0a0c] border border-zinc-800 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <User size={14} />
                <span>بيانات العميل</span>
              </h4>
              <div className="text-sm font-semibold text-zinc-200">{device.customerName}</div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Phone size={13} className="text-zinc-500" />
                <span dir="ltr">{device.countryCode} {device.customerPhone}</span>
                <span className="text-zinc-600 font-sans">({device.countryName})</span>
              </div>
            </div>

            {/* Device & Fault Box */}
            <div className="p-4 rounded-xl bg-[#0a0a0c] border border-zinc-800 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Wrench size={14} />
                <span>بيانات العطل والتشخيص</span>
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">عطل الجهاز:</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-300">
                  {faultText}
                </span>
              </div>
              {device.notes && (
                <div className="text-xs text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                  <span className="text-zinc-500 block mb-0.5 font-medium">ملاحظات مسجلة:</span>
                  <span className="text-zinc-300">{device.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Financials & Payments Ledger */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                <Coins size={14} />
                <span>الحسابات وسجل المدفوعات</span>
              </h3>

              {remaining > 0 && !showAddPaymentForm && (
                <button
                  onClick={() => setShowAddPaymentForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>+ إضافة دفعة جديدة</span>
                </button>
              )}
            </div>

            {/* 3-Column Financial Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0a0a0c] border border-zinc-800 text-center">
                <span className="text-xs text-zinc-500 block mb-1">السعر الأساسي</span>
                <span className="text-base sm:text-lg font-black text-zinc-200 tabular-nums">
                  {formatCurrency(device.basePrice)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0a0a0c] border border-emerald-950/50 text-center">
                <span className="text-xs text-emerald-400/80 block mb-1">إجمالي المدفوع</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 tabular-nums">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0a0a0c] border border-amber-950/50 text-center">
                <span className="text-xs text-amber-400/80 block mb-1">المتبقي للتحصيل</span>
                <span className={`text-base sm:text-lg font-black tabular-nums ${remaining > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>

            {/* Add Payment Form (Collapsible) */}
            {showAddPaymentForm && (
              <form onSubmit={handleCreatePayment} className="p-4 rounded-xl bg-zinc-900/60 border border-emerald-800/40 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <PlusCircle size={14} />
                    <span>تسجيل دفعة نقدية جديدة</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentForm(false)}
                    className="text-zinc-500 hover:text-zinc-300 text-xs"
                  >
                    إلغاء
                  </button>
                </div>

                {paymentError && (
                  <div className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-800/50">
                    {paymentError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      قيمة الدفعة (جنيه) <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={remaining}
                      required
                      placeholder={`أقصى مبلغ: ${remaining}`}
                      value={newPaymentAmount}
                      onChange={(e) => setNewPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0a0a0c] border border-zinc-800 rounded-lg text-sm text-emerald-400 font-bold outline-none tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      بيان / طريقة السداد
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: دفعة أثناء الإصلاح، سداد متبقي، فودافون كاش..."
                      value={newPaymentNote}
                      onChange={(e) => setNewPaymentNote(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a0a0c] border border-zinc-800 rounded-lg text-sm text-zinc-200 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentForm(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingPayment}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded-lg cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isAddingPayment ? 'جاري الحفظ...' : 'تأكيد وحفظ الدفعة'}
                  </button>
                </div>
              </form>
            )}

            {/* Payments Table / History */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400">سجل الدفعات التفصيلي:</h4>
              {payments.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500 bg-[#0a0a0c] rounded-xl border border-zinc-800">
                  لا توجد دفعات مسجلة حتى الآن
                </div>
              ) : (
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#0a0a0c]">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-2.5">البيان</th>
                        <th className="p-2.5">قيمة الدفعة</th>
                        <th className="p-2.5">التاريخ والوقت</th>
                        <th className="p-2.5">إجمالي المدفوع</th>
                        <th className="p-2.5">المتبقي</th>
                        <th className="p-2.5 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {payments.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-zinc-900/40">
                          <td className="p-2.5 text-zinc-300 font-medium">
                            {p.note || (idx === 0 ? 'عربون أولي' : `دفعة رقم ${idx + 1}`)}
                          </td>
                          <td className="p-2.5 font-bold text-emerald-400 tabular-nums">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="p-2.5 text-zinc-400 font-mono text-[11px]">
                            {formatDateTime(p.timestamp)}
                          </td>
                          <td className="p-2.5 text-zinc-300 tabular-nums">
                            {formatCurrency(p.totalPaidSoFar)}
                          </td>
                          <td className="p-2.5 text-amber-400 tabular-nums font-semibold">
                            {formatCurrency(p.remainingBalanceSoFar)}
                          </td>
                          <td className="p-2.5 text-center">
                            {payments.length > 1 && idx === payments.length - 1 && (
                              <button
                                onClick={() => onDeletePayment(p.id)}
                                title="حذف هذه الدفعة"
                                className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/90 z-20 flex items-center justify-center p-4">
            <div className="bg-[#16161b] border border-red-800/70 p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/80 mx-auto flex items-center justify-center text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">تأكيد حذف الجهاز؟</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  سيتم حذف بيانات الجهاز ({device.deviceName}) للعميل {device.customerName} وجميع سجلات مدفوعاته نهائياً من قاعدة البيانات المحلية.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'جاري الحذف...' : 'نعم، احذف الجهاز'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
