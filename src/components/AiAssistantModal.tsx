import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  Copy,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { HRSystemData } from '../types/hrm';
import { analyzeWithGemini, getStoredApiKey } from '../utils/geminiAi';
import { copyTextToClipboard } from '../utils/docExporter';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HRSystemData;
  currentPeriod: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  data,
  currentPeriod
}) => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; model?: string; timestamp: string }[]
  >([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Suggested prompt pills
  const promptPills = [
    'Phân tích 3 biến động quỹ lương đáng chú ý nhất kỳ này?',
    'Ai đang có tiền tăng ca (OT) cao bất thường cần rà soát?',
    'Tư vấn các hợp đồng và thử việc cần ký gia hạn gấp?',
    'So sánh quỹ lương thực tế giữa các phòng ban?'
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message with initial prompt
      handleSendMessage('Phân tích tổng quan quỹ lương kỳ ' + currentPeriod + ' và các rủi ro nhân sự cần xử lý gấp.');
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận dạng giọng nói tiếng Việt (Web Speech API). Bạn có thể gõ văn bản trực tiếp.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await analyzeWithGemini(query, data, currentPeriod);
      const assistantMsg = {
        role: 'assistant' as const,
        text: result.markdown,
        model: result.modelUsed,
        timestamp: result.timestamp
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          text: `Đã xảy ra lỗi: ${err.message || 'Không thể kết nối đến AI'}`,
          model: 'Error',
          timestamp: new Date().toLocaleTimeString('vi-VN')
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (text: string, index: number) => {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#0F291E] to-[#163B2C] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Trợ lý AI Phân tích Quỹ lương & Tham mưu Nhân sự
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    Gemini Flash
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80">
                  Tự động chuyển đổi mô hình (gemini-3-flash → 3.1-flash-lite → 2.0-flash) kèm Exponential Backoff
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Gợi ý:
            </span>
            {promptPills.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500 text-[11px] whitespace-nowrap shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/60 dark:bg-slate-950/40 text-xs sm:text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/80 text-[11px] text-slate-400">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {msg.model || 'Gemini 3 Flash'}
                      </span>
                      <button
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                      >
                        {copiedIndex === idx ? (
                          <span className="text-emerald-600 font-bold">Đã sao chép!</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="whitespace-pre-line leading-relaxed font-sans text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  <div
                    className={`mt-2 text-[10px] ${
                      msg.role === 'user' ? 'text-amber-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm max-w-[80%] space-y-2 shimmer-active">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>AI đang phân tích 200 bản ghi dữ liệu lương & nhân sự...</span>
                  </div>
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer with Speech Recognition */}
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleRecording}
                title={isRecording ? 'Dừng thu âm' : 'Nói tiếng Việt để hỏi AI'}
                className={`p-2.5 rounded-xl border transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                placeholder={isRecording ? 'Đang lắng nghe bạn nói...' : 'Nhập câu hỏi phân tích quỹ lương hoặc nhân sự...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
