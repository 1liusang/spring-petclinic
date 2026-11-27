# Phân tích lỗi và hạn chế xác minh

## Kết quả sản phẩm

Không có ca HTTP trượt trong run `mwymg1e7c11f2a` trên commit `dc1ea45d8e5eedfbb3a3c9e7b7bcb7d1a38b567e`. Vì vậy không mở defect sản phẩm từ lần chạy này. Các ca nhập sai được ứng dụng từ chối đúng là **test đạt**, không phải defect.

Kết luận chỉ áp dụng cho 27 ca ở [test plan](../docs/test-plan.md), với 90/90 cặp lớp dữ liệu hợp lệ. Không tuyên bố ứng dụng không có lỗi ngoài phạm vi đó.

## Các vấn đề ở hồ sơ và harness đã khắc phục

| Vấn đề quan sát | Nguyên nhân | Khắc phục và cách kiểm tra |
|---|---|---|
| Demo luôn ghi commit cũ | Commit được viết cố định trong script | Đọc commit checkout và lưu riêng commit ứng dụng khai báo; đối chiếu Actuator trên clone sạch |
| Hướng dẫn chạy ở thư mục cha KTPM | Tài liệu được viết trước khi đưa script vào repo | Hướng dẫn hiện hành chạy tại gốc repo; bản clone sạch chạy lại thành công |
| Bằng chứng dễ bị nhầm giữa các lần chạy | Các đường dẫn đầu ra cố định bị ghi đè | Orchestrator tạo thư mục theo run ID, kiểm tra run/commit của script con |
| Request có thể chờ lâu khi server treo | Không có timeout rõ ràng | Dùng AbortSignal.timeout; test server không phản hồi xác nhận exit khác 0 |
| HTTP status chưa đủ để kết luận | Một form HTTP 200 có thể chứa lỗi khác | Kiểm tra đúng trường và trang sau thao tác; lưu expected/actual và HTML |

Những thay đổi này thuộc công cụ/tài liệu kiểm thử của nhóm. Không gán chúng thành lỗi Java của PetClinic. Test cố ý loại hàng TSV, dùng server 503 và sửa fixture là test âm tính của harness/verifier, không phải lỗi sản phẩm vừa phát hiện.

## Việc cần xác nhận thêm

- Hai test MySQL bị skipped và suite PostgreSQL không có test thực thi trong lần này. Chưa có bằng chứng DB ngoài đạt.
- Chưa chụp được PNG mới vì Computer Use không hỗ trợ kiểm soát URL cho cửa sổ Cốc Cốc hiện có. HTML và log mới đã lưu; ảnh cũ không thay thế bằng chứng ảnh mới.
- Chưa có xác nhận review và chạy lại từ tài khoản/máy của thành viên khác. Các author commit được đặt theo phân công và yêu cầu chủ repo; thông tin author tự nó không chứng minh đóng góp độc lập.
- File Word/PDF/PowerPoint cũ chưa được cập nhật và nghiệm thu thành hồ sơ cuối kỳ. Báo cáo Markdown hiện hành là nguồn số liệu mới.

Khi phát hiện ca trượt mới, ghi: commit, cấu hình/DB/locale, input, bước tái hiện, expected/actual, log/HTML, phân loại sản phẩm/harness/dữ liệu/môi trường và nguyên nhân đã xác minh. Không ghi nguyên nhân giả định thành kết luận.
