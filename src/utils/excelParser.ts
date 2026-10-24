import * as XLSX from 'xlsx';
import { Department, Employee, Contract, Timesheet, Payroll, LeaveRequest, LeaveBalance, HRSystemData } from '../types/hrm';

export interface FileValidationResult {
  fileName: string;
  fileType: string;
  isValid: boolean;
  headerRow: number;
  rowCount: number;
  hasTotalRowSkipped: boolean;
  errors: string[];
  warnings: string[];
  sheetNames: string[];
}

export function parseExcelFile(
  fileData: ArrayBuffer,
  fileName: string,
  currentData: HRSystemData
): { updatedData: HRSystemData; validation: FileValidationResult } {
  const wb = XLSX.read(fileData, { type: 'array', cellFormula: true, cellStyles: true });
  const sheetNames = wb.SheetNames;
  const validation: FileValidationResult = {
    fileName,
    fileType: 'Unknown',
    isValid: true,
    headerRow: 4,
    rowCount: 0,
    hasTotalRowSkipped: false,
    errors: [],
    warnings: [],
    sheetNames
  };

  const newData: HRSystemData = {
    ...currentData,
    sourceFiles: Array.from(new Set([...currentData.sourceFiles, fileName])),
    lastUpdated: new Date().toLocaleString('vi-VN')
  };

  // Determine file type from filename or sheet names
  const lowerName = fileName.toLowerCase();

  // Helper to read rows starting at row 4 (range: 3) and filter out total row (Dòng 55)
  const extractValidRows = (sheet: XLSX.WorkSheet) => {
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet, { range: 3, defval: '' });
    // Filter out total row (row with 'TỔNG CỘNG' or empty maNV)
    const validRows = rawRows.filter((r) => {
      const firstVal = String(Object.values(r)[0] || '').trim();
      const nameVal = String(r['Họ và tên'] || '').trim().toUpperCase();
      if (nameVal.includes('TỔNG CỘNG') || firstVal.toUpperCase().includes('TỔNG CỘNG')) {
        validation.hasTotalRowSkipped = true;
        return false;
      }
      return r['Mã NV'] && String(r['Mã NV']).startsWith('TP');
    });
    validation.rowCount = validRows.length;
    return validRows;
  };

  try {
    if (lowerName.includes('00_danh_muc') || sheetNames.includes('Phong_ban')) {
      validation.fileType = '00 - Danh mục hệ thống';
      if (wb.Sheets['Phong_ban']) {
        const pbRows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Phong_ban'], { range: 2 });
        newData.departments = pbRows.map((r) => ({
          id: r['Mã phòng ban'] || '',
          name: r['Tên phòng ban'] || '',
          description: r['Chức năng / Nhiệm vụ'] || '',
          dinhBien: Number(r['Định biên nhân sự'] || 0),
          truongBoPhan: r['Trưởng bộ phận dự kiến'] || ''
        }));
      }
    } else if (lowerName.includes('01_ho_so') || sheetNames.includes('Ho_so_nhan_vien')) {
      validation.fileType = '01 - Hồ sơ nhân viên';
      const ws = wb.Sheets['Ho_so_nhan_vien'] || wb.Sheets[sheetNames[0]];
      const rows = extractValidRows(ws);
      newData.employees = rows.map((r) => ({
        maNV: String(r['Mã NV']).trim(),
        hoTen: String(r['Họ và tên'] || '').trim(),
        gioiTinh: (r['Giới tính'] || 'Nam').trim() as any,
        ngaySinh: String(r['Ngày sinh'] || '').trim(),
        cccd: String(r['Số CCCD'] || '').trim(),
        queQuan: String(r['Quê quán'] || '').trim(),
        phongBan: String(r['Phòng ban'] || '').trim(),
        chucVu: String(r['Chức vụ / Chức danh'] || '').trim(),
        trinhDo: String(r['Trình độ'] || '').trim(),
        ngayVaoLam: String(r['Ngày vào làm'] || '').trim(),
        email: String(r['Email công việc'] || '').trim(),
        soDienThoai: String(r['Số điện thoại'] || '').trim(),
        soTaiKhoan: String(r['Số tài khoản NH'] || '').trim(),
        nganHang: String(r['Ngân hàng'] || '').trim(),
        maSoBHXH: String(r['Mã số BHXH'] || '').trim(),
        nguoiPhuThuoc: Number(r['Người phụ thuộc'] || 0),
        trangThai: String(r['Trạng thái'] || 'Đang làm việc').trim() as any
      }));
    } else if (lowerName.includes('02_hop_dong') || sheetNames.includes('Hop_dong_lao_dong')) {
      validation.fileType = '02 - Hợp đồng lao động';
      const ws = wb.Sheets['Hop_dong_lao_dong'] || wb.Sheets[sheetNames[0]];
      const rows = extractValidRows(ws);
      newData.contracts = rows.map((r) => ({
        soHD: String(r['Số hợp đồng'] || '').trim(),
        maNV: String(r['Mã NV'] || '').trim(),
        hoTen: String(r['Họ và tên'] || '').trim(),
        phongBan: String(r['Phòng ban'] || '').trim(),
        chucDanh: String(r['Chức danh ký HĐ'] || '').trim(),
        loaiHD: String(r['Loại hợp đồng'] || '').trim(),
        ngayKy: String(r['Ngày ký'] || '').trim(),
        ngayHieuLuc: String(r['Ngày hiệu lực'] || '').trim(),
        ngayHetHan: String(r['Ngày hết hạn'] || '').trim(),
        mucLuongBH: Number(r['Mức lương đóng BH (VNĐ)'] || 0),
        diaDiem: String(r['Địa điểm làm việc'] || '').trim(),
        trangThai: String(r['Trạng thái hợp đồng'] || 'Đang hiệu lực').trim() as any
      }));
    } else if (lowerName.includes('03_cham_cong') || sheetNames.some((s) => s.includes('Cham_cong'))) {
      validation.fileType = '03 - Bảng chấm công';
      // Detect month from filename: e.g. 2026_07 -> 07/2026
      let monthStr = '07/2026';
      const match = fileName.match(/2026_(\d{2})/);
      if (match) monthStr = `${match[1]}/2026`;

      const ws = wb.Sheets[sheetNames[0]];
      const rows = extractValidRows(ws);
      const parsedTimesheets: Timesheet[] = rows.map((r) => ({
        thang: monthStr,
        maNV: String(r['Mã NV']).trim(),
        hoTen: String(r['Họ và tên'] || '').trim(),
        phongBan: String(r['Phòng ban'] || '').trim(),
        chucVu: String(r['Chức vụ'] || '').trim(),
        congChuan: Number(r['Công chuẩn'] || 26),
        congThucTe: Number(r['Công thực tế (X)'] || 0),
        nghiPhep: Number(r['Nghỉ phép (P)'] || 0),
        nghiKhongLuong: Number(r['Nghỉ không lương (Ro)'] || 0),
        nghiOm: Number(r['Nghỉ ốm (Om)'] || 0),
        nghiThaiSan: Number(r['Nghỉ thai sản (TS)'] || 0),
        tongCong: Number(r['Tổng công tính lương'] || Number(r['Công thực tế (X)'] || 0) + Number(r['Nghỉ phép (P)'] || 0)),
        tangCaThuong: Number(r['Tăng ca ngày thường (h)'] || 0),
        tangCaCN: Number(r['Tăng ca Chủ nhật (h)'] || 0),
        treSom: Number(r['Đi trễ / Về sớm (lần)'] || 0),
        ghiChu: String(r['Ghi chú'] || '').trim()
      }));

      // Replace or merge with existing timesheets for this month
      newData.timesheets = [
        ...newData.timesheets.filter((t) => t.thang !== monthStr),
        ...parsedTimesheets
      ];
    } else if (lowerName.includes('04_nghi_phep') || sheetNames.includes('Theo_doi_don_nghi')) {
      validation.fileType = '04 - Nghỉ phép & Quỹ phép';
      if (wb.Sheets['Theo_doi_don_nghi']) {
        const ws = wb.Sheets['Theo_doi_don_nghi'];
        const rows = XLSX.utils.sheet_to_json<any>(ws, { range: 3 });
        newData.leaves = rows
          .filter((r) => r['Mã đơn'] && r['Mã NV'])
          .map((r) => ({
            maDon: String(r['Mã đơn']).trim(),
            maNV: String(r['Mã NV']).trim(),
            hoTen: String(r['Họ và tên'] || '').trim(),
            phongBan: String(r['Phòng ban'] || '').trim(),
            loaiNghi: String(r['Loại nghỉ phép'] || '').trim(),
            tuNgay: String(r['Từ ngày'] || '').trim(),
            denNgay: String(r['Đến ngày'] || '').trim(),
            soNgay: Number(r['Số ngày'] || 1),
            lyDo: String(r['Lý do xin nghỉ'] || '').trim(),
            nguoiDuyet: String(r['Người phê duyệt'] || '').trim(),
            trangThai: String(r['Trạng thái duyệt'] || 'Đã duyệt').trim() as any
          }));
        validation.rowCount = newData.leaves.length;
      }
    } else if (lowerName.includes('05_bang_luong') || sheetNames.some((s) => s.includes('Bang_luong'))) {
      validation.fileType = '05 - Bảng lương & Thuế';
      let monthStr = '07/2026';
      const match = fileName.match(/2026_(\d{2})/);
      if (match) monthStr = `${match[1]}/2026`;

      const ws = wb.Sheets[sheetNames[0]];
      const rows = extractValidRows(ws);
      const parsedPayrolls: Payroll[] = rows.map((r) => {
        const mucLuongHD = Number(r['Mức lương HĐ'] || 0);
        const ngayCong = Number(r['Ngày công'] || 0);
        const luongThoiGian = Number(r['Lương thời gian']) || (mucLuongHD > 0 && ngayCong > 0 ? Math.round((mucLuongHD / 26) * ngayCong) : 0);
        const phuCapTN = Number(r['Phụ cấp TN'] || 0);
        const phuCapAnTrua = Number(r['Phụ cấp ăn trưa'] || 0);
        const tienOT = Number(r['Tiền làm thêm OT'] || 0);
        const thuongHieuQua = Number(r['Thưởng hiệu quả'] || 0);
        const tongThuNhap = Number(r['Tổng thu nhập']) || (luongThoiGian + phuCapTN + phuCapAnTrua + tienOT + thuongHieuQua);
        const bhxh = Number(r['BHXH,YT,TN (10.5%)'] || 0) || Math.round(mucLuongHD * 0.105);
        const thueTNCN = Number(r['Thuế TNCN'] || 0);
        const thucLinh = Number(r['Thực lĩnh']) || Math.max(0, tongThuNhap - bhxh - thueTNCN);
        return {
          thang: monthStr,
          maNV: String(r['Mã NV']).trim(),
          hoTen: String(r['Họ và tên'] || '').trim(),
          phongBan: String(r['Phòng ban'] || '').trim(),
          chucDanh: String(r['Chức danh'] || '').trim(),
          mucLuongHD,
          ngayCong,
          luongThoiGian,
          phuCapTN,
          phuCapAnTrua,
          tienOT,
          thuongHieuQua,
          tongThuNhap,
          bhxh,
          thueTNCN,
          thucLinh,
          ghiChu: String(r['Ghi chú'] || '').trim()
        };
      });

      newData.payrolls = [
        ...newData.payrolls.filter((p) => p.thang !== monthStr),
        ...parsedPayrolls
      ];
    } else {
      validation.warnings.push('Tên file không thuộc mẫu chuẩn 00 đến 05, hệ thống đã cố gắng nhận diện tự động.');
    }
  } catch (err: any) {
    validation.isValid = false;
    validation.errors.push(`Lỗi phân tích file: ${err.message || 'Không đọc được dữ liệu'}`);
  }

  return { updatedData: newData, validation };
}
