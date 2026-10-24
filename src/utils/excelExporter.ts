import * as XLSX from 'xlsx';
import { Payroll, Timesheet, Employee } from '../types/hrm';

export function exportPayrollToExcel(payrolls: Payroll[], period: string) {
  const exportRows = payrolls.map((p, idx) => ({
    'STT': idx + 1,
    'Mã NV': p.maNV,
    'Họ và tên': p.hoTen,
    'Phòng ban': p.phongBan,
    'Chức vụ': p.chucDanh,
    'Mức lương HĐ': p.mucLuongHD,
    'Ngày công': p.ngayCong,
    'Lương thời gian': p.luongThoiGian,
    'Phụ cấp TN': p.phuCapTN,
    'Phụ cấp ăn trưa': p.phuCapAnTrua,
    'Tiền làm thêm OT': p.tienOT,
    'Thưởng hiệu quả': p.thuongHieuQua,
    'Tổng thu nhập': p.tongThuNhap,
    'BHXH,YT,TN (10.5%)': p.bhxh,
    'Thuế TNCN': p.thueTNCN,
    'Thực lĩnh': p.thucLinh,
    'Ghi chú': p.ghiChu
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Luong_${period.replace('/', '_')}`);
  XLSX.writeFile(wb, `Bang_luong_CongTyA_${period.replace('/', '_')}.xlsx`);
}

export function exportTimesheetToExcel(timesheets: Timesheet[], period: string) {
  const exportRows = timesheets.map((t, idx) => ({
    'STT': idx + 1,
    'Mã NV': t.maNV,
    'Họ và tên': t.hoTen,
    'Phòng ban': t.phongBan,
    'Chức vụ': t.chucVu,
    'Công chuẩn': t.congChuan,
    'Công thực tế (X)': t.congThucTe,
    'Nghỉ phép (P)': t.nghiPhep,
    'Nghỉ không lương (Ro)': t.nghiKhongLuong,
    'Nghỉ ốm (Om)': t.nghiOm,
    'Nghỉ thai sản (TS)': t.nghiThaiSan,
    'Tổng công tính lương': t.tongCong,
    'Tăng ca ngày thường (h)': t.tangCaThuong,
    'Tăng ca Chủ nhật (h)': t.tangCaCN,
    'Đi trễ / Về sớm (lần)': t.treSom,
    'Ghi chú': t.ghiChu
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `ChamCong_${period.replace('/', '_')}`);
  XLSX.writeFile(wb, `Bang_cham_cong_CongTyA_${period.replace('/', '_')}.xlsx`);
}

export function exportEmployeesToExcel(employees: Employee[]) {
  const exportRows = employees.map((e, idx) => ({
    'STT': idx + 1,
    'Mã NV': e.maNV,
    'Họ và tên': e.hoTen,
    'Giới tính': e.gioiTinh,
    'Ngày sinh': e.ngaySinh,
    'Số CCCD': e.cccd,
    'Quê quán': e.queQuan,
    'Phòng ban': e.phongBan,
    'Chức vụ': e.chucVu,
    'Trình độ': e.trinhDo,
    'Ngày vào làm': e.ngayVaoLam,
    'Email công việc': e.email,
    'Số điện thoại': e.soDienThoai,
    'Số tài khoản NH': e.soTaiKhoan,
    'Ngân hàng': e.nganHang,
    'Mã số BHXH': e.maSoBHXH,
    'Người phụ thuộc': e.nguoiPhuThuoc,
    'Trạng thái': e.trangThai
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ho_so_nhan_su');
  XLSX.writeFile(wb, `Danh_sach_nhan_su_CongTyA.xlsx`);
}
