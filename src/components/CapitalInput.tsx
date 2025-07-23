
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatCurrency';
import { ConfirmModal } from './Modal';

interface CapitalInputProps {
  initialCapital: number;
  onUpdateCapital: (newCapital: number) => void;
}

export default function CapitalInput({ initialCapital, onUpdateCapital }: CapitalInputProps) {
  const [inputValue, setInputValue] = useState(initialCapital.toString());
  const [clearModal, setClearModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const capital = parseFloat(inputValue);
    
    if (isNaN(capital) || capital < 0) {
      toast.error('กรุณากรอกจำนวนเงินทุนที่ถูกต้อง', {
        icon: '❌',
      });
      return;
    }
    
    onUpdateCapital(capital);
    toast.success(`อัปเดตเงินทุนเป็น ${formatCurrency(capital)} เรียบร้อยแล้ว`, {
      icon: '💰',
      duration: 3000,
    });
  };

  const handleClear = () => {
    setClearModal(true);
  };

  const confirmClear = () => {
    setInputValue('0');
    onUpdateCapital(0);
    setClearModal(false);
    toast.success('ล้างข้อมูลเงินทุนเรียบร้อยแล้ว', {
      icon: '🗑️',
      duration: 3000,
    });
  };

  const closeClearModal = () => {
    setClearModal(false);
  };

  return (
    <>
      <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
        <h2 className="mb-4 text-xl sm:text-2xl font-bold text-white">เงินทุนเริ่มต้น</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="capital" className="block text-sm font-medium text-gray-300 mb-2">
                จำนวนเงินทุน (USD)
              </label>
              <input
                type="number"
                id="capital"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="กรอกจำนวนเงินทุนเริ่มต้น"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              />
            </div>
            
            <div className="flex gap-2 sm:items-end">
              <button
                type="submit"
                className="flex-1 sm:flex-none rounded-lg mb-1 bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              >
                อัปเดต
              </button>
              
              {initialCapital > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 sm:flex-none rounded-lg mb-1 bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>
        </form>

        {initialCapital > 0 && (
          <div className="mt-4 rounded-lg bg-gray-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">เงินทุนปัจจุบัน:</span>
              <span className="text-lg font-bold text-yellow-400">
                {formatCurrency(initialCapital)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-lg bg-blue-900/20 border border-blue-500/30 p-3">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">ℹ️</span>
            <div className="text-xs sm:text-sm text-blue-200">
              <p className="font-semibold mb-1">เกี่ยวกับเงินทุนเริ่มต้น:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>ใช้สำหรับคำนวณผลตอบแทนรวม (ROI)</li>
                <li>สามารถปรับเปลี่ยนได้ตลอดเวลา</li>
                <li>ไม่ส่งผลกระทบต่อการคำนวณกำไร/ขาดทุนของแต่ละเทรด</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={clearModal}
        onClose={closeClearModal}
        onConfirm={confirmClear}
        title="ยืนยันการล้างข้อมูลเงินทุน"
        message="ต้องการล้างข้อมูลเงินทุนเริ่มต้นหรือไม่?"
        details={`เงินทุนปัจจุบัน: ${formatCurrency(initialCapital)} จะถูกรีเซ็ตเป็น $0`}
        confirmText="ล้าง"
        cancelText="ยกเลิก"
        confirmVariant="danger"
        icon="🗑️"
      />
    </>
  );
}
