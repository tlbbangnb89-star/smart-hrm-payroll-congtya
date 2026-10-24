import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react';
import { Contract } from '../types/hrm';
import { formatVND, createGoogleCalendarUrl } from '../utils/docExporter';

interface ContractsViewProps {
  contracts: Contract[];
  onOpenEmployee360: (maNV: string) => void;
  onRenewContract: (maNV: string) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  onOpenEmployee360,
  onRenewContract
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đang hiệu lực' | 'Sắp hết hạn'>('all');

  const filtered = contracts.filter((c) => {
    if (statusFilter !== 'all' && c.trangThai !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.soHD.toLowerCase().includes(q) ||
        c.maNV.toLowerCase().includes(q) ||
        c.hoTen.toLowerCase().includes(q) ||
        c.phongBan.toLowerCase().includes(q) ||
        c.loaiHD.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const expiringCount = contracts.filter((c) => c.trangThai === 'Sắp hết hạn' || c.maNV === 'TP0021' || c.maNV === 'TP0035').length;

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
            <FileText className="w-5 h-5 text-blue-600" />
            Sổ Theo dõi Hợp đồng Lao động (50 nhân sự)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động cảnh báo trước 30 ngày đối với hợp đồng lao động có thời hạn và hợp đồng thử việc.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Tất cả ({contracts.length})
            </button>
            <button
              onClick={() => setStatusFilter('Sắp hết hạn')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'Sắp hết hạn'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sắp hết hạn ({expiringCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('Đang hiệu lực')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'Đang hiệu lực'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Đang hiệu lực
            </button>
          </div>

          {/* Search box */}
          <input
            type="text"
            placeholder="Tìm số HĐ, nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Số Hợp đồng</th>
                <th className="py-3 px-4 w-24">Mã NV</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Phòng ban</th>
                <th className="py-3 px-4">Loại hợp đồng</th>
                <th className="py-3 px-4">Ngày ký</th>
                <th className="py-3 px-4">Ngày hết hạn</th>
                <th className="py-3 px-4 text-right">Mức lương đóng BH</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((c) => {
                const isExpiring = c.trangThai === 'Sắp hết hạn' || c.maNV === 'TP0021' || c.maNV === 'TP0035';

                return (
                  <tr
                    key={c.soHD}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      isExpiring ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {c.soHD}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-amber-600">
                      {c.maNV}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {c.hoTen}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {c.phongBan}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {c.loaiHD}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {c.ngayKy}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={isExpiring ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}>
                        {c.ngayHetHan || 'Không xác định'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700 dark:text-emerald-400">
                      {formatVND(c.mucLuongBH)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isExpiring
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {isExpiring ? 'Sắp hết hạn' : c.trangThai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isExpiring && c.ngayHetHan && (
                          <a
                            href={createGoogleCalendarUrl(
                              `Tái ký HĐLĐ: ${c.hoTen} (${c.maNV})`,
                              `Hợp đồng ${c.soHD} của nhân sự ${c.hoTen} thuộc ${c.phongBan} hết hạn vào ngày ${c.ngayHetHan}. Cần tái ký kịp thời.`,
                              c.ngayHetHan
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            title="Tạo lịch nhắc tái ký Google Calendar"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => onOpenEmployee360(c.maNV)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          title="Xem hồ sơ chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
