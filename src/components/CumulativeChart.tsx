
'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { calculateTradePnL } from '@/utils/tradeCalculations';

export default function CumulativeChart({ trades }) {
  const data = useMemo(() => {
    const dailyPnl = trades.reduce((acc, trade) => {
      const date = trade.date;
      const pnl = calculateTradePnL(trade);
      acc[date] = (acc[date] || 0) + pnl;
      return acc;
    }, {});

    const sortedDates = Object.keys(dailyPnl).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let cumulativePnl = 0;
    return sortedDates.map(date => {
      cumulativePnl += dailyPnl[date];
      return {
        date,
        cumulativePnl: cumulativePnl,
      };
    });
  }, [trades]);

  return (
    <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg w-full">
      <h2 className="mb-4 text-lg sm:text-2xl font-bold text-white">แนวโน้มกำไร/ขาดทุนสะสม</h2>
      <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
        <BarChart data={data} margin={{
          top: 5,
          right: 15,
          left: 10,
          bottom: 5,
        }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis 
            dataKey="date" 
            stroke="#CBD5E0" 
            fontSize={12}
            tick={{ fontSize: 10 }}
            className="sm:text-sm"
          />
          <YAxis 
            stroke="#CBD5E0" 
            fontSize={12}
            tick={{ fontSize: 10 }}
            className="sm:text-sm"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
            contentStyle={{ 
              backgroundColor: '#2D3748', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#E2E8F0' }}
            itemStyle={{ color: '#E2E8F0' }}
          />
          <Legend 
            wrapperStyle={{ 
              color: '#F6E05E', 
              paddingTop: '10px',
              fontWeight: '600',
              fontSize: '12px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}
            iconType="rect"
          />
          <Bar dataKey="cumulativePnl" name="กำไร/ขาดทุนสะสม" fill="#F6E05E">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.cumulativePnl >= 0 ? '#48BB78' : '#FC8181'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
