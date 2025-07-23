'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trade } from '@/hooks/useLocalStorage';
import { ConfirmModal } from './Modal';

interface DataManagerProps {
  trades: Trade[];
  capital: number;
  onImportTrades: (trades: Trade[]) => void;
  onRestoreBackup: (data: { trades: Trade[], capital: number }) => void;
}

interface BackupData {
  trades: Trade[];
  capital: number;
  backupDate: string;
}

export default function DataManager({ trades, capital, onImportTrades, onRestoreBackup }: DataManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    data: BackupData | null;
  }>({ isOpen: false, data: null });

  const handleExportCSV = () => {
    if (trades.length === 0) {
      toast.error('ไม่มีข้อมูลการเทรดให้ส่งออก', { icon: '❌' });
      return;
    }

    const csvHeaders = [
      'วันที่',
      'ประเภท',
      'ราคาเข้า',
      'ราคาออก',
      'ขนาด Lot',
      'กำไร/ขาดทุน',
      'หมายเหตุ'
    ];

    const csvData = trades.map(trade => {
      const pnl = (trade.exitPrice - trade.entryPrice) * trade.lotSize * 100;
      return [
        new Date(trade.date).toLocaleDateString('th-TH'),
        trade.type === 'buy' ? 'ซื้อ' : 'ขาย',
        trade.entryPrice.toFixed(2),
        trade.exitPrice.toFixed(2),
        trade.lotSize.toString(),
        pnl.toFixed(2),
        trade.note || ''
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gold-trades-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('ส่งออกข้อมูลเป็น CSV สำเร็จ!', {
      icon: '📊',
      duration: 3000,
    });
  };

  const handleExportJSON = () => {
    if (trades.length === 0) {
      toast.error('ไม่มีข้อมูลการเทรดให้ส่งออก', { icon: '❌' });
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      trades: trades,
      summary: {
        totalTrades: trades.length,
        totalPnL: trades.reduce((sum, trade) => sum + (trade.exitPrice - trade.entryPrice) * trade.lotSize * 100, 0)
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gold-trades-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('ส่งออกข้อมูลเป็น JSON สำเร็จ!', {
      icon: '📄',
      duration: 3000,
    });
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading('กำลังนำเข้าข้อมูล...', {
      icon: '⏳',
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data;
        
        try {
          data = JSON.parse(content);
        } catch {
          toast.dismiss(loadingToast);
          toast.error('ไฟล์ JSON ไม่ถูกต้อง', { icon: '❌' });
          return;
        }

        let importedTrades: Trade[] = [];
        
        if (Array.isArray(data)) {
          importedTrades = data;
        } else if (data.trades && Array.isArray(data.trades)) {
          importedTrades = data.trades;
        } else {
          toast.dismiss(loadingToast);
          toast.error('รูปแบบข้อมูลไม่ถูกต้อง', { icon: '❌' });
          return;
        }

        const validTrades = importedTrades.filter(trade => 
          trade && 
          typeof trade.entryPrice === 'number' && 
          typeof trade.exitPrice === 'number' && 
          typeof trade.lotSize === 'number' &&
          (trade.type === 'buy' || trade.type === 'sell') &&
          trade.date
        );

        if (validTrades.length === 0) {
          toast.dismiss(loadingToast);
          toast.error('ไม่พบข้อมูลการเทรดที่ถูกต้อง', { icon: '❌' });
          return;
        }

        toast.dismiss(loadingToast);
        onImportTrades(validTrades);
        
      } catch (error) {
        console.error('Error importing data:', error);
        toast.dismiss(loadingToast);
        toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล', { icon: '❌' });
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleCreateBackup = () => {
    if (trades.length === 0) {
      toast.error('ไม่มีข้อมูลการเทรดสำหรับสำรองข้อมูล', { icon: '❌' });
      return;
    }

    const backupData = {
      backupDate: new Date().toISOString(),
      trades: trades,
      capital: capital,
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gold-trading-backup-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('สร้างไฟล์สำรองข้อมูลสำเร็จ!', {
      icon: '💾',
      duration: 3000,
    });
  };

  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let backupData;
        
        try {
          backupData = JSON.parse(content);
        } catch {
          toast.error('ไฟล์สำรองข้อมูลไม่ถูกต้อง', { icon: '❌' });
          return;
        }

        if (!backupData.trades || !Array.isArray(backupData.trades) || typeof backupData.capital !== 'number') {
          toast.error('รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง', { icon: '❌' });
          return;
        }

        const backupInfo: BackupData = {
          trades: backupData.trades,
          capital: backupData.capital,
          backupDate: backupData.backupDate ? new Date(backupData.backupDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'
        };

        setRestoreModal({ isOpen: true, data: backupInfo });
        
      } catch (error) {
        console.error('Error restoring backup:', error);
        toast.error('เกิดข้อผิดพลาดในการกู้คืนข้อมูล', { icon: '❌' });
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const confirmRestore = () => {
    if (restoreModal.data) {
      onRestoreBackup({
        trades: restoreModal.data.trades,
        capital: restoreModal.data.capital
      });
    }
    setRestoreModal({ isOpen: false, data: null });
  };

  const closeRestoreModal = () => {
    setRestoreModal({ isOpen: false, data: null });
  };

  return (
    <>
      <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl">📊</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">จัดการข้อมูล</h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
          >
            <span>{isExpanded ? 'ย่อ' : 'ขยาย'}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* สรุปข้อมูล - แสดงตลอด */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">จำนวนการเทรด</p>
            <p className="text-lg sm:text-xl font-bold text-blue-400">{trades.length}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">เงินทุนเริ่มต้น</p>
            <p className="text-lg sm:text-xl font-bold text-yellow-400">${capital.toLocaleString()}</p>
          </div>
        </div>

        {/* เนื้อหาที่ย่อขยายได้ */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-700 pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ส่งออกข้อมูล */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-300">ส่งออกข้อมูล</h3>
                <button
                  onClick={handleExportCSV}
                  disabled={trades.length === 0}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📊 ส่งออกเป็น CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  disabled={trades.length === 0}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📄 ส่งออกเป็น JSON
                </button>
              </div>

              {/* นำเข้าข้อมูล */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-300">นำเข้าข้อมูล</h3>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                  <div className="w-full cursor-pointer rounded-lg bg-purple-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                    📥 นำเข้าจาก JSON
                  </div>
                </label>
              </div>

              {/* สำรองข้อมูล */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-300">สำรองข้อมูล</h3>
                <button
                  onClick={handleCreateBackup}
                  disabled={trades.length === 0}
                  className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💾 สร้างไฟล์สำรองข้อมูล
                </button>
              </div>

              {/* กู้คืนข้อมูล */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-300">กู้คืนข้อมูล</h3>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                  <div className="w-full cursor-pointer rounded-lg bg-yellow-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75">
                    🔄 กู้คืนจากไฟล์สำรองข้อมูล
                  </div>
                </label>
              </div>
            </div>

            {/* คำแนะนำ */}
            <div className="rounded-lg bg-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">💡 คำแนะนำ</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• <strong>CSV:</strong> สำหรับเปิดใน Excel หรือ Google Sheets</li>
                <li>• <strong>JSON:</strong> สำหรับนำเข้าข้อมูลกลับมาในระบบ</li>
                <li>• <strong>สำรองข้อมูล:</strong> รวมทั้งการเทรดและเงินทุน</li>
                <li>• <strong>กู้คืน:</strong> จะแทนที่ข้อมูลปัจจุบันทั้งหมด</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Backup Confirmation Modal */}
      {restoreModal.data && (
        <ConfirmModal
          isOpen={restoreModal.isOpen}
          onClose={closeRestoreModal}
          onConfirm={confirmRestore}
          title="ยืนยันการกู้คืนข้อมูล"
          message="ต้องการกู้คืนข้อมูลจากไฟล์สำรองหรือไม่?"
          details={`
            วันที่สำรองข้อมูล: ${restoreModal.data.backupDate}
            การเทรด: ${restoreModal.data.trades.length} รายการ
            เงินทุน: $${restoreModal.data.capital.toLocaleString()}
            
            ข้อมูลปัจจุบันจะถูกแทนที่ทั้งหมด
          `}
          confirmText="กู้คืน"
          cancelText="ยกเลิก"
          confirmVariant="warning"
          icon="🔄"
        />
      )}
    </>
  );
} 