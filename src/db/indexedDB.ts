import { DeviceRecord, PaymentRecord, BackupData } from '../types';

const DB_NAME = 'CaptainMobileDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('devices')) {
        const deviceStore = db.createObjectStore('devices', { keyPath: 'id' });
        deviceStore.createIndex('customerPhone', 'customerPhone', { unique: false });
        deviceStore.createIndex('status', 'status', { unique: false });
        deviceStore.createIndex('receivedAt', 'receivedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('payments')) {
        const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
        paymentStore.createIndex('deviceId', 'deviceId', { unique: false });
        paymentStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// ---------------- Devices Operations ----------------

export async function getAllDevices(): Promise<DeviceRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['devices'], 'readonly');
    const store = transaction.objectStore('devices');
    const request = store.getAll();

    request.onsuccess = () => {
      const result = (request.result || []) as DeviceRecord[];
      // Sort newest first
      result.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
      resolve(result);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getDeviceById(id: string): Promise<DeviceRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['devices'], 'readonly');
    const store = transaction.objectStore('devices');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as DeviceRecord | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDevice(device: DeviceRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['devices'], 'readwrite');
    const store = transaction.objectStore('devices');
    const request = store.put(device);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDevice(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['devices', 'payments'], 'readwrite');
    const deviceStore = transaction.objectStore('devices');
    const paymentStore = transaction.objectStore('payments');

    deviceStore.delete(id);

    // Delete associated payments
    const paymentIndex = paymentStore.index('deviceId');
    const paymentReq = paymentIndex.getAllKeys(id);
    paymentReq.onsuccess = () => {
      const keys = paymentReq.result;
      keys.forEach((key) => paymentStore.delete(key));
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// ---------------- Payments Operations ----------------

export async function getPaymentsForDevice(deviceId: string): Promise<PaymentRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readonly');
    const store = transaction.objectStore('payments');
    const index = store.index('deviceId');
    const request = index.getAll(deviceId);

    request.onsuccess = () => {
      const result = (request.result || []) as PaymentRecord[];
      result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      resolve(result);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readonly');
    const store = transaction.objectStore('payments');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result || []) as PaymentRecord[]);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function addPayment(payment: PaymentRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readwrite');
    const store = transaction.objectStore('payments');
    const request = store.put(payment);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deletePayment(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['payments'], 'readwrite');
    const store = transaction.objectStore('payments');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ---------------- Backup & Restore Operations ----------------

export async function exportAllData(): Promise<BackupData> {
  const [devices, payments] = await Promise.all([
    getAllDevices(),
    getAllPayments(),
  ]);

  return {
    appName: 'Captain Mobile',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    devices,
    payments,
  };
}

export async function importAllData(data: BackupData): Promise<void> {
  if (!data || !Array.isArray(data.devices) || !Array.isArray(data.payments)) {
    throw new Error('الملف المحدد غير صالح أو لا يحتوي على بنية بيانات Captain Mobile الصحيحة');
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['devices', 'payments'], 'readwrite');
    const deviceStore = transaction.objectStore('devices');
    const paymentStore = transaction.objectStore('payments');

    // Clear existing
    deviceStore.clear();
    paymentStore.clear();

    // Insert imported devices
    for (const device of data.devices) {
      deviceStore.put(device);
    }

    // Insert imported payments
    for (const payment of data.payments) {
      paymentStore.put(payment);
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['devices', 'payments', 'settings'], 'readwrite');
    transaction.objectStore('devices').clear();
    transaction.objectStore('payments').clear();
    transaction.objectStore('settings').clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
