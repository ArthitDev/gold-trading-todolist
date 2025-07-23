'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Trade } from '@/hooks/useLocalStorage';
import { calculateTradePnL } from '@/utils/tradeCalculations';

interface TradeProportionChartProps {
  trades: Trade[];
}

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function TradeProportionChart({ trades }: TradeProportionChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');

  const chartData = useMemo(() => {
    if (trades.length === 0) return [];

    // กลุ่มข้อมูลตาม timeframe
    const groupedData: { [key: string]: { winning: number, losing: number, neutral: number } } = {};
    
    trades.forEach(trade => {
      const pnl = calculateTradePnL(trade);
      const date = new Date(trade.date);
      let key: string;

      switch (timeFrame) {
        case 'daily':
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly':
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          key = `สัปดาห์ ${startOfWeek.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}`;
          break;
        case 'monthly':
          key = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
          break;
        case 'yearly':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = { winning: 0, losing: 0, neutral: 0 };
      }

      if (pnl > 0) {
        groupedData[key].winning++;
      } else if (pnl < 0) {
        groupedData[key].losing++;
      } else {
        groupedData[key].neutral++;
      }
    });

    // แปลงเป็น array และ sort ตามวันที่
    return Object.entries(groupedData)
      .map(([period, stats]) => ({
        period,
        ...stats,
        total: stats.winning + stats.losing + stats.neutral
      }))
      .sort((a, b) => {
        if (timeFrame === 'yearly') {
          return parseInt(a.period) - parseInt(b.period);
        }
        return a.period.localeCompare(b.period);
      });
  }, [trades, timeFrame]);

  // ข้อมูลสำหรับ Pie Chart - รวมทั้งหมด
  const overallStats = useMemo(() => {
    const winning = trades.filter(trade => calculateTradePnL(trade) > 0).length;
    const losing = trades.filter(trade => calculateTradePnL(trade) < 0).length;
    const neutral = trades.filter(trade => calculateTradePnL(trade) === 0).length;

    return [
      { name: 'กำไร', value: winning, color: '#48BB78' },
      { name: 'ขาดทุน', value: losing, color: '#FC8181' },
      ...(neutral > 0 ? [{ name: 'เท่าทุน', value: neutral, color: '#CBD5E0' }] : [])
    ];
  }, [trades]);

  const timeFrameLabels = {
    daily: 'รายวัน',
    weekly: 'รายสัปดาห์',
    monthly: 'รายเดือน',
    yearly: 'รายปี'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-gray-300">
            จำนวน: <span className="font-bold text-yellow-400">{data.value}</span> รายการ
          </p>
          <p className="text-gray-300">
            สัดส่วน: <span className="font-bold text-yellow-400">
              {((data.value / trades.length) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (trades.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-white">สัดส่วนการเทรด</h2>
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-gray-400 text-lg">ยังไม่มีข้อมูลการเทรด</p>
          <p className="text-gray-500 text-sm mt-2">
            เพิ่มการเทรดเพื่อดูข้อมูลสัดส่วนการเทรด
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">สัดส่วนการเทรด</h2>
        
        {/* Time Frame Selector */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(timeFrameLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTimeFrame(key as TimeFrame)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition duration-300 ${
                timeFrame === key
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart สำหรับภาพรวม */}
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">ภาพรวมทั้งหมด</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overallStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                stroke="#2D3748"
                strokeWidth={2}
              >
                {overallStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  color: '#F6E05E', 
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* สถิติรายช่วงเวลา */}
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">
            สถิติ{timeFrameLabels[timeFrame]}
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {chartData.map((item, index) => {
              const winRate = item.total > 0 ? (item.winning / item.total) * 100 : 0;
              return (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold text-sm">{item.period}</span>
                    <span className="text-yellow-400 font-bold">{winRate.toFixed(1)}%</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-green-400 font-bold">{item.winning}</p>
                      <p className="text-gray-400">กำไร</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 font-bold">{item.losing}</p>
                      <p className="text-gray-400">ขาดทุน</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-400 font-bold">{item.total}</p>
                      <p className="text-gray-400">รวม</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* สรุปสถิติ */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">การเทรดทั้งหมด</p>
            <p className="text-xl font-bold text-blue-400">{trades.length}</p>
          </div>
          <div className="text-center bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">อัตราชนะ</p>
            <p className="text-xl font-bold text-yellow-400">
              {trades.length > 0 ? ((overallStats[0]?.value || 0) / trades.length * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">การเทรดดีที่สุด</p>
            <p className="text-xl font-bold text-green-400">
              {chartData.length > 0 ? Math.max(...chartData.map(d => d.winning)) : 0}
            </p>
          </div>
          <div className="text-center bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-400">ช่วงเวลาที่วิเคราะห์</p>
            <p className="text-xl font-bold text-purple-400">{chartData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 