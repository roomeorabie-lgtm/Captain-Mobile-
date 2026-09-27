import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Smartphone, 
  Plus, 
  Filter, 
  RefreshCw, 
  Wrench, 
  PackageOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DeviceRecord, DeviceStatus, PaymentRecord } from './types';
import { 
  getAllDevices, 
  getAllPayments, 
  saveDevice, 
  deleteDevice, 
  addPayment, 
  deletePayment 
} from './db/indexedDB';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { DeviceCard } from './components/DeviceCard';
import { DeviceModal } from './components/DeviceModal';
import { DeviceDetailsModal } from './components/DeviceDetailsModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { generateReceiptNumber, OFFICIAL_LOGO_URL } from './utils/formatters';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('captain_mobile_auth') === 'authenticated';
  });

  // Data State (Starts 100% empty, zero mock data)
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<DeviceRecord | null>(null);

  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [whatsAppDevice, setWhatsAppDevice] = useState<DeviceRecord | null>(null);
  const [whatsAppLatestPayment, setWhatsAppLatestPayment] = useState<number | undefined>(undefined);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const [printDevice, setPrintDevice] = useState<DeviceRecord | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Load data from IndexedDB
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [fetchedDevices, fetchedPayments] = await Promise.all([
        getAllDevices(),
        getAllPayments(),
      ]);
      setDevices(fetchedDevices);
      setPayments(fetchedPayments);

      // If a device was currently open in details, update its state reference
      if (selectedDevice) {
        const updated = fetchedDevices.find((d) => d.id === selectedDevice.id);
        if (updated) setSelectedDevice(updated);
      }
    } catch (err) {
      console.error('Failed to load local database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('captain_mobile_auth');
    setIsAuthenticated(false);
  };

  // Pre-calculate payments and remaining balances per device
  const devicePaymentsMap = useMemo(() => {
    const map = new Map<string, { totalPaid: number; remaining: number; payments: PaymentRecord[] }>();
    
    // Group payments by device
    const grouped = new Map<string, PaymentRecord[]>();
    for (const p of payments) {
      const list = grouped.get(p.deviceId) || [];
      list.push(p);
      grouped.set(p.deviceId, list);
    }

    for (const device of devices) {
      const devicePayList = grouped.get(device.id) || [];
      // Sort chronologically
      devicePayList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const totalPaid = devicePayList.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(0, device.basePrice - totalPaid);
      map.set(device.id, { totalPaid, remaining, payments: devicePayList });
    }

    return map;
  }, [devices, payments]);

  // Calculate high-level stats
  const stats = useMemo(() => {
    let receivedCount = 0;
    let inRepairCount = 0;
    let readyCount = 0;
    let deliveredCount = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    for (const device of devices) {
      if (device.status === 'تم استلام الجهاز') receivedCount++;
      else if (device.status === 'جاري الفحص' || device.status === 'جاري الإصلاح') inRepairCount++;
      else if (device.status === 'جاهز للتسليم') readyCount++;
      else if (device.status === 'تم التسليم') deliveredCount++;

      const fin = devicePaymentsMap.get(device.id);
      if (fin) {
        totalPaid += fin.totalPaid;
        totalRemaining += fin.remaining;
      } else {
        totalPaid += device.deposit;
        totalRemaining += Math.max(0, device.basePrice - device.deposit);
      }
    }

    return {
      totalDevices: devices.length,
      receivedDevices: receivedCount,
      inRepairDevices: inRepairCount,
      readyDevices: readyCount,
      deliveredDevices: deliveredCount,
      totalPaid,
      totalRemaining,
    };
  }, [devices, devicePaymentsMap]);

  // Real-time search & status filtering
  const filteredDevices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return devices.filter((device) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'repair') {
          if (device.status !== 'جاري الفحص' && device.status !== 'جاري الإصلاح') return false;
        } else if (device.status !== statusFilter) {
          return false;
        }
      }

      // Search query filter (customerName, customerPhone, deviceName, receiptNumber)
      if (query) {
        const matchesName = device.customerName.toLowerCase().includes(query);
        const matchesPhone = device.customerPhone.includes(query) || (device.countryCode + device.customerPhone).includes(query);
        const matchesDevice = device.deviceName.toLowerCase().includes(query);
        const matchesReceipt = device.receiptNumber.toLowerCase().includes(query);
        return matchesName || matchesPhone || matchesDevice || matchesReceipt;
      }

      return true;
    });
  }, [devices, searchQuery, statusFilter]);

  // Save new device
  const handleSaveDevice = async (
    deviceData: Omit<DeviceRecord, 'id' | 'receiptNumber' | 'updatedAt'>,
    initialDeposit: number
  ) => {
    const newId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const receiptNumber = generateReceiptNumber();
    const timestamp = new Date().toISOString();

    const newDevice: DeviceRecord = {
      ...deviceData,
      id: newId,
      receiptNumber,
      updatedAt: timestamp,
    };

    // Save device to IndexedDB
    await saveDevice(newDevice);

    // If an initial deposit was entered, create an initial payment record
    if (initialDeposit > 0) {
      const initialPayment: PaymentRecord = {
        id: 'pay_' + Date.now(),
        deviceId: newId,
        amount: initialDeposit,
        note: 'عربون أولي عند الاستلام',
        timestamp: newDevice.receivedAt || timestamp,
        totalPaidSoFar: initialDeposit,
        remainingBalanceSoFar: Math.max(0, newDevice.basePrice - initialDeposit),
      };
      await addPayment(initialPayment);
    }

    await refreshData();
  };

  // Update existing device
  const handleUpdateDevice = async (updatedDevice: DeviceRecord) => {
    await saveDevice(updatedDevice);
    await refreshData();
    if (selectedDevice && selectedDevice.id === updatedDevice.id) {
      setSelectedDevice(updatedDevice);
    }
  };

  // Quick Status changer
  const handleUpdateStatus = async (deviceId: string, newStatus: DeviceStatus) => {
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev) return;

    const updated: DeviceRecord = {
      ...dev,
      status: newStatus,
      deliveredAt: newStatus === 'تم التسليم' ? new Date().toISOString() : dev.deliveredAt,
      updatedAt: new Date().toISOString(),
    };

    await saveDevice(updated);
    await refreshData();
    if (selectedDevice && selectedDevice.id === deviceId) {
      setSelectedDevice(updated);
    }
  };

  // Add subsequent payment
  const handleAddPayment = async (deviceId: string, amount: number, note: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev) return;

    const fin = devicePaymentsMap.get(deviceId) || { totalPaid: 0, remaining: dev.basePrice, payments: [] };
    const newTotalPaid = fin.totalPaid + amount;
    const newRemaining = Math.max(0, dev.basePrice - newTotalPaid);

    const newPayment: PaymentRecord = {
      id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      deviceId,
      amount,
      note,
      timestamp: new Date().toISOString(),
      totalPaidSoFar: newTotalPaid,
      remainingBalanceSoFar: newRemaining,
    };

    await addPayment(newPayment);
    await refreshData();

    // Offer quick WhatsApp receipt for this payment
    setWhatsAppDevice(dev);
    setWhatsAppLatestPayment(amount);
    setIsWhatsAppModalOpen(true);
  };

  // Delete payment
  const handleDeletePayment = async (paymentId: string) => {
    await deletePayment(paymentId);
    await refreshData();
  };

  // Delete device
  const handleDeleteDevice = async (deviceId: string) => {
    await deleteDevice(deviceId);
    await refreshData();
    if (selectedDevice && selectedDevice.id === deviceId) {
      setSelectedDevice(null);
      setIsDetailsModalOpen(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = (device: DeviceRecord) => {
    setSelectedDevice(device);
    setIsDetailsModalOpen(true);
  };

  // Open WhatsApp Modal
  const handleOpenWhatsApp = (device: DeviceRecord, latestAmount?: number) => {
    setWhatsAppDevice(device);
    setWhatsAppLatestPayment(latestAmount);
    setIsWhatsAppModalOpen(true);
  };

  // Open Print Modal
  const handleOpenPrint = (device: DeviceRecord) => {
    setPrintDevice(device);
    setIsPrintModalOpen(true);
  };

  // If unauthenticated, show luxury login screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Active device payments for details view
  const activeDeviceFin = selectedDevice
    ? devicePaymentsMap.get(selectedDevice.id) || { totalPaid: selectedDevice.deposit, remaining: Math.max(0, selectedDevice.basePrice - selectedDevice.deposit), payments: [] }
    : { totalPaid: 0, remaining: 0, payments: [] };

  const printDeviceFin = printDevice
    ? devicePaymentsMap.get(printDevice.id) || { totalPaid: printDevice.deposit, remaining: Math.max(0, printDevice.basePrice - printDevice.deposit), payments: [] }
    : { totalPaid: 0, remaining: 0, payments: [] };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased selection:bg-amber-500/20 selection:text-amber-400">
      {/* Header Bar */}
      <Header
        onOpenAddModal={() => {
          setEditDevice(null);
          setIsAddModalOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onLogout={handleLogout}
        totalDevicesCount={devices.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dashboard Statistics & Counters */}
        <DashboardStats
          stats={stats}
          activeFilter={statusFilter}
          onFilterChange={(f) => setStatusFilter(f)}
        />

        {/* Search, Status Tabs & Controls */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Real-time Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث فوري باسم العميل، رقم الهاتف، اسم الجهاز، أو رقم الإيصال..."
                className="w-full pr-10 pl-4 py-2.5 bg-[#121215] border border-zinc-800 focus:border-amber-500/80 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 hover:text-zinc-300 text-xs font-mono"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Quick Add Button on mobile/tablet */}
            <button
              onClick={() => {
                setEditDevice(null);
                setIsAddModalOpen(true);
              }}
              className="sm:hidden px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Plus size={18} />
              <span>+ إضافة جهاز عميل</span>
            </button>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-500 text-xs px-1 flex items-center gap-1 shrink-0">
              <Filter size={12} />
              <span>الحالة:</span>
            </span>

            {[
              { id: 'all', label: 'الكل' },
              { id: 'تم استلام الجهاز', label: 'تم الاستلام' },
              { id: 'repair', label: 'قيد الفحص والإصلاح' },
              { id: 'جاهز للتسليم', label: 'جاهز للتسليم' },
              { id: 'تم التسليم', label: 'تم التسليم' },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer font-medium ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                      : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-[11px] text-amber-400/90 hover:underline px-2 py-1 shrink-0 mr-auto"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Devices Cards Section */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-zinc-400">جاري تحميل بيانات الأجهزة المحلية...</p>
          </div>
        ) : devices.length === 0 ? (
          /* Zero Data Clean Empty State */
          <div className="py-16 sm:py-24 px-4 text-center rounded-2xl bg-[#121215]/60 border border-zinc-800/80 flex flex-col items-center justify-center max-w-2xl mx-auto my-4">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-3 mb-4 shadow-inner">
              <img
                src={OFFICIAL_LOGO_URL}
                alt="Captain Mobile"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,190,0,0.15)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-zinc-100 mb-2">
              مرحباً بك في Captain Mobile
            </h3>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-6 font-medium">
              لا توجد أجهزة مسجلة حالياً. ابدأ الآن بالضغط على الزر أدناه لتسجيل أول جهاز عميل واستلامه للصيانة.
            </p>
            <button
              onClick={() => {
                setEditDevice(null);
                setIsAddModalOpen(true);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/10 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>+ إضافة جهاز عميل جديد</span>
            </button>
          </div>
        ) : filteredDevices.length === 0 ? (
          /* Filter / Search yielded no results */
          <div className="py-14 text-center rounded-xl bg-[#121215]/50 border border-zinc-800/80 p-6">
            <AlertCircle size={32} className="mx-auto text-zinc-600 mb-2" />
            <h4 className="text-base font-bold text-zinc-300 mb-1">لم يتم العثور على أجهزة مطابقة</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              لا توجد أجهزة تتطابق مع بحثك: "{searchQuery}". حاول تغيير كلمة البحث أو إعادة ضبط الفلاتر.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 cursor-pointer"
            >
              عرض جميع الأجهزة
            </button>
          </div>
        ) : (
          /* Grid of Customer Device Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map((device) => {
              const fin = devicePaymentsMap.get(device.id) || {
                totalPaid: device.deposit,
                remaining: Math.max(0, device.basePrice - device.deposit),
                payments: [],
              };

              return (
                <DeviceCard
                  key={device.id}
                  device={device}
                  totalPaid={fin.totalPaid}
                  remaining={fin.remaining}
                  onClick={() => handleOpenDetails(device)}
                  onQuickWhatsApp={(e) => {
                    e.stopPropagation();
                    handleOpenWhatsApp(device);
                  }}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {/* 1. Add / Edit Device Modal */}
      <DeviceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditDevice(null);
        }}
        onSave={handleSaveDevice}
        editDevice={editDevice}
        onUpdate={handleUpdateDevice}
      />

      {/* 2. Device Details, Payments Ledger & Status Progression Modal */}
      <DeviceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        device={selectedDevice}
        payments={activeDeviceFin.payments}
        onUpdateStatus={handleUpdateStatus}
        onAddPayment={handleAddPayment}
        onDeletePayment={handleDeletePayment}
        onEditDevice={(dev) => {
          setEditDevice(dev);
          setIsDetailsModalOpen(false);
          setIsAddModalOpen(true);
        }}
        onDeleteDevice={handleDeleteDevice}
        onOpenWhatsApp={(dev, latestAmount) => handleOpenWhatsApp(dev, latestAmount)}
        onOpenPrintReceipt={(dev) => handleOpenPrint(dev)}
      />

      {/* 3. WhatsApp Messaging Center Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        device={whatsAppDevice}
        totalPaid={
          whatsAppDevice
            ? (devicePaymentsMap.get(whatsAppDevice.id)?.totalPaid ?? whatsAppDevice.deposit)
            : 0
        }
        remaining={
          whatsAppDevice
            ? (devicePaymentsMap.get(whatsAppDevice.id)?.remaining ?? Math.max(0, whatsAppDevice.basePrice - whatsAppDevice.deposit))
            : 0
        }
        latestPaymentAmount={whatsAppLatestPayment}
      />

      {/* 4. Customer Printable Receipt / Invoice Modal */}
      <ReceiptPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        device={printDevice}
        totalPaid={printDeviceFin.totalPaid}
        remaining={printDeviceFin.remaining}
      />

      {/* 5. Backup & Restore Management Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={refreshData}
        totalDevicesCount={devices.length}
      />
    </div>
  );
}
