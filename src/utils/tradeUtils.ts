import { Trade } from '@/hooks/useLocalStorage';
import { calculateTradePnL } from './tradeCalculations';

// Export ข้อมูลการเทรดเป็น JSON
export const exportTradesToJSON = (trades: Trade[]) => {
  const dataStr = JSON.stringify(trades, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `gold-trades-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export ข้อมูลการเทรดเป็น CSV
export const exportTradesToCSV = (trades: Trade[]) => {
  const headers = ['วันที่', 'ประเภท', 'ราคาเข้า', 'ราคาออก (Exit Price)', 'ขนาด Lot', 'กำไร/ขาดทุน', 'หมายเหตุ'];
  
  const csvContent = [
    headers.join(','),
    ...trades.map(trade => {
      const pnl = calculateTradePnL(trade);
      return [
        trade.date,
        trade.type === 'buy' ? 'ซื้อ' : 'ขาย',
        trade.entryPrice,
        trade.exitPrice,
        trade.lotSize,
        pnl.toFixed(2),
        trade.note || ''
      ].join(',');
    })
  ].join('\n');
  
  const dataBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `gold-trades-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import ข้อมูลการเทรดจาก JSON
export const importTradesFromJSON = (file: File): Promise<Trade[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const trades = JSON.parse(content) as Trade[];
        
        // ตรวจสอบรูปแบบข้อมูล
        if (!Array.isArray(trades)) {
          throw new Error('ไฟล์ไม่ใช่ array ของข้อมูลการเทรด');
        }
        
        // ตรวจสอบโครงสร้างข้อมูลแต่ละรายการ
        const validTrades = trades.filter(trade => {
          return trade.date && 
                 typeof trade.entryPrice === 'number' &&
                 typeof trade.exitPrice === 'number' &&
                 typeof trade.lotSize === 'number';
        });
        
        resolve(validTrades);
      } catch (error) {
        reject(new Error('ไม่สามารถอ่านไฟล์ JSON ได้: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    reader.readAsText(file);
  });
};

// คำนวณสถิติการเทรด
export const calculateTradeStatistics = (trades: Trade[]) => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      totalPnl: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }

  const pnls = trades.map(trade => calculateTradePnL(trade));
  const wins = pnls.filter(pnl => pnl > 0);
  const losses = pnls.filter(pnl => pnl < 0);
  
  const totalPnl = pnls.reduce((sum, pnl) => sum + pnl, 0);
  const totalWins = wins.reduce((sum, win) => sum + win, 0);
  const totalLosses = Math.abs(losses.reduce((sum, loss) => sum + loss, 0));
  
  return {
    totalTrades: trades.length,
    totalPnl,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
    averageWin: wins.length > 0 ? totalWins / wins.length : 0,
    averageLoss: losses.length > 0 ? totalLosses / losses.length : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
    largestWin: wins.length > 0 ? Math.max(...wins) : 0,
    largestLoss: losses.length > 0 ? Math.min(...losses) : 0,
  };
};

// ตรวจสอบ backup ข้อมูลอัตโนมัติ
export const createBackup = (trades: Trade[], capital: number) => {
  const backupData = {
    trades,
    capital,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const dataStr = JSON.stringify(backupData, null, 2);
  localStorage.setItem('gold-trades-backup', dataStr);
  localStorage.setItem('gold-trades-backup-date', new Date().toISOString());
};

// กู้คืนข้อมูลจาก backup
export const restoreFromBackup = (): { trades: Trade[], capital: number } | null => {
  try {
    const backupStr = localStorage.getItem('gold-trades-backup');
    if (!backupStr) return null;
    
    const backup = JSON.parse(backupStr);
    return {
      trades: backup.trades || [],
      capital: backup.capital || 0
    };
  } catch (error) {
    console.error('ไม่สามารถกู้คืนข้อมูลจาก backup ได้:', error);
    return null;
  }
}; 