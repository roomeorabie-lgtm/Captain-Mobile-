import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  User, 
  Phone, 
  Globe, 
  Wrench, 
  Coins, 
  Receipt, 
  FileText, 
  Clock, 
  Check, 
  Search,
  Plus
} from 'lucide-react';
import { DeviceRecord, FaultType, DeviceStatus } from '../types';
import { COUNTRIES, CountryInfo, DEFAULT_COUNTRY } from '../data/countries';
import { PHONE_BRANDS } from '../data/phoneModels';
import { formatCurrency, generateReceiptNumber } from '../utils/formatters';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceData: Omit<DeviceRecord, 'id' | 'receiptNumber' | 'updatedAt'>, initialDeposit: number) => Promise<void>;
  editDevice?: DeviceRecord | null;
  onUpdate?: (deviceData: DeviceRecord) => Promise<void>;
}

const FAULT_OPTIONS: { id: FaultType; label: string }[] = [
  { id: 'شاشة', label: 'شاشة' },
  { id: 'سوكت', label: 'سوكت شحن' },
  { id: 'بوردة', label: 'صيانة بوردة' },
  { id: 'فلاتة', label: 'فلاتة' },
  { id: 'IC', label: 'آي سي (IC)' },
  { id: 'عطل آخر', label: 'عطل آخر (تحديد يدوي)' },
];

