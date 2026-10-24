import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  CreditCard,
  Eye
} from 'lucide-react';
import { Employee } from '../types/hrm';
import { exportEmployeesToExcel } from '../utils/excelExporter';

interface EmployeesViewProps {
  employees: Employee[];
  departments: string[];
  selectedDept: string;
  onDeptChange: (d: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenEmployee360: (maNV: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  departments,
  selectedDept,
  onDeptChange,
  searchQuery,
  onSearchChange,
  onOpenEmployee360
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đang làm việc' | 'Thử việc'>('all');

  const filtered = employees.filter((emp) => {
    if (selectedDept !== 'all' && emp.phongBan !== selectedDept) return false;
    if (statusFilter !== 'all' && emp.trangThai !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        emp.maNV.toLowerCase().includes(q) ||
        emp.hoTen.toLowerCase().includes(q) ||
        emp.cccd.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.phongBan.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Top Bar with Filters & Export */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Danh sách Nhân sự & Hồ sơ 360° ({filtered.length}/{employees.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhấp chuột vào bất kỳ nhân viên nào để mở Ngăn kéo trượt đối soát 5 chiều thông tin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('Đang làm việc')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'Đang làm việc'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              Chính thức
            </button>
            <button
              onClick={() => setStatusFilter('Thử việc')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'Thử việc'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-amber-600'
              }`}
            >
              Thử việc
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={() => exportEmployeesToExcel(filtered)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 text-center w-12">STT</th>
                <th className="py-3 px-4 w-24">Mã NV</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Phòng ban</th>
                <th className="py-3 px-4">Chức vụ / Chức danh</th>
                <th className="py-3 px-4">Ngày vào làm</th>
                <th className="py-3 px-4">Số CCCD</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center w-24">Hồ sơ 360°</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((emp, idx) => (
                <tr
                  key={emp.maNV}
                  onClick={() => onOpenEmployee360(emp.maNV)}
                  className="hover:bg-amber-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    {emp.maNV}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {emp.hoTen}
                    </div>
                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {emp.phongBan}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {emp.chucVu}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {emp.ngayVaoLam}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {emp.cccd}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.trangThai === 'Đang làm việc'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {emp.trangThai}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEmployee360(emp.maNV);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
