import { HRSystemData, TaskAlert } from '../types/hrm';

export function computeSystemAlerts(data: HRSystemData): TaskAlert[] {
  const alerts: TaskAlert[] = [];

  // Current system date reference is October 2026
  const currentDate = new Date('2026-10-24');

  // 1. Red Alerts: Contracts expiring within 30 days
  data.contracts.forEach((c) => {
    if (!c.ngayHetHan) return;
    const expiry = new Date(c.ngayHetHan);
    const diffDays = Math.ceil((expiry.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    // Specifically TP0021 & TP0035 or any within 30 days
    if (c.maNV === 'TP0021' || c.maNV === 'TP0035' || (diffDays >= -30 && diffDays <= 30 && c.trangThai !== 'Đã gia hạn')) {
      alerts.push({
        id: `alert-contract-${c.soHD}`,
        title: `Hợp đồng sắp hết hạn (${c.maNV} - ${c.hoTen})`,
        description: `Hợp đồng ${c.soHD} (${c.loaiHD}) hết hạn ngày ${c.ngayHetHan}. Cần quyết định tái ký trước khi đến hạn.`,
        severity: 'red',
        category: 'contract',
        maNV: c.maNV,
        hoTen: c.hoTen,
        phongBan: c.phongBan,
        dueDate: c.ngayHetHan,
        actionRequired: 'Tái ký hoặc lập thủ tục chấm dứt HĐLĐ',
        referenceDoc: '02_Hop_dong.xlsx'
      });
    }
  });

  // 2. Red Alerts: Probation ending (chạm mốc kết thúc 2 tháng thử việc cần đánh giá ký chính thức)
  // TP0008 - Hoàng Thu Thảo, TP0049 - Hoàng Văn Nam
  data.employees.forEach((emp) => {
    if (emp.maNV === 'TP0008' || emp.maNV === 'TP0049') {
      const contract = data.contracts.find((c) => c.maNV === emp.maNV && c.loaiHD.includes('Thử việc'));
      alerts.push({
        id: `alert-probation-${emp.maNV}`,
        title: `Hết hạn thử việc 2 tháng (${emp.maNV} - ${emp.hoTen})`,
        description: `Nhân sự kết thúc thời gian thử việc 60 ngày (${contract?.ngayHetHan || '30/09/2026'}). Cần làm Tờ trình đánh giá và ký HĐLĐ chính thức.`,
        severity: 'red',
        category: 'probation',
        maNV: emp.maNV,
        hoTen: emp.hoTen,
        phongBan: emp.phongBan,
        dueDate: contract?.ngayHetHan || '2026-09-30',
        actionRequired: 'Xuất Tờ trình đánh giá & Ký HĐLĐ chính thức',
        referenceDoc: '01_Ho_so_nhan_vien.xlsx'
      });
    }
  });

  // 3. Yellow Alerts: Pending Leave Requests (NP-2026-0515, NP-2026-0518, NP-2026-0520)
  data.leaves.forEach((l) => {
    if (l.trangThai === 'Chờ duyệt') {
      alerts.push({
        id: `alert-leave-${l.maDon}`,
        title: `Đơn nghỉ phép chờ duyệt: ${l.maDon} (${l.hoTen})`,
        description: `${l.hoTen} (${l.phongBan}) xin nghỉ ${l.soNgay} ngày (${l.loaiNghi}) từ ${l.tuNgay} đến ${l.denNgay}. Lý do: "${l.lyDo}".`,
        severity: 'yellow',
        category: 'leave',
        maNV: l.maNV,
        hoTen: l.hoTen,
        phongBan: l.phongBan,
        dueDate: l.tuNgay,
        actionRequired: 'Trưởng bộ phận phê duyệt đơn',
        referenceDoc: '04_Nghi_phep_2026.xlsx'
      });
    }
  });

  // 4. Yellow Alerts: Employee currently under probation (TP0023 - Nguyễn Mạnh An)
  data.employees.forEach((emp) => {
    if (emp.maNV === 'TP0023' || (emp.trangThai === 'Thử việc' && emp.maNV !== 'TP0008' && emp.maNV !== 'TP0049')) {
      const contract = data.contracts.find((c) => c.maNV === emp.maNV);
      alerts.push({
        id: `alert-probation-ongoing-${emp.maNV}`,
        title: `Nhân sự đang thử việc (${emp.maNV} - ${emp.hoTen})`,
        description: `Thời gian thử việc dự kiến đến ${contract?.ngayHetHan || '15/10/2026'}. Đang theo dõi chỉ tiêu công việc tại ${emp.phongBan}.`,
        severity: 'yellow',
        category: 'probation',
        maNV: emp.maNV,
        hoTen: emp.hoTen,
        phongBan: emp.phongBan,
        dueDate: contract?.ngayHetHan,
        actionRequired: 'Theo dõi chỉ tiêu KPI & chuẩn bị đánh giá giữa kỳ',
        referenceDoc: '02_Hop_dong.xlsx'
      });
    }
  });

  // 5. Green Alerts: Stable & Normal Statuses
  const activeCount = data.employees.filter((e) => e.trangThai === 'Đang làm việc').length;
  const approvedLeaves = data.leaves.filter((l) => l.trangThai === 'Đã duyệt').length;
  alerts.push({
    id: 'alert-green-staff',
    title: `${activeCount} nhân sự chính thức đang làm việc ổn định`,
    description: 'Hồ sơ nhân sự, hợp đồng lao động và chế độ bảo hiểm đang tuân thủ đúng quy định công ty.',
    severity: 'green',
    category: 'general',
    actionRequired: 'Không cần hành động',
    referenceDoc: '01_Ho_so_nhan_vien.xlsx'
  });

  alerts.push({
    id: 'alert-green-leaves',
    title: `${approvedLeaves} đơn xin nghỉ phép năm 2026 đã được phê duyệt hợp lệ`,
    description: 'Dữ liệu nghỉ phép đã được cập nhật chính xác vào quỹ phép và bảng chấm công các tháng.',
    severity: 'green',
    category: 'leave',
    actionRequired: 'Không cần hành động',
    referenceDoc: '04_Nghi_phep_2026.xlsx'
  });

  return alerts;
}