export const DeviceModal: React.FC<DeviceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editDevice,
  onUpdate,
}) => {
  const isEditing = Boolean(editDevice);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(DEFAULT_COUNTRY);
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Device Model Selection State
  const [selectedBrand, setSelectedBrand] = useState<string>(PHONE_BRANDS[0].brand);
  const [deviceName, setDeviceName] = useState('');
  const [customDeviceInput, setCustomDeviceInput] = useState('');
  const [isCustomDevice, setIsCustomDevice] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');

  // Fault State
  const [faultType, setFaultType] = useState<FaultType>('شاشة');
  const [customFault, setCustomFault] = useState('');

  // Financial State
  const [basePrice, setBasePrice] = useState<number | ''>('');
  const [deposit, setDeposit] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<DeviceStatus>('تم استلام الجهاز');
  const [receivedAt, setReceivedAt] = useState<string>(new Date().toISOString());

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (editDevice) {
      setCustomerName(editDevice.customerName);
      const country = COUNTRIES.find((c) => c.dialCode === editDevice.countryCode) || DEFAULT_COUNTRY;
      setSelectedCountry(country);
      setCustomerPhone(editDevice.customerPhone);
      setDeviceName(editDevice.deviceName);
      setIsCustomDevice(true);
      setCustomDeviceInput(editDevice.deviceName);
      setFaultType(editDevice.faultType);
      setCustomFault(editDevice.customFault || '');
      setBasePrice(editDevice.basePrice);
      setDeposit(editDevice.deposit);
      setNotes(editDevice.notes || '');
      setStatus(editDevice.status);
      setReceivedAt(editDevice.receivedAt);
    } else {
      setCustomerName('');
      setSelectedCountry(DEFAULT_COUNTRY);
      setCustomerPhone('');
      setSelectedBrand(PHONE_BRANDS[0].brand);
      setDeviceName(PHONE_BRANDS[0].models[0]);
      setIsCustomDevice(false);
      setCustomDeviceInput('');
      setFaultType('شاشة');
      setCustomFault('');
      setBasePrice('');
      setDeposit('');
      setNotes('');
      setStatus('تم استلام الجهاز');
      setReceivedAt(new Date().toISOString());
    }
    setFormError(null);
  }, [editDevice, isOpen]);

  if (!isOpen) return null;

  // Calculate remaining
  const numericBasePrice = Number(basePrice) || 0;
  const numericDeposit = Number(deposit) || 0;
  const remaining = Math.max(0, numericBasePrice - numericDeposit);

  // Filtered countries
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.includes(countrySearch) ||
      c.nameEn.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch)
  );

  // Active brand models
  const currentBrandModels = PHONE_BRANDS.find((b) => b.brand === selectedBrand)?.models || [];
  const filteredModels = currentBrandModels.filter((m) =>
    m.toLowerCase().includes(phoneSearchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setFormError('يرجى إدخال اسم العميل');
      return;
    }

    const trimmedPhone = customerPhone.trim();
    if (!trimmedPhone) {
      setFormError('يرجى إدخال رقم الهاتف');
      return;
    }

    const finalDeviceName = isCustomDevice ? customDeviceInput.trim() : deviceName.trim();
    if (!finalDeviceName) {
      setFormError('يرجى تحديد أو كتابة موديل الجهاز');
      return;
    }

    if (numericBasePrice <= 0) {
      setFormError('يرجى إدخال تكلفة الإصلاح الأساسية بشكل صحيح');
      return;
    }

    if (numericDeposit > numericBasePrice) {
      setFormError('العربون لا يمكن أن يكون أكبر من إجمالي تكلفة الإصلاح');
      return;
    }

    if (faultType === 'عطل آخر' && !customFault.trim()) {
      setFormError('يرجى كتابة تفاصيل العطل الآخر');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && editDevice && onUpdate) {
        await onUpdate({
          ...editDevice,
          customerName: trimmedName,
          customerPhone: trimmedPhone,
          countryCode: selectedCountry.dialCode,
          countryName: selectedCountry.name,
          deviceName: finalDeviceName,
          faultType,
          customFault: faultType === 'عطل آخر' ? customFault.trim() : undefined,
          basePrice: numericBasePrice,
          deposit: numericDeposit,
          notes: notes.trim(),
          status,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await onSave(
          {
            customerName: trimmedName,
            customerPhone: trimmedPhone,
            countryCode: selectedCountry.dialCode,
            countryName: selectedCountry.name,
            deviceName: finalDeviceName,
            faultType,
            customFault: faultType === 'عطل آخر' ? customFault.trim() : undefined,
            basePrice: numericBasePrice,
            deposit: numericDeposit,
            notes: notes.trim(),
            status: 'تم استلام الجهاز',
            receivedAt: receivedAt || new Date().toISOString(),
          },
          numericDeposit
        );
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ الجهاز');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0f0f13]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                {isEditing ? 'تعديل بيانات الجهاز' : 'إضافة جهاز عميل جديد'}
              </h2>
              <p className="text-xs text-zinc-400">
                {isEditing ? 'تعديل تفاصيل العميل وتكلفة الصيانة' : 'تسجيل استلام هاتف جديد وإصدار كارت صيانة'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs sm:text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <User size={14} />
              <span>بيانات العميل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  اسم العميل <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمود"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 focus:border-amber-500 rounded-xl text-zinc-100 text-sm outline-none placeholder-zinc-600 transition-colors"
                />
              </div>

              {/* Phone with Country Picker */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  رقم الهاتف مع الدولة <span className="text-amber-500">*</span>
                </label>
                <div className="flex gap-2">
                  {/* Country Selector Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="h-full px-2.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-200 text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <span className="text-base">{selectedCountry.flag}</span>
                      <span className="font-mono text-zinc-400" dir="ltr">{selectedCountry.dialCode}</span>
                    </button>

                    {countryDropdownOpen && (
                      <div className="absolute top-full mt-1.5 right-0 w-64 bg-[#16161b] border border-zinc-700 rounded-xl shadow-2xl p-2 z-50">
                        <div className="relative mb-2">
                          <input
                            type="text"
                            placeholder="بحث عن دولة..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 outline-none"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setCountryDropdownOpen(false);
                              }}
                              className="w-full px-2.5 py-1.5 text-right text-xs rounded-lg hover:bg-zinc-800 flex items-center justify-between text-zinc-200"
                            >
                              <span className="flex items-center gap-2">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              <span className="font-mono text-zinc-500 text-[11px]" dir="ltr">
                                {c.dialCode}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 01012345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 focus:border-amber-500 rounded-xl text-zinc-100 text-sm outline-none placeholder-zinc-600 transition-colors text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Device Model */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                <Smartphone size={14} />
                <span>اسم وموديل الجهاز</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomDevice(!isCustomDevice)}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                {isCustomDevice ? 'اختيار من القائمة الجاهزة' : 'كتابة اسم مخصص يدوياً'}
              </button>
            </div>

            {isCustomDevice ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  اسم وموديل الجهاز يدويًا <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: iPhone 15 Pro Max أو Galaxy S24 Ultra"
                  value={customDeviceInput}
                  onChange={(e) => setCustomDeviceInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 focus:border-amber-500 rounded-xl text-zinc-100 text-sm outline-none placeholder-zinc-600 transition-colors"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Brand Selector Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                  {PHONE_BRANDS.map((b) => (
                    <button
                      key={b.brand}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(b.brand);
                        setDeviceName(b.models[0]);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedBrand === b.brand
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'bg-[#0a0a0c] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {b.brand}
                    </button>
                  ))}
                </div>

                {/* Models Grid & Search */}
                <div className="bg-[#0a0a0c] border border-zinc-800/80 rounded-xl p-3">
                  <div className="relative mb-2">
                    <Search size={14} className="absolute right-3 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder={`بحث في موديلات ${selectedBrand}...`}
                      value={phoneSearchQuery}
                      onChange={(e) => setPhoneSearchQuery(e.target.value)}
                      className="w-full pr-8 pl-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                    {filteredModels.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setDeviceName(model)}
                        className={`px-2.5 py-2 rounded-lg text-xs text-right truncate transition-all cursor-pointer ${
                          deviceName === model
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                            : 'bg-zinc-900/50 hover:bg-zinc-800/60 text-zinc-300 border border-zinc-800/50'
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">الجهاز المحدد:</span>
                    <span className="font-bold text-amber-400 truncate max-w-[280px]">
                      {deviceName || 'لم يتم التحديد'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Fault Type */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/80">
            <h3 className="text-xs font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Wrench size={14} />
              <span>عطل الجهاز</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FAULT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFaultType(f.id)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                    faultType === f.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#0a0a0c] border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {faultType === 'عطل آخر' && (
              <div className="mt-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  اكتب العطل يدويًا بالتفصيل <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عطل سماعة المكالمات، كاميرا خلفية تهتز، عطل بصمة..."
                  value={customFault}
                  onChange={(e) => setCustomFault(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 focus:border-amber-500 rounded-xl text-zinc-100 text-sm outline-none placeholder-zinc-600 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Section 4: Financials & Costs */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/80">
            <h3 className="text-xs font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Coins size={14} />
              <span>التكلفة والحسابات (الجنيه المصري)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Base Price */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  السعر الأساسي / الإجمالي <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 focus:border-amber-500 rounded-xl text-zinc-100 text-sm font-bold outline-none tabular-nums"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-medium">
                    ج.م
                  </span>
                </div>
              </div>

              {/* Deposit */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  العربون المدفوع
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 focus:border-emerald-500 rounded-xl text-emerald-400 text-sm font-bold outline-none tabular-nums"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-medium">
                    ج.م
                  </span>
                </div>
              </div>

              {/* Calculated Remaining */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  المتبقي (تلقائيًا)
                </label>
                <div className="px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800/80 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-extrabold text-amber-400 tabular-nums">
                    {formatCurrency(remaining)}
                  </span>
                  <span className="text-[11px] text-zinc-500">مستحق</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Status (If editing) & Notes */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/80">
            {isEditing && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  حالة الجهاز الحالية
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DeviceStatus)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 focus:border-amber-500 rounded-xl text-zinc-100 text-sm outline-none cursor-pointer"
                >
                  <option value="تم استلام الجهاز">تم استلام الجهاز</option>
                  <option value="جاري الفحص">جاري الفحص</option>
                  <option value="جاري الإصلاح">جاري الإصلاح</option>
                  <option value="جاهز للتسليم">جاهز للتسليم</option>
                  <option value="تم التسليم">تم التسليم</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                ملاحظات إضافية (كلمة سر الجهاز، ملحقات تم استلامها، إلخ)
              </label>
              <textarea
                rows={2}
                placeholder="مثال: الجهاز معه جراب وشاحن، الباسورد: 1234، توجد خدوش سابقة على الظهر..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-zinc-800 focus:border-amber-500 rounded-xl text-zinc-100 text-sm outline-none placeholder-zinc-600 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-sm font-extrabold shadow-lg shadow-amber-500/10 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : isEditing ? 'تحديث البيانات' : 'حفظ واستلام الجهاز'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
