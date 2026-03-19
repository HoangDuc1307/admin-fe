# admin-fe (Angular)

Giao diện quản trị (Admin Dashboard) cho hệ thống Thương mại điện tử Marketplace.

## Yêu cầu hệ thống

- **Node.js**: Phiên bản 18 trở lên.
- **npm**: Đi kèm với Node.js.

## Hướng dẫn Cài đặt & Chạy

1. Di chuyển vào thư mục `frontend/`:
   ```bash
   cd frontend
   ```

2. Cài đặt các thư viện (Node Modules):
   ```bash
   npm install
   ```

3. Khởi chạy ứng dụng ở chế độ phát triển:
   ```bash
   npm start
   ```
   Ứng dụng sẽ khả dụng tại địa chỉ: `http://localhost:4200/`.

## Các chức năng dành cho Admin

- **Quản lý bài đăng**: Duyệt các bài rao bán mới từ người dùng.
- **Quản lý người dùng**: Xem thông tin chi tiết và khóa các tài khoản vi phạm.
- **Quản lý báo cáo**: Xem bằng chứng đính kèm (hình ảnh) và xử lý báo cáo.
- **Hệ thống thông báo**: Chuông báo tự động cập nhật mỗi 30 giây khi có việc cần xử lý.
- **Bảng điều khiển (Dashboard)**: Theo dõi doanh thu, số lượng bài đăng và giao dịch qua biểu đồ sinh động.

## Kết nối Backend

Mặc định Frontend sẽ kết nối với Backend tại `http://127.0.0.1:8000/api/admin/`. Đảm bảo Backend đã được chạy để dữ liệu có thể hiển thị.

---
**Chúc bạn có một buổi trình bày đồ án thành công!**
