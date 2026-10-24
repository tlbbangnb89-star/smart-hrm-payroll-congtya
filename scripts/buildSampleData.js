const fs = require('fs');
const XLSX = require('xlsx');

// 1. Departments
const dmWb = XLSX.readFile('00_Danh_muc_he_thong.xlsx');
const pbRows = XLSX.utils.sheet_to_json(dmWb.Sheets['Phong_ban'], { range: 2 });
const departments = pbRows.map(r => ({
  id: r['Mã phòng ban'] || '',
  name: r['Tên phòng ban'] || '',
  description: r['Chức năng / Nhiệm vụ'] || '',
  dinhBien: Number(r['Định biên nhân sự'] || 0),
  truongBoPhan: r['Trưởng bộ phận dự kiến'] || ''
}));

// Parameters
const qdRows = XLSX.utils.sheet_to_json(dmWb.Sheets['Quy_dinh_chung'], { range: 2 });
const parameters = {};
qdRows.forEach(r => {
  if (r['Mã tham số']) parameters[r['Mã tham số']] = r['Giá trị áp dụng'];
});

// 2. Employees (01_Ho_so_nhan_vien.xlsx)
const hsWb = XLSX.readFile('01_Ho_so_nhan_vien.xlsx');
const hsRows = XLSX.utils.sheet_to_json(hsWb.Sheets['Ho_so_nhan_vien'], { range: 3 });
const employees = hsRows.filter(r => r['Mã NV'] && String(r['Mã NV']).startsWith('TP')).map(r => ({
  maNV: String(r['Mã NV']).trim(),
  hoTen: String(r['Họ và tên'] || '').trim(),
  gioiTinh: (r['Giới tính'] || 'Nam').trim(),
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
  trangThai: String(r['Trạng thái'] || 'Đang làm việc').trim()
}));

// 3. Contracts (02_Hop_dong.xlsx)
const hdWb = XLSX.readFile('02_Hop_dong.xlsx');
const hdRows = XLSX.utils.sheet_to_json(hdWb.Sheets['Hop_dong_lao_dong'], { range: 3 });
const contracts = hdRows.filter(r => r['Mã NV'] && String(r['Mã NV']).startsWith('TP')).map(r => ({
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
  trangThai: String(r['Trạng thái hợp đồng'] || 'Đang hiệu lực').trim()
}));

// 4. Leaves (04_Nghi_phep_2026.xlsx)
const npWb = XLSX.readFile('04_Nghi_phep_2026.xlsx');
const npRows = XLSX.utils.sheet_to_json(npWb.Sheets['Theo_doi_don_nghi'], { range: 3 });
const leaves = npRows.filter(r => r['Mã đơn'] && r['Mã NV']).map(r => ({
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
  trangThai: String(r['Trạng thái duyệt'] || 'Đã duyệt').trim()
}));

// Leave balances
const qpRows = XLSX.utils.sheet_to_json(npWb.Sheets['Quy_phep_nam'], { range: 2 });
const leaveBalances = qpRows.filter(r => r['Mã NV'] && String(r['Mã NV']).startsWith('TP')).map(r => {
  const tieuChuan = Number(r['Phép tiêu chuẩn'] || 12);
  const thamNien = Number(r['Phép thâm niên'] || 0);
  const tongQuy = tieuChuan + thamNien;
  const userLeaves = leaves.filter(l => l.maNV === r['Mã NV'] && l.trangThai === 'Đã duyệt' && l.loaiNghi.includes('phép năm'));
  const daSuDung = userLeaves.reduce((sum, l) => sum + l.soNgay, 0);
  return {
    maNV: String(r['Mã NV']).trim(),
    hoTen: String(r['Họ và tên'] || '').trim(),
    phongBan: String(r['Phòng ban'] || '').trim(),
    tieuChuan,
    thamNien,
    tongQuy,
    daSuDung,
    conLai: Math.max(0, tongQuy - daSuDung),
    ghiChu: String(r['Ghi chú'] || 'Bình thường').trim()
  };
});

// 5. Timesheets (07, 08, 09, 10)
const fileMonths = [
  { file: '03_Cham_cong_2026_07.xlsx', m: '07/2026' },
  { file: '03_Cham_cong_2026_08.xlsx', m: '08/2026' },
  { file: '03_Cham_cong_2026_09.xlsx', m: '09/2026' },
  { file: '03_Cham_cong_2026_10.xlsx', m: '10/2026' }
];

