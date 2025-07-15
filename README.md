CyberHud Web Tool
Giới thiệu
Đây là một công cụ dựa trên web để cấu hình và cập nhật firmware cho thiết bị CyberHud. Giao diện web cho phép người dùng kết nối với CyberHud qua Bluetooth, tùy chỉnh các cài đặt khác nhau và flash firmware mới một cách dễ dàng.

Tính năng
Cấu hình qua Web Bluetooth: Kết nối với CyberHud không dây để thay đổi cài đặt.

Tùy chỉnh hiển thị:

Xoay màn hình.

Điều chỉnh độ sáng màn hình và đèn LED cảnh báo.

Cảnh báo & Âm thanh:

Đặt độ trễ cho cảnh báo tốc độ.

Bật/tắt tiếng bíp khi biển báo thay đổi.

Màn hình khởi động:

Tải lên ảnh khởi động tùy chỉnh (JPEG, 320x240).

Cài đặt thời gian hiển thị.

Nạp Firmware (Flashing): Giao diện web để flash firmware mới cho HUD.

Mô tả các tệp
index.html: Trang chính để tùy biến và cấu hình các cài đặt của CyberHud.

app.js: Chứa logic JavaScript cho index.html, xử lý kết nối Web Bluetooth, gửi cấu hình và truyền tệp.

style.css: Tệp CSS để tạo kiểu cho index.html.

flash.html: Trang để nạp firmware cho CyberHud, với các tùy chọn cho các phiên bản khác nhau (đèn xanh dương hoặc xanh lá).


manifest_*.json: Các tệp kê khai cho công cụ ESP Web Tools, chỉ định các tệp nhị phân firmware sẽ được nạp.

Hướng dẫn sử dụng
Nạp Firmware
Cắm CyberHud vào máy tính qua cổng USB.

Mở tệp flash.html (cho CyberHud).

Nếu sử dụng flash.html, chọn màu đèn LED nhấp nháy trên thiết bị của bạn (xanh dương hoặc xanh lá).

Nhấp vào nút "Install" và chọn cổng COM tương ứng với thiết bị của bạn từ cửa sổ bật lên.

Chờ quá trình nạp hoàn tất.

Cấu hình CyberHud
Đảm bảo CyberHud của bạn đã được bật và không kết nối với thiết bị nào khác.

Mở index.html trong trình duyệt web hỗ trợ Web Bluetooth (ví dụ: Google Chrome trên máy tính).

Nhấp vào nút "Kết nối với CyberHud".

Chọn thiết bị "VIETMAP_HUD" từ danh sách.

Sau khi kết nối, trang web sẽ tự động tải cấu hình hiện tại từ HUD.

Thay đổi các cài đặt theo ý muốn.

Nhấp vào nút "Gửi Cấu hình tới HUD" để lưu các thay đổi của bạn.
