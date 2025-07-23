'use client';

import { useMemo } from 'react';
import { Trade } from '@/hooks/useLocalStorage';
import { calculateTradePnL } from '@/utils/tradeCalculations';
import { formatCurrency, formatPnL, formatAmount } from '@/utils/formatCurrency';

interface DetailedStatsCardProps {
  trades: Trade[];
}

export default function DetailedStatsCard({ trades }: DetailedStatsCardProps) {
  const stats = useMemo(() => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnl: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitFactor: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        averageTradesPerDay: 0,
        bestTradingDay: { date: '', pnl: 0 },
        worstTradingDay: { date: '', pnl: 0 }
      };
    }

    const pnls = trades.map(trade => calculateTradePnL(trade));
    const wins = pnls.filter(pnl => pnl > 0);
    const losses = pnls.filter(pnl => pnl < 0);
    
    const totalPnl = pnls.reduce((sum, pnl) => sum + pnl, 0);
    const totalWins = wins.reduce((sum, win) => sum + win, 0);
    const totalLosses = Math.abs(losses.reduce((sum, loss) => sum + loss, 0));

    // คำนวณ consecutive wins/losses
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentStreakType = '';

    pnls.forEach(pnl => {
      if (pnl > 0) {
        if (currentStreakType === 'win') {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentStreakType = 'win';
        }
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
      } else if (pnl < 0) {
        if (currentStreakType === 'loss') {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentStreakType = 'loss';
        }
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
      }
    });

    // คำนวณ PnL รายวัน
    const dailyPnl: { [key: string]: number } = {};
    trades.forEach(trade => {
      const date = trade.date;
      const pnl = calculateTradePnL(trade);
      dailyPnl[date] = (dailyPnl[date] || 0) + pnl;
    });

    const dailyPnlValues = Object.values(dailyPnl);
    const bestDay = Object.entries(dailyPnl).reduce((best, [date, pnl]) => 
      pnl > best.pnl ? { date, pnl } : best, { date: '', pnl: -Infinity });
    const worstDay = Object.entries(dailyPnl).reduce((worst, [date, pnl]) => 
      pnl < worst.pnl ? { date, pnl } : worst, { date: '', pnl: Infinity });

    // คำนวณจำนวนวันที่เทรด
    const tradingDays = Object.keys(dailyPnl).length;
    const averageTradesPerDay = tradingDays > 0 ? trades.length / tradingDays : 0;

    return {
      totalTrades: trades.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
      totalPnl,
      averageWin: wins.length > 0 ? totalWins / wins.length : 0,
      averageLoss: losses.length > 0 ? totalLosses / losses.length : 0,
      largestWin: wins.length > 0 ? Math.max(...wins) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses) : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      consecutiveWins: maxWinStreak,
      consecutiveLosses: maxLossStreak,
      averageTradesPerDay,
      bestTradingDay: bestDay.pnl !== -Infinity ? bestDay : { date: '', pnl: 0 },
      worstTradingDay: worstDay.pnl !== Infinity ? worstDay : { date: '', pnl: 0 }
    };
  }, [trades]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const formatNumber = (num: number, decimals = 2) => {
    return formatAmount(num, decimals);
  };

  const getProfitFactorColor = (pf: number) => {
    if (pf >= 2) return 'text-green-400';
    if (pf >= 1.5) return 'text-yellow-400';
    if (pf >= 1) return 'text-orange-400';
    return 'text-red-400';
  };

  if (trades.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-white">สถิติเชิงลึก</h2>
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-gray-400 text-lg">ยังไม่มีข้อมูลการเทรด</p>
          <p className="text-gray-500 text-sm mt-2">
            เพิ่มการเทรดเพื่อดูข้อมูลสถิติเชิงลึก
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-white">สถิติเชิงลึก</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* การเทรดพื้นฐาน */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">การเทรดพื้นฐาน</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">การเทรดทั้งหมด:</span>
              <span className="text-white font-bold">{stats.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">การเทรดชนะ:</span>
              <span className="text-green-400 font-bold">{stats.winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">การเทรดแพ้:</span>
              <span className="text-red-400 font-bold">{stats.losingTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">อัตราชนะ:</span>
              <span className="text-yellow-400 font-bold">{formatNumber(stats.winRate, 1)}%</span>
            </div>
          </div>
        </div>

        {/* กำไรขาดทุน */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-400 mb-3">กำไรขาดทุน</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">กำไรขาดทุนรวม:</span>
              <span className={`font-bold ${stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPnL(stats.totalPnl)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">กำไรเฉลี่ย:</span>
              <span className="text-green-400 font-bold">${formatNumber(stats.averageWin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ขาดทุนเฉลี่ย:</span>
              <span className="text-red-400 font-bold">${formatNumber(stats.averageLoss)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Factor:</span>
              <span className={`font-bold ${getProfitFactorColor(stats.profitFactor)}`}>
                {stats.profitFactor === Infinity ? '∞' : formatNumber(stats.profitFactor)}
              </span>
            </div>
          </div>
        </div>

        {/* สถิติสูงสุด */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-400 mb-3">สถิติสูงสุด</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">กำไรสูงสุด:</span>
              <span className="text-green-400 font-bold">${formatNumber(stats.largestWin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ขาดทุนสูงสุด:</span>
              <span className="text-red-400 font-bold">${formatNumber(Math.abs(stats.largestLoss))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ชนะติดต่อกัน:</span>
              <span className="text-green-400 font-bold">{stats.consecutiveWins} ครั้ง</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">แพ้ติดต่อกัน:</span>
              <span className="text-red-400 font-bold">{stats.consecutiveLosses} ครั้ง</span>
            </div>
          </div>
        </div>

        {/* สถิติรายวัน */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-400 mb-3">สถิติรายวัน</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">เทรดเฉลี่ย/วัน:</span>
              <span className="text-white font-bold">{formatNumber(stats.averageTradesPerDay, 1)}</span>
            </div>
            <div className="flex justify-between flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-gray-400">วันที่ดีที่สุด:</span>
                <span className="text-green-400 font-bold">${formatNumber(stats.bestTradingDay.pnl)}</span>
              </div>
              <span className="text-gray-500 text-xs">{formatDate(stats.bestTradingDay.date)}</span>
            </div>
            <div className="flex justify-between flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-gray-400">วันที่แย่ที่สุด:</span>
                <span className="text-red-400 font-bold">${formatNumber(Math.abs(stats.worstTradingDay.pnl))}</span>
              </div>
              <span className="text-gray-500 text-xs">{formatDate(stats.worstTradingDay.date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">ตัวชี้วัดประสิทธิภาพ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${getProfitFactorColor(stats.profitFactor)}`}>
              {stats.profitFactor === Infinity ? '∞' : formatNumber(stats.profitFactor, 2)}
            </div>
            <p className="text-gray-400 text-sm">Profit Factor</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.profitFactor >= 2 ? 'ดีเยี่ยม' : 
               stats.profitFactor >= 1.5 ? 'ดี' :
               stats.profitFactor >= 1 ? 'ปานกลาง' : 'ต้องปรับปรุง'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${stats.winRate >= 60 ? 'text-green-400' : stats.winRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {formatNumber(stats.winRate, 1)}%
            </div>
            <p className="text-gray-400 text-sm">อัตราชนะ</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.winRate >= 60 ? 'ดีเยี่ยม' : 
               stats.winRate >= 40 ? 'ดี' : 'ต้องปรับปรุง'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${stats.averageWin > Math.abs(stats.averageLoss) ? 'text-green-400' : 'text-orange-400'}`}>
              {stats.averageLoss > 0 ? formatNumber(stats.averageWin / stats.averageLoss, 2) : '∞'}
            </div>
            <p className="text-gray-400 text-sm">Risk:Reward</p>
            <p className="text-xs text-gray-500 mt-1">
              กำไรเฉลี่ย : ขาดทุนเฉลี่ย
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 