# Phiên bản và cách cố định thực nghiệm

- Repo nhóm: https://github.com/1liusang/spring-petclinic
- Mã nguồn ứng dụng ban đầu dùng cho bài: `500158f732419217507c7656904b8e6aa1bcc0d6`.
- Mốc đã tích hợp ba gói file: `04aaeb3dc10f82d2698bfd9655299e4d6be3835f`.
- Mã nguồn Java và cấu hình build ở mốc tích hợp giữ nguyên so với mốc ứng dụng. Các commit tiếp theo cho bài kiểm thử được ghi theo nội dung công việc thực tế, không sửa ngày commit.
- Mỗi lần chạy harness ghi commit checkout, trạng thái file đã theo dõi, thời điểm, Node.js, URL và commit ứng dụng do người chạy khai báo. Kết quả mới nằm trong thư mục theo run ID; không dùng lại HTML/JSON cũ để kết luận.

Trước khi tái lập một lần chạy, dùng **commit đầy đủ trong JSON kết quả** để checkout, không lấy `main` mới nhất theo mặc định:

```powershell
git clone https://github.com/1liusang/spring-petclinic.git
cd spring-petclinic
git checkout <commit-trong-json>
git status --short
```

Sau đó thực hiện [setup](setup.md). `PETCLINIC_APP_COMMIT` là khai báo của người chạy về checkout đã build ứng dụng; JSON lưu riêng trường này và commit của harness, không suy diễn rằng URL bất kỳ đang chạy đúng phiên bản. Thực nghiệm nhóm dùng ứng dụng từ chính checkout sạch trên cổng riêng và lưu log khởi động.

Nếu thay mã Java/schema/quy tắc nghiệp vụ, phải chốt commit mới, chạy lại test và cập nhật kết luận. Các bằng chứng tháng 10/2026 trong repo là dữ liệu lịch sử, không chứng minh các phiên bản mới đã đạt.

## Snapshot kiểm thử hiện hành

Commit đã chạy: `dc1ea45d8e5eedfbb3a3c9e7b7bcb7d1a38b567e`, run `mwymg1e7c11f2a`. [Kết quả](../reports/test-results.md) và [manifest](../reports/verification/evidence-manifest.json) chứa bằng chứng mới; source Java và build config không đổi so với mốc ứng dụng đã nêu trên.

Maven Wrapper hiện pin 3.9.16. Khi công bố bundle hash, giữ nguyên bytes của snapshot và chuẩn hóa PICT/TSV về LF theo `.gitattributes`; kiểm tra trên clone sạch để phát hiện khác biệt định dạng do Git.
