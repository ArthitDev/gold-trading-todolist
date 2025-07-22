'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Trade } from '@/hooks/useLocalStorage';
import { calculateTradePnL } from '@/utils/tradeCalculations';
import { formatCurrency, formatPnL } from '@/utils/formatCurrency';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AIAnalysisProps {
  trades: Trade[];
  capital: number;
}

interface AnalysisResult {
  analysis: string;
  stats: any;
  analysisType: string;
  timestamp: string;
}

type AnalysisType = 'performance' | 'risk' | 'improvement' | 'strategy';

export default function AIAnalysis({ trades, capital }: AIAnalysisProps) {
  const [apiKey, setApiKey] = useLocalStorage<string>('gemini-api-key', '');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedType, setSelectedType] = useState<AnalysisType>('performance');
  const [error, setError] = useState<string | null>(null);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'unknown' | 'testing' | 'success' | 'error';
    message: string;
  }>({ status: 'unknown', message: '' });

  // Listen for API key changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedApiKey = localStorage.getItem('gemini-api-key');
      const newApiKey = storedApiKey ? JSON.parse(storedApiKey) : '';
      
      if (newApiKey !== apiKey) {
        setApiKey(newApiKey);
        
        if (newApiKey) {
          // Reset connection status when API key changes
          setConnectionStatus({ status: 'unknown', message: 'API Key ใหม่ - กรุณาทดสอบการเชื่อมต่อ' });
        } else {
          // Clear connection status when API key is removed
          setConnectionStatus({ status: 'unknown', message: '' });
        }
      }
    };

    // Listen for storage events (when other components update localStorage)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event that we'll dispatch from APIKeySettings
    window.addEventListener('apikey-updated', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('apikey-updated', handleStorageChange as EventListener);
    };
  }, [apiKey, setApiKey]);

  // Auto test connection when API key changes and is valid
  useEffect(() => {
    if (apiKey && apiKey.trim() && connectionStatus.status === 'unknown' && 
        connectionStatus.message.includes('API Key ใหม่') && 
        !connectionStatus.message.includes('กำลังเตรียมทดสอบ')) {
      
      // Show preparing message
      setConnectionStatus({ status: 'unknown', message: 'API Key ใหม่ - กำลังเตรียมทดสอบการเชื่อมต่อ...' });
      
      // Auto test connection after a short delay
      const timer = setTimeout(() => {
        testConnection();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [apiKey, connectionStatus]);

  const analysisTypes = {
    performance: {
      label: 'วิเคราะห์ประสิทธิภาพ',
      icon: '📊',
      description: 'ประเมินผลงานโดยรวมและจุดแข็ง-จุดอ่อน'
    },
    risk: {
      label: 'วิเคราะห์ความเสี่ยง',
      icon: '⚠️',
      description: 'ประเมินระดับความเสี่ยงและการจัดการ'
    },
    improvement: {
      label: 'คำแนะนำปรับปรุง',
      icon: '🚀',
      description: 'แนวทางพัฒนาและปรับปรุงการเทรด'
    },
    strategy: {
      label: 'วิเคราะห์กลยุทธ์',
      icon: '🎯',
      description: 'ประเมินและแนะนำกลยุทธ์การเทรด'
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus({ 
        status: 'error', 
        message: 'กรุณาตั้งค่า API Key ก่อนทดสอบ' 
      });
      return false;
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
          message: 'เชื่อมต่อสำเร็จ! พร้อมใช้งาน AI Analysis'
        });
        return true;
      } else {
        setConnectionStatus({
          status: 'error',
          message: data.error || 'ไม่สามารถเชื่อมต่อได้'
        });
        return false;
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus({
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ'
      });
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAnalysis = async () => {
    if (trades.length === 0) {
      setError('ยังไม่มีข้อมูลการเทรดสำหรับการวิเคราะห์');
      return;
    }

    if (!apiKey.trim()) {
      setError('กรุณาตั้งค่า Gemini API Key ก่อนใช้งาน');
      return;
    }

    // ทดสอบการเชื่อมต่อก่อนเริ่มการวิเคราะห์
    const isConnected = await testConnection();
    if (!isConnected) {
      setError('ไม่สามารถเชื่อมต่อกับ Gemini API ได้ กรุณาตรวจสอบ API Key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trades,
          capital,
          analysisType: selectedType,
          apiKey: apiKey || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการวิเคราะห์');
      }

      setAnalysisResult(data);
      setIsAnalysisExpanded(true); // ขยายผลการวิเคราะห์ใหม่โดยอัตโนมัติ
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          🤖 การวิเคราะห์ AI
        </h2>
        
        {/* Analysis Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(analysisTypes).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key as AnalysisType)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 ${
                selectedType === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={config.description}
            >
              <span className="text-lg sm:text-base">{config.icon}</span>
              <span className="text-center leading-tight">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Selection Info */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl sm:text-2xl">{analysisTypes[selectedType].icon}</span>
          <h3 className="text-base sm:text-lg font-semibold text-white">{analysisTypes[selectedType].label}</h3>
        </div>
        <p className="text-gray-300 text-sm mb-4">{analysisTypes[selectedType].description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex justify-between sm:flex-col">
            <span className="text-gray-400">การเทรดทั้งหมด:</span>
            <span className="font-bold text-blue-400">{trades.length}</span>
          </div>
          <div className="flex justify-between sm:flex-col">
            <span className="text-gray-400">เงินทุน:</span>
            <span className="font-bold text-yellow-400">{formatCurrency(capital)}</span>
          </div>
          <div className="flex justify-between sm:flex-col">
            <span className="text-gray-400">กำไรขาดทุน:</span>
            <span className={`font-bold ${
              trades.reduce((sum, trade) => sum + calculateTradePnL(trade), 0) >= 0 
                ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatPnL(trades.reduce((sum, trade) => sum + calculateTradePnL(trade), 0))}
            </span>
          </div>
          <div className="flex justify-between sm:flex-col">
            <span className="text-gray-400">อัตราชนะ:</span>
            <span className="font-bold text-purple-400">
              {trades.length > 0 ? 
                ((trades.filter(trade => calculateTradePnL(trade) > 0).length / trades.length) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* API Key Warning */}
      {!apiKey && (
        <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">⚠️</span>
            <h4 className="text-sm font-semibold text-yellow-400">ต้องตั้งค่า API Key</h4>
          </div>
          <p className="text-sm text-gray-300">
            กรุณาตั้งค่า Gemini API Key ในส่วนการตั้งค่าด้านบนก่อนใช้งานฟีเจอร์ AI Analysis
          </p>
        </div>
      )}

      {/* Connection Status */}
      {apiKey && (
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <span className="text-sm font-medium text-gray-300">สถานะการเชื่อมต่อ Gemini API:</span>
            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="px-3 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 transition-colors flex items-center justify-center gap-1 w-full sm:w-auto"
            >
              {isTestingConnection ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
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
          </div>
          
          <div className={`text-sm font-bold ${
            connectionStatus.status === 'success' ? 'text-green-400' :
            connectionStatus.status === 'error' ? 'text-red-400' :
            connectionStatus.status === 'testing' ? 'text-yellow-400' :
            connectionStatus.message.includes('API Key ใหม่') ? 'text-blue-400' :
            'text-gray-400'
          }`}>
            {connectionStatus.status === 'success' && '✅'}
            {connectionStatus.status === 'error' && '❌'}
            {connectionStatus.status === 'testing' && '🔄'}
            {connectionStatus.status === 'unknown' && connectionStatus.message.includes('API Key ใหม่') && '🆕'}
            {connectionStatus.status === 'unknown' && !connectionStatus.message.includes('API Key ใหม่') && '❓'}
            {' '}
            {connectionStatus.message || 'ยังไม่ได้ทดสอบการเชื่อมต่อ'}
          </div>
          
          {connectionStatus.status === 'error' && (
            <div className="mt-2 text-xs text-red-300">
              💡 แนะนำ: ตรวจสอบ API Key ในส่วนการตั้งค่าด้านบน
            </div>
          )}
        </div>
      )}

      {/* Analysis Button */}
      <div className="mb-6 text-center">
        <button
          onClick={handleAnalysis}
          disabled={isLoading || trades.length === 0 || !apiKey || isTestingConnection}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2 ${
            isLoading || isTestingConnection
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : trades.length === 0 || !apiKey
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : connectionStatus.status === 'success'
              ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="hidden sm:inline">กำลังวิเคราะห์...</span>
              <span className="sm:hidden">วิเคราะห์...</span>
            </>
          ) : isTestingConnection ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="hidden sm:inline">กำลังทดสอบการเชื่อมต่อ...</span>
              <span className="sm:hidden">ทดสอบ...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">🔍 เริ่มวิเคราะห์ด้วย AI</span>
              <span className="sm:hidden">🔍 วิเคราะห์ AI</span>
              {connectionStatus.status === 'success' && (
                <span className="text-xs bg-green-500 px-2 py-1 rounded-full">พร้อม</span>
              )}
            </>
          )}
        </button>
        
        {trades.length === 0 && (
          <p className="mt-2 text-sm text-gray-400">
            กรุณาเพิ่มข้อมูลการเทรดก่อนใช้งานการวิเคราะห์ AI
          </p>
        )}
        
        {apiKey && connectionStatus.status === 'unknown' && (
          <p className="mt-2 text-sm text-yellow-400">
            💡 {connectionStatus.message || 'แนะนำให้ทดสอบการเชื่อมต่อก่อนเริ่มวิเคราะห์'}
          </p>
        )}
        
        {apiKey && connectionStatus.status === 'error' && (
          <p className="mt-2 text-sm text-red-400">
            ❌ ไม่สามารถเชื่อมต่อ API ได้ กรุณาทดสอบการเชื่อมต่อใหม่
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-400">❌</span>
            <span className="text-red-300 font-semibold">เกิดข้อผิดพลาด</span>
          </div>
          <p className="text-red-200 mt-1 text-sm break-words">{error}</p>
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          {/* Collapsible Header */}
          <div 
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-600 transition-colors duration-200 gap-3"
            onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                {analysisTypes[analysisResult.analysisType as AnalysisType].icon}
                <span className="hidden sm:inline">ผลการวิเคราะห์: </span>
                {analysisTypes[analysisResult.analysisType as AnalysisType].label}
              </h3>
              <span className="text-sm text-gray-400">
                {formatTimestamp(analysisResult.timestamp)}
              </span>
              {/* Mini Stats when collapsed */}
              {!isAnalysisExpanded && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-blue-600 px-2 py-1 rounded">
                    {analysisResult.stats?.totalTrades || trades.length} trades
                  </span>
                  <span className="bg-yellow-600 px-2 py-1 rounded">
                    {analysisResult.stats?.winRate?.toFixed(1) || 
                     (trades.length > 0 ? 
                      ((trades.filter(trade => (trade.exitPrice - trade.entryPrice) * trade.lotSize > 0).length / trades.length) * 100).toFixed(1) 
                      : 0)
                    }% WR
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    (analysisResult.stats?.profitFactor || 0) >= 1.5 ? 'bg-green-600' : 
                    (analysisResult.stats?.profitFactor || 0) >= 1 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    PF: {analysisResult.stats?.profitFactor === Infinity ? '∞' : 
                         (analysisResult.stats?.profitFactor?.toFixed(2) || '0.00')}
                  </span>
                </div>
              )}
            </div>
            
            {/* Expand/Collapse Icon */}
            <div className="flex items-center justify-center sm:justify-end gap-3">
              <span className="text-sm text-gray-400 hidden sm:inline">
                {isAnalysisExpanded ? 'ซ่อน' : 'แสดง'}
              </span>
              <div className={`transform transition-transform duration-200 ${isAnalysisExpanded ? 'rotate-180' : 'rotate-0'}`}>
                <svg 
                  className="w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Collapsible Content */}
          <div className={`transition-all duration-300 ease-in-out ${
            isAnalysisExpanded 
              ? 'max-h-none opacity-100' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Summary Stats - Always visible when expanded */}
              <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{analysisResult.stats?.totalTrades || trades.length}</div>
                  <div className="text-gray-400 text-xs">การเทรดทั้งหมด</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    {analysisResult.stats?.winRate?.toFixed(1) || 
                     (trades.length > 0 ? 
                      ((trades.filter(trade => (trade.exitPrice - trade.entryPrice) * trade.lotSize > 0).length / trades.length) * 100).toFixed(1) 
                      : 0)
                    }%
                  </div>
                  <div className="text-gray-400 text-xs">อัตราชนะ</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    (analysisResult.stats?.profitFactor || 0) >= 1.5 ? 'text-green-400' : 
                    (analysisResult.stats?.profitFactor || 0) >= 1 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {analysisResult.stats?.profitFactor === Infinity ? '∞' : 
                     (analysisResult.stats?.profitFactor?.toFixed(2) || '0.00')
                    }
                  </div>
                  <div className="text-gray-400 text-xs">Profit Factor</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    (analysisResult.stats?.totalPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPnL(analysisResult.stats?.totalPnl || 0)}
                  </div>
                  <div className="text-gray-400 text-xs">กำไรขาดทุนรวม</div>
                </div>
              </div>

              {/* Analysis Content */}
              <div className="prose prose-invert max-w-none">
                <div className="bg-gray-800 rounded-lg p-4 overflow-auto text-gray-100 text-sm sm:text-base leading-relaxed">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-3 mt-6">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base sm:text-lg font-semibold text-green-400 mb-2 mt-4">{children}</h3>,
                      p: ({children}) => <p className="mb-3 text-gray-200">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-200">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-200">{children}</ol>,
                      strong: ({children}) => <strong className="font-bold text-yellow-400">{children}</strong>,
                      code: ({children}) => <code className="bg-gray-700 px-2 py-1 rounded text-yellow-300 text-sm">{children}</code>,
                      table: ({children}) => <div className="overflow-x-auto"><table className="min-w-full table-auto text-left border-collapse border border-gray-600 mb-4">{children}</table></div>,
                      th: ({children}) => <th className="border border-gray-600 px-3 py-2 bg-gray-700 text-gray-200 font-semibold text-sm">{children}</th>,
                      td: ({children}) => <td className="border border-gray-600 px-3 py-2 text-gray-300 text-sm">{children}</td>
                    }}
                  >
                    {analysisResult.analysis}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 