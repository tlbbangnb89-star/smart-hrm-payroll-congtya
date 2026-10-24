import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  FileText,
  DollarSign,
  CalendarDays,
  Clock,
  Mail,
  CalendarPlus,
  Printer,
  ExternalLink,
  Building,
  CreditCard,
  Shield,
  Briefcase,
  Award,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { Employee, Contract, Timesheet, Payroll, LeaveRequest, LeaveBalance } from '../types/hrm';
import { formatVND, createGoogleCalendarUrl, createGmailDraftUrl } from '../utils/docExporter';

interface Employee360DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  contract?: Contract;
  timesheets: Timesheet[];
  payrolls: Payroll[];
  leaves: LeaveRequest[];
  leaveBalance?: LeaveBalance;
  currentPeriod: string;
  onOpenPayslip: (emp: Employee, pay: Payroll) => void;
  onOpenEvaluationModal?: (maNV: string) => void;
}

export const Employee360Drawer: React.FC<Employee360DrawerProps> = ({
  isOpen,
  onClose,
  employee,
  contract,
  timesheets,
  payrolls,
  leaves,
  leaveBalance,
  currentPeriod,
  onOpenPayslip,
  onOpenEvaluationModal
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'contract' | 'payroll' | 'leaves' | 'timesheet'>('profile');

  if (!isOpen || !employee) return null;

  // Current month's payroll for this employee
  const currentPayroll = payrolls.find((p) => p.thang === currentPeriod) || payrolls[payrolls.length - 1];
  const currentTimesheet = timesheets.find((t) => t.thang === currentPeriod) || timesheets[timesheets.length - 1];

  // Prepare Gmail draft text
  const emailSubject = `[Công ty A] Thông báo Phiếu lương Tháng ${currentPeriod} - ${employee.hoTen} (${employee.maNV})`;
  const emailBody = `Kính gửi Anh/Chị ${employee.hoTen},

Phòng Hành chính - Nhân sự xin gửi thông tin quyết toán tiền lương kỳ ${currentPeriod}:
- Mức lương hợp đồng: ${formatVND(currentPayroll?.mucLuongHD)}
- Ngày công làm việc: ${currentPayroll?.ngayCong || 26}/26 công
- Lương thời gian: ${formatVND(currentPayroll?.luongThoiGian)}
- Phụ cấp trách nhiệm: ${formatVND(currentPayroll?.phuCapTN)}
- Phụ cấp ăn trưa: ${formatVND(currentPayroll?.phuCapAnTrua)}
- Tiền làm thêm ngoài giờ (OT): ${formatVND(currentPayroll?.tienOT)}
- Thưởng hiệu quả: ${formatVND(currentPayroll?.thuongHieuQua)}
------------------------------------
- TỔNG THU NHẬP: ${formatVND(currentPayroll?.tongThuNhap)}
- Trích nộp BHXH/YT/TN (10.5%): -${formatVND(currentPayroll?.bhxh)}
- Thuế TNCN khấu trừ: -${formatVND(currentPayroll?.thueTNCN)}
------------------------------------
- THỰC LĨNH CHUYỂN KHOẢN: ${formatVND(currentPayroll?.thucLinh)}

Tài khoản nhận lương: ${employee.soTaiKhoan} (${employee.nganHang}).
Nếu có bất kỳ thắc mắc nào, Anh/Chị vui lòng phản hồi phòng HCNS trước ngày 05 hàng tháng.

Trân trọng,
Phòng Hành chính - Nhân sự Công ty A`;

  const isProbation = employee.trangThai === 'Thử việc' || contract?.loaiHD.includes('Thử việc');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F291E] to-[#1E3A8A] text-amber-400 font-extrabold text-xl flex items-center justify-center shadow-md border-2 border-amber-500/30">
                    {employee.hoTen.split(' ').slice(-1)[0]?.charAt(0) || 'NV'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {employee.hoTen}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        {employee.maNV}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {employee.chucVu} • {employee.phongBan}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          employee.trangThai === 'Đang làm việc'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {employee.trangThai}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Vào làm: {employee.ngayVaoLam}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Excel Source Files Badge */}
              <div className="mt-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>
                  📂 <strong>Nguồn đối soát 360°:</strong> 01_Ho_so, 02_Hop_dong, 03_Cham_cong, 04_Nghi_phep, 05_Bang_luong
                </span>
                <span className="text-emerald-600 font-semibold">Khóa: {employee.maNV}</span>
              </div>

              {/* 5 Tabs Navigation */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mt-4 -mb-6 space-x-1">
                {[
                  { id: 'profile', label: '1. Cá nhân', icon: <User className="w-3.5 h-3.5" /> },
                  { id: 'contract', label: '2. Hợp đồng', icon: <FileText className="w-3.5 h-3.5" /> },
                  { id: 'payroll', label: '3. Lương & Thuế', icon: <DollarSign className="w-3.5 h-3.5" /> },
                  { id: 'leaves', label: '4. Nghỉ phép', icon: <CalendarDays className="w-3.5 h-3.5" /> },
                  { id: 'timesheet', label: '5. Chấm công', icon: <Clock className="w-3.5 h-3.5" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-lg'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tab 1: Profile */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block mb-1">Số CCCD</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{employee.cccd}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block mb-1">Ngày sinh & Giới tính</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {employee.ngaySinh} ({employee.gioiTinh})
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block mb-1">Quê quán</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{employee.queQuan}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block mb-1">Trình độ chuyên môn</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{employee.trinhDo}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block mb-1">Email công việc</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{employee.email}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block mb-1">Số điện thoại</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{employee.soDienThoai}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block mb-1">Tài khoản Ngân hàng</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {employee.soTaiKhoan} ({employee.nganHang})
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block mb-1">Mã số BHXH / MST</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{employee.maSoBHXH}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs">
                    <span className="text-emerald-800 dark:text-emerald-300 font-semibold block mb-0.5">
                      Giảm trừ gia cảnh thuế TNCN:
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400">
                      Bản thân (11.000.000 ₫/tháng) + {employee.nguoiPhuThuoc} người phụ thuộc (
                      {formatVND(employee.nguoiPhuThuoc * 4400000)}/tháng)
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Contract */}
              {activeTab === 'contract' && (
                <div className="space-y-4 text-xs">
                  {contract ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {contract.soHD}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              contract.trangThai === 'Sắp hết hạn'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {contract.trangThai}
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 font-medium">
                          {contract.loaiHD}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1">Ngày ký HĐ</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{contract.ngayKy}</span>
                        </div>
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1">Ngày hiệu lực</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{contract.ngayHieuLuc}</span>
                        </div>
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1">Ngày hết hạn</span>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {contract.ngayHetHan || 'Không xác định'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1">Mức lương đóng BH</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatVND(contract.mucLuongBH)}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block mb-1">Địa điểm làm việc</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{contract.diaDiem}</span>
                      </div>

                      {contract.ngayHetHan && (
                        <div className="pt-2">
                          <a
                            href={createGoogleCalendarUrl(
                              `Nhắc tái ký HĐLĐ: ${employee.hoTen} (${employee.maNV})`,
                              `Hết hạn hợp đồng ${contract.soHD} vào ngày ${contract.ngayHetHan}. Cần làm thủ tục tái ký hoặc chấm dứt HĐLĐ.`,
                              contract.ngayHetHan
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
                          >
                            <CalendarPlus className="w-4 h-4" />
                            <span>📅 Tạo lịch nhắc Google Calendar ngày hết hạn</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400">Chưa có thông tin hợp đồng</div>
                  )}
                </div>
              )}

              {/* Tab 3: Payroll */}
              {activeTab === 'payroll' && (
                <div className="space-y-4 text-xs">
                  {currentPayroll ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/10 to-amber-500/10 border border-emerald-500/20 flex items-center justify-between">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Thực lĩnh kỳ {currentPeriod}</span>
                          <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                            {formatVND(currentPayroll.thucLinh)}
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenPayslip(employee, currentPayroll)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Phiếu lương (A4/A5)</span>
                        </button>
                      </div>

                      {/* Detailed Breakdown Table */}
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 text-slate-500">Mức lương HĐ / Ngày công</td>
                            <td className="py-2 text-right font-medium">
                              {formatVND(currentPayroll.mucLuongHD)} ({currentPayroll.ngayCong}/26 công)
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 text-slate-500">Lương thời gian</td>
                            <td className="py-2 text-right font-bold text-slate-800 dark:text-slate-200">
                              {formatVND(currentPayroll.luongThoiGian)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 text-slate-500">Phụ cấp trách nhiệm</td>
                            <td className="py-2 text-right font-medium text-slate-800 dark:text-slate-200">
                              {formatVND(currentPayroll.phuCapTN)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 text-slate-500">Phụ cấp ăn trưa</td>
                            <td className="py-2 text-right font-medium text-slate-800 dark:text-slate-200">
                              {formatVND(currentPayroll.phuCapAnTrua)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 text-slate-500">Tiền làm thêm (OT)</td>
                            <td className="py-2 text-right font-bold text-blue-600 dark:text-blue-400">
                              {formatVND(currentPayroll.tienOT)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 text-slate-500">Thưởng hiệu quả</td>
                            <td className="py-2 text-right font-medium text-slate-800 dark:text-slate-200">
                              {formatVND(currentPayroll.thuongHieuQua)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                            <td className="py-2.5 font-bold text-slate-900 dark:text-white">TỔNG THU NHẬP</td>
                            <td className="py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                              {formatVND(currentPayroll.tongThuNhap)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 text-slate-500">Trừ BHXH, YT, TN (10.5%)</td>
                            <td className="py-2 text-right font-medium text-rose-600 dark:text-rose-400">
                              -{formatVND(currentPayroll.bhxh)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 text-slate-500">Thuế TNCN khấu trừ</td>
                            <td className="py-2 text-right font-medium text-rose-600 dark:text-rose-400">
                              -{formatVND(currentPayroll.thueTNCN)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400">Chưa có bảng lương kỳ này</div>
                  )}
                </div>
              )}

              {/* Tab 4: Leaves */}
              {activeTab === 'leaves' && (
                <div className="space-y-4 text-xs">
                  {/* Leave balance summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
                      <span className="text-slate-500 block mb-1">Tổng quỹ phép</span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {leaveBalance?.tongQuy || 12} ngày
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
                      <span className="text-slate-500 block mb-1">Đã sử dụng</span>
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                        {leaveBalance?.daSuDung || 0} ngày
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                      <span className="text-slate-500 block mb-1">Còn lại</span>
                      <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                        {leaveBalance?.conLai || 12} ngày
                      </span>
                    </div>
                  </div>

                  {/* List of Leave Requests */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                      Lịch sử xin nghỉ phép ({leaves.length})
                    </h4>
                    {leaves.length > 0 ? (
                      <div className="space-y-2">
                        {leaves.map((l) => (
                          <div
                            key={l.maDon}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">{l.maDon}</span>
                                <span className="text-slate-500">({l.loaiNghi})</span>
                              </div>
                              <p className="text-slate-400 text-[11px] mt-0.5">
                                {l.tuNgay} → {l.denNgay} ({l.soNgay} ngày) • {l.lyDo}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                l.trangThai === 'Đã duyệt'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {l.trangThai}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-400">Không có đơn xin nghỉ phép trong năm 2026</div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Timesheet */}
              {activeTab === 'timesheet' && (
                <div className="space-y-4 text-xs">
                  {currentTimesheet ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1">Công thực tế (X)</span>
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            {currentTimesheet.congThucTe} / {currentTimesheet.congChuan} ngày
                          </span>
                        </div>
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1">Nghỉ phép hưởng lương (P)</span>
                          <span className="text-base font-bold text-emerald-600">
                            {currentTimesheet.nghiPhep} ngày
                          </span>
                        </div>
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1">Tăng ca ngày thường</span>
                          <span className="text-base font-bold text-blue-600">
                            {currentTimesheet.tangCaThuong} giờ
                          </span>
                        </div>
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 block mb-1">Tăng ca Chủ nhật</span>
                          <span className="text-base font-bold text-purple-600">
                            {currentTimesheet.tangCaCN} giờ
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span>Đi trễ / Về sớm:</span>
                        <span className="font-bold text-amber-600">
                          {currentTimesheet.treSom} lần
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400">Chưa có dữ liệu chấm công kỳ này</div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {currentPayroll && (
                  <button
                    onClick={() => onOpenPayslip(employee, currentPayroll)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Xem Phiếu lương A4/A5</span>
                  </button>
                )}

                {isProbation && onOpenEvaluationModal && (
                  <button
                    onClick={() => onOpenEvaluationModal(employee.maNV)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Tờ trình đánh giá thử việc</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={createGmailDraftUrl(employee.email, emailSubject, emailBody)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold shadow-sm"
                  title="Gửi bảng lương qua Gmail"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gửi Gmail</span>
                </a>

                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