const timesheets = [];
fileMonths.forEach(fm => {
  if (fs.existsSync(fm.file)) {
    const wb = XLSX.readFile(fm.file);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 3 });
    rows.filter(r => r['Mã NV'] && String(r['Mã NV']).startsWith('TP')).forEach(r => {
      timesheets.push({
        thang: fm.m,
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
        tongCong: Number(r['Tổng công tính lương'] || ((Number(r['Công thực tế (X)'] || 0)) + (Number(r['Nghỉ phép (P)'] || 0)))),
        tangCaThuong: Number(r['Tăng ca ngày thường (h)'] || 0),
        tangCaCN: Number(r['Tăng ca Chủ nhật (h)'] || 0),
        treSom: Number(r['Đi trễ / Về sớm (lần)'] || 0),
        ghiChu: String(r['Ghi chú'] || '').trim()
      });
    });
  }
});

// 6. Payrolls (07, 08, 09, 10)
const payrollFiles = [
  { file: '05_Bang_luong_2026_07.xlsx', m: '07/2026' },
  { file: '05_Bang_luong_2026_08.xlsx', m: '08/2026' },
  { file: '05_Bang_luong_2026_09.xlsx', m: '09/2026' },
  { file: '05_Bang_luong_2026_10.xlsx', m: '10/2026' }
];

const payrolls = [];
payrollFiles.forEach(pf => {
  if (fs.existsSync(pf.file)) {
    const wb = XLSX.readFile(pf.file, { cellFormula: true });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 3 });
    rows.filter(r => r['Mã NV'] && String(r['Mã NV']).startsWith('TP')).forEach(r => {
      const mucLuongHD = Number(r['Mức lương HĐ'] || 0);
      const ngayCong = Number(r['Ngày công'] || 0);
      const luongThoiGian = Number(r['Lương thời gian']) || (mucLuongHD > 0 && ngayCong > 0 ? Math.round((mucLuongHD / 26) * ngayCong) : 0);
      const phuCapTN = Number(r['Phụ cấp TN'] || 0);
      const phuCapAnTrua = Number(r['Phụ cấp ăn trưa'] || 0);
      const tienOT = Number(r['Tiền làm thêm OT'] || 0);
      const thuongHieuQua = Number(r['Thưởng hiệu quả'] || 0);
      const tongThuNhap = Number(r['Tổng thu nhập']) || (luongThoiGian + phuCapTN + phuCapAnTrua + tienOT + thuongHieuQua);
      const bhxh = Number(r['BHXH,YT,TN (10.5%)'] || 0);
      const thueTNCN = Number(r['Thuế TNCN'] || 0);
      const thucLinh = Number(r['Thực lĩnh']) || Math.max(0, tongThuNhap - bhxh - thueTNCN);
      payrolls.push({
        thang: pf.m,
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
      });
    });
  }
});

const output = `import { HRSystemData } from '../types/hrm';

export const initialHRData: HRSystemData = {
  departments: ${JSON.stringify(departments, null, 2)},
  employees: ${JSON.stringify(employees, null, 2)},
  contracts: ${JSON.stringify(contracts, null, 2)},
  timesheets: ${JSON.stringify(timesheets, null, 2)},
  payrolls: ${JSON.stringify(payrolls, null, 2)},
  leaves: ${JSON.stringify(leaves, null, 2)},
  leaveBalances: ${JSON.stringify(leaveBalances, null, 2)},
  parameters: ${JSON.stringify(parameters, null, 2)},
  lastUpdated: '2026-10-24 08:00',
  sourceFiles: [
    '00_Danh_muc_he_thong.xlsx',
    '01_Ho_so_nhan_vien.xlsx',
    '02_Hop_dong.xlsx',
    '03_Cham_cong_2026_07.xlsx',
    '03_Cham_cong_2026_08.xlsx',
    '03_Cham_cong_2026_09.xlsx',
    '03_Cham_cong_2026_10.xlsx',
    '04_Nghi_phep_2026.xlsx',
    '05_Bang_luong_2026_07.xlsx',
    '05_Bang_luong_2026_08.xlsx',
    '05_Bang_luong_2026_09.xlsx',
    '05_Bang_luong_2026_10.xlsx'
  ]
};
`;

if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/sampleData.ts', output, 'utf8');
console.log('Successfully generated src/data/sampleData.ts!');
console.log('Departments:', departments.length);
console.log('Employees:', employees.length);
console.log('Contracts:', contracts.length);
console.log('Timesheets:', timesheets.length);
console.log('Payrolls:', payrolls.length);
console.log('Leaves:', leaves.length);
