'use client';

import { useState, useRef } from 'react';
import { Trade } from '@/hooks/useLocalStorage';
import { 
  exportTradesToJSON, 
  exportTradesToCSV, 
  importTradesFromJSON,
  createBackup,
  restoreFromBackup 
} from '@/utils/tradeUtils';
import { formatCurrency } from '@/utils/formatCurrency';

interface DataManagerProps {
  trades: Trade[];
  capital: number;
  onImportTrades: (trades: Trade[]) => void;
  onRestoreBackup: (data: { trades: Trade[], capital: number }) => void;
}

export default function DataManager({ trades, capital, onImportTrades, onRestoreBackup }: DataManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    exportTradesToJSON(trades);
  };

  const handleExportCSV = () => {
    exportTradesToCSV(trades);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedTrades = await importTradesFromJSON(file);
      onImportTrades(importedTrades);
      alert(`นำเข้าข้อมูลสำเร็จ! จำนวน ${importedTrades.length} รายการ`);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + (error as Error).message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateBackup = () => {
    createBackup(trades, capital);
    alert('สร้าง backup สำเร็จ!');
  };

  const handleRestoreBackup = () => {
    const backup = restoreFromBackup();
    if (backup) {
      if (window.confirm('คุณต้องการกู้คืนข้อมูลจาก backup หรือไม่? ข้อมูลปัจจุบันจะถูกแทนที่')) {
        onRestoreBackup(backup);
        alert('กู้คืนข้อมูลสำเร็จ!');
      }
    } else {
      alert('ไม่พบข้อมูล backup');
    }
  };

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">จัดการข้อมูล</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
        >
          {isOpen ? 'ซ่อน' : 'แสดง'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Export Section */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-300">ส่งออกข้อมูล</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportJSON}
                disabled={trades.length === 0}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                ส่งออก JSON
              </button>
              <button
                onClick={handleExportCSV}
                disabled={trades.length === 0}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                ส่งออก CSV
              </button>
            </div>
            {trades.length === 0 && (
              <p className="mt-2 text-sm text-gray-400">ยังไม่มีข้อมูลการเทรดที่จะส่งออก</p>
            )}
          </div>

          {/* Import Section */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-300">นำเข้าข้อมูล</h3>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {importing ? 'กำลังนำเข้า...' : 'เลือกไฟล์ JSON'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">รองรับเฉพาะไฟล์ JSON ที่ส่งออกจากระบบนี้</p>
          </div>

          {/* Backup Section */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-300">สำรองข้อมูล</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCreateBackup}
                className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75"
              >
                สร้าง Backup
              </button>
              <button
                onClick={handleRestoreBackup}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
              >
                กู้คืนจาก Backup
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">Backup จะถูกเก็บไว้ใน Local Storage ของเบราว์เซอร์</p>
          </div>

          {/* Statistics */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h3 className="mb-3 text-lg font-semibold text-gray-300">สถิติข้อมูล</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-400">การเทรดทั้งหมด</p>
                <p className="text-xl font-bold text-blue-400">{trades.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">ขนาดข้อมูล</p>
                <p className="text-xl font-bold text-gray-300">
                  {(JSON.stringify(trades).length / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">เงินทุนปัจจุบัน</p>
                <p className="text-xl font-bold text-yellow-400">
                  {formatCurrency(capital)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">อัปเดตล่าสุด</p>
                <p className="text-sm text-gray-300">
                  {trades.length > 0 
                    ? new Date(trades[trades.length - 1].createdAt || '').toLocaleDateString('th-TH')
                    : '-'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 