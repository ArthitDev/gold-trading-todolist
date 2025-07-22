import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface TestConnectionRequest {
  apiKey: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TestConnectionRequest = await request.json();
    const { apiKey } = body;

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'กรุณาใส่ API Key' 
        },
        { status: 400 }
      );
    }

    // ทดสอบการเชื่อมต่อด้วยการส่ง prompt ง่ายๆ
    const testPrompt = 'สวัสดี กรุณาตอบว่า "การเชื่อมต่อสำเร็จ" เป็นภาษาไทย';

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey.trim(),
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: testPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.1,
          maxOutputTokens: 50,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API test error:', errorText);
      
      // ตรวจสอบ error code เฉพาะ
      if (response.status === 400) {
        return NextResponse.json({
          success: false,
          error: 'API Key ไม่ถูกต้องหรือไม่มีสิทธิ์เข้าถึง'
        });
      } else if (response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'API Key ไม่มีสิทธิ์ใช้งาน Gemini API'
        });
      } else if (response.status === 429) {
        return NextResponse.json({
          success: false,
          error: 'เกินจำนวนการเรียกใช้ API ที่อนุญาต'
        });
      } else {
        return NextResponse.json({
          success: false,
          error: `การเชื่อมต่อล้มเหลว (${response.status})`
        });
      }
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้รับการตอบสนองที่ถูกต้องจาก API'
      });
    }

    // ตรวจสอบว่าได้รับการตอบสนองที่เหมาะสม
    if (responseText.includes('การเชื่อมต่อสำเร็จ') || responseText.includes('สำเร็จ')) {
      return NextResponse.json({
        success: true,
        message: 'การเชื่อมต่อสำเร็จ! Gemini API พร้อมใช้งาน',
        apiVersion: 'gemini-2.0-flash',
        responseTime: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'การเชื่อมต่อสำเร็จ แต่การตอบสนองอาจไม่ตรงตามที่คาดหวัง',
        apiVersion: 'gemini-2.0-flash',
        responseTime: new Date().toISOString(),
        actualResponse: responseText.substring(0, 100) // แสดงบางส่วนของ response
      });
    }

  } catch (error) {
    console.error('Connection test error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        success: false,
        error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Gemini ได้'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ'
    }, { status: 500 });
  }
} 