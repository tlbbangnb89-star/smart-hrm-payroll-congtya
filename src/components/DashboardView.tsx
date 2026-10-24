import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Copy,
  CheckCircle2,
  Calendar,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Bot
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { HRSystemData, TaskAlert } from '../types/hrm';
import { CountUpNumber } from './CountUpNumber';
import { formatVND, copyTextToClipboard } from '../utils/docExporter';

interface DashboardViewProps {
  data: HRSystemData;
  period: string;
  deptFilter: string;
  alerts: TaskAlert[];
  onNavigateToTab: (tab: any) => void;
  onOpenEmployee360: (empId: string) => void;
  onOpenAiAssistant: () => void;
  aiSummary: string;
  isAiLoading: boolean;
  onRefreshAi: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  period,
  deptFilter,
  alerts,
  onNavigateToTab,
  onOpenEmployee360,
  onOpenAiAssistant,
  aiSummary,
  isAiLoading,
  onRefreshAi
}) => {
  const [copied, setCopied] = React.useState(false);

  // Filtered employees
  const filteredEmployees = deptFilter === 'all'
    ? data.employees
    : data.employees.filter((e) => e.phongBan === deptFilter);

  // Filtered payrolls
  const currentMonthPayrolls = data.payrolls.filter(
    (p) => p.thang === period && (deptFilter === 'all' || p.phongBan === deptFilter)
  );

  // KPI Calculations
  const totalStaff = filteredEmployees.length;
  const totalDinhBien = data.departments.reduce(
    (sum, d) => sum + (deptFilter === 'all' || d.name === deptFilter ? d.dinhBien : 0),
    0
  );
  const fillRate = totalDinhBien > 0 ? Math.round((totalStaff / totalDinhBien) * 100) : 100;

  const totalNetSalary = currentMonthPayrolls.reduce((sum, p) => sum + p.thucLinh, 0);
  const totalGrossSalary = currentMonthPayrolls.reduce((sum, p) => sum + p.tongThuNhap, 0);
  const totalOTAmount = currentMonthPayrolls.reduce((sum, p) => sum + p.tienOT, 0);
  const otEmployeeCount = currentMonthPayrolls.filter((p) => p.tienOT > 0).length;

  // Previous month comparison
  const prevPeriod = period === '10/2026' ? '09/2026' : period === '09/2026' ? '08/2026' : '07/2026';
  const prevPayrolls = data.payrolls.filter(
    (p) => p.thang === prevPeriod && (deptFilter === 'all' || p.phongBan === deptFilter)
  );
  const prevNetSalary = prevPayrolls.reduce((sum, p) => sum + p.thucLinh, 0);
  const salaryDiffPercent = prevNetSalary > 0
    ? Number((((totalNetSalary - prevNetSalary) / prevNetSalary) * 100).toFixed(1))
    : 0;

  // Red & Yellow urgent alerts count
  const urgentAlerts = alerts.filter((a) => a.severity === 'red' || a.severity === 'yellow');
  const redAlerts = alerts.filter((a) => a.severity === 'red');

  // 1. Chart Data: Horizontal Bar - Actual vs Headcount (Định biên)
  const deptStaffingData = data.departments.map((dept) => {
    const actual = data.employees.filter((e) => e.phongBan === dept.name).length;
    return {
      name: dept.name.replace('Phòng ', '').replace('Xưởng ', ''),
      fullName: dept.name,
      'Thực tế': actual,
      'Định biên': dept.dinhBien
    };
  });

  // 2. Chart Data: Composed Bar & Line - Revenue/Income & Net Pay through Months (T07 - T10)
  const monthList = ['07/2026', '08/2026', '09/2026', '10/2026'];
  const monthlyTrendData = monthList.map((m) => {
    const mPayrolls = data.payrolls.filter(
      (p) => p.thang === m && (deptFilter === 'all' || p.phongBan === deptFilter)
    );
    const gross = mPayrolls.reduce((s, p) => s + p.tongThuNhap, 0);
    const net = mPayrolls.reduce((s, p) => s + p.thucLinh, 0);
    const ot = mPayrolls.reduce((s, p) => s + p.tienOT, 0);
    return {
      month: `T${m.slice(0, 2)}`,
      'Tổng thu nhập': gross,
      'Thực lĩnh': net,
      'Làm thêm OT': ot
    };
  });

  // 3. Chart Data: Donut - Payroll allocation by 6 departments
  const deptColors = ['#0F291E', '#1E3A8A', '#D97706', '#059669', '#7C3AED', '#DB2777'];
  const deptPayrollData = data.departments.map((dept) => {
    const deptPay = data.payrolls
      .filter((p) => p.thang === period && p.phongBan === dept.name)
      .reduce((s, p) => s + p.thucLinh, 0);
    return {
      name: dept.name.replace('Phòng ', '').replace('Xưởng ', ''),
      fullName: dept.name,
      value: deptPay
    };
  });

  // Copy report summary to clipboard
  const handleCopyReport = async () => {
    const reportText = `BÁO CÁO NHÂN SỰ & QUỸ LƯƠNG CÔNG TY A - KỲ ${period}
- Quy mô nhân sự: ${totalStaff}/${totalDinhBien} (${fillRate}% định biên)
- Tổng quỹ lương thực lĩnh: ${formatVND(totalNetSalary)} (Tổng thu nhập: ${formatVND(totalGrossSalary)})
- Biến động so với kỳ trước: ${salaryDiffPercent >= 0 ? '+' : ''}${salaryDiffPercent}%
- Tiền làm thêm ngoài giờ (OT): ${formatVND(totalOTAmount)} (${otEmployeeCount} nhân sự)
- Rủi ro cần xử lý gấp: ${urgentAlerts.length} đầu việc (${redAlerts.length} khẩn cấp đỏ)
---
Ghi chú AI: ${aiSummary.replace(/#/g, '').slice(0, 300)}...`;
    const success = await copyTextToClipboard(reportText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-amber-500/10 to-transparent border border-emerald-700/20 dark:border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Bảng điều hành Tổng hợp Quản trị & Tiền lương (Tháng {period})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đối soát tự động từ 10 file Excel nguồn: 50 nhân viên, 6 phòng ban, Quý 3 & T10/2026.
            </p>
          </div>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm transition-all active:scale-95"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép!' : '📋 Sao chép nhanh báo cáo'}</span>
          </button>
        </div>
      </div>

      {/* 4 Animated KPI Cards (Bento Grid) with 3D Hover & Subtle Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Staff */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/50 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng nhân sự
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
            <CountUpNumber value={totalStaff} />
            <span className="text-xs font-normal text-slate-400 ml-1.5">/ {totalDinhBien} ĐB</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 mr-1.5">
              {fillRate}%
            </span>
            <span>Tỷ lệ lấp đầy định biên</span>
          </div>
        </div>

        {/* KPI 2: Total Net Payroll */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-amber-500/50 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quỹ lương thực lĩnh
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
            <CountUpNumber value={totalNetSalary} isCurrency={true} suffix=" ₫" />
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold">
            {salaryDiffPercent >= 0 ? (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                +{salaryDiffPercent}%
              </span>
            ) : (
              <span className="flex items-center text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                {salaryDiffPercent}%
              </span>
            )}
            <span className="text-slate-400 ml-1.5 font-normal">so với {prevPeriod}</span>
          </div>
        </div>

        {/* KPI 3: Overtime Cost */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-500/50 transition-all duration-300 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Chi phí làm thêm (OT)
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
            <CountUpNumber value={totalOTAmount} isCurrency={true} suffix=" ₫" />
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mr-1.5">
              {otEmployeeCount} người
            </span>
            <span>Có phát sinh tăng ca</span>
          </div>
        </div>

        {/* KPI 4: Urgent Actions (Tasks) */}
        <div
          onClick={() => onNavigateToTab('tasks')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-red-500 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Việc cần xử lý
            </span>
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-red-600 dark:text-red-400 flex items-center justify-between">
            <div>
              <CountUpNumber value={urgentAlerts.length} />
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                ({redAlerts.length} khẩn cấp)
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mt-2 text-xs text-red-600/90 dark:text-red-400/90 font-medium truncate">
            HĐ hết hạn & đơn chờ duyệt
          </div>
        </div>
      </div>

      {/* 3 Interactive Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Horizontal Bar - Actual Staff vs Headcount */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Thực tế vs Định biên (6 Phòng ban)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Người</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={deptStaffingData}
                margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} nhân sự`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Thực tế" fill="#0F291E" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Định biên" fill="#D97706" radius={[0, 4, 4, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Composed Bar & Line - Revenue/Income vs Net Pay Trend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Biến động Quỹ lương (T07 - T10/2026)
              </h3>
            </div>
            <span className="text-xs text-slate-400">VNĐ</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 10 }}
                  width={40}
                />
                <Tooltip
                  formatter={(val: any) => [formatVND(Number(val)), '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Tổng thu nhập" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Thực lĩnh" stroke="#D97706" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Donut - Payroll allocation by department */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cơ cấu Quỹ lương (Kỳ {period})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Tỷ trọng</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptPayrollData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deptPayrollData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={deptColors[index % deptColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatVND(Number(val)), 'Quỹ lương']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Bento: Urgent Tasks + AI Consultant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Tasks Quick List (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Việc cần xử lý gấp ({urgentAlerts.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('tasks')}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {urgentAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => alert.maNV && onOpenEmployee360(alert.maNV)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all ${
                    alert.severity === 'red'
                      ? 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-bold ${
                        alert.severity === 'red' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{alert.dueDate || 'Gấp'}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>TP0021, TP0035, TP0008, TP0049</span>
            <button
              onClick={() => onNavigateToTab('tasks')}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
            >
              Mở phân hệ xử lý →
            </button>
          </div>
        </div>

        {/* Smart AI Assistant Summary Card (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-[#0F291E] text-white shadow-lg border border-emerald-800/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-emerald-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    AI Tham mưu Nhân sự & Phân tích Quỹ lương
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                      Gemini Flash
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200/70">
                    Tự động nhận diện biến động lương, tăng ca bất thường & đề xuất giải pháp
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenAiAssistant}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hỏi chuyên sâu</span>
              </button>
            </div>

            {/* AI Content Preview with skeleton shimmer if loading */}
            {isAiLoading ? (
              <div className="space-y-2.5 py-4 shimmer-active">
                <div className="h-4 bg-emerald-800/40 rounded w-3/4"></div>
                <div className="h-4 bg-emerald-800/40 rounded w-full"></div>
                <div className="h-4 bg-emerald-800/40 rounded w-5/6"></div>
                <div className="h-4 bg-emerald-800/40 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="text-xs text-emerald-100/90 space-y-2 max-h-56 overflow-y-auto pr-2 custom-scroll">
                <div className="whitespace-pre-line leading-relaxed font-sans">
                  {aiSummary}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs">
            <span className="text-emerald-300/70 text-[11px]">
              Cơ chế tự động dự phòng: gemini-3-flash → 3.1-flash-lite → 2.0-flash
            </span>
            <button
              onClick={onRefreshAi}
              className="text-amber-300 hover:text-amber-200 font-semibold text-xs flex items-center gap-1"
            >
              <span>Phân tích lại</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
