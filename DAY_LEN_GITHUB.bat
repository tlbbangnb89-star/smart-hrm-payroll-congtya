@echo off
chcp 65001 > nul
echo ====================================================================
echo  ĐẨY DỰ ÁN LÊN GITHUB - CÔNG TY A (SMART HRM & PAYROLL DASHBOARD)
echo ====================================================================
echo.

set "GITPATH=C:\Users\LENOVO P51\AppData\Local\Programs\git\cmd"
set "GHPATH=C:\Users\LENOVO P51\AppData\Local\Programs\gh\bin"
set "PATH=%GITPATH%;%GHPATH%;%PATH%"

cd /d "%~dp0"

echo [1/3] Kiểm tra đăng nhập GitHub...
gh auth status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Bạn chưa đăng nhập GitHub. Trình duyệt sẽ mở để bạn xác thực tài khoản...
    gh auth login --hostname github.com --git-protocol https --web
)

echo.
echo [2/3] Tạo kho lưu trữ (Repository) và đẩy mã nguồn lên GitHub...
set /p REPO_NAME="Nhập tên Repository muốn tạo trên GitHub (Nhấn Enter để dùng mặc định: smart-hrm-payroll-congtya): "
if "%REPO_NAME%"=="" set REPO_NAME=smart-hrm-payroll-congtya

gh repo create %REPO_NAME% --public --source=. --remote=origin --push
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================================
    echo  🎉 ĐÃ ĐẨY TOÀN BỘ MÃ NGUỒN WEB APP LÊN GITHUB THÀNH CÔNG!
    echo ====================================================================
    gh repo view --web
) else (
    echo.
    echo Nếu bạn đã có sẵn link Repository, hãy nhập URL bên dưới (VD: https://github.com/username/repo.git):
    set /p REMOTE_URL="GitHub Repo URL: "
    if not "%REMOTE_URL%"=="" (
        git remote remove origin >nul 2>nul
        git remote add origin %REMOTE_URL%
        git branch -M main
        git push -u origin main
    )
)

pause
