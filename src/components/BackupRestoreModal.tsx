import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  FileJson, 
  ShieldAlert,
  HardDrive
} from 'lucide-react';
import { BackupData } from '../types';
import { exportAllData, importAllData, clearAllData } from '../db/indexedDB';
import { formatDate } from '../utils/formatters';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => Promise<void>;
  totalDevicesCount: number;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  totalDevicesCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import flow states
  const [importedPreview, setImportedPreview] = useState<BackupData | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Clear data states
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearInputConfirm, setClearInputConfirm] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle Export Backup
  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const data = await exportAllData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;

      // Filename format: Captain-Mobile-Backup-YYYY-MM-DD.json
      const today = new Date().toISOString().split('T')[0];
      const filename = `Captain-Mobile-Backup-${today}.json`;

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      alert('حدث خطأ أثناء تصدير النسخة الاحتياطية: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger file browser for restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !Array.isArray(parsed.devices) || !Array.isArray(parsed.payments)) {
          throw new Error('الملف المحدد لا يحتوي على بنية بيانات Captain Mobile صالحة');
        }
        setImportedPreview(parsed);
      } catch (err: any) {
        setImportError(err.message || 'فشل في قراءة ملف النسخة الاحتياطية');
        setImportedPreview(null);
      }
    };

    reader.onerror = () => {
      setImportError('حدث خطأ أثناء قراءة الملف من جهازك');
    };

    reader.readAsText(file);
    // Reset file input so same file can be selected again if needed
    e.target.value = '';
  };

  // Confirm and Execute Import
  const handleConfirmImport = async () => {
    if (!importedPreview) return;
    setIsImporting(true);
    setImportError(null);

    try {
      await importAllData(importedPreview);
      await onDataChanged();
      setImportSuccess(true);
      setImportedPreview(null);
      setTimeout(() => setImportSuccess(false), 4000);
    } catch (err: any) {
      setImportError(err.message || 'حدث خطأ أثناء استرجاع البيانات');
    } finally {
      setIsImporting(false);
    }
  };

  // Confirm and Execute Clear All Data
  const handleClearAll = async () => {
    if (clearInputConfirm.trim() !== 'حذف') {
      alert('يرجى كتابة كلمة "حذف" للتأكيد');
      return;
    }

    setIsClearing(true);
    try {
      await clearAllData();
      await onDataChanged();
      setClearSuccess(true);
      setShowClearConfirm(false);
      setClearInputConfirm('');
      setTimeout(() => setClearSuccess(false), 3000);
    } catch (err: any) {
      alert('حدث خطأ أثناء مسح البيانات: ' + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0f0f13]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                النسخ الاحتياطي والاسترجاع
              </h2>
              <p className="text-xs text-zinc-400">
                إدارة ملفات البيانات ونقلها إلى أجهزة أخرى محلياً
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
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Storage Information Banner */}
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-zinc-800 flex items-start gap-3">
            <HardDrive size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-zinc-200">
                التخزين المحلي الآمن (IndexedDB)
              </div>
              <p className="text-zinc-400 leading-relaxed">
                بيانات محلك وأجهزتك محفوظة بالكامل في متصفح هذا الجهاز فقط. لنقل البيانات لهاتف أو كمبيوتر آخر، قم بتحميل ملف Backup ثم استرجاعه على الجهاز الجديد.
              </p>
              <div className="text-amber-400 font-mono text-[11px] pt-1">
                عدد الأجهزة المسجلة حالياً: {totalDevicesCount} جهاز
              </div>
            </div>
          </div>

          {/* Section 1: Export Backup */}
          <div className="space-y-3 p-4 rounded-xl bg-[#0e0e12] border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <Download size={15} className="text-emerald-400" />
                <span>تصدير نسخة احتياطية</span>
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              تنزيل جميع العملاء، الأجهزة، سجلات المدفوعات، والملاحظات في ملف واحد بصيغة JSON على جهازك.
            </p>

            {exportSuccess && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>تم تنزيل النسخة الاحتياطية بنجاح!</span>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/10 transition-all disabled:opacity-50"
            >
              <Download size={16} />
              <span>{isExporting ? 'جاري التصدير...' : 'تحميل نسخة احتياطية'}</span>
            </button>
          </div>

          {/* Section 2: Import Backup */}
          <div className="space-y-3 p-4 rounded-xl bg-[#0e0e12] border border-zinc-800/80">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Upload size={15} className="text-blue-400" />
              <span>استرجاع نسخة احتياطية</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-normal">
              اختر ملف نسخة احتياطية محفوظة سابقاً (بصيغة JSON) لاسترجاع كافة الأجهزة والمدفوعات.
            </p>

            {importSuccess && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>تم استرجاع جميع البيانات بنجاح!</span>
              </div>
            )}

            {importError && (
              <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{importError}</span>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!importedPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border border-zinc-700 transition-colors"
              >
                <Upload size={16} className="text-blue-400" />
                <span>استرجاع نسخة احتياطية</span>
              </button>
            ) : (
              /* Preview & Warning before restore */
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/50 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <FileJson size={16} />
                  <span>معاينة ملف النسخة: {importFileName}</span>
                </div>

                <div className="text-xs text-zinc-300 space-y-1 bg-black/40 p-2.5 rounded-lg border border-zinc-800">
                  <div>تاريخ النسخة: <span className="font-mono text-zinc-100">{formatDate(importedPreview.exportDate)}</span></div>
                  <div>عدد الأجهزة بالملف: <span className="font-bold text-emerald-400 tabular-nums">{importedPreview.devices?.length || 0}</span></div>
                  <div>عدد سجلات المدفوعات: <span className="font-bold text-emerald-400 tabular-nums">{importedPreview.payments?.length || 0}</span></div>
                </div>

                <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    تحذير: هذه العملية قد تستبدل البيانات الحالية. تأكد من وجود نسخة احتياطية قبل المتابعة.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setImportedPreview(null)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isImporting ? 'جاري الاسترجاع...' : 'تأكيد واسترجاع البيانات'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Danger Zone */}
          <div className="space-y-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40">
            <h3 className="text-xs font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert size={15} />
              <span>منطقة الخطر - حذف جميع البيانات</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-normal">
              مسح قاعدة البيانات المحلية بالكامل والبدء من الصفر. لا يمكن التراجع عن هذا الإجراء إلا بوجود نسخة احتياطية.
            </p>

            {clearSuccess && (
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 text-xs">
                تم مسح جميع البيانات بنجاح والبدء من الصفر.
              </div>
            )}

            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-red-200 text-xs font-bold transition-colors cursor-pointer"
              >
                حذف جميع البيانات
              </button>
            ) : (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl space-y-3 animate-fadeIn">
                <p className="text-xs text-red-200 font-bold">
                  هل أنت متأكد تماماً؟ اكتب كلمة "حذف" في المربع أدناه لتأكيد المسح الشامل:
                </p>
                <input
                  type="text"
                  placeholder="اكتب: حذف"
                  value={clearInputConfirm}
                  onChange={(e) => setClearInputConfirm(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-red-800/80 rounded-lg text-sm text-white outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClearConfirm(false);
                      setClearInputConfirm('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                  >
                    تراجع
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isClearing || clearInputConfirm.trim() !== 'حذف'}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
                  >
                    {isClearing ? 'جاري المسح...' : 'تأكيد المسح النهائي'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#0f0f13] flex justify-end">
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
