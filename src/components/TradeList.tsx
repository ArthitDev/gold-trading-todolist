
import { useMemo } from 'react';
import { Trade } from '@/hooks/useLocalStorage';
import { calculateTradePnL, calculateTotalOunces, calculatePnLPerOunce, GOLD_LOT_SIZE } from '@/utils/tradeCalculations';
import { formatAmount, formatPnL } from '@/utils/formatCurrency';

interface TradeListProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
}

export default function TradeList({ trades, onDeleteTrade }: TradeListProps) {
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades]);

  const handleDelete = (id: string) => {
    if (window.confirm('คุณต้องการลบรายการเทรดนี้หรือไม่?')) {
      onDeleteTrade(id);
    }
  };

  if (trades.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-white">ประวัติการเทรด</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400 text-lg">ยังไม่มีข้อมูลการเทรด</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-white">ประวัติการเทรด</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full table-auto text-left text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider">วันที่</th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider">ประเภท</th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider">ราคาเข้า</th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider">ราคาออก</th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider">ขนาด Lot<br/><span className="text-xs normal-case text-gray-400">(1 lot = 100 oz)</span></th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider">กำไร/ขาดทุน</th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider">หมายเหตุ</th>
              <th className="p-3 text-sm font-semibold uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade) => {
              const pnl = calculateTradePnL(trade);
              return (
                <tr key={trade.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors">
                  <td className="p-3 text-sm">
                    {new Date(trade.date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      trade.type === 'buy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.type === 'buy' ? 'ซื้อ' : 'ขาย'}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-mono">
                    ${formatAmount(trade.entryPrice)}
                  </td>
                  <td className="p-3 text-sm font-mono">
                    ${formatAmount(trade.exitPrice)}
                  </td>
                  <td className="p-3 text-sm font-mono">
                    <div>{formatAmount(trade.lotSize)}</div>
                    <div className="text-xs text-gray-500">
                      ({calculateTotalOunces(trade.lotSize).toFixed(0)} oz)
                    </div>
                  </td>
                  <td className={`p-3 text-sm font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <div>{formatPnL(pnl)}</div>
                    <div className="text-xs text-gray-500">
                      (${formatAmount(Math.abs(calculatePnLPerOunce(trade)))}/oz)
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-300 max-w-xs">
                    {trade.note ? (
                      <div className="truncate" title={trade.note}>
                        {trade.note}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    <button
                      onClick={() => handleDelete(trade.id!)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* สรุปสถิติในตาราง */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-400">การเทรดทั้งหมด</p>
          <p className="text-xl font-bold text-blue-400">{trades.length}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-400">การเทรดที่ได้กำไร</p>
          <p className="text-xl font-bold text-green-400">
            {trades.filter(trade => calculateTradePnL(trade) > 0).length}
          </p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-400">การเทรดที่ขาดทุน</p>
          <p className="text-xl font-bold text-red-400">
            {trades.filter(trade => calculateTradePnL(trade) < 0).length}
          </p>
        </div>
      </div>
    </div>
  );
}
