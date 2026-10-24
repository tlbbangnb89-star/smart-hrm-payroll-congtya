# HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
### Smart HRM & Payroll Dashboard dành cho Ban Giám đốc & Phòng Hành chính - Nhân sự

Ứng dụng web toàn diện giải quyết triệt để bài toán quản trị nhân sự rời rạc trên 10 file Excel, tự động hóa đối soát dữ liệu 360°, phát hiện và cảnh báo sớm các rủi ro pháp lý lao động (hết hạn hợp đồng, kết thúc thử việc, đơn nghỉ chờ duyệt) và tích hợp Trợ lý AI Tham mưu Nhân sự & Phân tích Quỹ lương kết nối Google Gemini API.

---

## 🌟 TÍNH NĂNG NỔI BẬT THEO 6 YẾU TỐ CHUẨN MỰC

### 1. Giao diện Bento Grid & Chuyển động Tinh tế
- **Phong cách Bento Grid**: Bố cục trực quan, phân khu thông minh chuẩn văn phòng giám đốc và phòng họp điều hành.
- **Bảng màu Doanh nghiệp cao cấp**: Sidebar Xanh Rừng Sâu (`#0F291E`), nền Trắng Sứ (`#F8FAFC`), điểm nhấn Vàng Đồng (`#D97706`).
- **Chế độ Sáng/Tối (Light/Dark Mode)**: Chuyển đổi mượt mà bằng nút bấm ngay trên Header.
- **4 Hiệu ứng Chuyển động (Animations)**:
  - *Fade-in Up*: Trượt nhẹ từ dưới lên khi chuyển tab và mở màn hình.
  - *Count-up Numbers*: Con số KPI (Tổng nhân sự, Quỹ lương, Số việc cần xử lý) nhảy tự động từ 0 lên giá trị thực.
  - *Hover Scale & Subtle Glow 3D*: Nổi nhẹ kèm viền sáng khi di chuột vào thẻ KPI và nút bấm.
  - *Skeleton Shimmer*: Khung xương quét dữ liệu khi AI đang phân tích.
- **3 Biểu đồ Recharts Tương tác**:
  1. *Horizontal Bar Chart*: Nhân sự thực tế vs Định biên của 6 phòng ban.
  2. *Composed Bar & Line Chart*: Biến động Tổng thu nhập và Thực lĩnh qua các tháng (T07, T08, T09, T10/2026).
  3. *Donut Chart*: Cơ cấu tỷ trọng quỹ lương theo 6 phòng ban.

### 2. Dữ liệu Thử nghiệm Nhanh & Nhập liệu Đa chiều
- Nút bấm nhịp thở **`⚡ Nạp dữ liệu thử nghiệm (Load Sample Data)`**: Nạp ngay 50 nhân sự (`TP0001` đến `TP0050`), 6 phòng ban, 50 hợp đồng, 200 bản ghi chấm công và bảng lương Quý 3/2026 chỉ với 1 click.
- **Bộ lọc đa chiều**: Lọc theo 6 phòng ban, 4 kỳ tháng (07, 08, 09, 10/2026), lọc trạng thái và tìm kiếm nhanh theo Mã NV, Họ tên, CCCD.
- **Hỏi đáp AI bằng Giọng nói (Web Speech API)**: Nhận dạng giọng nói tiếng Việt trực tiếp để tra cứu và phân tích số liệu.

### 3. Quy tắc Nghiệp vụ & Đọc File Excel Thông minh
- **Nhận diện tự động Header tại Dòng 4**, dữ liệu từ **Dòng 5 đến Dòng 54**, tự động **loại bỏ Dòng 55 (TỔNG CỘNG)** để tránh nhân đôi số liệu.
- **Quy tắc phân loại cảnh báo 3 cấp độ (Đỏ - Vàng - Xanh)**:
  - 🔴 **Màu Đỏ (Khẩn cấp)**: Hợp đồng lao động sắp hết hạn trong 30 ngày (`TP0021 - Đinh Tuấn Anh`, `TP0035 - Đặng Minh Thịnh`) và nhân sự chạm mốc hết 2 tháng thử việc cần đánh giá ký chính thức (`TP0008 - Hoàng Thu Thảo`, `TP0049 - Hoàng Văn Nam`).
  - 🟡 **Màu Vàng (Chờ xử lý)**: Đơn xin nghỉ phép chờ duyệt (`NP-2026-0515`, `NP-2026-0518`, `NP-2026-0520`) và nhân sự đang thử việc (`TP0023 - Nguyễn Mạnh An`).
  - 🟢 **Màu Xanh (Ổn định)**: Nhân sự chính thức, hợp đồng còn hiệu lực, đơn nghỉ phép đã duyệt.
- **Đối soát liên kết 360°**: Dùng `Mã NV` làm khóa chính liên kết 5 chiều: Hồ sơ cá nhân + Hợp đồng + Chấm công OT + Quỹ phép năm + Chi tiết lương/Thuế TNCN/BHXH (10.5%).

### 4. Trợ lý AI Tham mưu Nhân sự & Fallback Thông minh
- Tích hợp mô hình chính `gemini-3-flash`.
- Cơ chế Fallback tự động khi gặp mã lỗi 429 hoặc quá tải: chuyển sang `gemini-3.1-flash-lite`, `gemini-2.0-flash` kèm Exponential Backoff.
- Trả về đúng 3 trọng tâm Markdown ngắn gọn:
  1. 3 nhận xét biến động quỹ lương đáng chú ý nhất.
  2. Danh sách nhân sự tăng ca (OT) cao bất thường.
  3. Đề xuất hành động cho Trưởng phòng HCNS.

### 5. Kết nối & Xuất bản Thực tế
- **Xem trước Phiếu lương (Payslip A4/A5 Preview)**: Bóc tách rõ Thu nhập, Phụ cấp, Tiền OT, Trừ BHXH 10.5%, Thuế TNCN và Thực lĩnh.
- **Xuất file Word (.doc)**: Xuất Phiếu lương hoặc Tờ trình đánh giá thử việc.
- **In / Lưu PDF**: Trình bày chuẩn A4 sẵn sàng ký duyệt.
- **Xuất Excel (.xlsx)**: Xuất toàn bộ bảng lương, chấm công hoặc hồ sơ nhân sự đã lọc.
- **Google Calendar**: Tạo lịch hẹn nhắc tái ký HĐLĐ mở thẳng Google Calendar.
- **Gmail Draft**: Mở cửa sổ soạn thư Gmail điền sẵn địa chỉ `@congtya.vn`, tiêu đề và nội dung tóm tắt lương tháng.
- **Clipboard**: Sao chép nhanh tóm tắt báo cáo điều hành.

### 6. Bảo mật & Triển khai
- Cài đặt API Key lưu an toàn tại `localStorage` hoặc đọc từ `VITE_GEMINI_API_KEY`.
- Không hardcode API Key hay thông tin nhạy cảm.
- Đã cấu hình `.gitignore` đầy đủ sẵn sàng đẩy lên GitHub và Vercel.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển (Dev Server)
npm run dev

# 3. Đóng gói cho môi trường Production (Build)
npm run build
```

Mở trình duyệt tại: **`http://localhost:3000`** hoặc **`http://localhost:3001`**.
Bấm nút **`⚡ Nạp dữ liệu thử nghiệm`** ở thanh Header để trải nghiệm toàn bộ hệ thống ngay lập tức!
