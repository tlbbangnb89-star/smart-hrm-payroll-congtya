export interface Department {
  id: string; // BGD, HCNS, etc.
  name: string; // Ban Giám đốc, etc.
  description: string;
  dinhBien: number;
  truongBoPhan: string;
  actualCount?: number;
}

export interface Employee {
  maNV: string; // TP0001
  hoTen: string;
  gioiTinh: 'Nam' | 'Nữ';
  ngaySinh: string;
  cccd: string;
  queQuan: string;
  phongBan: string;
  chucVu: string;
  trinhDo: string;
  ngayVaoLam: string;
  email: string;
  soDienThoai: string;
  soTaiKhoan: string;
  nganHang: string;
  maSoBHXH: string;
  nguoiPhuThuoc: number;
  trangThai: 'Đang làm việc' | 'Thử việc' | 'Đã nghỉ việc';
  avatar?: string;
}

export interface Contract {
  soHD: string;
  maNV: string;
  hoTen: string;
  phongBan: string;
  chucDanh: string;
  loaiHD: string;
  ngayKy: string;
  ngayHieuLuc: string;
  ngayHetHan: string;
  mucLuongBH: number;
  diaDiem: string;
  trangThai: 'Đang hiệu lực' | 'Sắp hết hạn' | 'Hết hạn' | 'Đã gia hạn';
}

export interface Timesheet {
  thang: string; // '07/2026', '08/2026', '09/2026', '10/2026'
  maNV: string;
  hoTen: string;
  phongBan: string;
  chucVu: string;
  congChuan: number;
  congThucTe: number;
  nghiPhep: number;
  nghiKhongLuong: number;
  nghiOm: number;
  nghiThaiSan: number;
  tongCong: number;
  tangCaThuong: number; // hours
  tangCaCN: number; // hours
  treSom: number; // times
  ghiChu: string;
}

export interface Payroll {
  thang: string; // '07/2026', '08/2026', '09/2026', '10/2026'
  maNV: string;
  hoTen: string;
  phongBan: string;
  chucDanh: string;
  mucLuongHD: number;
  ngayCong: number;
  luongThoiGian: number;
  phuCapTN: number;
  phuCapAnTrua: number;
  tienOT: number;
  thuongHieuQua: number;
  tongThuNhap: number;
  bhxh: number; // 10.5%
  thueTNCN: number;
  thucLinh: number;
  ghiChu: string;
}

export interface LeaveRequest {
  maDon: string;
  maNV: string;
  hoTen: string;
  phongBan: string;
  loaiNghi: string;
  tuNgay: string;
  denNgay: string;
  soNgay: number;
  lyDo: string;
  nguoiDuyet: string;
  trangThai: 'Đã duyệt' | 'Chờ duyệt' | 'Từ chối';
}

export interface LeaveBalance {
  maNV: string;
  hoTen: string;
  phongBan: string;
  tieuChuan: number;
  thamNien: number;
  tongQuy: number;
  daSuDung: number;
  conLai: number;
  ghiChu: string;
}

export type AlertSeverity = 'red' | 'yellow' | 'green';

export interface TaskAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity; // red: Khẩn cấp, yellow: Chờ xử lý, green: Ổn định
  category: 'contract' | 'probation' | 'leave' | 'general';
  maNV?: string;
  hoTen?: string;
  phongBan?: string;
  dueDate?: string;
  actionRequired: string;
  actionTaken?: boolean;
  referenceDoc?: string;
}

export interface HRSystemData {
  departments: Department[];
  employees: Employee[];
  contracts: Contract[];
  timesheets: Timesheet[];
  payrolls: Payroll[];
  leaves: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  parameters: Record<string, any>;
  lastUpdated: string;
  sourceFiles: string[];
}
