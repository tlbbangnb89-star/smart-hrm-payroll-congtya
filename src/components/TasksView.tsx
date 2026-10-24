import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  FileCheck,
  UserCheck,
  CalendarPlus,
  Mail,
  FileText,
  ExternalLink,
  Check,
  X,
  Filter
} from 'lucide-react';
import { TaskAlert, AlertSeverity, HRSystemData } from '../types/hrm';
import { createGoogleCalendarUrl, createGmailDraftUrl } from '../utils/docExporter';

interface TasksViewProps {
  data: HRSystemData;
  alerts: TaskAlert[];
  onApproveLeave: (maDon: string) => void;
  onRejectLeave: (maDon: string) => void;
  onSignProbation: (maNV: string) => void;
  onRenewContract: (maNV: string) => void;
  onOpenEmployee360: (maNV: string) => void;
  onOpenEvaluationModal: (maNV: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  data,
  alerts,
  onApproveLeave,
  onRejectLeave,
  onSignProbation,
  onRenewContract,
  onOpenEmployee360,
  onOpenEvaluationModal
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | AlertSeverity>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'contract' | 'probation' | 'leave'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    return true;
  });

  const redCount = alerts.filter((a) => a.severity === 'red').length;
  const yellowCount = alerts.filter((a) => a.severity === 'yellow').length;
  const greenCount = alerts.filter((a) => a.severity === 'green').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Trung tâm Xử lý Rủi ro & Tác vụ Nhân sự
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Phân loại theo quy tắc 3 cấp độ: Khẩn cấp (Đỏ) - Chờ xử lý (Vàng) - Ổn định (Xanh).
          </p>
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterSeverity === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tất cả ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('red')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              filterSeverity === 'red'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>Khẩn cấp ({redCount})</span>
          </button>
          <button
            onClick={() => setFilterSeverity('yellow')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              filterSeverity === 'yellow'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>Chờ duyệt ({yellowCount})</span>
          </button>
          <button
            onClick={() => setFilterSeverity('green')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              filterSeverity === 'green'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>Ổn định ({greenCount})</span>
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((task) => {
          const emp = task.maNV ? data.employees.find((e) => e.maNV === task.maNV) : null;
          const contract = task.maNV ? data.contracts.find((c) => c.maNV === task.maNV) : null;

          return (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                task.severity === 'red'
                  ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 hover:shadow-md'
                  : task.severity === 'yellow'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:shadow-md'
                  : 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
              }`}
            >
              <div>
                {/* Badge and Due Date */}
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      task.severity === 'red'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300'
                        : task.severity === 'yellow'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {task.severity === 'red'
                      ? 'Khẩn cấp (Trong 30 ngày)'
                      : task.severity === 'yellow'
                      ? 'Cần xử lý'
                      : 'Đang ổn định'}
                  </span>

                  {task.dueDate && (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Hạn: {task.dueDate}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {task.title}
                </h3>

                {/* Description */}
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {task.description}
                </p>

                {/* Reference File */}
                {task.referenceDoc && (
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Nguồn dữ liệu: <strong>{task.referenceDoc}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Buttons based on task type */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-2">
                {/* Contract Expiry Tasks (TP0021, TP0035) */}
                {task.category === 'contract' && task.maNV && (
                  <>
                    <button
                      onClick={() => onRenewContract(task.maNV!)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Duyệt gia hạn HĐ</span>
                    </button>

                    <a
                      href={createGoogleCalendarUrl(
                        `Tái ký Hợp đồng lao động - ${task.hoTen} (${task.maNV})`,
                        `Họp đánh giá và ký gia hạn Hợp đồng lao động cho nhân sự ${task.hoTen} thuộc ${task.phongBan}.`,
                        task.dueDate || '2026-10-15'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-medium"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tạo lịch Google</span>
                    </a>

                    <button
                      onClick={() => onOpenEmployee360(task.maNV!)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline ml-auto"
                    >
                      Hồ sơ 360°
                    </button>
                  </>
                )}

                {/* Probation Tasks (TP0008, TP0049) */}
                {task.category === 'probation' && task.severity === 'red' && task.maNV && (
                  <>
                    <button
                      onClick={() => onSignProbation(task.maNV!)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Ký HĐLĐ chính thức</span>
                    </button>

                    <button
                      onClick={() => onOpenEvaluationModal(task.maNV!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-medium"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tờ trình đánh giá (.doc)</span>
                    </button>

                    <button
                      onClick={() => onOpenEmployee360(task.maNV!)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline ml-auto"
                    >
                      Hồ sơ 360°
                    </button>
                  </>
                )}

                {/* Leave Requests (NP-2026-0515, NP-2026-0518, NP-2026-0520) */}
                {task.category === 'leave' && task.severity === 'yellow' && (
                  <>
                    <button
                      onClick={() => onApproveLeave(task.id.replace('alert-leave-', ''))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Phê duyệt đơn</span>
                    </button>

                    <button
                      onClick={() => onRejectLeave(task.id.replace('alert-leave-', ''))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-red-300 dark:border-red-900 text-red-600 text-xs font-medium hover:bg-red-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Từ chối</span>
                    </button>

                    {emp && (
                      <a
                        href={createGmailDraftUrl(
                          emp.email,
                          `[Công ty A] Phản hồi đơn xin nghỉ phép - ${task.id.replace('alert-leave-', '')}`,
                          `Chào bạn ${emp.hoTen},\n\nPhòng Hành chính - Nhân sự đã tiếp nhận đơn xin nghỉ phép của bạn.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-medium ml-auto"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span>Email phản hồi</span>
                      </a>
                    )}
                  </>
                )}

                {/* Probation Ongoing (TP0023) */}
                {task.category === 'probation' && task.severity === 'yellow' && task.maNV && (
                  <>
                    <button
                      onClick={() => onOpenEmployee360(task.maNV!)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem tiến độ thử việc</span>
                    </button>
                  </>
                )}

                {/* Green tasks */}
                {task.severity === 'green' && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đạt tiêu chuẩn vận hành
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
