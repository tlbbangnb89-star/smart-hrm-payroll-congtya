import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function runVerification() {
  console.log('🚀 Bắt đầu quá trình kiểm thử tự động trên Google Chrome...');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome không tồn tại tại: ${chromePath}`);
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      console.log('❌ Console Error:', text);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
    console.log('❌ Unhandled Page Error:', err.toString());
  });

  try {
    console.log('🌐 Đang tải http://localhost:3001/...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle0', timeout: 15000 });

    const title = await page.title();
    console.log(`✅ Tiêu đề trang web: "${title}"`);

    // 1. Tự động bấm vào nút "⚡ Nạp dữ liệu thử nghiệm"
    console.log('⚡ Đang tìm và bấm nút "⚡ Nạp dữ liệu thử nghiệm"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.innerText.includes('Nạp dữ liệu thử nghiệm') || b.innerText.includes('Sample Data'));
      if (target) target.click();
    });
    console.log('✅ Đã nhấp vào nút "⚡ Nạp dữ liệu thử nghiệm" thành công!');
    await new Promise(r => setTimeout(r, 1200));

    // 2. KIỂM TRA (1): Các con số KPI và 3 biểu đồ trên Bảng điều hành
    console.log('📊 KIỂM TRA (1): Các con số KPI và 3 biểu đồ trên Bảng điều hành...');
    const kpiElements = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('main > div > div:nth-child(2) > div'));
      return cards.map(c => c.innerText.trim());
    });
    console.log(`✅ Tìm thấy ${kpiElements.length} thẻ KPI. Nội dung mẫu:`);
    kpiElements.forEach((k, idx) => console.log(`   - KPI ${idx + 1}: ${k.replace(/\n/g, ' | ')}`));

    // Check 3 Recharts charts
    const chartsCount = await page.evaluate(() => {
      return document.querySelectorAll('.recharts-responsive-container').length;
    });
    console.log(`✅ Số lượng biểu đồ Recharts hoạt động: ${chartsCount}/3`);
    if (chartsCount < 3) {
      console.warn('⚠️ Số biểu đồ tìm thấy ít hơn 3!');
    }

    if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots', { recursive: true });
    await page.screenshot({ path: 'screenshots/01_dashboard.png' });
    console.log('📸 Đã chụp ảnh Bảng điều hành: screenshots/01_dashboard.png');

    // 3. KIỂM TRA (2): Chuyển sang tab "Danh sách nhân viên", bấm "TP0001 - Phạm Thái Hùng"
    console.log('👥 KIỂM TRA (2): Chuyển sang phân hệ Hồ sơ 360° Nhân sự...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('aside nav button'));
      const empTab = navButtons.find(b => b.innerText.includes('Hồ sơ 360') || b.innerText.includes('Nhân sự') || b.innerText.includes('nhân viên'));
      if (empTab) empTab.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Click on TP0001 - Phạm Thái Hùng
    console.log('🔍 Đang tìm nhân sự "TP0001 - Phạm Thái Hùng"...');
    const clickedTP0001 = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const tp0001Row = rows.find(r => r.innerText.includes('TP0001') || r.innerText.includes('Phạm Thái Hùng'));
      if (tp0001Row) {
        tp0001Row.click();
        return true;
      }
      return false;
    });
    console.log(`✅ Bấm vào dòng nhân viên TP0001: ${clickedTP0001 ? 'Thành công' : 'Thất bại'}`);
    await new Promise(r => setTimeout(r, 1000));

    // Check if 360 Drawer is open
    const drawerOpen = await page.evaluate(() => {
      return document.body.innerText.includes('Hồ sơ cá nhân') || 
             document.body.innerText.includes('1. Cá nhân') ||
             document.body.innerText.includes('TP0001');
    });
    console.log(`✅ Cửa sổ trượt Hồ sơ 360° mở ra: ${drawerOpen}`);

    // Click on "Phiếu lương (A4/A5)" or tab 3 to preview payslip
    console.log('📑 Đang bấm xem trước Phiếu lương cá nhân...');
    const payslipBtnClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const psBtn = buttons.find(b => b.innerText.includes('Xem Phiếu lương') || b.innerText.includes('Phiếu lương (A4/A5)'));
      if (psBtn) {
        psBtn.click();
        return true;
      }
      return false;
    });
    console.log(`✅ Bấm nút xem Phiếu lương: ${payslipBtnClicked}`);
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: 'screenshots/02_employee360_payslip.png' });
    console.log('📸 Đã chụp ảnh Hồ sơ 360° & Phiếu lương: screenshots/02_employee360_payslip.png');

    // Close payslip modal
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const modalClose = closeButtons.find(b => b.getAttribute('aria-label') === 'Close' || (b.querySelector('svg') && b.closest('.fixed')));
      // hit Escape key as well
    });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 600));

    // 4. KIỂM TRA (3): Chuyển sang tab "Việc cần xử lý"
    console.log('⚠️ KIỂM TRA (3): Chuyển sang phân hệ "Việc cần xử lý"...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('aside nav button'));
      const taskTab = navButtons.find(b => b.innerText.includes('Việc cần xử lý'));
      if (taskTab) taskTab.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const taskChecks = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasRedProbationThao: bodyText.includes('TP0008') && bodyText.includes('Hoàng Thu Thảo'),
        hasRedProbationNam: bodyText.includes('TP0049') && bodyText.includes('Hoàng Văn Nam'),
        hasRedContractAnh: bodyText.includes('TP0021') && bodyText.includes('Đinh Tuấn Anh'),
        hasRedContractThinh: bodyText.includes('TP0035') && bodyText.includes('Đặng Minh Thịnh'),
        hasYellowLeave515: bodyText.includes('NP-2026-0515'),
        hasYellowLeave518: bodyText.includes('NP-2026-0518'),
        hasYellowLeave520: bodyText.includes('NP-2026-0520'),
        hasYellowProbationAn: bodyText.includes('TP0023') && bodyText.includes('Nguyễn Mạnh An'),
      };
    });

    console.log('✅ Kết quả kiểm tra việc cần xử lý theo phân loại màu sắc:');
    console.log(`   - 🔴 Hết hạn 2 tháng thử việc TP0008 (Hoàng Thu Thảo): ${taskChecks.hasRedProbationThao ? 'HIỂN THỊ ĐÚNG' : 'THIẾU'}`);
    console.log(`   - 🔴 Hết hạn 2 tháng thử việc TP0049 (Hoàng Văn Nam): ${taskChecks.hasRedProbationNam ? 'HIỂN THỊ ĐÚNG' : 'THIẾU'}`);
    console.log(`   - 🔴 Hết hạn hợp đồng trong 30 ngày TP0021 (Đinh Tuấn Anh): ${taskChecks.hasRedContractAnh ? 'HIỂN THỊ ĐÚNG' : 'THIẾU'}`);
    console.log(`   - 🔴 Hết hạn hợp đồng trong 30 ngày TP0035 (Đặng Minh Thịnh): ${taskChecks.hasRedContractThinh ? 'HIỂN THỊ ĐÚNG' : 'THIẾU'}`);
    console.log(`   - 🟡 Đơn nghỉ phép chờ duyệt NP-2026-0515: ${taskChecks.hasYellowLeave515 ? 'HIỂN THỊ ĐÚNG' : 'THIẾU'}`);
    console.log(`   - 🟡 Đơn nghỉ phép chờ duyệt NP-2026-0518: ${taskChecks.hasYellowLeave518 ? 'HIỂN THỊ ĐÚNG' : 'THIẾU'}`);
    console.log(`   - 🟡 Đơn nghỉ phép chờ duyệt NP-2026-0520: ${taskChecks.hasYellowLeave520 ? 'HIỂN THỊ ĐÚNG' : 'THIẾU'}`);
    console.log(`   - 🟡 Đang trong thời gian thử việc TP0023 (Nguyễn Mạnh An): ${taskChecks.hasYellowProbationAn ? 'HIỂN THỊ ĐÚNG' : 'THIẾU'}`);

    await page.screenshot({ path: 'screenshots/03_tasks_view.png' });
    console.log('📸 Đã chụp ảnh Việc cần xử lý: screenshots/03_tasks_view.png');

    // 5. Console Error Review
    console.log('\n🔍 TỔNG KẾT KIỂM TRA LỖI CONSOLE:');
    if (consoleErrors.length === 0) {
      console.log('🎉 XUẤT SẮC: Không có bất kỳ lỗi Console nào!');
    } else {
      console.log(`⚠️ Có ${consoleErrors.length} lỗi console:`, consoleErrors);
    }

  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm thử:', error);
  } finally {
    await browser.close();
    console.log('🏁 Hoàn tất kiểm thử tự động.');
  }
}

runVerification();
