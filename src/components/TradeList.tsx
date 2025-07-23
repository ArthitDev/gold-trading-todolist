
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Trade } from '@/hooks/useLocalStorage';
import { calculateTradePnL, calculateTotalOunces, calculatePnLPerOunce, GOLD_LOT_SIZE } from '@/utils/tradeCalculations';
import { formatAmount, formatPnL } from '@/utils/formatCurrency';
import { ConfirmModal } from './Modal';

interface TradeListProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
}

export default function TradeList({ trades, onDeleteTrade }: TradeListProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    trade: Trade | null;
  }>({ isOpen: false, trade: null });

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades]);

  const handleDeleteClick = (trade: Trade) => {
    setDeleteModal({ isOpen: true, trade });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.trade?.id) {
      onDeleteTrade(deleteModal.trade.id);
      toast.success('ลบการเทรดเรียบร้อยแล้ว', {
        icon: '🗑️',
        duration: 3000,
      });
    }
    setDeleteModal({ isOpen: false, trade: null });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, trade: null });
  };

  if (trades.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-white">ประวัติการเทรด</h2>
        <div className="flex items-center justify-center py-8 sm:py-12">
          <p className="text-gray-400 text-base sm:text-lg">ยังไม่มีข้อมูลการเทรด</p>
        </div>
      </div>
    );
  }

  const getTradeDetails = (trade: Trade) => {
    const pnl = calculateTradePnL(trade);
    const tradeInfo = `${trade.type === 'buy' ? 'ซื้อ' : 'ขาย'} ${trade.lotSize} lot • ${formatPnL(pnl)}`;
    const dateInfo = new Date(trade.date).toLocaleDateString('th-TH');
    return { pnl, tradeInfo, dateInfo };
  };

  return (
    <>
      <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-white">ประวัติการเทรด</h2>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-700">
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
                        onClick={() => handleDeleteClick(trade)}
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

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {sortedTrades.map((trade) => {
            const pnl = calculateTradePnL(trade);
            return (
              <div key={trade.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-white font-semibold">
                      {new Date(trade.date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 w-fit ${
                      trade.type === 'buy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.type === 'buy' ? 'ซื้อ' : 'ขาย'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(trade)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                  >
                    ลบ
                  </button>
                </div>

                {/* Trade Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400 block">ราคาเข้า</span>
                    <span className="text-white font-mono">${formatAmount(trade.entryPrice)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ราคาออก</span>
                    <span className="text-white font-mono">${formatAmount(trade.exitPrice)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ขนาด Lot</span>
                    <div>
                      <span className="text-white font-mono">{formatAmount(trade.lotSize)}</span>
                      <span className="text-xs text-gray-500 block">
                        ({calculateTotalOunces(trade.lotSize).toFixed(0)} oz)
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block">กำไร/ขาดทุน</span>
                    <div>
                      <span className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPnL(pnl)}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        (${formatAmount(Math.abs(calculatePnLPerOunce(trade)))}/oz)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                {trade.note && (
                  <div className="pt-2 border-t border-gray-600">
                    <span className="text-gray-400 text-sm block mb-1">หมายเหตุ</span>
                    <span className="text-gray-300 text-sm">{trade.note}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* สรุปสถิติในตาราง */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Delete Confirmation Modal */}
      {deleteModal.trade && (
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="ยืนยันการลบการเทรด"
          message="ต้องการลบการเทรดนี้หรือไม่?"
          details={`วันที่: ${getTradeDetails(deleteModal.trade).dateInfo} • ${getTradeDetails(deleteModal.trade).tradeInfo}`}
          confirmText="ลบ"
          cancelText="ยกเลิก"
          confirmVariant="danger"
          icon="🗑️"
        />
      )}
    </>
  );
}
