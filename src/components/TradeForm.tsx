'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trade } from '@/hooks/useLocalStorage';

interface TradeFormProps {
  onAddTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
}

export default function TradeForm({ onAddTrade }: TradeFormProps) {
  const [trade, setTrade] = useState({
    date: '',
    entryPrice: '',
    exitPrice: '',
    lotSize: '',
    type: 'buy' as 'buy' | 'sell',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTrade((prevTrade) => ({
      ...prevTrade,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const tradeData: Omit<Trade, 'id' | 'createdAt'> = {
        date: trade.date,
        entryPrice: parseFloat(trade.entryPrice),
        exitPrice: parseFloat(trade.exitPrice),
        lotSize: parseFloat(trade.lotSize),
        type: trade.type,
        note: trade.note || undefined,
      };

      // Calculate P&L for display
      const pnl = (tradeData.exitPrice - tradeData.entryPrice) * tradeData.lotSize * 100;
      const pnlText = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
      
      onAddTrade(tradeData);
      
      // Show success toast with trade details
      toast.success(
        `เพิ่มการเทรดสำเร็จ!\n${tradeData.type === 'buy' ? 'ซื้อ' : 'ขาย'} ${tradeData.lotSize} lot • P&L: ${pnlText}`,
        {
          duration: 5000,
          icon: '✅',
        }
      );
      
      // Reset form
      setTrade({
        date: '',
        entryPrice: '',
        exitPrice: '',
        lotSize: '',
        type: 'buy',
        note: '',
      });
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเพิ่มการเทรด กรุณาลองใหม่อีกครั้ง', {
        icon: '❌',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-white">เพิ่มรายการเทรดใหม่</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-300">วันที่</label>
          <input
            type="date"
            name="date"
            value={trade.date}
            onChange={handleChange}
            className="rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-300">ประเภทการเทรด</label>
          <select
            name="type"
            value={trade.type}
            onChange={handleChange}
            className="rounded-lg border border-gray-600 bg-gray-700 p-3 pr-8 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-no-repeat bg-right bg-[length:16px_16px]]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
            }}
            disabled={isSubmitting}
          >
            <option value="buy">ซื้อ (Buy)</option>
            <option value="sell">ขาย (Sell)</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-300">ราคาเข้า (Entry Price USD)</label>
          <input
            type="number"
            name="entryPrice"
            placeholder="ราคาเข้า (USD)"
            value={trade.entryPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-300">ราคาออก (Exit Price USD)</label>
          <input
            type="number"
            name="exitPrice"
            placeholder="ราคาออก (USD)"
            value={trade.exitPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex flex-col sm:col-span-2">
          <label className="mb-2 text-sm font-medium text-gray-300">ขนาด Lot (Lot Size)</label>
          <input
            type="number"
            name="lotSize"
            placeholder="ขนาด Lot (1 lot = 100 oz)"
            value={trade.lotSize}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
          <div className="mt-1 text-xs text-gray-400">
            💡 1 lot = 100 ออนซ์ทองคำ | {trade.lotSize ? `${(parseFloat(trade.lotSize) * 100).toFixed(0)} ออนซ์` : '0 ออนซ์'}
          </div>
        </div>
        
        <div className="flex flex-col sm:col-span-2">
          <label className="mb-2 text-sm font-medium text-gray-300">หมายเหตุ (ไม่บังคับ)</label>
          <textarea
            name="note"
            placeholder="เพิ่มหมายเหตุเกี่ยวกับการเทรด..."
            value={trade.note}
            onChange={handleChange}
            rows={3}
            className="rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="rounded-lg bg-blue-600 p-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            กำลังเพิ่มข้อมูล...
          </>
        ) : (
          'เพิ่มรายการเทรด'
        )}
      </button>
    </form>
  );
}