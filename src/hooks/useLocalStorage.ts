'use client';

import { useState, useEffect } from 'react';
import { calculateTradePnL } from '@/utils/tradeCalculations';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State เพื่อเก็บค่าปัจจุบัน
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // ดึงข้อมูลจาก local storage
      const item = window.localStorage.getItem(key);
      // Parse stored json หรือถ้าไม่มีให้คืนค่า initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // ถ้าเกิด error ในการ parse ให้คืนค่า initialValue
      console.log(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return wrapped version ของ useState's setter function ที่จะยังอัพเดท local storage ด้วย
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // อนุญาตให้ value เป็น function เหมือน useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // บันทึก state
      setStoredValue(valueToStore);
      
      // บันทึกไปยัง local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // การจัดการ error อย่างง่าย
      console.log(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook สำหรับจัดการข้อมูลการเทรดโดยเฉพาะ
export interface Trade {
  id?: string;
  date: string;
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  type?: 'buy' | 'sell';
  note?: string;
  createdAt?: string;
}

export function useTrades() {
  const [trades, setTrades] = useLocalStorage<Trade[]>('gold-trades', []);
  
  const addTrade = (trade: Omit<Trade, 'id' | 'createdAt'>) => {
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTrades(prev => [...prev, newTrade]);
    return newTrade;
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(trade => trade.id !== id));
  };

  const updateTrade = (id: string, updatedTrade: Partial<Trade>) => {
    setTrades(prev => 
      prev.map(trade => 
        trade.id === id ? { ...trade, ...updatedTrade } : trade
      )
    );
  };

  const clearAllTrades = () => {
    setTrades([]);
  };

  // เพิ่มฟีเจอร์ import ข้อมูล
  const importTrades = (importedTrades: Trade[]) => {
    // เพิ่ม ID และ timestamp ให้ข้อมูลที่ import เข้ามา
    const tradesWithMetadata = importedTrades.map(trade => ({
      ...trade,
      id: trade.id || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
      createdAt: trade.createdAt || new Date().toISOString(),
      type: trade.type || 'buy'
    }));
    
    setTrades(tradesWithMetadata);
  };

  const replaceAllTrades = (newTrades: Trade[]) => {
    setTrades(newTrades);
  };

  // คำนวณสถิติ
  const totalPnl = trades.reduce((sum, trade) => {
    const pnl = calculateTradePnL(trade);
    return sum + pnl;
  }, 0);

  const winningTrades = trades.filter(trade => 
    calculateTradePnL(trade) > 0
  );

  const losingTrades = trades.filter(trade => 
    calculateTradePnL(trade) < 0
  );

  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  // Auto backup ทุกครั้งที่มีการเปลี่ยนแปลงข้อมูล
  useEffect(() => {
    if (trades.length > 0 && typeof window !== 'undefined') {
      // สร้าง backup อัตโนมัติทุก 5 รายการใหม่
      if (trades.length % 5 === 0) {
        const backupData = {
          trades,
          exportDate: new Date().toISOString(),
          version: '1.0'
        };
        localStorage.setItem('gold-trades-auto-backup', JSON.stringify(backupData));
        localStorage.setItem('gold-trades-auto-backup-date', new Date().toISOString());
      }
    }
  }, [trades]);

  return {
    trades,
    addTrade,
    deleteTrade,
    updateTrade,
    clearAllTrades,
    importTrades,
    replaceAllTrades,
    statistics: {
      totalPnl,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
    }
  };
}

// Hook สำหรับจัดการเงินทุน
export function useCapital() {
  const [baseCapital, setBaseCapital] = useLocalStorage<number>('base-capital', 0);
  
  const updateCapital = (newCapital: number) => {
    setBaseCapital(newCapital);
  };

  return {
    baseCapital,
    updateCapital,
    setCapital: setBaseCapital,
  };
} 