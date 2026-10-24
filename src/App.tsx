import React, { useState, useEffect } from 'react';
import { initialHRData } from './data/sampleData';
import { HRSystemData, Employee, Payroll } from './types/hrm';
import { computeSystemAlerts } from './utils/alertRules';
import { getStoredApiKey, generateLocalHRAnalysis, analyzeWithGemini } from './utils/geminiAi';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { EmployeesView } from './components/EmployeesView';
import { ContractsView } from './components/ContractsView';
import { TimesheetsView } from './components/TimesheetsView';
import { LeavesView } from './components/LeavesView';
import { PayrollView } from './components/PayrollView';
import { DataUploadView } from './components/DataUploadView';
import { Employee360Drawer } from './components/Employee360Drawer';
import { PayslipModal } from './components/PayslipModal';
import { EvaluationModal } from './components/EvaluationModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AiAssistantModal } from './components/AiAssistantModal';

export const App: React.FC = () => {
  // Main Data State
  const [data, setData] = useState<HRSystemData>(initialHRData);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentPeriod, setCurrentPeriod] = useState<string>('09/2026');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modals & Drawers
  const [selectedEmpId360, setSelectedEmpId360] = useState<string | null>(null);
  const [payslipData, setPayslipData] = useState<{ emp: Employee; pay: Payroll } | null>(null);
  const [evaluationEmpId, setEvaluationEmpId] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => Boolean(getStoredApiKey()));

  // AI Summary State for Dashboard
  const [aiSummary, setAiSummary] = useState<string>(() => generateLocalHRAnalysis(initialHRData, '09/2026'));
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Available Periods & Departments
  const availablePeriods = ['07/2026', '08/2026', '09/2026', '10/2026'];
  const departmentNames = data.departments.map((d) => d.name);

  // Compute Alerts dynamically based on current data
  const alerts = computeSystemAlerts(data);
  const urgentCount = alerts.filter((a) => a.severity === 'red' || a.severity === 'yellow').length;

  // Sync Dark Mode with DOM
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Refresh AI analysis on period change or manual request
  const fetchAiAnalysis = async (period: string = currentPeriod) => {
    setIsAiLoading(true);
    try {
      const res = await analyzeWithGemini(
        `Phân tích tổng quan quỹ lương kỳ ${period} và các rủi ro nhân sự cần xử lý gấp.`,
        data,
        period
      );
      setAiSummary(res.markdown);
    } catch (e) {
      setAiSummary(generateLocalHRAnalysis(data, period));
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiAnalysis(currentPeriod);
  }, [currentPeriod]);

  // Load sample data button
  const handleLoadSampleData = () => {
    setData({
      ...initialHRData,
      lastUpdated: new Date().toLocaleString('vi-VN')
    });
    fetchAiAnalysis(currentPeriod);
    showToast('⚡ Đã nạp thành công bộ dữ liệu chuẩn Công ty A (50 nhân sự TP0001-TP0050, 6 phòng ban, Quý 3/2026)!');
  };

  // Actions for tasks & approvals
  const handleApproveLeave = (maDon: string) => {
    setData((prev) => ({
      ...prev,
      leaves: prev.leaves.map((l) => (l.maDon === maDon ? { ...l, trangThai: 'Đã duyệt' } : l))
    }));
    showToast(`✅ Đã phê duyệt đơn nghỉ phép ${maDon}!`);
  };

  const handleRejectLeave = (maDon: string) => {
    setData((prev) => ({
      ...prev,
      leaves: prev.leaves.map((l) => (l.maDon === maDon ? { ...l, trangThai: 'Từ chối' } : l))
    }));
    showToast(`Đã từ chối đơn nghỉ phép ${maDon}.`);
  };

  const handleSignProbation = (maNV: string) => {
    setData((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.maNV === maNV ? { ...e, trangThai: 'Đang làm việc' } : e)),
      contracts: prev.contracts.map((c) =>
        c.maNV === maNV
          ? {
              ...c,
              loaiHD: 'HĐLĐ xác định thời hạn (01 năm)',
              trangThai: 'Đang hiệu lực',
              ngayHieuLuc: '2026-10-01',
              ngayHetHan: '2027-10-01',
              mucLuongBH: Math.round(c.mucLuongBH / 0.85)
            }
          : c
      )
    }));
    showToast(`🎉 Đã ký Hợp đồng lao động chính thức cho nhân sự ${maNV}!`);
  };

  const handleRenewContract = (maNV: string) => {
    setData((prev) => ({
      ...prev,
      contracts: prev.contracts.map((c) =>
        c.maNV === maNV
          ? {
              ...c,
              trangThai: 'Đang hiệu lực',
              loaiHD: 'HĐLĐ không xác định thời hạn',
              ngayHetHan: ''
            }
          : c
      )
    }));
    showToast(`✅ Đã gia hạn thành công Hợp đồng lao động cho nhân sự ${maNV}!`);
  };

  // Find selected employee for 360 Drawer
  const selectedEmp360 = selectedEmpId360
    ? data.employees.find((e) => e.maNV === selectedEmpId360) || null
    : null;
  const selectedContract360 = selectedEmpId360
    ? data.contracts.find((c) => c.maNV === selectedEmpId360)
    : undefined;
  const selectedTimesheets360 = selectedEmpId360
    ? data.timesheets.filter((t) => t.maNV === selectedEmpId360)
    : [];
  const selectedPayrolls360 = selectedEmpId360
    ? data.payrolls.filter((p) => p.maNV === selectedEmpId360)
    : [];
  const selectedLeaves360 = selectedEmpId360
    ? data.leaves.filter((l) => l.maNV === selectedEmpId360)
    : [];
  const selectedLeaveBalance360 = selectedEmpId360
    ? data.leaveBalances.find((b) => b.maNV === selectedEmpId360)
    : undefined;

  // Selected Employee for Evaluation
  const evalEmployee = evaluationEmpId
    ? data.employees.find((e) => e.maNV === evaluationEmpId) || null
    : null;
  const evalContract = evaluationEmpId
    ? data.contracts.find((c) => c.maNV === evaluationEmpId)
    : undefined;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        urgentCount={urgentCount}
        totalEmployees={data.employees.length}
        lastUpdated={data.lastUpdated}
        sourceFilesCount={data.sourceFiles.length}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Global Header */}
        <Header
          currentPeriod={currentPeriod}
          onPeriodChange={setCurrentPeriod}
          availablePeriods={availablePeriods}
          selectedDept={selectedDept}
          onDeptChange={setSelectedDept}
          departments={departmentNames}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLoadSampleData={handleLoadSampleData}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          hasApiKey={hasApiKey}
          isDark={isDark}
          onToggleDark={() => setIsDark((prev) => !prev)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        />

        {/* View Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              data={data}
              period={currentPeriod}
              deptFilter={selectedDept}
              alerts={alerts}
              onNavigateToTab={setActiveTab}
              onOpenEmployee360={setSelectedEmpId360}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              aiSummary={aiSummary}
              isAiLoading={isAiLoading}
              onRefreshAi={() => fetchAiAnalysis(currentPeriod)}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              data={data}
              alerts={alerts}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
              onSignProbation={handleSignProbation}
              onRenewContract={handleRenewContract}
              onOpenEmployee360={setSelectedEmpId360}
              onOpenEvaluationModal={setEvaluationEmpId}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={data.employees}
              departments={departmentNames}
              selectedDept={selectedDept}
              onDeptChange={setSelectedDept}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenEmployee360={setSelectedEmpId360}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsView
              contracts={data.contracts}
              onOpenEmployee360={setSelectedEmpId360}
              onRenewContract={handleRenewContract}
            />
          )}

          {activeTab === 'timesheets' && (
            <TimesheetsView
              timesheets={data.timesheets}
              currentPeriod={currentPeriod}
              onPeriodChange={setCurrentPeriod}
              availablePeriods={availablePeriods}
              selectedDept={selectedDept}
              onDeptChange={setSelectedDept}
              departments={departmentNames}
              onOpenEmployee360={setSelectedEmpId360}
            />
          )}

          {activeTab === 'leaves' && (
            <LeavesView
              leaves={data.leaves}
              leaveBalances={data.leaveBalances}
              employees={data.employees}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
              onOpenEmployee360={setSelectedEmpId360}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              payrolls={data.payrolls}
              employees={data.employees}
              currentPeriod={currentPeriod}
              onPeriodChange={setCurrentPeriod}
              availablePeriods={availablePeriods}
              selectedDept={selectedDept}
              onDeptChange={setSelectedDept}
              departments={departmentNames}
              onOpenPayslip={(emp, pay) => setPayslipData({ emp, pay })}
              onOpenEmployee360={setSelectedEmpId360}
            />
          )}

          {activeTab === 'upload' && (
            <DataUploadView
              data={data}
              onDataUpdated={setData}
              onLoadSampleData={handleLoadSampleData}
            />
          )}
        </main>
      </div>

      {/* 3. Slide-over Drawer: Employee 360 */}
      <Employee360Drawer
        isOpen={Boolean(selectedEmpId360)}
        onClose={() => setSelectedEmpId360(null)}
        employee={selectedEmp360}
        contract={selectedContract360}
        timesheets={selectedTimesheets360}
        payrolls={selectedPayrolls360}
        leaves={selectedLeaves360}
        leaveBalance={selectedLeaveBalance360}
        currentPeriod={currentPeriod}
        onOpenPayslip={(emp, pay) => setPayslipData({ emp, pay })}
        onOpenEvaluationModal={setEvaluationEmpId}
      />

      {/* 4. Payslip Preview Modal (A4/A5) */}
      <PayslipModal
        isOpen={Boolean(payslipData)}
        onClose={() => setPayslipData(null)}
        employee={payslipData?.emp || null}
        payroll={payslipData?.pay || null}
      />

      {/* 5. Probation Evaluation Modal */}
      <EvaluationModal
        isOpen={Boolean(evaluationEmpId)}
        onClose={() => setEvaluationEmpId(null)}
        employee={evalEmployee}
        contract={evalContract}
        onConfirmOfficialContract={handleSignProbation}
      />

      {/* 6. API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(k) => setHasApiKey(Boolean(k))}
      />

      {/* 7. AI Assistant Chat & Voice Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        data={data}
        currentPeriod={currentPeriod}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
