
'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';

export default function CapitalInput({ initialCapital, onUpdateCapital }) {
  const [capital, setCapital] = useState(initialCapital);

  useEffect(() => {
    setCapital(initialCapital);
  }, [initialCapital]);

  const handleChange = (e) => {
    setCapital(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateCapital(parseFloat(capital));
  };

  const handleClear = () => {
    if (window.confirm('คุณต้องการล้างเงินทุนเริ่มต้นเป็น 0 หรือไม่?')) {
      setCapital(0);
      onUpdateCapital(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-white">เงินทุนเริ่มต้น</h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="number"
          name="capital"
          placeholder="ระบุเงินทุนเริ่มต้น (USD)"
          value={capital}
          onChange={handleChange}
          step="0.01"
          min="0"
          className="flex-grow rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
        <div className="flex gap-3 sm:flex-shrink-0">
          <button 
            type="submit" 
            className="flex-1 sm:flex-none rounded-lg bg-green-600 px-4 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            บันทึก
          </button>
          <button 
            type="button"
            onClick={handleClear}
            className="flex-1 sm:flex-none rounded-lg bg-red-600 px-4 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
            title="ล้างเงินทุนเริ่มต้น"
          >
            <span className="hidden sm:inline">ล้าง</span>
            <span className="sm:hidden">ล้าง</span>
          </button>
        </div>
      </div>
      <p className="text-sm sm:text-lg text-gray-300">
        เงินทุนปัจจุบัน: <span className="font-bold text-yellow-400">{formatCurrency(parseFloat(capital) || 0)}</span>
      </p>
    </form>
  );
}
