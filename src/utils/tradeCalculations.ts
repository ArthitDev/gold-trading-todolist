import { Trade } from '@/hooks/useLocalStorage';

/**
 * ขนาดของ 1 lot ทองคำ (ออนซ์)
 * โดยปกติ 1 lot = 100 ออนซ์
 */
export const GOLD_LOT_SIZE = 100;

/**
 * คำนวณกำไร-ขาดทุนของการเทรดทองคำ
 * @param trade - ข้อมูลการเทรด
 * @returns กำไร-ขาดทุนเป็น USD
 */
export function calculateTradePnL(trade: Trade): number {
  const { entryPrice, exitPrice, lotSize, type = 'buy' } = trade;
  
  // คำนวณความต่างของราคา
  const priceDifference = exitPrice - entryPrice;
  
  if (type === 'sell') {
    // สำหรับ Sell: กำไรเมื่อราคาลดลง (เราขายสูง ซื้อคืนต่ำ)
    return -priceDifference * lotSize * GOLD_LOT_SIZE;
  } else {
    // สำหรับ Buy: กำไรเมื่อราคาขึ้น (เราซื้อต่ำ ขายสูง)
    return priceDifference * lotSize * GOLD_LOT_SIZE;
  }
}

/**
 * คำนวณกำไร-ขาดทุนแบบง่าย (เพื่อความเข้ากันได้เดิม)
 */
export function calculatePnL(entryPrice: number, exitPrice: number, lotSize: number, type: 'buy' | 'sell' = 'buy'): number {
  const priceDifference = exitPrice - entryPrice;
  
  if (type === 'sell') {
    return -priceDifference * lotSize * GOLD_LOT_SIZE;
  } else {
    return priceDifference * lotSize * GOLD_LOT_SIZE;
  }
}

/**
 * คำนวณกำไร-ขาดทุนต่อออนซ์
 * @param trade - ข้อมูลการเทรด
 * @returns กำไร-ขาดทุนต่อออนซ์เป็น USD
 */
export function calculatePnLPerOunce(trade: Trade): number {
  const { entryPrice, exitPrice, type = 'buy' } = trade;
  
  const priceDifference = exitPrice - entryPrice;
  
  if (type === 'sell') {
    return -priceDifference;
  } else {
    return priceDifference;
  }
}

/**
 * คำนวณจำนวนออนซ์ทั้งหมดที่เทรด
 * @param lotSize - จำนวน lot
 * @returns จำนวนออนซ์ทั้งหมด
 */
export function calculateTotalOunces(lotSize: number): number {
  return lotSize * GOLD_LOT_SIZE;
}

/**
 * คำนวณมูลค่าการเทรดทั้งหมด (Notional Value)
 * @param price - ราคาทองคำ
 * @param lotSize - จำนวน lot
 * @returns มูลค่าเป็น USD
 */
export function calculateNotionalValue(price: number, lotSize: number): number {
  return price * lotSize * GOLD_LOT_SIZE;
}

/**
 * ตรวจสอบว่าการเทรดนั้นได้กำไรหรือไม่
 */
export function isTradeProfit(trade: Trade): boolean {
  return calculateTradePnL(trade) > 0;
}

/**
 * ตรวจสอบว่าการเทรดนั้นขาดทุนหรือไม่
 */
export function isTradeLoss(trade: Trade): boolean {
  return calculateTradePnL(trade) < 0;
}

/**
 * คำนวณเปอร์เซ็นต์กำไร/ขาดทุน
 * @param trade - ข้อมูลการเทรด
 * @returns เปอร์เซ็นต์กำไร/ขาดทุน
 */
export function calculatePnLPercentage(trade: Trade): number {
  const pnl = calculateTradePnL(trade);
  const entryValue = calculateNotionalValue(trade.entryPrice, trade.lotSize);
  
  return entryValue > 0 ? (pnl / entryValue) * 100 : 0;
} 