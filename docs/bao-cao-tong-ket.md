# Báo cáo kỹ thuật R01 K06 nhóm 15

Nhóm áp dụng Pairwise Testing cho form tạo chủ nuôi của Spring PetClinic, kết hợp kiểm tra validation và ba luồng nghiệp vụ. Bản clone sạch tại commit `dc1ea45d8e5eedfbb3a3c9e7b7bcb7d1a38b567e` đạt 27/27 ca HTTP, phủ 90/90 cặp trong mô hình và tái sinh được ma trận 14 ca PICT. Kết quả này giới hạn ở phạm vi đã thiết kế; chưa đủ để kết luận toàn ứng dụng không có lỗi.

Thành viên theo phân công: Lương Đức Sang — 2312735; Lâm Văn Đức — 2314299; Đạo Ngọc Thạch — 2314387. Lịch sử commit thể hiện các thay đổi đã đưa lên repo, còn review và đánh giá đóng góp cá nhân cần từng thành viên xác nhận.

## A Mục tiêu hệ thống và phạm vi nghiệp vụ

Spring PetClinic quản lý chủ nuôi, thú nuôi, lượt khám và danh sách bác sĩ. Nhóm chọn vai trò sử dụng là nhân viên phòng khám. Đây là vai trò nghiệp vụ, không phải role bảo mật vì bản ứng dụng trong phạm vi không có đăng nhập/phân quyền.

Các luồng khảo sát gồm tạo và tìm chủ nuôi, thêm thú nuôi, thêm lượt khám. Nhóm tập trung Pairwise vào `POST /owners/new`, có 5 trường kết hợp: firstName, lastName, address, city, telephone. Thú nuôi/lượt khám được dùng cho kiểm tra luồng liên hoàn và hai ca âm tính bổ sung, chưa được mô hình hóa Pairwise riêng.

Mã nguồn chia thành `owner`, `vet`, `model`, `system`; template và DB seed nằm trong resources. Dependency chính là Spring MVC, Thymeleaf, Bean Validation, Spring Data JPA/Hibernate và H2. [Phân tích hệ thống](system-analysis.md) có cây thư mục, liên kết mã nguồn và bảng luồng dữ liệu.

## B Kiến trúc và module liên quan

Ứng dụng chạy trong một JVM Spring Boot. Browser/harness gửi form đến MVC controller; controller bind dữ liệu, kiểm tra validation, gọi repository và trả template hoặc chuyển hướng. H2 mặc định nằm trong cùng JVM. Các luồng này không có tầng service nghiệp vụ riêng giữa controller và repository.

OwnerController quản lý tạo/tìm hồ sơ; PetController dùng PetValidator và kiểm tra tên trùng/ngày sinh; VisitController yêu cầu ngày sau hôm nay; OwnerRepository lưu quan hệ Owner → Pet → Visit theo cascade. Form Thymeleaf thể hiện lỗi đúng trường và trang hồ sơ cho phép đọc lại kết quả lưu.

[Sơ đồ component và sequence](architecture.md) thể hiện các nhánh hợp lệ/không hợp lệ. Các chức năng lịch hẹn/bệnh án chưa commit tại workspace khác không thuộc kiến trúc hoặc kết luận của bài này.

## C Môi trường và bằng chứng chạy hệ thống

Thực nghiệm dùng Windows, OpenJDK 25.0.4.1, Maven Wrapper 3.9.16, Spring Boot 4.1.0, Node v24.21.0, H2 in-memory và PICT 3.7.4. Repo yêu cầu Java từ 17; harness cần Node từ 18 và module chuẩn, không có dependency npm.

Clone sạch tải từ repo GitHub được build, chạy Maven test rồi mở instance riêng tại cổng 18088. Schema/data H2 được nạp khi khởi động. Seed có 10 chủ nuôi, 13 thú nuôi, 6 bác sĩ; dữ liệu test có tên riêng theo run ID. Reset bằng dừng/khởi động lại instance H2.

