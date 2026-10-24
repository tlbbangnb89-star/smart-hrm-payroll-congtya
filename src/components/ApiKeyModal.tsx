import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey } from '../utils/geminiAi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved
}) => {
  const [apiKey, setApiKey] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setTestStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredApiKey(apiKey);
    onKeySaved(apiKey);
    onClose();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setErrorMessage('Vui lòng nhập API Key trước khi kiểm tra');
      return;
    }
    setTestStatus('testing');
    setErrorMessage('');

    try {
      // Test with a lightweight call to gemini-2.0-flash or gemini-1.5-flash
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });

      if (res.ok) {
        setTestStatus('success');
      } else {
        const errJson = await res.json().catch(() => ({}));
        setTestStatus('error');
        setErrorMessage(errJson.error?.message || `HTTP Lỗi ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setErrorMessage(err.message || 'Lỗi mạng hoặc API Key không hợp lệ');
    }
  };

  const handleClear = () => {
    setApiKey('');
    saveStoredApiKey('');
    onKeySaved('');
    setTestStatus('idle');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
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
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cài đặt Google Gemini API Key
                </h3>
                <p className="text-xs text-slate-500">
                  Lưu trữ an toàn tại localStorage trình duyệt
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nhập Gemini API Key (bắt đầu bằng `AIzaSy...`):
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Status Feedback */}
            {testStatus === 'testing' && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
                <span>Đang kiểm tra kết nối với Google AI Studio...</span>
              </div>
            )}

            {testStatus === 'success' && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Kết nối thành công! Gemini API đã sẵn sàng phân tích.</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span className="truncate">{errorMessage || 'Kết nối thất bại. Kiểm tra lại Key.'}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bảo mật tối đa:</span>
              </div>
              <p className="leading-relaxed">
                Mã khóa được lưu trữ duy nhất trên trình duyệt của bạn (Local Storage) hoặc đọc từ <code>.env.local</code>. Tuyệt đối không lưu trên máy chủ từ xa.
              </p>
              <div className="pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold inline-flex items-center gap-1"
                >
                  <span>Lấy khóa API miễn phí từ Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Xóa khóa
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestKey}
                disabled={testStatus === 'testing' || !apiKey.trim()}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Kiểm tra kết nối
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
