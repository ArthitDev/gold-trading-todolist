# บันทึกการเทรดทอง (Gold Trading Tracker)

แอปพลิเคชันสำหรับบันทึกและวิเคราะห์ประวัติการเทรดทองคำ พร้อมฟีเจอร์การจัดการข้อมูลที่ครบครัน และ **การวิเคราะห์ด้วย AI**

## ฟีเจอร์หลัก

### 📊 การบันทึกการเทรด
- เพิ่มรายการเทรดใหม่พร้อมข้อมูลครบครัน
- เลือกประเภทการเทรด (ซื้อ/ขาย)
- เพิ่มหมายเหตุสำหรับแต่ละการเทรด
- ระบบบันทึกที่เรียบง่ายและใช้งานง่าย

### 🤖 การวิเคราะห์ด้วย AI (ใหม่!)
- **วิเคราะห์ประสิทธิภาพ**: ประเมินผลงานโดยรวมและจุดแข็ง-จุดอ่อน
- **วิเคราะห์ความเสี่ยง**: ประเมินระดับความเสี่ยงและการจัดการ
- **คำแนะนำปรับปรุง**: แนวทางพัฒนาและปรับปรุงการเทรด
- **วิเคราะห์กลยุทธ์**: ประเมินและแนะนำกลยุทธ์การเทรด
- **การแสดงผลด้วย Markdown**: ผลการวิเคราะห์ในรูปแบบที่อ่านง่าย
- **ใช้ Gemini AI**: เทคโนโลยี AI ล่าสุดจาก Google

### 💾 การจัดการข้อมูล Local Storage
- **บันทึกอัตโนมัติ**: ข้อมูลทั้งหมดถูกบันทึกใน Local Storage ของเบราว์เซอร์
- **ส่งออกข้อมูล**: Export เป็นไฟล์ JSON หรือ CSV
- **นำเข้าข้อมูล**: Import จากไฟล์ JSON
- **สำรองข้อมูล**: Backup และ Restore อัตโนมัติ
- **Auto Backup**: สร้าง backup อัตโนมัติทุก 5 รายการใหม่

### 📈 การวิเคราะห์และสถิติ
- สรุปกำไร/ขาดทุนรวม
- อัตราการชนะ (Win Rate)
- จำนวนการเทรดที่ได้กำไร/ขาดทุน
- กราฟแสดงผลรายวัน
- กราฟสะสมกำไร/ขาดทุน
- **กราฟ Pie Chart**: สัดส่วนการเทรดตามช่วงเวลา (รายวัน/สัปดาห์/เดือน/ปี)
- **สถิติเชิงลึก**: Profit Factor, Max Drawdown, Consecutive Wins/Losses

### 🛠️ ฟีเจอร์เพิ่มเติม
- การลบรายการเทรดแต่ละรายการ
- การลบข้อมูลทั้งหมด
- ตั้งค่าเงินทุนเริ่มต้น
- UI ที่เรียบง่ายและใช้งานสะดวก
- รองรับ TypeScript เต็มรูปแบบ

## วิธีการใช้งาน

### การเริ่มต้น
1. กรอกเงินทุนเริ่มต้นในส่วน "ตั้งค่าเงินทุนเริ่มต้น"
2. เพิ่มรายการเทรดในส่วน "เพิ่มรายการเทรดใหม่"

### การเพิ่มรายการเทรด
1. เลือกวันที่เทรด
2. เลือกประเภทการเทรด (ซื้อ/ขาย)
3. กรอกราคาเข้า
4. กรอกราคาออก
5. กรอกขนาด Lot
6. เพิ่มหมายเหตุ (ไม่บังคับ)
7. กดปุ่ม "เพิ่มรายการเทรด"

### การใช้งานการวิเคราะห์ AI
1. **เลือกประเภทการวิเคราะห์**:
   - 📊 วิเคราะห์ประสิทธิภาพ
   - ⚠️ วิเคราะห์ความเสี่ยง
   - 🚀 คำแนะนำปรับปรุง
   - 🎯 วิเคราะห์กลยุทธ์

2. **กดปุ่ม "เริ่มวิเคราะห์ด้วย AI"**
3. **รอผลการวิเคราะห์** (ประมาณ 10-30 วินาที)
4. **อ่านการวิเคราะห์** ในรูปแบบ Markdown ที่จัดรูปแบบแล้ว
5. **คัดลอกผลการวิเคราะห์** หากต้องการนำไปใช้ที่อื่น

### การจัดการข้อมูล
ในส่วน "จัดการข้อมูล" คุณสามารถ:

#### ส่งออกข้อมูล
- **JSON**: สำหรับการสำรองข้อมูลหรือนำเข้าใหม่
- **CSV**: สำหรับการวิเคราะห์ใน Excel หรือ Google Sheets

#### นำเข้าข้อมูล
- เลือกไฟล์ JSON ที่ส่งออกจากระบบ
- ข้อมูลจะถูกตรวจสอบความถูกต้องก่อนนำเข้า

#### สำรองข้อมูล
- **สร้าง Backup**: สร้างการสำรองข้อมูลใน Local Storage
- **กู้คืนจาก Backup**: กู้คืนข้อมูลจาก backup ล่าสุด

## โครงสร้างข้อมูล

