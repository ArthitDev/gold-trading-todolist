import { NextRequest, NextResponse } from 'next/server';
import { calculateTradePnL } from '@/utils/tradeCalculations';

// Fallback API Key สำหรับกรณีที่ผู้ใช้ไม่ได้ตั้งค่า API Key เอง
const FALLBACK_GEMINI_API_KEY = 'AIzaSyBZrddIgoVtaCIC5vQE6y1yPvay4dkzT9k';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface Trade {
  id?: string;
  date: string;
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  type?: 'buy' | 'sell';
  note?: string;
  createdAt?: string;
}

interface AnalysisRequest {
  trades: Trade[];
  capital: number;
  analysisType?: 'performance' | 'risk' | 'improvement' | 'strategy';
  apiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { trades, capital, analysisType = 'performance', apiKey } = body;

    if (!trades || trades.length === 0) {
      return NextResponse.json(
        { error: 'ไม่มีข้อมูลการเทรดสำหรับการวิเคราะห์' },
        { status: 400 }
      );
    }

    // ใช้ API Key จากผู้ใช้ หรือ fallback เป็น default
    const geminiApiKey = apiKey || FALLBACK_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json({ 
        error: 'ไม่พบ Gemini API Key กรุณาตั้งค่า API Key ในหน้าการตั้งค่า' 
      }, { status: 400 });
    }

    // คำนวณสถิติพื้นฐาน
    const stats = calculateTradingStats(trades);
    
    // สร้าง prompt สำหรับ AI
    const prompt = generateAnalysisPrompt(trades, capital, stats, analysisType);

    // เรียก Gemini API
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: 'ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'ไม่สามารถสร้างการวิเคราะห์ได้';

    return NextResponse.json({
      analysis,
      stats,
      analysisType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการวิเคราะห์' },
      { status: 500 }
    );
  }
}

function calculateTradingStats(trades: Trade[]) {
  const pnls = trades.map(trade => calculateTradePnL(trade));
  const wins = pnls.filter(pnl => pnl > 0);
  const losses = pnls.filter(pnl => pnl < 0);
  
  const totalPnl = pnls.reduce((sum, pnl) => sum + pnl, 0);
  const totalWins = wins.reduce((sum, win) => sum + win, 0);
  const totalLosses = Math.abs(losses.reduce((sum, loss) => sum + loss, 0));

  // คำนวณ drawdown
  let maxDrawdown = 0;
  let peak = 0;
  let runningPnl = 0;
  
  pnls.forEach(pnl => {
    runningPnl += pnl;
    if (runningPnl > peak) {
      peak = runningPnl;
    }
    const drawdown = peak - runningPnl;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  // หาจำนวนการเทรดติดต่อกัน
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  pnls.forEach(pnl => {
    if (pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else if (pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    }
  });

  return {
    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
    totalPnl,
    averageWin: wins.length > 0 ? totalWins / wins.length : 0,
    averageLoss: losses.length > 0 ? totalLosses / losses.length : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
    maxDrawdown,
    maxWinStreak,
    maxLossStreak,
    largestWin: wins.length > 0 ? Math.max(...wins) : 0,
    largestLoss: losses.length > 0 ? Math.min(...losses) : 0,
  };
}

function generateAnalysisPrompt(trades: Trade[], capital: number, stats: any, analysisType: string): string {
  const recentTrades = trades.slice(-10); // 10 การเทรดล่าสุด
  
  const basePrompt = `
คุณเป็น AI Trading Analyst ผู้เชี่ยวชาญด้านการวิเคราะห์การเทรดทองคำ

ข้อมูลการเทรด:
- เงินทุนเริ่มต้น: $${capital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
- จำนวนการเทรดทั้งหมด: ${stats.totalTrades}
- อัตราชนะ: ${stats.winRate.toFixed(1)}%
- กำไรขาดทุนรวม: $${stats.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
- Profit Factor: ${stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
- กำไรเฉลี่ย: $${stats.averageWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
- ขาดทุนเฉลี่ย: $${stats.averageLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
- Max Drawdown: $${stats.maxDrawdown.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
- ชนะติดต่อกันสูงสุด: ${stats.maxWinStreak} ครั้ง
- แพ้ติดต่อกันสูงสุด: ${stats.maxLossStreak} ครั้ง

การเทรด 10 รายการล่าสุด:
${recentTrades.map((trade, index) => {
  const pnl = calculateTradePnL(trade);
  return `${index + 1}. ${trade.date}: ${trade.type?.toUpperCase() || 'BUY'} - เข้า $${trade.entryPrice.toFixed(2)} ออก $${trade.exitPrice.toFixed(2)} ขนาด ${trade.lotSize} = ${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toFixed(2)} USD${trade.note ? ` (${trade.note})` : ''}`;
}).join('\n')}
`;

  const analysisPrompts = {
    performance: `${basePrompt}

กรุณาวิเคราะห์ประสิทธิภาพการเทรดโดยครอบคลุม:
1. **ประเมินผลงานโดยรวม** - ดีหรือต้องปรับปรุง และเพราะอะไร
2. **จุดแข็งของการเทรด** - สิ่งที่ทำได้ดี
3. **จุดที่ต้องปรับปรุง** - ปัญหาที่พบและวิธีแก้ไข
4. **การจัดการความเสี่ยง** - ประเมิน Risk Management
5. **แนวโน้มการเทรด** - pattern ที่สังเกตได้

ตอบเป็นภาษาไทยในรูปแบบ Markdown ที่อ่านง่าย`,

    risk: `${basePrompt}

กรุณาวิเคราะห์ความเสี่ยงในการเทรดโดยครอบคลุม:
1. **ระดับความเสี่ยงปัจจุบัน** - สูง กลาง หรือต่ำ
2. **การกระจายความเสี่ยง** - วิเคราะห์ position sizing
3. **Max Drawdown Analysis** - ผลกระทบและการป้องกัน
4. **Consecutive Losses** - ความเสี่ยงจากการแพ้ติดต่อกัน
5. **คำแนะนำการจัดการความเสี่ยง** - วิธีลดความเสี่ยง

ตอบเป็นภาษาไทยในรูปแบบ Markdown`,

    improvement: `${basePrompt}

กรุณาให้คำแนะนำในการปรับปรุงการเทรดโดยครอบคลุม:
1. **จุดที่ต้องปรับปรุงเร่งด่วน** - ปัญหาสำคัญที่สุด
2. **กลยุทธ์การปรับปรุง** - วิธีการเฉพาะ
3. **การตั้งเป้าหมาย** - เป้าหมายระยะสั้นและยาว
4. **การพัฒนาทักษะ** - ทักษะที่ควรฝึกฝน
5. **แผนการดำเนินการ** - ขั้นตอนการปรับปรุง

ตอบเป็นภาษาไทยในรูปแบบ Markdown`,

    strategy: `${basePrompt}

กรุณาวิเคราะห์กลยุทธ์การเทรดโดยครอบคลุม:
1. **รูปแบบการเทรดปัจจุบัน** - วิเคราะห์ strategy ที่ใช้
2. **ประสิทธิภาพของกลยุทธ์** - ผลตอบแทนและความเสี่ยง
3. **การปรับปรุงกลยุทธ์** - ข้อเสนอแนะการพัฒนา
4. **กลยุทธ์ทางเลือก** - แนะนำ strategy ใหม่
5. **การเลือกจังหวะ** - timing ในการเข้าและออก

ตอบเป็นภาษาไทยในรูปแบบ Markdown`
  };

  return analysisPrompts[analysisType as keyof typeof analysisPrompts] || analysisPrompts.performance;
} 