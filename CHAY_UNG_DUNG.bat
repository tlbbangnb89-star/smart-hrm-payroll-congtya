@echo off
chcp 65001 > nul
echo ====================================================================
echo  HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
echo  Smart HRM & Payroll Dashboard (Quý 3/2026)
echo ====================================================================
echo.
echo Đang khởi động hệ thống...

set "NODEPATH=C:\Users\LENOVO P51\AppData\Local\Programs\nodejs"
if exist "%NODEPATH%\node.exe" (
    set "PATH=%NODEPATH%;%PATH%"
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [THÔNG BÁO] Không tìm thấy Node.js trong PATH, đang mở bản Standalone trực tiếp...
    start "" "index_standalone.html"
    exit /b 0
)

echo Đang mở trình duyệt tại: http://localhost:3000/ ...
start "" "http://localhost:3000/"

echo.
echo Đang chạy Web Server (Nhấn Ctrl+C để dừng)...
call npm run dev -- --host --port 3000

pause