Run `mwymg1e7c11f2a` bắt đầu `2026-11-27T06:49:54.706Z`, tức tối 26/11/2026 tại America/Los_Angeles. Harness ghi file đã theo dõi sạch, commit ứng dụng/harness khớp, và Actuator tự báo `dc1ea45`. Demo tạo owner ID 11, thêm pet ID 14 và lượt khám ngày 27/11/2026, sau đó đọc lại hồ sơ. ID chỉ có ý nghĩa trong instance của run đó.

Hướng dẫn đầy đủ ở [setup](setup.md); [log khởi động](../reports/verification/server-startup.log) và HTML trong [run mới](../output/r01-k06/runs/mwymg1e7c11f2a/demo/) là bằng chứng. Không gán ảnh tháng 10 cho run tháng 11. Ảnh PNG mới còn cần bổ sung do giới hạn công cụ trình duyệt hiện tại.

## D Nguyên lý kỹ thuật và tiêu chí đánh giá

Vét cạn mô hình 5 trường × 3 mức cần 243 tổ hợp. Pairwise bảo đảm mọi cặp mức giữa hai trường xuất hiện ít nhất một lần. Với mô hình không có constraint liên trường, cần phủ `C(5,2) × 3 × 3 = 90` cặp.

PICT sinh 14 ca với strength 2, seed cố định. Harness kiểm tra độc lập toàn bộ cặp, còn script verify gọi executable PICT và so sánh TSV. Hai việc có ý nghĩa khác nhau: đủ cặp không tự chứng minh TSV đã được tái sinh bằng PICT.

Ca hợp lệ phải POST 302 và đọc lại đủ dữ liệu. Ca không hợp lệ phải trả form 200 với lỗi đúng trường và không tạo bản ghi qua hành vi tìm kiếm/hồ sơ. Bộ HTTP đạt khi đủ 27 mã riêng biệt cùng run/commit, tất cả PASS. Lỗi kết nối, thiếu ca hoặc thiếu cặp phải làm lệnh thoát khác 0.

Giả định và rủi ro: locale tiếng Anh, Java/Node cùng ngày địa phương, URL đúng instance, mô hình lớp hợp lệ độc lập. Pairwise không phủ mọi tương tác 3 chiều, các biến thể Unicode hoặc mọi miền validation. [Lý thuyết](pairwise-theory.md) giải thích các giới hạn này.

## E Thiết kế mô hình và dữ liệu kiểm thử

| Trường | Mức dữ liệu hợp lệ |
|---|---|
| firstName | Ngắn, tiếng Việt có dấu, đúng 30 ký tự |
| lastName | Ngắn + tag, có dấu + tag, đủ 30 ký tự có tag |
| address | Ngắn, tiếng Việt có dấu, đủ 255 ký tự |
| city | Ngắn, tiếng Việt có dấu, đủ 80 ký tự |
| telephone | Ba mẫu 10 chữ số, trong đó có số bắt đầu bằng 0 |

Các mẫu telephone cùng thuộc một miền hợp lệ, chưa chứng minh ba loại hành vi riêng. Tag giúp phân biệt dữ liệu mỗi lần chạy và được kiểm tra để không vượt giới hạn.

Bảy ca âm tính tách riêng: firstName rỗng, điện thoại 9 số, điện thoại có chữ, firstName/lastName 31 ký tự, address 256 ký tự, city 81 ký tự. Chỉ làm sai một trường mỗi ca để tránh che lỗi. Bổ sung TC05 chặn tên pet trùng, TC07 chặn visit hôm nay. Bốn bước demo là TC01, FIND, TC04, TC06.

[Test plan](test-plan.md) liệt kê precondition/input/expected result theo mã. [Mô hình](../pairwise_owner/owner_model.pict), [TSV](../pairwise_owner/owner_cases.tsv) và JSON từng ca chứa dữ liệu thực thi cụ thể.

## F Mã tự động hóa và cách chạy

```powershell
node --test tests/harness.test.mjs tests/evidence.test.mjs
node pairwise_owner/run_owner_pairwise.mjs --check
node run_r01_k06.mjs --verify-pict
node scripts/verify-evidence.mjs
```

