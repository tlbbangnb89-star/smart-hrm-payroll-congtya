import fs from 'fs';
import path from 'path';

function buildStandalone() {
  const distDir = path.resolve('dist');
  const assetsDir = path.join(distDir, 'assets');

  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find(f => f.endsWith('.js'));
  const cssFile = files.find(f => f.endsWith('.css'));

  if (!jsFile || !cssFile) {
    throw new Error('Chưa build dự án, thiếu file js hoặc css trong dist/assets!');
  }

  const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

  const html = `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230F291E'><circle cx='12' cy='12' r='10' fill='%23D97706'/><text x='12' y='16' font-size='11' font-weight='bold' fill='white' text-anchor='middle'>A</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A</title>
    <meta name="description" content="Hệ thống Quản trị Nhân sự & Tiền lương Thông minh - Smart HRM & Payroll Dashboard dành cho Ban Giám đốc và Phòng Hành chính - Nhân sự Công ty A." />
    <!-- Google Fonts: Plus Jakarta Sans & Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
${cssContent}
    </style>
  </head>
  <body class="bg-[#F8FAFC] text-slate-800 antialiased selection:bg-amber-100 selection:text-amber-900 transition-colors duration-200">
    <div id="root"></div>
    <script type="module">
${jsContent}
    </script>
  </body>
</html>`;

  fs.writeFileSync('index_standalone.html', html, 'utf8');
  fs.writeFileSync(path.join(distDir, 'index_standalone.html'), html, 'utf8');

  // Inject redirect into dist/index.html as well for offline double-click
  const distIndex = path.join(distDir, 'index.html');
  if (fs.existsSync(distIndex)) {
    let distHtml = fs.readFileSync(distIndex, 'utf8');
    if (!distHtml.includes('index_standalone.html')) {
      distHtml = distHtml.replace('<head>', '<head>\n    <script>\n      if (window.location.protocol === "file:") window.location.replace("./index_standalone.html");\n    </script>');
      fs.writeFileSync(distIndex, distHtml, 'utf8');
    }
  }

  console.log('✅ Đã tạo thành công index_standalone.html (mở trực tiếp không cần server)!');
}

buildStandalone();
