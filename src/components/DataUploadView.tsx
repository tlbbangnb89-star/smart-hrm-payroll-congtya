import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  FileCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { HRSystemData } from '../types/hrm';
import { parseExcelFile, FileValidationResult } from '../utils/excelParser';

interface DataUploadViewProps {
  data: HRSystemData;
  onDataUpdated: (newData: HRSystemData) => void;
  onLoadSampleData: () => void;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({
  data,
  onDataUpdated,
  onLoadSampleData
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationList, setValidationList] = useState<FileValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List of standard sample files available in public/sample_data
  const sampleFileList = [
    { name: '00_Danh_muc_he_thong.xlsx', desc: 'Danh mục 6 phòng ban, chức vụ & tham số BHXH' },
    { name: '01_Ho_so_nhan_vien.xlsx', desc: '50 Hồ sơ nhân sự TP0001 - TP0050, CCCD, chức danh' },
    { name: '02_Hop_dong.xlsx', desc: 'Hợp đồng lao động, cảnh báo tái ký TP0021 & TP0035' },
    { name: '03_Cham_cong_2026_07.xlsx', desc: 'Bảng tổng hợp chấm công & OT Tháng 07/2026' },
    { name: '03_Cham_cong_2026_08.xlsx', desc: 'Bảng tổng hợp chấm công & OT Tháng 08/2026' },
    { name: '03_Cham_cong_2026_09.xlsx', desc: 'Bảng tổng hợp chấm công & OT Tháng 09/2026' },
    { name: '03_Cham_cong_2026_10.xlsx', desc: 'Bảng tổng hợp chấm công & OT Tháng 10/2026' },
    { name: '04_Nghi_phep_2026.xlsx', desc: 'Đơn nghỉ phép năm 2026 & Quỹ phép (NP-0515, NP-0518, NP-0520)' },
    { name: '05_Bang_luong_2026_07.xlsx', desc: 'Bảng thanh toán lương & thuế TNCN Tháng 07/2026' },
    { name: '05_Bang_luong_2026_08.xlsx', desc: 'Bảng thanh toán lương & thuế TNCN Tháng 08/2026' },
    { name: '05_Bang_luong_2026_09.xlsx', desc: 'Bảng thanh toán lương & quyết toán Q3/2026' },
    { name: '05_Bang_luong_2026_10.xlsx', desc: 'Bảng thanh toán lương Tháng 10/2026' }
  ];

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    let updated = { ...data };
    const newValidations: FileValidationResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        newValidations.push({
          fileName: file.name,
          fileType: 'Sai định dạng',
          isValid: false,
          headerRow: 0,
          rowCount: 0,
          hasTotalRowSkipped: false,
          errors: ['File không phải định dạng Excel (.xlsx / .xls)'],
          warnings: [],
          sheetNames: []
        });
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const { updatedData, validation } = parseExcelFile(buffer, file.name, updated);
        updated = updatedData;
        newValidations.push(validation);
      } catch (err: any) {
        newValidations.push({
          fileName: file.name,
          fileType: 'Lỗi',
          isValid: false,
          headerRow: 0,
          rowCount: 0,
          hasTotalRowSkipped: false,
          errors: [err.message || 'Lỗi đọc file'],
          warnings: [],
          sheetNames: []
        });
      }
    }

    setValidationList((prev) => [...newValidations, ...prev]);
    onDataUpdated(updated);
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-amber-600" />
            Nhập thêm Dữ liệu & Kiểm tra Tính hợp lệ (Validation Checklist)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hỗ trợ kéo thả cùng lúc hoặc từng file trong bộ 10 file nguồn của Công ty A.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onLoadSampleData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🔄 Quét lại dữ liệu gốc (50 nhân sự)</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 text-center cursor-pointer flex flex-col items-center justify-center ${
          isDragging
            ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".xlsx, .xls"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
          }}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Kéo thả file Excel (.xlsx) vào đây hoặc nhấp để chọn file
        </h3>
        <p className="text-xs text-slate-500 max-w-md">
          Hệ thống tự động nhận diện cấu trúc tiêu đề tại <strong>Dòng 4</strong>, nạp dữ liệu nhân viên từ <strong>Dòng 5 đến 54</strong>, và loại bỏ dòng <strong>TỔNG CỘNG (Dòng 55)</strong>.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            01_Ho_so_nhan_vien
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            02_Hop_dong
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            03_Cham_cong
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            04_Nghi_phep
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            05_Bang_luong
          </span>
        </div>
      </div>

      {/* Validation Checklist Requirements Card */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>4 Quy tắc Tự động Đối soát & Chuẩn hóa Dữ liệu (Validation Protocol):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">1. Nhận diện Header</span>
            Tiêu đề cột tự động quét tại <strong>Dòng 4</strong> của bảng tính (Mã NV, Họ tên, Phòng ban, Mức lương...).
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">2. Khoảng dữ liệu</span>
            Chỉ đọc bản ghi từ <strong>Dòng 5 đến 54</strong> tương ứng với 50 mã nhân viên <strong>TP0001 - TP0050</strong>.
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">3. Khử trùng dòng Tổng</span>
            Tự động phát hiện và loại bỏ dòng <strong>TỔNG CỘNG</strong> ở Dòng 55 nhằm chống sai lệch và nhân đôi số liệu.
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">4. Khóa chính 360°</span>
            Lấy <strong>Mã NV</strong> làm khóa duy nhất liên kết chéo 5 chiều thông tin nhân sự.
          </div>
        </div>
      </div>

      {/* Validation Results (if any uploaded) */}
      {validationList.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Kết quả kiểm tra file vừa tải lên ({validationList.length})
          </h3>
          <div className="space-y-2">
            {validationList.map((res, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  res.isValid
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                    : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {res.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white mr-2">
                      {res.fileName}
                    </span>
                    <span className="text-slate-500">({res.fileType})</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Đã đọc {res.rowCount} dòng hợp lệ • Tiêu đề Dòng {res.headerRow} •
                      {res.hasTotalRowSkipped
                        ? ' Đã tự động loại bỏ dòng Tổng cộng'
                        : ' Không có dòng tổng trùng lặp'}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    res.isValid
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {res.isValid ? 'Hợp lệ' : 'Lỗi'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Files Download Repository */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kho 10 File Nguồn Mẫu Chuẩn Công ty A (.xlsx)
            </h3>
            <p className="text-xs text-slate-500">
              Bạn có thể tải từng file về máy tính để kiểm tra tính năng kéo thả nhập liệu:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sampleFileList.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                </div>
              </div>

              <a
                href={`/sample_data/${item.name}`}
                download={item.name}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 shadow-2xs flex-shrink-0"
                title="Tải file mẫu về máy"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
