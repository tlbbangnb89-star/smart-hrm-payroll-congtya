import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  Building2,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  User
} from 'lucide-react';
import { Timesheet } from '../types/hrm';
import { exportTimesheetToExcel } from '../utils/excelExporter';

interface TimesheetsViewProps {
  timesheets: Timesheet[];
  currentPeriod: string;
  onPeriodChange: (p: string) => void;
  availablePeriods: string[];
  selectedDept: string;
  onDeptChange: (d: string) => void;
  departments: string[];
  onOpenEmployee360: (maNV: string) => void;
}

export const TimesheetsView: React.FC<TimesheetsViewProps> = ({
  timesheets,
  currentPeriod,
  onPeriodChange,
  availablePeriods,
  selectedDept,
  onDeptChange,
  departments,
  onOpenEmployee360
}) => {
  const [search, setSearch] = useState('');

  const currentMonthTimesheets = timesheets.filter((t) => t.thang === currentPeriod);

  const filtered = currentMonthTimesheets.filter((t) => {
    if (selectedDept !== 'all' && t.phongBan !== selectedDept) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.maNV.toLowerCase().includes(q) ||
        t.hoTen.toLowerCase().includes(q) ||
        t.phongBan.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate totals
  const totalStandard = filtered.reduce((s, t) => s + t.congChuan, 0);
  const totalActual = filtered.reduce((s, t) => s + t.congThucTe, 0);
  const totalLeave = filtered.reduce((s, t) => s + t.nghiPhep, 0);
  const totalOTNormal = filtered.reduce((s, t) => s + t.tangCaThuong, 0);
  const totalOTSunday = filtered.reduce((s, t) => s + t.tangCaCN, 0);
  const totalTardy = filtered.reduce((s, t) => s + t.treSom, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Bảng Tổng hợp Chấm công & Tăng ca (Kỳ {currentPeriod})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Định mức 26 ngày công chuẩn/tháng. Hệ số làm thêm: Ngày thường x1.5, Chủ nhật x2.0.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={currentPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p} className="dark:bg-slate-800">
                  Tháng {p}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-800">Tất cả phòng ban</option>
              {departments.map((d) => (
                <option key={d} value={d} className="dark:bg-slate-800">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Export Excel */}
          <button
            onClick={() => exportTimesheetToExcel(filtered, currentPeriod)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Tổng công thực tế</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {totalActual} <span className="text-xs font-normal text-slate-400">/ {totalStandard}</span>
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Nghỉ phép hưởng lương</span>
          <span className="text-xl font-bold text-emerald-600">{totalLeave} ngày</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Tăng ca thường / CN</span>
          <span className="text-xl font-bold text-blue-600">
            {totalOTNormal}h <span className="text-xs font-normal text-slate-400">/ {totalOTSunday}h</span>
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Đi trễ / Về sớm</span>
          <span className="text-xl font-bold text-amber-600">{totalTardy} lần</span>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3 w-20">Mã NV</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3">Phòng ban</th>
                <th className="py-3 px-3 text-center">Công chuẩn</th>
                <th className="py-3 px-3 text-center">Thực tế (X)</th>
                <th className="py-3 px-3 text-center">Nghỉ phép (P)</th>
                <th className="py-3 px-3 text-center">Tổng công</th>
                <th className="py-3 px-3 text-center">TC Thường (h)</th>
                <th className="py-3 px-3 text-center">TC Chủ nhật (h)</th>
                <th className="py-3 px-3 text-center">Trễ/Sớm</th>
                <th className="py-3 px-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t, idx) => (
                <tr
                  key={t.maNV}
                  onClick={() => onOpenEmployee360(t.maNV)}
                  className="hover:bg-amber-50/30 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-600">{t.maNV}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{t.hoTen}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{t.phongBan}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">{t.congChuan}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {t.congThucTe}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">{t.nghiPhep}</td>
                  <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-900 dark:text-white">
                    {t.tongCong}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-blue-600">
                    {t.tangCaThuong > 0 ? `${t.tangCaThuong}h` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-purple-600">
                    {t.tangCaCN > 0 ? `${t.tangCaCN}h` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {t.treSom > 0 ? (
                      <span className="text-amber-600 font-bold">{t.treSom}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                    {t.ghiChu}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right">TỔNG CỘNG ({filtered.length} nhân sự):</td>
                <td className="py-3 px-3 text-center font-mono">{totalStandard}</td>
                <td className="py-3 px-3 text-center font-mono text-emerald-700 dark:text-emerald-400">{totalActual}</td>
                <td className="py-3 px-3 text-center font-mono">{totalLeave}</td>
                <td className="py-3 px-3 text-center font-mono">{totalActual + totalLeave}</td>
                <td className="py-3 px-3 text-center font-mono text-blue-600">{totalOTNormal}h</td>
                <td className="py-3 px-3 text-center font-mono text-purple-600">{totalOTSunday}h</td>
                <td className="py-3 px-3 text-center font-mono text-amber-600">{totalTardy}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
