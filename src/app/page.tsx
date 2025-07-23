
'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { calculateTradePnL } from '@/utils/tradeCalculations';
import { formatCurrency, formatPnL } from '@/utils/formatCurrency';
import TradeForm from '@/components/TradeForm';
import TradeList from '@/components/TradeList';
import SummaryChart from '@/components/SummaryChart';
import CumulativeChart from '@/components/CumulativeChart';
import TradeProportionChart from '@/components/TradeProportionChart';
import PnLLineChart from '@/components/PnLLineChart';
import DetailedStatsCard from '@/components/DetailedStatsCard';
import AIAnalysis from '@/components/AIAnalysis';
import CapitalInput from '@/components/CapitalInput';
import DataManager from '@/components/DataManager';
import APIKeySettings from '@/components/APIKeySettings';
import { ConfirmModal } from '@/components/Modal';
import { useTrades, useCapital, Trade } from '@/hooks/useLocalStorage';

export default function Home() {
  const { trades, addTrade, deleteTrade, clearAllTrades, importTrades, replaceAllTrades, statistics } = useTrades();
  const { baseCapital, updateCapital, setCapital } = useCapital();
  
  const [modals, setModals] = useState({
    clearAll: false,
    import: { isOpen: false, data: null as Trade[] | null }
  });

  const totalCapital = baseCapital + statistics.totalPnl;

  // ฟังก์ชันสำหรับ import ข้อมูล
  const handleImportTrades = (importedTrades: Trade[]) => {
    setModals(prev => ({ ...prev, import: { isOpen: true, data: importedTrades } }));
  };

  const confirmImport = () => {
    if (modals.import.data) {
      importTrades(modals.import.data);
      toast.success(`นำเข้าข้อมูลสำเร็จ! ${modals.import.data.length} รายการ`, {
        icon: '📥',
        duration: 4000,
      });
    }
    setModals(prev => ({ ...prev, import: { isOpen: false, data: null } }));
  };

  const closeImportModal = () => {
    setModals(prev => ({ ...prev, import: { isOpen: false, data: null } }));
  };

  // ฟังก์ชันสำหรับกู้คืนจาก backup
  const handleRestoreBackup = (backupData: { trades: Trade[], capital: number }) => {
    replaceAllTrades(backupData.trades);
    setCapital(backupData.capital);
    toast.success('กู้คืนข้อมูลสำเร็จ!', {
      icon: '🔄',
      duration: 4000,
    });
  };

  // ฟังก์ชันสำหรับลบข้อมูลทั้งหมด
  const handleClearAllTrades = () => {
    if (trades.length === 0) {
      toast.error('ไม่มีข้อมูลการเทรดให้ลบ', {
        icon: '❌',
      });
      return;
    }
    setModals(prev => ({ ...prev, clearAll: true }));
  };

  const confirmClearAll = () => {
    clearAllTrades();
    toast.success('ลบข้อมูลทั้งหมดเรียบร้อยแล้ว', {
      icon: '🗑️',
      duration: 4000,
    });
    setModals(prev => ({ ...prev, clearAll: false }));
  };

  const closeClearAllModal = () => {
    setModals(prev => ({ ...prev, clearAll: false }));
  };

  return (
    <>
      <main className="min-h-screen bg-gray-950 p-2 sm:p-4 lg:p-8 text-white">
        <div className="mx-auto max-w-7xl rounded-xl bg-gray-900 p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl">
          <h2 className="mb-6 text-center text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-yellow-400 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">📊</span>
            </div>
            <span className="leading-tight">
              ระบบวิเคราะห์พฤติกรรมการเทรดทอง
            </span>
          </h2>

          {/* คำอธิบายการคำนวณ */}
          <div className="mb-8 rounded-lg bg-blue-900/20 border border-blue-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">ℹ️</span>
              <h3 className="text-base sm:text-lg font-semibold text-blue-400">
                การคำนวณการเทรดทองคำ
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-gray-300 space-y-1">
              <p>
                • <strong>1 Lot</strong> = 100 ออนซ์ทองคำ
              </p>
              <p>
                • <strong>การคำนวณกำไร/ขาดทุน</strong> = (ราคาออก - ราคาเข้า) ×
                จำนวน Lot × 100 ออนซ์
              </p>
              <p>
                • <strong>ราคา</strong> แสดงเป็น USD ต่อออนซ์
              </p>
              <p>
                • <strong>ตัวอย่าง:</strong> Buy 0.1 lot ที่ $2,000, ขายที่
                $2,010 = ($2,010 - $2,000) × 0.1 × 100 = $100
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:gap-8">
            <CapitalInput
              initialCapital={baseCapital}
              onUpdateCapital={updateCapital}
            />

            {/* สรุปผลรวมแบบละเอียด */}
            <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  สรุปผลรวม
                </h2>
                {trades.length > 0 && (
                  <button
                    onClick={handleClearAllTrades}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 w-full sm:w-auto"
                  >
                    ลบข้อมูลทั้งหมด
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">เงินทุนเริ่มต้น</p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-400">
                    {formatCurrency(baseCapital)}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">กำไร/ขาดทุนรวม</p>
                  <p
                    className={`text-lg sm:text-xl font-bold ${
                      statistics.totalPnl >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatPnL(statistics.totalPnl)}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">เงินทุนสุทธิ</p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-400">
                    {formatCurrency(totalCapital)}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">จำนวนการเทรดทั้งหมด</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-400">
                    {statistics.totalTrades}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">การเทรดที่ได้กำไร</p>
                  <p className="text-lg sm:text-xl font-bold text-green-400">
                    {statistics.winningTrades}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">อัตราชนะ</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-400">
                    {statistics.winRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* จัดการข้อมูล */}
            <DataManager
              trades={trades}
              capital={baseCapital}
              onImportTrades={handleImportTrades}
              onRestoreBackup={handleRestoreBackup}
            />

            {/* ฟอร์มการเทรด */}
            <TradeForm onAddTrade={addTrade} />

            {/* รายการการเทรด */}
            <TradeList trades={trades} onDeleteTrade={deleteTrade} />

            {/* กราฟต่างๆ */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <SummaryChart trades={trades} />
              <CumulativeChart trades={trades} />
            </div>

            {/* กราฟ Line Chart ขนาดใหญ่ */}
            <PnLLineChart trades={trades} />

            {/* กราฟสัดส่วนการเทรด */}
            <TradeProportionChart trades={trades} />

            {/* สถิติเชิงลึก */}
            <DetailedStatsCard trades={trades} />

            {/* การตั้งค่า API Key */}
            <APIKeySettings />

            {/* การวิเคราะห์ AI */}
            <AIAnalysis trades={trades} capital={baseCapital} />
          </div>
        </div>
      </main>

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={modals.clearAll}
        onClose={closeClearAllModal}
        onConfirm={confirmClearAll}
        title="ยืนยันการลบข้อมูลทั้งหมด"
        message="ต้องการลบข้อมูลทั้งหมดหรือไม่?"
        details={`การเทรดทั้งหมด ${trades.length} รายการจะถูกลบอย่างถาวร`}
        confirmText="ลบทั้งหมด"
        cancelText="ยกเลิก"
        confirmVariant="danger"
        icon="⚠️"
      />

      {/* Import Confirmation Modal */}
      <ConfirmModal
        isOpen={modals.import.isOpen}
        onClose={closeImportModal}
        onConfirm={confirmImport}
        title="ยืนยันการนำเข้าข้อมูล"
        message={`ต้องการนำเข้าข้อมูล ${
          modals.import.data?.length || 0
        } รายการหรือไม่?`}
        details={`ข้อมูลปัจจุบัน ${trades.length} รายการจะถูกแทนที่`}
        confirmText="นำเข้า"
        cancelText="ยกเลิก"
        confirmVariant="success"
        icon="📥"
      />
    </>
  );
}
