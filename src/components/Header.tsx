import React from 'react';
import {
  Search,
  Sparkles,
  Key,
  Sun,
  Moon,
  Mic,
  Calendar,
  Building2,
  RefreshCw,
  SlidersHorizontal,
  Bot
} from 'lucide-react';

interface HeaderProps {
  currentPeriod: string;
  onPeriodChange: (p: string) => void;
  availablePeriods: string[];
  selectedDept: string;
  onDeptChange: (d: string) => void;
  departments: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLoadSampleData: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenAiAssistant: () => void;
  onStartVoiceSearch?: () => void;
  isListening?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPeriod,
  onPeriodChange,
  availablePeriods,
  selectedDept,
  onDeptChange,
  departments,
  searchQuery,
  onSearchChange,
  onLoadSampleData,
  onOpenApiKeyModal,
  hasApiKey,
  isDark,
  onToggleDark,
  onOpenAiAssistant,
  onStartVoiceSearch,
  isListening
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="px-4 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title and subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F291E] to-[#163B2C] dark:from-emerald-700 dark:to-slate-900 flex items-center justify-center shadow-md text-amber-400 font-bold text-xl border border-amber-500/30">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Live 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart HRM & Payroll Dashboard dành cho Ban Giám đốc & Phòng HCNS
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {/* Quick Sample Data Button */}
          <button
            onClick={onLoadSampleData}
            title="Nạp ngay 50 nhân sự & dữ liệu Quý 3/2026 chuẩn"
            className="animate-breathe inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Nạp dữ liệu thử nghiệm</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAiAssistant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold shadow-sm transition-all"
            title="Mở Trợ lý AI Phân tích Quỹ lương & Tham mưu Nhân sự"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Trợ lý AI</span>
          </button>

          {/* Period Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <span className="text-slate-500 mr-1 hidden sm:inline">Kỳ:</span>
            <select
              value={currentPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p} className="dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  Tháng {p}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
            >
              <option value="all" className="dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                Tất cả phòng ban (6)
              </option>
              {departments.map((d) => (
                <option key={d} value={d} className="dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Mã NV, Họ tên, CCCD..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-7 py-1.5 w-36 sm:w-44 focus:w-56 transition-all duration-200 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {onStartVoiceSearch && (
              <button
                onClick={onStartVoiceSearch}
                title={isListening ? 'Đang lắng nghe giọng nói...' : 'Tìm kiếm bằng giọng nói'}
                className={`absolute right-2 p-0.5 rounded-full ${
                  isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
              hasApiKey
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
            title={hasApiKey ? 'Gemini API đã kết nối' : 'Cấu hình Gemini API Key'}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden md:inline">API Key</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
