import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileDown, UserCheck, Award } from 'lucide-react';
import { Employee, Contract } from '../types/hrm';
import { formatVND, downloadWordDoc, printHtmlContent } from '../utils/docExporter';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  contract?: Contract;
  onConfirmOfficialContract: (maNV: string) => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  employee,
  contract,
  onConfirmOfficialContract
}) => {
  if (!isOpen || !employee) return null;

  const getEvaluationHtml = () => `
    <div style="max-width: 800px; margin: 0 auto; font-family: 'Times New Roman', Arial, sans-serif; color: #111; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="font-size: 13pt; font-weight: bold;">CÔNG TY CỔ PHẦN CÔNG NGHỆ & DỊCH VỤ A</div>
        <div style="font-size: 11pt;">PHÒNG HÀNH CHÍNH - NHÂN SỰ</div>
        <div style="margin-top: 5px; font-weight: bold;">-----------------***-----------------</div>
      </div>

      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="font-size: 16pt; font-weight: bold; margin: 0; text-transform: uppercase;">TỜ TRÌNH ĐÁNH GIÁ KẾT QUẢ THỬ VIỆC</h2>
        <div style="font-size: 12pt; font-style: italic;">(V/v: Tiếp nhận nhân sự chính thức sau 02 tháng thử việc)</div>
      </div>

      <div style="margin-bottom: 15px; font-size: 12pt;">
        <p><strong>Kính gửi:</strong> BAN GIÁM ĐỐC CÔNG TY A</p>
        <p>- Căn cứ Hợp đồng thử việc số: <strong>${contract?.soHD || '008/2026/HĐLĐ-CPA'}</strong> ký ngày 01/08/2026;</p>
        <p>- Căn cứ kết quả thực hiện công việc và ý kiến nhận xét của Trưởng bộ phận <strong>${employee.phongBan}</strong>;</p>
      </div>

      <div style="margin-bottom: 20px; font-size: 12pt;">
        <h3 style="font-size: 13pt; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px;">I. THÔNG TIN NHÂN SỰ THỬ VIỆC</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <tr>
            <td style="width: 25%; padding: 4px 0;"><strong>Họ và tên:</strong></td>
            <td style="width: 35%; padding: 4px 0;">${employee.hoTen}</td>
            <td style="width: 20%; padding: 4px 0;"><strong>Mã nhân viên:</strong></td>
            <td style="width: 20%; padding: 4px 0;">${employee.maNV}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Vị trí công tác:</strong></td>
            <td style="padding: 4px 0;">${employee.chucVu}</td>
            <td style="padding: 4px 0;"><strong>Phòng ban:</strong></td>
            <td style="padding: 4px 0;">${employee.phongBan}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Thời gian thử việc:</strong></td>
            <td style="padding: 4px 0;" colspan="3">Từ 01/08/2026 đến ${contract?.ngayHetHan || '30/09/2026'} (60 ngày)</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 20px; font-size: 12pt;">
        <h3 style="font-size: 13pt; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px;">II. ĐÁNH GIÁ NĂNG LỰC & KỶ LUẬT LAO ĐỘNG</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #94a3b8; padding: 6px; text-align: left;">Tiêu chí đánh giá</th>
              <th style="border: 1px solid #94a3b8; padding: 6px; text-align: center; width: 25%;">Xếp loại</th>
              <th style="border: 1px solid #94a3b8; padding: 6px; text-align: left; width: 40%;">Nhận xét</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">1. Mức độ hoàn thành công việc chuyên môn</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: #047857;">Tốt (90/100)</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Nắm bắt quy trình nhanh, chủ động giải quyết công việc.</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">2. Chấp hành nội quy, giờ giấc làm việc</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: #047857;">Tốt</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Đúng giờ, không vi phạm đi trễ về sớm.</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">3. Tinh thần trách nhiệm & phối hợp nhóm</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: #047857;">Rất tốt</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Hòa đồng, tương tác tích cực với đồng nghiệp.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 25px; font-size: 12pt;">
        <h3 style="font-size: 13pt; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px;">III. ĐỀ XUẤT CỦA PHÒNG HÀNH CHÍNH - NHÂN SỰ</h3>
        <p>1. Ký Hợp đồng lao động chính thức xác định thời hạn <strong>01 năm (12 tháng)</strong> bắt đầu từ ngày <strong>01/10/2026</strong>.</p>
        <p>2. Mức lương chính thức (100%): <strong>${formatVND(Math.round(((contract?.mucLuongBH || 7225000) / 0.85)))}</strong> / tháng.</p>
        <p>3. Tham gia đóng bảo hiểm xã hội đầy đủ theo quy định của Luật BHXH.</p>
        <p style="margin-top: 10px;">Kính trình Ban Giám đốc xem xét phê duyệt.</p>
      </div>

      <div style="margin-top: 40px; display: flex; justify-content: space-between; text-align: center; font-size: 12pt;">
        <div style="width: 45%;">
          <div style="font-weight: bold;">TRƯỞNG BỘ PHẬN TRỰC TIẾP</div>
          <div style="font-style: italic; font-size: 10pt; color: #666;">(Ký & ghi rõ họ tên)</div>
          <div style="margin-top: 60px; font-weight: bold;">Đã đồng ý đề xuất</div>
        </div>
        <div style="width: 45%;">
          <div style="font-weight: bold;">TỔNG GIÁM ĐỐC PHÊ DUYỆT</div>
          <div style="font-style: italic; font-size: 10pt; color: #666;">(Ký, đóng dấu)</div>
          <div style="margin-top: 60px; font-weight: bold;">Phạm Thái Hùng</div>
        </div>
      </div>
    </div>
  `;

  const handlePrint = () => {
    printHtmlContent(`To_trinh_thu_viec_${employee.maNV}`, getEvaluationHtml());
  };

  const handleDownloadWord = () => {
    downloadWordDoc(
      `To_trinh_danh_gia_thu_viec_${employee.maNV}`,
      `Tờ trình đánh giá thử việc - ${employee.hoTen}`,
      getEvaluationHtml()
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Tờ trình Đánh giá Hết hạn Thử việc
                </h3>
                <p className="text-xs text-slate-500">
                  {employee.hoTen} ({employee.maNV}) • {employee.phongBan}
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

          {/* Form preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/60 text-xs sm:text-sm">
            <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="text-center border-b pb-3">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  CÔNG TY CỔ PHẦN CÔNG NGHỆ & DỊCH VỤ A
                </h4>
                <p className="text-xs text-slate-500">PHÒNG HÀNH CHÍNH - NHÂN SỰ</p>
                <h3 className="text-base font-bold text-emerald-800 mt-2 uppercase">
                  TỜ TRÌNH ĐÁNH GIÁ KẾT QUẢ THỬ VIỆC
                </h3>
                <p className="text-xs text-slate-400 italic">
                  (Tiếp nhận nhân sự chính thức sau 02 tháng thử việc)
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <p>
                  <strong>Kính gửi:</strong> Ban Giám đốc Công ty A
                </p>
                <p>
                  - Căn cứ Hợp đồng thử việc số <strong>{contract?.soHD || '008/2026/HĐLĐ-CPA'}</strong> ký ngày 01/08/2026.
                </p>
                <p>
                  - Nhân sự: <strong>{employee.hoTen}</strong> (Mã NV: <strong>{employee.maNV}</strong>)
                </p>
                <p>
                  - Vị trí: <strong>{employee.chucVu}</strong> - Bộ phận: <strong>{employee.phongBan}</strong>
                </p>
                <p>
                  - Thời gian: 60 ngày thử việc đã hoàn thành đạt kết quả <strong>Tốt (90/100 điểm)</strong>.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                <strong>Đề xuất:</strong> Ký Hợp đồng lao động chính thức 01 năm từ ngày 01/10/2026. Hưởng 100% lương
                chính thức và tham gia BHXH đầy đủ.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>🖨️ In Tờ trình</span>
              </button>

              <button
                onClick={handleDownloadWord}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm active:scale-95"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>💾 Tải Word (.doc)</span>
              </button>
            </div>

            <button
              onClick={() => {
                onConfirmOfficialContract(employee.maNV);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Phê duyệt Ký HĐLĐ Chính thức</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
