# Kết quả kiểm thử R01 K06

## Kết luận thực nghiệm

Lần chạy trên bản clone sạch từ GitHub đạt **27/27 ca HTTP**, bao phủ **90/90 cặp mức giá trị**. PICT tái sinh 14 ca trùng TSV đã lưu. Không xác nhận defect sản phẩm trong phạm vi bộ ca này. Bộ test Java có 79 test được thống kê, 0 failure, 0 error, 2 skipped, tương ứng 77 test đạt.

## Phiên bản và điều kiện chạy

| Thuộc tính | Giá trị |
|---|---|
| Commit ứng dụng và harness | `dc1ea45d8e5eedfbb3a3c9e7b7bcb7d1a38b567e` |
| Run ID | `mwymg1e7c11f2a` |
| Bắt đầu UTC | `2026-11-27T06:49:54.706Z` |
| Ngày địa phương máy Windows | 26/11/2026, múi giờ America/Los_Angeles |
| Instance | `http://localhost:18088`, H2 seed mới |
| Java | Liberica OpenJDK 25.0.4.1 |
| Node | v24.21.0 |
| Maven Wrapper | Apache Maven 3.9.16 |
| Spring Boot | 4.1.0 |
| PICT | 3.7.4, seed `20261017`, strength 2 |
| Trạng thái trước chạy | File được theo dõi sạch, `dirty=false` |
| Server tự báo commit | `dc1ea45`, khớp checkout |

`build.time` trong Actuator là timestamp tái lập từ `pom.xml`, không phải giờ thực nghiệm. Giờ chạy lấy từ JSON và log. Các bản clone dùng chung một máy, vì vậy bằng chứng này xác nhận khả năng chạy lại từ checkout sạch trên máy hiện tại, chưa phải xác nhận từ máy của thành viên khác.

## Kết quả theo nhóm

| Nhóm | Số ca | Đạt | Trượt | Oracle chính |
|---|---:|---:|---:|---|
| Pairwise hợp lệ PW01–PW14 | 14 | 14 | 0 | POST 302, đọc lại đủ 5 trường đã lưu |
| Validation NEG01–NEG07 | 7 | 7 | 0 | Form 200, lỗi đúng trường, tìm không thấy owner |
| Demo TC01, FIND, TC04, TC06 | 4 | 4 | 0 | Tạo owner, tìm đúng hồ sơ, thêm pet, thêm visit |
| Nghiệp vụ TC05, TC07 | 2 | 2 | 0 | Chặn tên pet trùng, chặn visit hôm nay, không tạo dữ liệu ngoài ý muốn |
| Tổng HTTP | 27 | 27 | 0 | Cùng run ID và commit |

Thời gian orchestrator là **2.478 ms** (2,478 giây), gồm probe ứng dụng, xác minh PICT và ba tiến trình con trên máy này. Đây là một mẫu đo, không phải benchmark. Chưa chạy vét cạn để đo thời gian, nên không kết luận nhanh hơn bao nhiêu lần.

## Bằng chứng gốc

- [JSON tổng hợp](../output/R01_K06_tong_hop.json) chứa từng ca, metadata, thời gian, coverage và thông tin server.
- [CSV theo mã ca](../output/R01_K06_ket_qua_ca.csv) có đủ 27 mã ca riêng biệt.
- [Thư mục run bất biến](../output/r01-k06/runs/mwymg1e7c11f2a/) chứa HTML form/hồ sơ và kết quả từng nhóm.
- [Maven summary](verification/maven-summary.json), [log Maven](verification/maven-test.log), [log khởi động server](verification/server-startup.log).
- [Manifest SHA-256](verification/evidence-manifest.json) đối chiếu 51 file. Manifest là công cụ kiểm tra tính nhất quán của bundle, không phải chữ ký độc lập hay bằng chứng chống giả mạo.

Hai test MySQL `findAll`, `ownerDetails` bị bỏ qua vì không có Docker. Suite PostgreSQL thống kê 0 test ở môi trường này; không coi nó là bằng chứng PostgreSQL đạt. Chi tiết từng suite nằm trong Maven summary.

## Cách kiểm tra lại bằng chứng mà không mở ứng dụng

```powershell
node scripts/verify-evidence.mjs
node --test tests/harness.test.mjs tests/evidence.test.mjs
```

Verifier kiểm tra các điều kiện đạt, ID ca, cùng run/commit, coverage tính lại từ mô hình/TSV, dữ liệu lưu trong HTML, lỗi đúng trường, JSON/CSV đồng nhất, file không thiếu và hash đúng. Các test âm tính sửa bản sao fixture trong thư mục tạm để xác nhận verifier từ chối bằng chứng sai.

## Giới hạn

Bao phủ 100% cặp trong mô hình không đồng nghĩa bao phủ 100% mã nguồn hay mọi tương tác từ ba trường trở lên. Không có số đo JaCoCo mới từ lần chạy này. Không kiểm thử bảo mật, tải, role, mọi locale hoặc mọi giá trị đầu vào. Bộ validation có bảy ca đại diện; chưa vét cạn các biến thể rỗng/trắng và Unicode.

HTML mới là bằng chứng lưu được trong lần chạy này. Các ảnh PNG tháng 10 trong thư mục cũ vẫn là dữ liệu lịch sử; chúng không được gán lại cho run mới. Chụp ảnh mới qua Computer Use bị chặn vì trình duyệt Cốc Cốc hiện tại chưa được hỗ trợ kiểm soát URL.
