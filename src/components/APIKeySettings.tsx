'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function APIKeySettings() {
  const [apiKey, setApiKey] = useLocalStorage<string>('gemini-api-key', '');
  const [inputValue, setInputValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'unknown' | 'testing' | 'success' | 'error';
    message: string;
    lastTested?: string;
  }>({ status: 'unknown', message: '' });

  useEffect(() => {
    setInputValue(apiKey);
    // Reset connection status when API key changes
    if (apiKey) {
      setConnectionStatus({ status: 'unknown', message: 'กรุณาทดสอบการเชื่อมต่อ' });
    }
  }, [apiKey]);

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus({ 
        status: 'error', 
        message: 'กรุณาใส่ API Key ก่อนทดสอบ' 
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus({ status: 'testing', message: 'กำลังทดสอบการเชื่อมต่อ...' });

    try {
      const response = await fetch('/api/test-gemini-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnectionStatus({
          status: 'success',
          message: 'เชื่อมต่อสำเร็จ! API Key ใช้งานได้',
          lastTested: new Date().toLocaleString('th-TH')
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: data.error || 'ไม่สามารถเชื่อมต่อได้',
          lastTested: new Date().toLocaleString('th-TH')
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus({
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ',
        lastTested: new Date().toLocaleString('th-TH')
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (inputValue.trim()) {
      setApiKey(inputValue.trim());
      setIsSaved(true);
      // Auto test connection after saving
      setTimeout(async () => {
        setIsSaved(false);
        // Test connection automatically after saving
        await testConnection();
      }, 1000);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setApiKey('');
    setConnectionStatus({ status: 'unknown', message: '' });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'testing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl">🔑</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">การตั้งค่า Gemini API Key</h2>
        </div>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors w-full sm:w-auto"
        >
          {isVisible ? 'ซ่อน' : 'แสดง'}
        </button>
      </div>

      {isVisible && (
        <div className="space-y-4 sm:space-y-6">
          {/* คำอธิบาย */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-3">วิธีการใช้งาน</h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>ไปที่ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">Google AI Studio</a></li>
              <li>สร้าง API Key ใหม่หรือใช้ที่มีอยู่</li>
              <li>คัดลอก API Key มาใส่ในช่องด้านล่าง</li>
              <li>กดบันทึกและทดสอบการเชื่อมต่อ</li>
              <li>เมื่อเชื่อมต่อสำเร็จจึงจะใช้งานฟีเจอร์ AI Analysis ได้</li>
            </ol>
          </div>

          {/* สถานะปัจจุบัน */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-sm font-medium text-gray-300">สถานะ API Key:</span>
              <span className={`text-sm font-bold ${apiKey ? 'text-green-400' : 'text-red-400'}`}>
                {apiKey ? '✅ ตั้งค่าแล้ว' : '❌ ยังไม่ได้ตั้งค่า'}
              </span>
            </div>
            
            {/* สถานะการเชื่อมต่อ */}
            {apiKey && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm text-gray-400">สถานะการเชื่อมต่อ:</span>
                  <span className={`text-sm font-bold ${getStatusColor()}`}>
                    {getStatusIcon()} {connectionStatus.message}
                  </span>
                </div>
                
                {connectionStatus.lastTested && (
                  <div className="text-xs text-gray-500">
                    ทดสอบล่าสุด: {connectionStatus.lastTested}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm text-gray-400 flex-shrink-0">Key:</span>
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-yellow-400 font-mono break-all">
                    {showKey ? apiKey : maskApiKey(apiKey)}
                  </code>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="text-xs text-blue-400 hover:underline flex-shrink-0"
                  >
                    {showKey ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Input สำหรับ API Key */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Reset connection status when input changes
                  setConnectionStatus({ status: 'unknown', message: '' });
                }}
                placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 pr-12 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
              >
                {showKey ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-400">
              API Key จะถูกเก็บไว้ใน Local Storage ของเบราว์เซอร์เท่านั้น ไม่ได้ส่งไปเซิร์ฟเวอร์
            </div>
          </div>

          {/* ปุ่มจัดการ */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={!inputValue.trim()}
              className="w-full sm:flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSaved ? '✅ บันทึกแล้ว' : 'บันทึก API Key'}
            </button>
            
            {apiKey && (
              <>
                <button
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="w-full sm:w-auto rounded-lg bg-green-600 px-4 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isTestingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">ทดสอบ...</span>
                      <span className="sm:hidden">ทดสอบ</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">🔧 ทดสอบการเชื่อมต่อ</span>
                      <span className="sm:hidden">🔧 ทดสอบ</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClear}
                  className="w-full sm:w-auto rounded-lg bg-red-600 px-4 py-3 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  <span className="hidden sm:inline">ลบ Key</span>
                  <span className="sm:hidden">ลบ</span>
                </button>
              </>
            )}
          </div>

          {/* คำเตือนความปลอดภัย */}
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400">⚠️</span>
              <h4 className="text-sm font-semibold text-yellow-400">ข้อควรระวัง</h4>
            </div>
            <ul className="text-xs sm:text-sm text-gray-300 space-y-1.5 list-disc list-inside">
              <li>ไม่ควรแชร์ API Key กับผู้อื่น</li>
              <li>ตรวจสอบการใช้งาน API ที่ Google AI Studio เป็นประจำ</li>
              <li>API Key จะหายไปเมื่อล้างข้อมูลเบราว์เซอร์</li>
              <li>หาก API Key หรือรั่วไหล ให้สร้างใหม่ทันที</li>
              <li>ทดสอบการเชื่อมต่อเป็นประจำเพื่อให้แน่ใจว่าใช้งานได้</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 