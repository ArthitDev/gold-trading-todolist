'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { calculateTradePnL } from '@/utils/tradeCalculations';

export default function SummaryChart({ trades }) {
  const data = useMemo(() => {
    const dailyPnl = trades.reduce((acc, trade) => {
      const date = trade.date;
      const pnl = calculateTradePnL(trade);
      acc[date] = (acc[date] || 0) + pnl;
      return acc;
    }, {});

    return Object.keys(dailyPnl).map(date => ({
      date,
      pnl: dailyPnl[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trades]);

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg w-full">
      <h2 className="mb-4 text-2xl font-bold text-white">แนวโน้มกำไร/ขาดทุนรายวัน</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="date" stroke="#CBD5E0" />
          <YAxis stroke="#CBD5E0" />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
            contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#E2E8F0' }}
            itemStyle={{ color: '#E2E8F0' }}
          />
          <Legend 
            wrapperStyle={{ 
              color: '#F6E05E', 
              paddingTop: '10px',
              fontWeight: '600',
              fontSize: '14px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}
            iconType="rect"
          />
          <Bar dataKey="pnl" name="กำไร/ขาดทุน" fill="#F6E05E">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#48BB78' : '#FC8181'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}