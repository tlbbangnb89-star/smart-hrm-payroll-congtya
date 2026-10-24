import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  FileDown,
  Mail,
  Copy,
  CheckCircle2,
  Building2,
  DollarSign
} from 'lucide-react';
import { Employee, Payroll } from '../types/hrm';
import { formatVND, downloadWordDoc, printHtmlContent, createGmailDraftUrl, copyTextToClipboard } from '../utils/docExporter';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  payroll: Payroll | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  employee,
  payroll
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !employee || !payroll) return null;

  const totalDeductions = (payroll.bhxh || 0) + (payroll.thueTNCN || 0);

  // HTML content for Word download or Print
  const getPayslipHtml = () => `
    <div style="max-width: 800px; margin: 0 auto; font-family: 'Times New Roman', Arial, sans-serif; color: #111;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0F291E; padding-bottom: 10px; margin-bottom: 15px;">
        <div>
          <div style="font-size: 16pt; font-weight: bold; color: #0F291E;">CÔNG TY A</div>
          <div style="font-size: 10pt; color: #555;">Hệ thống Quản trị Nhân sự & Tiền lương</div>
        </div>
        <div style="text-align: right; font-size: 10pt; color: #555;">
          <div>Mẫu số: 02-LĐTL</div>
          <div>Kỳ lương: <strong>Tháng ${payroll.thang}</strong></div>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 18pt; font-weight: bold; margin: 0; color: #0F291E;">PHIẾU THANH TOÁN TIỀN LƯƠNG</h2>
        <div style="font-size: 11pt; font-style: italic; color: #666;">(Kỳ chi trả: Tháng ${payroll.thang})</div>
      </div>

      <!-- Employee Info -->
      <table style="width: 100%; margin-bottom: 15px; font-size: 11pt;">
        <tr>
          <td style="width: 20%; font-weight: bold; border: none; padding: 4px 0;">Mã nhân viên:</td>
          <td style="width: 30%; border: none; padding: 4px 0;">${employee.maNV}</td>
          <td style="width: 20%; font-weight: bold; border: none; padding: 4px 0;">Họ và tên:</td>
          <td style="width: 30%; border: none; padding: 4px 0; font-weight: bold;">${employee.hoTen}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; border: none; padding: 4px 0;">Phòng ban:</td>
          <td style="border: none; padding: 4px 0;">${employee.phongBan}</td>
          <td style="font-weight: bold; border: none; padding: 4px 0;">Chức danh:</td>
          <td style="border: none; padding: 4px 0;">${payroll.chucDanh}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; border: none; padding: 4px 0;">Số tài khoản:</td>
          <td style="border: none; padding: 4px 0;">${employee.soTaiKhoan} (${employee.nganHang})</td>
          <td style="font-weight: bold; border: none; padding: 4px 0;">Ngày công chuẩn/thực tế:</td>
          <td style="border: none; padding: 4px 0;">${payroll.ngayCong} / 26 công</td>
        </tr>
      </table>

      <!-- Earnings & Deductions Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11pt;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #94a3b8; padding: 8px; text-align: center; width: 8%;">STT</th>
            <th style="border: 1px solid #94a3b8; padding: 8px; text-align: left;">KHOẢN MỤC THANH TOÁN</th>
            <th style="border: 1px solid #94a3b8; padding: 8px; text-align: right; width: 25%;">SỐ TIỀN (VNĐ)</th>
            <th style="border: 1px solid #94a3b8; padding: 8px; text-align: left; width: 25%;">GHI CHÚ</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background-color: #f8fafc; font-weight: bold;">
            <td style="border: 1px solid #94a3b8; padding: 6px; text-align: center;">I</td>
            <td style="border: 1px solid #94a3b8; padding: 6px;" colspan="3">CÁC KHOẢN THU NHẬP</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">1</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Lương thời gian (Lương HĐ / 26 * Ngày công)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: right;">${formatVND(payroll.luongThoiGian)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Mức HĐ: ${formatVND(payroll.mucLuongHD)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">2</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Phụ cấp trách nhiệm / chức vụ</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: right;">${formatVND(payroll.phuCapTN)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Theo quy định CV</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">3</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Phụ cấp ăn trưa</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: right;">${formatVND(payroll.phuCapAnTrua)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Định mức miễn thuế</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">4</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Tiền làm thêm giờ (OT)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: right; color: #1e3a8a; font-weight: bold;">${formatVND(payroll.tienOT)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Theo bảng chấm công</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">5</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Thưởng hiệu quả / năng suất</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: right;">${formatVND(payroll.thuongHieuQua)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Đánh giá KPI</td>
          </tr>
          <tr style="background-color: #ecfdf5; font-weight: bold;">
            <td style="border: 1px solid #94a3b8; padding: 8px; text-align: center;">(A)</td>
            <td style="border: 1px solid #94a3b8; padding: 8px; color: #0F291E;">TỔNG THU NHẬP (1+2+3+4+5)</td>
            <td style="border: 1px solid #94a3b8; padding: 8px; text-align: right; color: #0F291E;">${formatVND(payroll.tongThuNhap)}</td>
            <td style="border: 1px solid #94a3b8; padding: 8px;"></td>
          </tr>

          <tr style="background-color: #f8fafc; font-weight: bold;">
            <td style="border: 1px solid #94a3b8; padding: 6px; text-align: center;">II</td>
            <td style="border: 1px solid #94a3b8; padding: 6px;" colspan="3">CÁC KHOẢN GIẢM TRỪ</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">6</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Trích nộp BHXH, BHYT, BHTN (10.5%)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: right; color: #b91c1c;">${formatVND(payroll.bhxh)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">8% BHXH + 1.5% BHYT + 1% BHTN</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">7</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Thuế Thu nhập cá nhân (TNCN)</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: right; color: #b91c1c;">${formatVND(payroll.thueTNCN)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">Biểu lũy tiến từng phần</td>
          </tr>
          <tr style="background-color: #fff1f2; font-weight: bold;">
            <td style="border: 1px solid #94a3b8; padding: 8px; text-align: center;">(B)</td>
            <td style="border: 1px solid #94a3b8; padding: 8px; color: #991b1b;">TỔNG KHOẢN GIẢM TRỪ (6+7)</td>
            <td style="border: 1px solid #94a3b8; padding: 8px; text-align: right; color: #991b1b;">${formatVND(totalDeductions)}</td>
            <td style="border: 1px solid #94a3b8; padding: 8px;"></td>
          </tr>

          <tr style="background-color: #fef3c7; font-size: 13pt; font-weight: bold;">
            <td style="border: 2px solid #b45309; padding: 10px; text-align: center;">(C)</td>
            <td style="border: 2px solid #b45309; padding: 10px; color: #78350f;">THỰC LĨNH CHUYỂN KHOẢN (A - B)</td>
            <td style="border: 2px solid #b45309; padding: 10px; text-align: right; color: #b45309;">${formatVND(payroll.thucLinh)}</td>
            <td style="border: 2px solid #b45309; padding: 10px; font-size: 10pt; color: #78350f;">Đã chuyển khoản</td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div style="margin-top: 30px; display: flex; justify-content: space-between; text-align: center; font-size: 11pt;">
        <div style="width: 30%;">
          <div style="font-weight: bold;">NGƯỜI LẬP BIỂU</div>
          <div style="font-style: italic; font-size: 9pt; color: #666;">(Ký, ghi rõ họ tên)</div>
          <div style="margin-top: 50px; font-weight: bold;">Chuyên viên C&B</div>
        </div>
        <div style="width: 30%;">
          <div style="font-weight: bold;">KẾ TOÁN TRƯỞNG</div>
          <div style="font-style: italic; font-size: 9pt; color: #666;">(Ký, ghi rõ họ tên)</div>
          <div style="margin-top: 50px; font-weight: bold;">Lê Thu Lan</div>
        </div>
        <div style="width: 30%;">
          <div style="font-weight: bold;">NGƯỜI LAO ĐỘNG</div>
          <div style="font-style: italic; font-size: 9pt; color: #666;">(Ký xác nhận)</div>
          <div style="margin-top: 50px; font-weight: bold;">${employee.hoTen}</div>
        </div>
      </div>
    </div>
  `;

  const handlePrint = () => {
    printHtmlContent(`PhieuLuong_${employee.maNV}_${payroll.thang.replace('/', '_')}`, getPayslipHtml());
  };

  const handleDownloadWord = () => {
    downloadWordDoc(
      `Phieu_luong_${employee.maNV}_${payroll.thang.replace('/', '_')}`,
      `Phiếu lương ${employee.hoTen} - ${payroll.thang}`,
      getPayslipHtml()
    );
  };

  const handleCopySummary = async () => {
    const summary = `PHIẾU LƯƠNG CÔNG TY A - KỲ ${payroll.thang}
Nhân viên: ${employee.hoTen} (${employee.maNV}) - ${employee.phongBan}
- Lương thời gian: ${formatVND(payroll.luongThoiGian)}
- Phụ cấp: ${formatVND(payroll.phuCapTN + payroll.phuCapAnTrua)}
- Tiền OT: ${formatVND(payroll.tienOT)}
- Thưởng: ${formatVND(payroll.thuongHieuQua)}
- Tổng thu nhập: ${formatVND(payroll.tongThuNhap)}
- Giảm trừ BHXH (10.5%): -${formatVND(payroll.bhxh)}
- Giảm trừ Thuế TNCN: -${formatVND(payroll.thueTNCN)}
=> THỰC LĨNH: ${formatVND(payroll.thucLinh)} (TK: ${employee.soTaiKhoan} - ${employee.nganHang})`;

    const ok = await copyTextToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
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
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F291E] text-amber-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Xem trước Phiếu lương (Payslip A4/A5)
                </h3>
                <p className="text-xs text-slate-500">
                  {employee.hoTen} ({employee.maNV}) • Kỳ tháng {payroll.thang}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Payslip Document Preview */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 dark:bg-slate-950/70">
            <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 max-w-2xl mx-auto text-xs sm:text-sm">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-[#0F291E] pb-3 mb-4">
                <div>
                  <h4 className="text-base font-extrabold text-[#0F291E] tracking-tight">CÔNG TY A</h4>
                  <p className="text-[11px] text-slate-500">Hệ thống Quản trị Nhân sự & Tiền lương</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p>Mẫu số: 02-LĐTL</p>
                  <p>
                    Kỳ: <strong>Tháng {payroll.thang}</strong>
                  </p>
                </div>
              </div>

              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-[#0F291E] uppercase">PHIẾU THANH TOÁN TIỀN LƯƠNG</h3>
                <p className="text-xs text-slate-500 italic">Kỳ chi trả: Tháng {payroll.thang}</p>
              </div>

              {/* Employee Information */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Mã NV:</span> <strong>{employee.maNV}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Họ và tên:</span> <strong>{employee.hoTen}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Phòng ban:</span> <span>{employee.phongBan}</span>
                </div>
                <div>
                  <span className="text-slate-500">Chức vụ:</span> <span>{payroll.chucDanh}</span>
                </div>
                <div>
                  <span className="text-slate-500">Tài khoản:</span> <strong>{employee.soTaiKhoan}</strong> ({employee.nganHang})
                </div>
                <div>
                  <span className="text-slate-500">Ngày công:</span> <strong>{payroll.ngayCong} / 26 ngày</strong>
                </div>
              </div>

              {/* Breakdown Table */}
              <table className="w-full border-collapse text-xs mb-4">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 p-2 text-left">KHOẢN MỤC</th>
                    <th className="border border-slate-300 p-2 text-right w-32">SỐ TIỀN</th>
                    <th className="border border-slate-300 p-2 text-left w-36">GHI CHÚ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan={3} className="border border-slate-300 p-1.5">
                      I. CÁC KHOẢN THU NHẬP
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">1. Lương thời gian (Lương HĐ / 26 * Công)</td>
                    <td className="border border-slate-300 p-2 text-right font-medium">
                      {formatVND(payroll.luongThoiGian)}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">
                      HĐ: {formatVND(payroll.mucLuongHD)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">2. Phụ cấp trách nhiệm / chức danh</td>
                    <td className="border border-slate-300 p-2 text-right font-medium">
                      {formatVND(payroll.phuCapTN)}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">Theo cấp bậc</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">3. Phụ cấp ăn trưa</td>
                    <td className="border border-slate-300 p-2 text-right font-medium">
                      {formatVND(payroll.phuCapAnTrua)}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">Miễn thuế</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">4. Tiền làm thêm giờ (OT)</td>
                    <td className="border border-slate-300 p-2 text-right font-bold text-blue-700">
                      {formatVND(payroll.tienOT)}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">Theo chấm công</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">5. Thưởng hiệu quả</td>
                    <td className="border border-slate-300 p-2 text-right font-medium">
                      {formatVND(payroll.thuongHieuQua)}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">Đánh giá KPI</td>
                  </tr>
                  <tr className="bg-emerald-50 font-bold text-emerald-900">
                    <td className="border border-slate-300 p-2">(A) TỔNG THU NHẬP</td>
                    <td className="border border-slate-300 p-2 text-right">{formatVND(payroll.tongThuNhap)}</td>
                    <td className="border border-slate-300 p-2"></td>
                  </tr>

                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan={3} className="border border-slate-300 p-1.5">
                      II. CÁC KHOẢN GIẢM TRỪ
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">6. Trích BHXH, BHYT, BHTN (10.5%)</td>
                    <td className="border border-slate-300 p-2 text-right text-rose-700 font-medium">
                      -{formatVND(payroll.bhxh)}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">Theo lương đóng BH</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2">7. Thuế Thu nhập cá nhân (TNCN)</td>
                    <td className="border border-slate-300 p-2 text-right text-rose-700 font-medium">
                      -{formatVND(payroll.thueTNCN)}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-500 text-[11px]">Lũy tiến từng phần</td>
                  </tr>
                  <tr className="bg-rose-50 font-bold text-rose-900">
                    <td className="border border-slate-300 p-2">(B) TỔNG KHOẢN GIẢM TRỪ</td>
                    <td className="border border-slate-300 p-2 text-right">-{formatVND(totalDeductions)}</td>
                    <td className="border border-slate-300 p-2"></td>
                  </tr>

                  <tr className="bg-amber-100 font-bold text-amber-950 text-sm">
                    <td className="border-2 border-amber-600 p-2.5">(C) THỰC LĨNH CHUYỂN KHOẢN</td>
                    <td className="border-2 border-amber-600 p-2.5 text-right text-amber-900 font-extrabold">
                      {formatVND(payroll.thucLinh)}
                    </td>
                    <td className="border-2 border-amber-600 p-2.5 text-[11px] text-amber-800 font-medium">
                      Đã hoàn tất thanh toán
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Row */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs mt-6 pt-4 border-t border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">NGƯỜI LẬP BIỂU</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                  <div className="mt-8 font-semibold text-slate-700">Chuyên viên C&B</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800">KẾ TOÁN TRƯỞNG</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                  <div className="mt-8 font-semibold text-slate-700">Lê Thu Lan</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800">NGƯỜI LAO ĐỘNG</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký xác nhận)</div>
                  <div className="mt-8 font-semibold text-slate-700">{employee.hoTen}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm active:scale-95 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>🖨️ In / Xuất PDF</span>
              </button>

              <button
                onClick={handleDownloadWord}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm active:scale-95 transition-all"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>💾 Xuất file Word (.doc)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép!' : '📋 Sao chép tóm tắt'}</span>
              </button>

              <a
                href={createGmailDraftUrl(
                  employee.email,
                  `[Công ty A] Phiếu thanh toán tiền lương - ${payroll.thang}`,
                  `Chào bạn ${employee.hoTen},\n\nPhòng HCNS gửi thông tin phiếu lương tháng ${payroll.thang}. Thực lĩnh chuyển khoản: ${formatVND(payroll.thucLinh)}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>✉️ Gửi qua Gmail</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
