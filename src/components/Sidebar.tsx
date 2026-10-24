import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  CalendarDays,
  DollarSign,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'tasks'
  | 'employees'
  | 'contracts'
  | 'timesheets'
  | 'leaves'
  | 'payroll'
  | 'upload';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  urgentCount: number;
  totalEmployees: number;
  lastUpdated: string;
  sourceFilesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  urgentCount,
  totalEmployees,
  lastUpdated,
  sourceFilesCount
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Bảng điều hành',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'tasks',
      label: 'Việc cần xử lý',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: urgentCount,
      badgeColor: 'bg-red-500'
    },
    {
      id: 'employees',
      label: 'Hồ sơ 360° Nhân sự',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'contracts',
      label: 'Hợp đồng lao động',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'timesheets',
      label: 'Chấm công & Tăng ca',
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 'leaves',
      label: 'Nghỉ phép & Quỹ phép',
      icon: <CalendarDays className="w-5 h-5" />
    },
    {
      id: 'payroll',
      label: 'Bảng lương & Thuế',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: 'upload',
      label: 'Nhập thêm dữ liệu',
      icon: <UploadCloud className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-64 lg:w-72 flex-shrink-0 bg-[#0F291E] text-slate-100 flex flex-col justify-between border-r border-emerald-950/60 shadow-xl min-h-screen">
      {/* Top brand header */}
      <div>
        <div className="p-5 border-b border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-extrabold text-white text-xl shadow-lg ring-2 ring-amber-400/30">
              A
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-1.5">
                CÔNG TY A
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-[11px] text-emerald-300/80 font-medium">Smart HRM & Payroll</div>
            </div>
          </div>
        </div>

        {/* Quick status bar */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-xs">
          <div className="flex items-center justify-between text-emerald-200/90 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              Quy mô hệ thống:
            </span>
            <span className="text-amber-400 font-bold">{totalEmployees} nhân sự</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-400/80">
            <span>6 Phòng ban</span>
            <span>{sourceFilesCount} file Excel liên kết</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-400/70 tracking-wider uppercase">
            Phân hệ Quản trị
          </div>

          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-800/80 text-white shadow-md border-l-4 border-amber-500 pl-2.5'
                    : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive ? 'text-amber-400 scale-110' : 'text-emerald-300/70 group-hover:text-emerald-200'
                    } transition-transform`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                        item.badgeColor || 'bg-amber-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-amber-400 animate-pulse" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/40 text-[11px] text-emerald-300/70">
        <div className="flex items-center gap-2 mb-1 text-emerald-200 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Hệ thống bảo mật cục bộ</span>
        </div>
        <p className="text-[10px] text-emerald-400/60 leading-tight">
          Cập nhật: {lastUpdated || '24/10/2026'} | Bản quyền Công ty A © 2026
        </p>
      </div>
    </aside>
  );
};
