
'use client';

import { useMemo } from 'react';
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
import { useTrades, useCapital, Trade } from '@/hooks/useLocalStorage';

export default function Home() {
  const { trades, addTrade, deleteTrade, clearAllTrades, importTrades, replaceAllTrades, statistics } = useTrades();
  const { baseCapital, updateCapital, setCapital } = useCapital();

  const totalCapital = baseCapital + statistics.totalPnl;

  // ฟังก์ชันสำหรับ import ข้อมูล
  const handleImportTrades = (importedTrades: Trade[]) => {
    if (window.confirm(`คุณต้องการนำเข้าข้อมูล ${importedTrades.length} รายการหรือไม่? ข้อมูลปัจจุบันจะถูกแทนที่`)) {
      importTrades(importedTrades);
    }
  };

  // ฟังก์ชันสำหรับกู้คืนจาก backup
  const handleRestoreBackup = (backupData: { trades: Trade[], capital: number }) => {
    replaceAllTrades(backupData.trades);
    setCapital(backupData.capital);
  };

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl rounded-xl bg-gray-900 p-6 shadow-2xl md:p-8 lg:p-10">
        <h2 className="mb-6 text-center text-3xl font-extrabold tracking-tight text-yellow-400 sm:text-4xl flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">📊</span>
          </div>
          ระบบวิเคราะห์พฤติกรรมการเทรดทอง
        </h2>
        
        {/* คำอธิบายการคำนวณ */}
        <div className="mb-8 rounded-lg bg-blue-900/20 border border-blue-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400">ℹ️</span>
            <h3 className="text-lg font-semibold text-blue-400">การคำนวณการเทรดทองคำ</h3>
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• <strong>1 Lot</strong> = 100 ออนซ์ทองคำ</p>
            <p>• <strong>การคำนวณกำไร/ขาดทุน</strong> = (ราคาออก - ราคาเข้า) × จำนวน Lot × 100 ออนซ์</p>
            <p>• <strong>ราคา</strong> แสดงเป็น USD ต่อออนซ์</p>
            <p>• <strong>ตัวอย่าง:</strong> Buy 0.1 lot ที่ $2,000, ขายที่ $2,010 = ($2,010 - $2,000) × 0.1 × 100 = $100</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-8">
          <CapitalInput
            initialCapital={baseCapital}
            onUpdateCapital={updateCapital}
          />

          {/* สรุปผลรวมแบบละเอียด */}
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">สรุปผลรวม</h2>
              {trades.length > 0 && (
                <button
                  onClick={clearAllTrades}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  ลบข้อมูลทั้งหมด
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">เงินทุนเริ่มต้น</p>
                <p className="text-xl font-bold text-yellow-400">
                  {formatCurrency(baseCapital)}
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">กำไร/ขาดทุนรวม</p>
                <p
                  className={`text-xl font-bold ${
                    statistics.totalPnl >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatPnL(statistics.totalPnl)}
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">เงินทุนสุทธิ</p>
                <p className="text-xl font-bold text-yellow-400">
                  {formatCurrency(totalCapital)}
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">จำนวนการเทรดทั้งหมด</p>
                <p className="text-xl font-bold text-blue-400">
                  {statistics.totalTrades}
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">การเทรดที่ได้กำไร</p>
                <p className="text-xl font-bold text-green-400">
                  {statistics.winningTrades}
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400">อัตราชนะ</p>
                <p className="text-xl font-bold text-purple-400">
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

          <TradeForm onAddTrade={addTrade} />

          {/* กราฟต่างๆ */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

          <TradeList trades={trades} onDeleteTrade={deleteTrade} />
        </div>
      </div>
    </main>
  );
}
