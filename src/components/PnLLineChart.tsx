'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Trade } from '@/hooks/useLocalStorage';
import { calculateTradePnL, calculateTotalOunces, calculatePnLPerOunce } from '@/utils/tradeCalculations';
import { formatAmount, formatPnL } from '@/utils/formatCurrency';

interface PnLLineChartProps {
  trades: Trade[];
}

export default function PnLLineChart({ trades }: PnLLineChartProps) {
  const chartData = useMemo(() => {
    if (trades.length === 0) return [];

    // เรียงการเทรดตามวันที่
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulativePnL = 0;
    let runningBalance = 0;
    
    return sortedTrades.map((trade, index) => {
      const tradePnL = calculateTradePnL(trade);
      cumulativePnL += tradePnL;
      runningBalance += tradePnL;
      
      return {
        tradeNumber: index + 1,
        date: trade.date,
        tradePnL: Number(tradePnL.toFixed(2)),
        cumulativePnL: Number(cumulativePnL.toFixed(2)),
        isProfit: tradePnL > 0,
        isLoss: tradePnL < 0,
        tradeInfo: `${trade.type?.toUpperCase() || 'BUY'}: $${formatAmount(trade.entryPrice)} → $${formatAmount(trade.exitPrice)} (${formatAmount(trade.lotSize)} lots = ${calculateTotalOunces(trade.lotSize).toFixed(0)} oz)`,
        note: trade.note || '',
        formattedDate: new Date(trade.date).toLocaleDateString('th-TH', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })
      };
    });
  }, [trades]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const profits = chartData.filter(item => item.tradePnL > 0);
    const losses = chartData.filter(item => item.tradePnL < 0);
    const maxProfit = Math.max(...chartData.map(item => item.tradePnL));
    const maxLoss = Math.min(...chartData.map(item => item.tradePnL));
    const finalPnL = chartData[chartData.length - 1]?.cumulativePnL || 0;
    
    // คำนวณ Drawdown
    let maxDrawdown = 0;
    let peak = 0;
    chartData.forEach(item => {
      if (item.cumulativePnL > peak) {
        peak = item.cumulativePnL;
      }
      const drawdown = peak - item.cumulativePnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return {
      totalTrades: chartData.length,
      profitTrades: profits.length,
      lossTrades: losses.length,
      winRate: (profits.length / chartData.length) * 100,
      maxProfit,
      maxLoss,
      finalPnL,
      maxDrawdown
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 shadow-lg max-w-sm">
          <p className="text-white font-semibold mb-2">การเทรดที่ {data.tradeNumber}</p>
          <p className="text-gray-300 text-sm mb-1">วันที่: {data.formattedDate}</p>
          <p className="text-gray-300 text-sm mb-2">{data.tradeInfo}</p>
          
          <div className="border-t border-gray-600 pt-2 space-y-1">
            <p className={`font-bold ${data.tradePnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              การเทรดนี้: {formatPnL(data.tradePnL)}
            </p>
            <p className="text-sm text-gray-400">
              (${formatAmount(Math.abs(data.tradePnL / (data.tradePnL >= 0 ? 1 : 1)))}/lot หรือ ${formatAmount(Math.abs(data.tradePnL / calculateTotalOunces(1)))}/oz)
            </p>
            <p className={`font-bold ${data.cumulativePnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              สะสมรวม: {formatPnL(data.cumulativePnL)}
            </p>
          </div>
          
          {data.note && (
            <div className="border-t border-gray-600 pt-2 mt-2">
              <p className="text-blue-300 text-sm">หมายเหตุ: {data.note}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (trades.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-white">กราฟกำไรขาดทุนต่อเนื่อง</h2>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-gray-400 text-lg">ยังไม่มีข้อมูลการเทรด</p>
            <p className="text-gray-500 text-sm mt-2">เพิ่มการเทรดเพื่อดูกราฟแนวโน้ม</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">กราฟกำไรขาดทุนต่อเนื่อง</h2>
        
        {stats && (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className={`px-3 py-1 rounded-full ${stats.finalPnL >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
              รวม: {formatPnL(stats.finalPnL)}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-600">
              WR: {stats.winRate.toFixed(1)}%
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-600">
              DD: ${formatAmount(stats.maxDrawdown)}
            </span>
          </div>
        )}
      </div>

      {/* สถิติรวม */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{stats.totalTrades}</div>
            <div className="text-gray-400">การเทรด</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{stats.profitTrades}</div>
            <div className="text-gray-400">กำไร</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">{stats.lossTrades}</div>
            <div className="text-gray-400">ขาดทุน</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">{stats.winRate.toFixed(1)}%</div>
            <div className="text-gray-400">อัตราชนะ</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">+${formatAmount(stats.maxProfit)}</div>
            <div className="text-gray-400">กำไรสูงสุด</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">${formatAmount(Math.abs(stats.maxLoss))}</div>
            <div className="text-gray-400">ขาดทุนสูงสุด</div>
          </div>
        </div>
      )}

      {/* กราฟหลัก */}
      <div className="bg-gray-900 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="tradeNumber" 
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              label={{ value: 'ลำดับการเทรด', position: 'insideBottom', offset: -40, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value >= 0 ? '+' : ''}$${formatAmount(Math.abs(value))}`}
              label={{ value: 'กำไร/ขาดทุน (USD)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                color: '#F6E05E', 
                fontWeight: '600',
                fontSize: '14px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
              }}
              iconType="rect"
            />
            
            {/* เส้นอ้างอิง Zero Line */}
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />
            
            {/* เส้นกำไรขาดทุนสะสม */}
            <Line
              type="monotone"
              dataKey="cumulativePnL"
              stroke="#F6E05E"
              strokeWidth={3}
              dot={{ fill: '#F6E05E', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#F6E05E', strokeWidth: 2, fill: '#1F2937' }}
              name="กำไรขาดทุนสะสม"
            />
            
            {/* เส้นกำไรขาดทุนแต่ละครั้ง */}
            <Line
              type="monotone"
              dataKey="tradePnL"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={{ fill: '#60A5FA', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, stroke: '#60A5FA', strokeWidth: 2, fill: '#1F2937' }}
              name="กำไรขาดทุนแต่ละครั้ง"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* คำอธิบายกราฟ */}
      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">การอ่านกราฟ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-yellow-400 rounded"></div>
              <span><strong className="text-yellow-400">เส้นทึบ:</strong> กำไรขาดทุนสะสม (Cumulative P&L)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-400 rounded" style={{backgroundImage: 'repeating-linear-gradient(to right, #60A5FA 0, #60A5FA 3px, transparent 3px, transparent 6px)'}}></div>
              <span><strong className="text-blue-400">เส้นประ:</strong> กำไรขาดทุนแต่ละครั้ง (Trade P&L)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-gray-500 rounded" style={{backgroundImage: 'repeating-linear-gradient(to right, #6B7280 0, #6B7280 1px, transparent 1px, transparent 3px)'}}></div>
              <span><strong className="text-gray-400">เส้นอ้างอิง:</strong> แนวเส้นศูนย์ (Break Even)</span>
            </div>
            <div>
              <span><strong className="text-green-400">เหนือเส้นศูนย์:</strong> กำไร | <strong className="text-red-400">ใต้เส้นศูนย์:</strong> ขาดทุน</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 