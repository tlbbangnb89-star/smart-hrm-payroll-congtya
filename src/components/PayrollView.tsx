import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  Building2,
  FileSpreadsheet,
  Printer,
  Search,
  Eye,
  TrendingUp,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { Payroll, Employee } from '../types/hrm';
import { formatVND } from '../utils/docExporter';
import { exportPayrollToExcel } from '../utils/excelExporter';

interface PayrollViewProps {
  payrolls: Payroll[];
  employees: Employee[];
  currentPeriod: string;
  onPeriodChange: (p: string) => void;
  availablePeriods: string[];
  selectedDept: string;
  onDeptChange: (d: string) => void;
  departments: string[];
  onOpenPayslip: (emp: Employee, pay: Payroll) => void;
  onOpenEmployee360: (maNV: string) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  payrolls,
  employees,
  currentPeriod,
  onPeriodChange,
  availablePeriods,
  selectedDept,
  onDeptChange,
  departments,
  onOpenPayslip,
  onOpenEmployee360
}) => {
  const [search, setSearch] = useState('');

  const currentMonthPayrolls = payrolls.filter((p) => p.thang === currentPeriod);

  const filtered = currentMonthPayrolls.filter((p) => {
    if (selectedDept !== 'all' && p.phongBan !== selectedDept) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.maNV.toLowerCase().includes(q) ||
        p.hoTen.toLowerCase().includes(q) ||
        p.phongBan.toLowerCase().includes(q) ||
        p.chucDanh.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate totals
  const totalBase = filtered.reduce((s, p) => s + p.mucLuongHD, 0);
  const totalTimeSalary = filtered.reduce((s, p) => s + p.luongThoiGian, 0);
  const totalAllowances = filtered.reduce((s, p) => s + p.phuCapTN + p.phuCapAnTrua, 0);
  const totalOT = filtered.reduce((s, p) => s + p.tienOT, 0);
  const totalBonus = filtered.reduce((s, p) => s + p.thuongHieuQua, 0);
  const totalGross = filtered.reduce((s, p) => s + p.tongThuNhap, 0);
  const totalInsurance = filtered.reduce((s, p) => s + p.bhxh, 0);
  const totalTax = filtered.reduce((s, p) => s + p.thueTNCN, 0);
  const totalNet = filtered.reduce((s, p) => s + p.thucLinh, 0);

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
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Bảng Quyết toán Tiền lương & Thuế TNCN (Kỳ {currentPeriod})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy chuẩn tính lương: Lương thời gian = (Lương HĐ / 26) * Ngày công. Khấu trừ BHXH (10.5%).
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

          {/* Export Excel Button */}
          <button
            onClick={() => exportPayrollToExcel(filtered, currentPeriod)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Tổng thu nhập toàn công ty</span>
          <span className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white truncate block">
            {formatVND(totalGross)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Tổng trừ BHXH (10.5%)</span>
          <span className="text-lg lg:text-xl font-bold text-rose-600 truncate block">
            -{formatVND(totalInsurance)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block mb-1">Tổng thuế TNCN khấu trừ</span>
          <span className="text-lg lg:text-xl font-bold text-rose-600 truncate block">
            -{formatVND(totalTax)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
          <span className="text-emerald-700 dark:text-emerald-300 block mb-1 font-semibold">
            Tổng thực lĩnh chuyển khoản
          </span>
          <span className="text-lg lg:text-xl font-extrabold text-emerald-800 dark:text-emerald-200 truncate block">
            {formatVND(totalNet)}
          </span>
        </div>
      </div>

      {/* Payroll Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3 w-20">Mã NV</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3">Phòng ban</th>
                <th className="py-3 px-3 text-right">Lương HĐ</th>
                <th className="py-3 px-3 text-center">Công</th>
                <th className="py-3 px-3 text-right">Lương thời gian</th>
                <th className="py-3 px-3 text-right">Phụ cấp</th>
                <th className="py-3 px-3 text-right">Tiền OT</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">Tổng thu nhập</th>
                <th className="py-3 px-3 text-right text-rose-600">BHXH (10.5%)</th>
                <th className="py-3 px-3 text-right text-rose-600">Thuế TNCN</th>
                <th className="py-3 px-3 text-right font-extrabold text-emerald-700 dark:text-emerald-400">Thực lĩnh</th>
                <th className="py-3 px-3 text-center">Phiếu lương</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((p, idx) => {
                const emp = employees.find((e) => e.maNV === p.maNV);
                return (
                  <tr
                    key={p.maNV}
                    onClick={() => emp && onOpenPayslip(emp, p)}
                    className="hover:bg-amber-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-600">{p.maNV}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600">
                        {p.hoTen}
                      </div>
                      <div className="text-[10px] text-slate-400">{p.chucDanh}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{p.phongBan}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                      {formatVND(p.mucLuongHD)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-200">
                      {p.ngayCong}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                      {formatVND(p.luongThoiGian)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatVND(p.phuCapTN + p.phuCapAnTrua)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">
                      {p.tienOT > 0 ? formatVND(p.tienOT) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatVND(p.tongThuNhap)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                      -{formatVND(p.bhxh)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                      {p.thueTNCN > 0 ? `-${formatVND(p.thueTNCN)}` : '0 ₫'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                      {formatVND(p.thucLinh)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (emp) onOpenPayslip(emp, p);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold"
                        title="Xem Phiếu lương A4/A5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>In</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Summary Row */}
            <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-xs">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right">
                  TỔNG CỘNG QUỸ LƯƠNG ({filtered.length} nhân sự):
                </td>
                <td className="py-3 px-3 text-right font-mono">{formatVND(totalBase)}</td>
                <td></td>
                <td className="py-3 px-3 text-right font-mono">{formatVND(totalTimeSalary)}</td>
                <td className="py-3 px-3 text-right font-mono">{formatVND(totalAllowances)}</td>
                <td className="py-3 px-3 text-right font-mono text-blue-600">{formatVND(totalOT)}</td>
                <td className="py-3 px-3 text-right font-mono">{formatVND(totalGross)}</td>
                <td className="py-3 px-3 text-right font-mono text-rose-600">-{formatVND(totalInsurance)}</td>
                <td className="py-3 px-3 text-right font-mono text-rose-600">-{formatVND(totalTax)}</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">
                  {formatVND(totalNet)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