Hai lệnh đầu và verifier bằng chứng không cần ứng dụng. Lệnh tổng hợp cần ứng dụng local đã mở, `PETCLINIC_URL`, `PETCLINIC_APP_COMMIT` và `PICT_PATH`. [README kiểm thử](../tests/README.md) có chi tiết dependency và biến môi trường.

Orchestrator tạo thư mục theo run ID, truyền run/đường dẫn cho các script con, đối chiếu commit, thu thập 27 ca và xuất JSON/CSV. Request có timeout. Metadata tách commit harness, commit ứng dụng do người chạy khai báo và commit server tự báo.

Verifier đọc HTML để kiểm tra dữ liệu đã lưu/lỗi đúng trường, tính lại coverage, đối chiếu JSON/CSV và kiểm tra hash bundle. Test harness/verifier kiểm tra các trường hợp ma trận thiếu cặp, mức lạ, HTTP 503, timeout, thiếu HTML, dữ liệu lưu bị sửa, CSV trùng mã và log bị thay đổi. Các test này bảo vệ công cụ; không tính chung vào 27 ca HTTP.

## G Kết quả và phân tích

| Bộ kiểm tra | Kết quả | Giới hạn |
|---|---|---|
| HTTP R01/K06 | 27/27 đạt | Phạm vi mô hình và scenario đã chọn |
| Pairwise | 14 ca, 90/90 cặp | Không phủ mọi tổ hợp từ 3 trường |
| Tái sinh PICT | 14 ca khớp TSV | Cùng executable/seed đã ghi |
| Maven Java | 79 thống kê, 77 đạt, 2 skipped | Chưa có bằng chứng MySQL/PostgreSQL đạt |
| Harness/verifier | 9 kiểm tra đạt | Kiểm tra công cụ, không cộng vào 27 HTTP |
| Snapshot bằng chứng | 51 file khớp hash | Kiểm tra nhất quán, không phải chữ ký độc lập |

Giảm số ca từ 243 còn 14, tương ứng **94,24%**. Orchestrator ở lần chạy sạch mất **2,478 giây**, gồm xác minh PICT và các bước gọi tiến trình. Chưa chạy vét cạn để đo thời gian nên không kết luận hệ số tăng tốc.

Không xác nhận defect sản phẩm trong bộ ca đã chạy. Những vấn đề đã sửa thuộc harness/tài liệu: commit ghi cứng, đường dẫn workspace cũ, chưa có timeout và nguy cơ nhầm bằng chứng giữa lần chạy. [Defects và hạn chế](../reports/defects.md) phân loại rõ thay vì gán chúng thành lỗi ứng dụng.

Chi tiết có thể truy lại ở [kết quả](../reports/test-results.md), [coverage](../reports/pairwise-coverage.md), JSON/CSV và HTML. Kết luận không có ca fail không tương đương kết luận ứng dụng không có lỗi.

## H Cố định phiên bản và tái lập

Checkout commit `dc1ea45d8e5eedfbb3a3c9e7b7bcb7d1a38b567e` để tái lập bộ mã đã chạy. Dùng hướng dẫn setup tại commit đó, mở instance riêng với H2 mới, đặt biến môi trường và chạy harness với `--verify-pict`. Script ghi run ID mới; không sửa metadata/kết quả lịch sử để làm nó trông như vừa chạy.

Snapshot đã công bố nằm trong `output/r01-k06/runs/mwymg1e7c11f2a/`, có JSON/CSV riêng và manifest ở `reports/verification/`. Thuộc tính Git giữ nguyên bytes cho bundle hash. Cần toàn bộ checkout chứa snapshot để chạy `node scripts/verify-evidence.mjs`.

[Lịch sử công việc](lich-su-cong-viec.md) ánh xạ task, commit và bằng chứng. Author commit được đặt theo yêu cầu của chủ repo; chưa thay thế review độc lập và đánh giá chéo. Nhóm cần xác nhận review, chạy lại trên máy thành viên khác, bổ sung PNG mới và cập nhật Word/PDF/PowerPoint trước khi chốt hồ sơ bảo vệ.