### ข้อมูลการเทรด (Trade)
```typescript
interface Trade {
  id?: string;              // รหัสเฉพาะ
  date: string;             // วันที่เทรด
  entryPrice: number;       // ราคาเข้า
  exitPrice: number;        // ราคาออก
  lotSize: number;          // ขนาด Lot
  type?: 'buy' | 'sell';    // ประเภทการเทรด
  note?: string;            // หมายเหตุ
  createdAt?: string;       // เวลาที่สร้างรายการ
}
```

## การตั้งค่า AI

### ความต้องการ
- Gemini API Key จาก Google AI Studio
- การเชื่อมต่ออินเทอร์เน็ต

### การตั้งค่า API Key
1. ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. สร้าง API Key ใหม่
3. สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:
```
GEMINI_API_KEY=your_api_key_here
```

### ประเภทการวิเคราะห์ AI

#### 📊 วิเคราะห์ประสิทธิภาพ
- ประเมินผลงานโดยรวม
- จุดแข็งของการเทรด
- จุดที่ต้องปรับปรุง
- การจัดการความเสี่ยง
- แนวโน้มการเทรด

#### ⚠️ วิเคราะห์ความเสี่ยง
- ระดับความเสี่ยงปัจจุบัน
- การกระจายความเสี่ยง
- Max Drawdown Analysis
- Consecutive Losses
- คำแนะนำการจัดการความเสี่ยง

#### 🚀 คำแนะนำปรับปรุง
- จุดที่ต้องปรับปรุงเร่งด่วน
- กลยุทธ์การปรับปรุง
- การตั้งเป้าหมาย
- การพัฒนาทักษะ
- แผนการดำเนินการ

#### 🎯 วิเคราะห์กลยุทธ์
- รูปแบบการเทรดปัจจุบัน
- ประสิทธิภาพของกลยุทธ์
- การปรับปรุงกลยุทธ์
- กลยุทธ์ทางเลือก
- การเลือกจังหวะ

## Local Storage Keys

แอปใช้ Local Storage keys ดังนี้:
- `gold-trades`: ข้อมูลการเทรดทั้งหมด
- `base-capital`: เงินทุนเริ่มต้น
- `gold-trades-backup`: ข้อมูล backup manual
- `gold-trades-auto-backup`: ข้อมูล backup อัตโนมัติ

## การติดตั้งและพัฒนา

### ความต้องการของระบบ
- Node.js 18+ 
- npm หรือ yarn

### การติดตั้ง
```bash
npm install
```

### การตั้งค่า Environment Variables
สร้างไฟล์ `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### การรัน Development Server
```bash
npm run dev
```

### การ Build สำหรับ Production
```bash
npm run build
```

## เทคโนโลยีที่ใช้

- **Next.js 14**: React Framework
- **TypeScript**: Type Safety
- **Tailwind CSS**: Styling
- **Recharts**: Data Visualization
- **Local Storage API**: ข้อมูลผู้ใช้
- **File API**: Export/Import
- **Gemini AI**: Google's AI for analysis
- **React Markdown**: Markdown rendering
- **Remark GFM**: GitHub Flavored Markdown

## ความปลอดภัยของข้อมูล

### การสำรองข้อมูล
- ข้อมูลถูกบันทึกใน Local Storage โดยอัตโนมัติ
- Auto backup ทุก 5 รายการใหม่
- สามารถ export ข้อมูลเป็นไฟล์ได้ตลอดเวลา

### ความปลอดภัย AI
- API Key ถูกเก็บใน environment variables
- ข้อมูลการเทรดส่งไปยัง AI เพื่อการวิเคราะห์เท่านั้น
- ไม่มีการเก็บข้อมูลส่วนตัวใน AI service

### ข้อควรระวัง
- ข้อมูลจะหายหากลบ Local Storage หรือ Clear Browser Data
- แนะนำให้ export ข้อมูลเป็นไฟล์เป็นประจำ
- ข้อมูลเก็บเฉพาะในเบราว์เซอร์เครื่องนี้เท่านั้น
- API Key ควรเก็บเป็นความลับ

## การแก้ปัญหา

### ข้อมูลหายไป
1. ตรวจสอบ backup อัตโนมัติในส่วน "จัดการข้อมูล"
2. ใช้ฟีเจอร์ "กู้คืนจาก Backup"

### ไม่สามารถ import ข้อมูลได้
1. ตรวจสอบว่าไฟล์เป็น JSON format
2. ตรวจสอบว่าไฟล์ไม่เสียหาย
3. ลองส่งออกข้อมูลตัวอย่างแล้วนำเข้าใหม่



### การวิเคราะห์ AI ไม่ทำงาน
1. ตรวจสอบ API Key ใน `.env.local`
2. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
3. ตรวจสอบว่ามีข้อมูลการเทรดอย่างน้อย 1 รายการ
4. ลองรีเฟรชหน้าเว็บและทำใหม่

## ใบอนุญาต

MIT License

---

## 🎉 ฟีเจอร์ใหม่ในเวอร์ชันนี้

### 🤖 การวิเคราะห์ด้วย AI
- การวิเคราะห์อัตโนมัติด้วย Gemini AI
- 4 ประเภทการวิเคราะห์ที่ครอบคลุม
- การแสดงผลด้วย Markdown ที่สวยงาม
- คำแนะนำเฉพาะสำหรับการปรับปรุงการเทรด

### 📊 กราฟและสถิติเพิ่มเติม
- Pie Chart แสดงสัดส่วนการเทรด
- ตัวเลือกช่วงเวลา (รายวัน/สัปดาห์/เดือน/ปี)
- สถิติเชิงลึกที่ครอบคลุมมากขึ้น
- Performance indicators แบบมืออาชีพ 