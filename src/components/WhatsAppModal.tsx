import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { DeviceRecord } from '../types';
import { generateWhatsAppMessage, sanitizeWhatsAppPhone } from '../utils/formatters';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceRecord | null;
  totalPaid: number;
  remaining: number;
  latestPaymentAmount?: number;
}

type TemplateKey = 'receipt' | 'deposit' | 'ready' | 'delivered';

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  device,
  totalPaid,
  remaining,
  latestPaymentAmount,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('receipt');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);

  // Set template based on device status when modal opens
  useEffect(() => {
    if (device) {
      let initialType: TemplateKey = 'receipt';
      if (device.status === 'جاهز للتسليم') initialType = 'ready';
      else if (device.status === 'تم التسليم') initialType = 'delivered';
      else if (totalPaid > 0) initialType = 'deposit';

      setSelectedTemplate(initialType);
      setMessageText(
        generateWhatsAppMessage(
          initialType,
          device,
          totalPaid,
          remaining,
          latestPaymentAmount ?? device.deposit
        )
      );
    }
  }, [device, totalPaid, remaining, latestPaymentAmount, isOpen]);

  if (!isOpen || !device) return null;

  const handleTemplateChange = (type: TemplateKey) => {
    setSelectedTemplate(type);
    setMessageText(
      generateWhatsAppMessage(
        type,
        device,
        totalPaid,
        remaining,
        latestPaymentAmount ?? device.deposit
      )
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = sanitizeWhatsAppPhone(device.countryCode, device.customerPhone);
    const encodedText = encodeURIComponent(messageText);
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const templates: { key: TemplateKey; label: string; desc: string }[] = [
    { key: 'receipt', label: 'استلام الجهاز', desc: 'إشعار بالاستلام والعربون وتكلفة الإصلاح' },
    { key: 'deposit', label: 'دفع العربون / دفعة', desc: 'تأكيد استلام دفعة أو عربون' },
    { key: 'ready', label: 'جاهزية الجهاز', desc: 'إشعار بأن الهاتف جاهز للاستلام بالمحل' },
    { key: 'delivered', label: 'تسليم الجهاز', desc: 'تأكيد التسليم وشكر العميل' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0f0f13]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>إرسال رسالة WhatsApp للعميل</span>
              </h2>
              <p className="text-xs text-zinc-400">
                {device.customerName} ({device.countryCode} {device.customerPhone})
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Template Selectors */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              اختر نموذج الرسالة المجهز:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTemplateChange(t.key)}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    selectedTemplate === t.key
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-sm'
                      : 'bg-[#0a0a0c] border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="text-xs font-bold">{t.label}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                نص الرسالة (يمكنك التعديل قبل الإرسال):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>نسخ النص</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3.5 bg-[#0a0a0c] border border-zinc-800 focus:border-emerald-500 rounded-xl text-zinc-100 text-sm outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Recipient info badge */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-400">
            <span>الرقم المستلم:</span>
            <span className="font-mono text-zinc-200 font-bold" dir="ltr">
              {sanitizeWhatsAppPhone(device.countryCode, device.customerPhone)}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#0f0f13] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 text-sm font-extrabold shadow-lg shadow-emerald-500/10 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Send size={16} />
            <span>إرسال عبر WhatsApp</span>
            <ExternalLink size={12} className="opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
