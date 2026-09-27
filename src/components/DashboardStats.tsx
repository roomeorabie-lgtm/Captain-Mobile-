import React from 'react';
import { 
  Smartphone, 
  PackageCheck, 
  Wrench, 
  CheckCircle2, 
  SendHorizontal, 
  Coins, 
  Receipt 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface StatsData {
  totalDevices: number;
  receivedDevices: number;
  inRepairDevices: number;
  readyDevices: number;
  deliveredDevices: number;
  totalPaid: number;
  totalRemaining: number;
}

interface DashboardStatsProps {
  stats: StatsData;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  activeFilter,
  onFilterChange,
}) => {
  const cards = [
    {
      id: 'all',
      title: 'إجمالي الأجهزة',
      value: stats.totalDevices,
      icon: Smartphone,
      accent: 'text-zinc-100',
      borderAccent: 'hover:border-zinc-700',
      activeBg: activeFilter === 'all' ? 'bg-zinc-800/80 border-amber-500/50' : 'bg-[#121215] border-zinc-800/70',
      isClickable: true,
      filterValue: 'all',
    },
    {
      id: 'received',
      title: 'الأجهزة المستلمة',
      value: stats.receivedDevices,
      icon: PackageCheck,
      accent: 'text-blue-400',
      borderAccent: 'hover:border-blue-500/40',
      activeBg: activeFilter === 'تم استلام الجهاز' ? 'bg-blue-950/30 border-blue-500/50' : 'bg-[#121215] border-zinc-800/70',
      isClickable: true,
      filterValue: 'تم استلام الجهاز',
    },
    {
      id: 'repair',
      title: 'قيد الإصلاح',
      value: stats.inRepairDevices,
      icon: Wrench,
      accent: 'text-amber-400',
      borderAccent: 'hover:border-amber-500/40',
      activeBg: activeFilter === 'repair' ? 'bg-amber-950/30 border-amber-500/50' : 'bg-[#121215] border-zinc-800/70',
      isClickable: true,
      filterValue: 'repair',
    },
    {
      id: 'ready',
      title: 'جاهز للتسليم',
      value: stats.readyDevices,
      icon: CheckCircle2,
      accent: 'text-emerald-400',
      borderAccent: 'hover:border-emerald-500/40',
      activeBg: activeFilter === 'جاهز للتسليم' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-[#121215] border-zinc-800/70',
      isClickable: true,
      filterValue: 'جاهز للتسليم',
    },
    {
      id: 'delivered',
      title: 'الأجهزة المسلّمة',
      value: stats.deliveredDevices,
      icon: SendHorizontal,
      accent: 'text-purple-400',
      borderAccent: 'hover:border-purple-500/40',
      activeBg: activeFilter === 'تم التسليم' ? 'bg-purple-950/30 border-purple-500/50' : 'bg-[#121215] border-zinc-800/70',
      isClickable: true,
      filterValue: 'تم التسليم',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Device Count Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onFilterChange(c.filterValue)}
              className={`p-3.5 sm:p-4 rounded-xl border text-right transition-all cursor-pointer ${c.activeBg} ${c.borderAccent} group relative overflow-hidden`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300">
                  {c.title}
                </span>
                <div className={`p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/60 ${c.accent}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black tabular-nums text-zinc-100">
                {c.value}
              </div>
            </button>
          );
        })}
      </div>

      {/* Financial Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Total Paid */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-[#121215] border border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/30 border border-emerald-700/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Coins size={20} />
            </div>
            <div>
              <span className="text-xs font-medium text-emerald-300/80 block">إجمالي المبالغ المدفوعة</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums">
                {formatCurrency(stats.totalPaid)}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">سداد وعرابين</span>
        </div>

        {/* Total Remaining */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-[#121215] border border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-700/40 flex items-center justify-center text-amber-400 shrink-0">
              <Receipt size={20} />
            </div>
            <div>
              <span className="text-xs font-medium text-amber-300/80 block">إجمالي المبالغ المتبقية</span>
              <span className="text-lg sm:text-xl font-black text-amber-400 tabular-nums">
                {formatCurrency(stats.totalRemaining)}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">مستحق التحصيل</span>
        </div>
      </div>
    </div>
  );
};
