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
    <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">จัดการข้อมูล</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 w-full sm:w-auto"
        >
          {isOpen ? 'ซ่อน' : 'แสดง'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Export Section */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-300">ส่งออกข้อมูล</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                disabled={trades.length === 0}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                📄 ส่งออก JSON
              </button>
              <button
                onClick={handleExportCSV}
                disabled={trades.length === 0}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                📊 ส่งออก CSV
              </button>
            </div>
            {trades.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">ต้องมีข้อมูลการเทรดก่อนจึงจะส่งออกได้</p>
            )}
          </div>

          {/* Import Section */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-300">นำเข้าข้อมูล</h3>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:disabled:bg-gray-600 file:cursor-pointer file:disabled:cursor-not-allowed border border-gray-600 bg-gray-700 rounded-lg"
              />
              {importing && (
                <div className="flex items-center gap-2 text-sm text-yellow-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                  กำลังนำเข้าข้อมูล...
                </div>
              )}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-sm">⚠️</span>
                  <div className="text-xs sm:text-sm text-yellow-200">
                    <p className="font-semibold mb-1">คำเตือน:</p>
                    <p>การนำเข้าข้อมูลจะแทนที่ข้อมูลปัจจุบันทั้งหมด กรุณาสำรองข้อมูลก่อนนำเข้า</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backup Section */}
          <div>
            <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-300">สำรองข้อมูลและกู้คืน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleCreateBackup}
                className="w-full rounded-lg bg-yellow-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75"
              >
                💾 สร้าง Backup
              </button>
              <button
                onClick={handleRestoreBackup}
                className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
              >
                🔄 กู้คืนจาก Backup
              </button>
            </div>
            <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 text-sm">ℹ️</span>
                <div className="text-xs sm:text-sm text-blue-200">
                  <p className="font-semibold mb-1">เกี่ยวกับ Backup:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Backup จะเก็บข้อมูลไว้ใน localStorage ของเบราว์เซอร์</li>
                    <li>ข้อมูล Backup จะหายไปหากล้างข้อมูลเบราว์เซอร์</li>
                    <li>แนะนำให้ส่งออกเป็นไฟล์ JSON เพื่อความปลอดภัย</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="mb-4 text-base sm:text-lg font-semibold text-gray-300">สรุปข้อมูลปัจจุบัน</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">จำนวนการเทรด</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{trades.length}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">เงินทุนเริ่มต้น</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{formatCurrency(capital)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 