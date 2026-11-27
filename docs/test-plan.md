# Kế hoạch và thiết kế kiểm thử R01/K06

## Mục tiêu, phạm vi và điều kiện

Phát hiện lỗi nhập/lưu dữ liệu form tạo chủ nuôi khi kết hợp các lớp hợp lệ, kiểm tra validation ở biên và xác nhận ba luồng liên hoàn. Ngoài phạm vi: đăng nhập/phân quyền, kiểm thử tải, bảo mật, DB MySQL/PostgreSQL và chức năng lịch hẹn/bệnh án chưa có trong commit đã pin.

Điều kiện: checkout ứng dụng được chốt, H2 seed mới, tiếng Anh mặc định, Java và Node cùng ngày địa phương, port/URL trỏ đúng instance. Dữ liệu test tạo mới theo run ID. Các trường chủ nuôi không có constraint liên trường ở mô hình hiện tại.

## Ánh xạ lớp dữ liệu

| Trường | Mức 1 | Mức 2 | Mức 3 | Căn cứ |
|---|---|---|---|---|
| firstName | `short`: An | `unicode`: Ánh | `max30`: A × 30 | Person: NotBlank, Size ≤30 |
| lastName | `short`: Test + tag | `unicode`: Đức + tag | `max30`: L + X + tag, đủ 30 | Person: NotBlank, Size ≤30 |
| address | `short`: 12 Tran Phu | `unicode`: 12 Đường Trần Phú | `max255`: A × 255 | Owner: NotBlank, Size ≤255 |
| city | `short`: Da Lat | `unicode`: Đà Lạt | `max80`: C × 80 | Owner: NotBlank, Size ≤80 |
| telephone | `digitsA`: 0123456789 | `digitsB`: 0987654321 | `digitsC`: 5551234567 | Owner: NotBlank, Pattern 10 chữ số |

Tag gồm run ID và chỉ số ca; dữ liệu thực thi từng ca được lưu trong JSON. Harness kiểm tra độ dài sau khi chèn tag. Ba số điện thoại là các giá trị đại diện cùng một miền hợp lệ; mô hình này không khẳng định chúng là ba lớp tương đương có hành vi khác nhau. Tên các mức khớp `owner_model.pict` và `owner_cases.tsv`.

## Danh sách scenario và oracle

| Mã | Input / precondition | Expected result |
|---|---|---|
| PW01–PW14 | Từng hàng TSV, dữ liệu hợp lệ | POST 302 tới hồ sơ, GET 200, đủ 5 giá trị đã lưu |
| NEG01 | firstName rỗng, các trường còn lại hợp lệ | Form 200, lỗi firstName, tìm họ riêng không thấy owner |
| NEG02 | telephone 9 chữ số | Form 200, lỗi telephone, không có owner |
| NEG03 | telephone chứa chữ | Form 200, lỗi telephone, không có owner |
| NEG04 | firstName 31 ký tự | Form 200, lỗi firstName, không có owner |
| NEG05 | lastName 31 ký tự | Form 200, lỗi lastName, không có owner |
| NEG06 | address 256 ký tự | Form 200, lỗi address, không có owner |
| NEG07 | city 81 ký tự | Form 200, lỗi city, không có owner |
| TC01 | Chủ nuôi mới, 5 trường hợp lệ | Redirect và hồ sơ mới |
| FIND | Tìm chính xác họ riêng của TC01 | Redirect đúng hồ sơ TC01 |
| TC04 | Có owner; pet tên riêng, type cat, sinh trong quá khứ | Redirect; pet có trên hồ sơ owner |
| TC06 | Có pet; ngày mai, mô tả riêng | Redirect; ngày và mô tả có trên hồ sơ |
| TC05 | Đã có pet cùng tên trong owner | Form 200, lỗi name với thông báo trùng; vẫn 1 pet cùng tên |
| TC07 | Có owner/pet; ngày hôm nay | Form 200, lỗi date; mô tả lượt khám không có trên hồ sơ |

Tổng dự kiến: 14 Pairwise + 7 validation + 4 bước demo + 2 ca nghiệp vụ âm tính = **27 ca**. Số ca test Maven là chỉ số riêng, không cộng vào 27.

HTTP 200/302 chỉ là một phần oracle. Ca hợp lệ phải đọc lại dữ liệu; ca bị từ chối phải kiểm tra đúng trường và không tạo bản ghi qua hành vi tìm kiếm/hồ sơ. HTML form và trang sau thao tác được lưu để kiểm tra lại.

## Chạy, đo và xử lý lỗi

- Mô hình đạt khi phủ 90/90 cặp, không có mức lạ/thiếu cột; PICT tái sinh khớp TSV.
- Bộ HTTP đạt khi đủ 27 ca cùng run ID, tất cả PASS; lỗi setup/kết nối làm run FAIL và exit code khác 0.
- Ghi thời điểm, commit harness, commit ứng dụng khai báo, Node, URL, thời gian chạy, input/expected/actual và HTML.
- Không so sánh thời gian với vét cạn nếu chưa thực thi vét cạn trong điều kiện tương đương. Chỉ tỷ lệ giảm **số ca** được suy ra từ mô hình.
- Ca fail phải tách lỗi sản phẩm khỏi lỗi harness, môi trường và dữ liệu. Defect cần input, bước tái hiện, expected/actual, phiên bản và bằng chứng.

Rủi ro còn lại: chưa phủ các tương tác từ 3 chiều, mọi biến thể Unicode/locale, mọi quy tắc pet/visit và mọi giá trị thiếu/rỗng khác. Bộ 7 ca âm tính là mẫu có chủ đích, không phải vét cạn validation.
