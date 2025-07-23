'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ConfirmModal } from './Modal';

export default function APIKeySettings() {
  const [apiKey, setApiKey] = useLocalStorage('gemini-api-key', '');
  const [tempApiKey, setTempApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [clearModal, setClearModal] = useState(false);

  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const testConnection = async () => {
    if (!tempApiKey.trim()) {
      toast.error('กรุณากรอก API Key ก่อนทดสอบ', {
        icon: '❌',
      });
      return;
    }

    setConnectionStatus('testing');
    const testToast = toast.loading('กำลังทดสอบการเชื่อมต่อ...', {
      icon: '⏳',
    });

    try {
      const response = await fetch('/api/test-gemini-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: tempApiKey }),
      });

      if (response.ok) {
        setConnectionStatus('success');
        toast.dismiss(testToast);
        toast.success('เชื่อมต่อสำเร็จ! API Key ใช้งานได้', {
          icon: '✅',
          duration: 4000,
        });
      } else {
        const errorData = await response.json();
        setConnectionStatus('error');
        toast.dismiss(testToast);
        toast.error(`การเชื่อมต่อล้มเหลว: ${errorData.error || 'ไม่ทราบสาเหตุ'}`, {
          icon: '❌',
          duration: 5000,
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.dismiss(testToast);
      toast.error('เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ', {
        icon: '❌',
      });
    }
  };

  const handleSave = () => {
    if (!tempApiKey.trim()) {
      toast.error('กรุณากรอก API Key ก่อนบันทึก', {
        icon: '❌',
      });
      return;
    }

    setApiKey(tempApiKey);
    setConnectionStatus('idle');
    
    // Dispatch custom event เพื่อแจ้งให้ component อื่นทราบว่า API key ถูกอัปเดต
    window.dispatchEvent(new CustomEvent('apikey-updated'));
    
    toast.success('บันทึก API Key เรียบร้อยแล้ว', {
      icon: '💾',
      duration: 3000,
    });
  };

  const handleClear = () => {
    setClearModal(true);
  };

  const confirmClear = () => {
    setApiKey('');
    setTempApiKey('');
    setConnectionStatus('idle');
    setClearModal(false);
    
    // Dispatch custom event เพื่อแจ้งให้ component อื่นทราบว่า API key ถูกล้าง
    window.dispatchEvent(new CustomEvent('apikey-updated'));
    
    toast.success('ล้าง API Key เรียบร้อยแล้ว', {
      icon: '🗑️',
      duration: 3000,
    });
  };

  const closeClearModal = () => {
    setClearModal(false);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>;
      case 'success':
        return <span className="text-green-400">✅</span>;
      case 'error':
        return <span className="text-red-400">❌</span>;
      default:
        return <span className="text-gray-400">🔑</span>;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'กำลังทดสอบ...';
      case 'success':
        return 'เชื่อมต่อสำเร็จ';
      case 'error':
        return 'เชื่อมต่อล้มเหลว';
      default:
        return apiKey ? 'พร้อมใช้งาน' : 'ยังไม่ได้ตั้งค่า';
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <>
      <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl">🔑</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">ตั้งค่า Gemini API Key</h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
          >
            <span>{isExpanded ? 'ย่อ' : 'ขยาย'}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* สถานะ - แสดงตลอด */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">สถานะ API Key:</span>
              <span className={`text-sm font-bold ${apiKey ? 'text-green-400' : 'text-red-400'}`}>
                {apiKey ? '✅ ตั้งค่าแล้ว' : '❌ ยังไม่ได้ตั้งค่า'}
              </span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">การเชื่อมต่อ:</span>
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon()}
                <span className="text-gray-300">{getStatusText()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Key ที่มีอยู่ - แสดงเมื่อมี key */}
        {apiKey && (
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm text-gray-400">API Key ปัจจุบัน:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-800 px-2 py-1 rounded text-yellow-400 font-mono">
                  {isVisible ? apiKey : maskApiKey(apiKey)}
                </code>
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className="text-xs text-blue-400 hover:underline"
                >
                  {isVisible ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* เนื้อหาที่ย่อขยายได้ */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-700 pt-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                  API Key ใหม่
                </label>
                <div className="relative">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    id="apiKey"
                    value={tempApiKey}
                    onChange={(e) => {
                      setTempApiKey(e.target.value);
                      setConnectionStatus('idle');
                    }}
                    placeholder="กรอก Gemini API Key ของคุณ"
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  >
                    {isVisible ? (
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
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={testConnection}
                  disabled={connectionStatus === 'testing' || !tempApiKey.trim()}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connectionStatus === 'testing' ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!tempApiKey.trim() || tempApiKey === apiKey}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  บันทึก
                </button>
                
                {apiKey && (
                  <button
                    onClick={handleClear}
                    className="flex-1 sm:flex-none rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>

            {/* คำแนะนำ */}
            <div className="rounded-lg bg-blue-900/20 border border-blue-500/30 p-4">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">ℹ️</span>
                <div className="text-xs sm:text-sm text-blue-200">
                  <p className="font-semibold mb-2">วิธีการรับ API Key:</p>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>ไปที่ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google AI Studio</a></li>
                    <li>สร้าง API Key ใหม่</li>
                    <li>คัดลอกและนำมาใส่ในช่องด้านบน</li>
                    <li>ทดสอบการเชื่อมต่อก่อนบันทึก</li>
                  </ol>
                  <p className="mt-2 text-yellow-200">
                    ⚠️ API Key จะถูกเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={clearModal}
        onClose={closeClearModal}
        onConfirm={confirmClear}
        title="ยืนยันการล้าง API Key"
        message="ต้องการล้าง API Key หรือไม่?"
        details="การวิเคราะห์ด้วย AI จะไม่สามารถใช้งานได้จนกว่าจะตั้งค่า API Key ใหม่"
        confirmText="ล้าง"
        cancelText="ยกเลิก"
        confirmVariant="danger"
        icon="🔑"
      />
    </>
  );
} 