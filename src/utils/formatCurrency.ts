/**
 * จัดรูปแบบตัวเลขเป็นสกุลเงิน USD
 * @param amount - จำนวนเงิน
 * @param decimals - จำนวนทศนิยม (default: 2)
 * @returns สตริงที่จัดรูปแบบแล้ว
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * จัดรูปแบบตัวเลขเป็น USD แบบกะทัดรัด (ไม่มีสัญลักษณ์ $ ข้างหน้า)
 * @param amount - จำนวนเงิน
 * @param decimals - จำนวนทศนิยม (default: 2)
 * @returns สตริงที่จัดรูปแบบแล้ว
 */
export function formatAmount(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * จัดรูปแบบตัวเลขกำไร/ขาดทุนพร้อมเครื่องหมาย + หรือ -
 * @param amount - จำนวนเงิน
 * @param decimals - จำนวนทศนิยม (default: 2)
 * @returns สตริงที่จัดรูปแบบแล้ว
 */
export function formatPnL(amount: number, decimals: number = 2): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${formatAmount(Math.abs(amount), decimals)}`;
}

/**
 * จัดรูปแบบตัวเลขแบบย่อ (K, M, B)
 * @param amount - จำนวนเงิน
 * @returns สตริงที่จัดรูปแบบแล้ว
 */
export function formatCompactCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatCurrency(amount);
  }
}

/**
 * แปลงจากบาทเป็น USD (ใช้อัตราแลกเปลี่ยนโดยประมาณ)
 * @param bahtAmount - จำนวนเงินบาท
 * @param exchangeRate - อัตราแลกเปลี่ยน (default: 35 บาทต่อ 1 USD)
 * @returns จำนวนเงิน USD
 */
export function convertBahtToUsd(bahtAmount: number, exchangeRate: number = 35): number {
  return bahtAmount / exchangeRate;
}

/**
 * แปลงจาก USD เป็นบาท
 * @param usdAmount - จำนวนเงิน USD
 * @param exchangeRate - อัตราแลกเปลี่ยน (default: 35 บาทต่อ 1 USD)
 * @returns จำนวนเงินบาท
 */
export function convertUsdToBaht(usdAmount: number, exchangeRate: number = 35): number {
  return usdAmount * exchangeRate;
} 