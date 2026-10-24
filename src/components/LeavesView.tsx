import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  X,
  Mail,
  AlertCircle,
  CheckCircle2,
  Filter,
  User,
  Clock
} from 'lucide-react';
import { LeaveRequest, LeaveBalance, Employee } from '../types/hrm';
import { createGmailDraftUrl } from '../utils/docExporter';

interface LeavesViewProps {
  leaves: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  employees: Employee[];
  onApproveLeave: (maDon: string) => void;
  onRejectLeave: (maDon: string) => void;
  onOpenEmployee360: (maNV: string) => void;
}

export const LeavesView: React.FC<LeavesViewProps> = ({
  leaves,
  leaveBalances,
  employees,
  onApproveLeave,
  onRejectLeave,
  onOpenEmployee360
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'balances'>('requests');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Chờ duyệt' | 'Đã duyệt'>('all');

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter !== 'all' && l.trangThai !== statusFilter) return false;
    return true;
  });

  const pendingCount = leaves.filter((l) => l.trangThai === 'Chờ duyệt').length;
  const approvedCount = leaves.filter((l) => l.trangThai === 'Đã duyệt').length;

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
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            Quản trị Nghỉ phép & Quỹ phép Năm 2026
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đối soát tự động từ 04_Nghi_phep_2026.xlsx: Duyệt đơn, trừ quỹ phép và đồng bộ bảng chấm công.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <span>Theo dõi Đơn nghỉ</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'balances'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Quỹ phép năm (50 nhân sự)
          </button>
        </div>
      </div>

      {/* Tab 1: Leave Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Lọc theo trạng thái:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-700'
                  : 'bg-white dark:bg-slate-800 text-slate-600 border'
              }`}
            >
              Tất cả ({leaves.length})
            </button>
            <button
              onClick={() => setStatusFilter('Chờ duyệt')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                statusFilter === 'Chờ duyệt'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-amber-600 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ duyệt ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('Đã duyệt')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                statusFilter === 'Đã duyệt'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã duyệt ({approvedCount})</span>
            </button>
          </div>

          {/* Leave Requests Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Mã đơn</th>
                    <th className="py-3 px-4 w-20">Mã NV</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Phòng ban</th>
                    <th className="py-3 px-4">Loại nghỉ</th>
                    <th className="py-3 px-4">Thời gian nghỉ</th>
                    <th className="py-3 px-4 text-center">Số ngày</th>
                    <th className="py-3 px-4">Lý do xin nghỉ</th>
                    <th className="py-3 px-4">Người duyệt</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeaves.map((l) => {
                    const isPending = l.trangThai === 'Chờ duyệt';
                    const emp = employees.find((e) => e.maNV === l.maNV);

                    return (
                      <tr
                        key={l.maDon}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          isPending ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {l.maDon}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-amber-600">
                          {l.maNV}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {l.hoTen}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {l.phongBan}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {l.loaiNghi}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {l.tuNgay} → {l.denNgay}
                        </td>
                        <td className="py-3 px-4 text-center font-bold font-mono text-emerald-700 dark:text-emerald-400">
                          {l.soNgay}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                          {l.lyDo}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {l.nguoiDuyet}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {l.trangThai}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => onApproveLeave(l.maDon)}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all"
                                  title="Phê duyệt đơn"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onRejectLeave(l.maDon)}
                                  className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                                  title="Từ chối"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                {emp && (
                                  <a
                                    href={createGmailDraftUrl(
                                      emp.email,
                                      `[Công ty A] Phản hồi đơn xin nghỉ phép ${l.maDon}`,
                                      `Chào bạn ${l.hoTen},\n\nPhòng HCNS đã tiếp nhận đơn xin nghỉ phép ${l.soNgay} ngày của bạn từ ${l.tuNgay} đến ${l.denNgay}.`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    title="Soạn thư Gmail"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                                  </a>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => onOpenEmployee360(l.maNV)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold"
                              >
                                Xem hồ sơ
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Leave Balances Table */}
      {activeTab === 'balances' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4 w-24">Mã NV</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4 text-center">Phép tiêu chuẩn</th>
                  <th className="py-3 px-4 text-center">Phép thâm niên</th>
                  <th className="py-3 px-4 text-center font-bold">Tổng quỹ phép</th>
                  <th className="py-3 px-4 text-center text-amber-600 font-bold">Đã sử dụng</th>
                  <th className="py-3 px-4 text-center text-emerald-600 font-bold">Còn lại</th>
                  <th className="py-3 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaveBalances.map((b, idx) => (
                  <tr
                    key={b.maNV}
                    onClick={() => onOpenEmployee360(b.maNV)}
                    className="hover:bg-amber-50/30 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-600">{b.maNV}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{b.hoTen}</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{b.phongBan}</td>
                    <td className="py-2.5 px-4 text-center font-mono">{b.tieuChuan}</td>
                    <td className="py-2.5 px-4 text-center font-mono">{b.thamNien}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {b.tongQuy}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-600">
                      {b.daSuDung}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-extrabold text-emerald-600">
                      {b.conLai}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">{b.ghiChu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};
