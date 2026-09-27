import React from 'react';
import { Plus, Database, LogOut, Smartphone } from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../utils/formatters';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  onLogout: () => void;
  totalDevicesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenBackupModal,
  onLogout,
  totalDevicesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 shadow-inner shrink-0">
            <img
              src={OFFICIAL_LOGO_URL}
              alt="Captain Mobile"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(255,190,0,0.2)]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-100">
                Captain Mobile
              </span>
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 font-mono">
                صيانة واحتراف
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden xs:block">
              نظام إدارة استلام وتسليم الهواتف
            </p>
          </div>
        </div>

        {/* Action Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add Device Primary Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/10 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="font-extrabold">+ إضافة جهاز عميل</span>
          </button>

          {/* Backup & Restore Button */}
          <button
            onClick={onOpenBackupModal}
            title="النسخ الاحتياطي والاسترجاع"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            <Database size={16} className="text-amber-500/90" />
            <span className="hidden md:inline">النسخ الاحتياطي</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="تسجيل الخروج"
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/50 text-zinc-400 hover:text-red-300 transition-all cursor-pointer"
            aria-label="تسجيل الخروج"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
