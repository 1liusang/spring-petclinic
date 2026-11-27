# Kết quả kiểm thử K06 Pairwise trên Spring PetClinic

**Kết quả hiện hành:** xem [báo cáo kết quả tháng 11](../reports/test-results.md), [coverage](../reports/pairwise-coverage.md) và [báo cáo kỹ thuật A–H](../docs/bao-cao-tong-ket.md). Snapshot mới có run ID và commit riêng; các đường dẫn trong phần dưới là hồ sơ lịch sử.

## Lưu trữ kết quả tháng 10 năm 2026

Phần bên dưới giữ nguyên để đối chiếu quá trình thực hiện. Không dùng số ID, đường dẫn workspace cũ, thời gian hoặc ảnh cũ để kết luận cho run mới.

## Phạm vi và dữ liệu

Nhóm kiểm thử form thêm chủ nuôi `/owners/new` trên mã nguồn Spring PetClinic commit `500158f732419217507c7656904b8e6aa1bcc0d6`. Mô hình PICT nằm ở [owner_model.pict](owner_model.pict), đầu ra PICT ở [owner_cases.tsv](owner_cases.tsv). Mỗi trường có ba lớp dữ liệu hợp lệ:

| Trường | Lớp 1 | Lớp 2 | Lớp 3 |
| --- | --- | --- | --- |
| firstName | Ngắn | Có dấu | Đúng 30 ký tự |
| lastName | Ngắn | Có dấu | Đúng 30 ký tự |
| address | Ngắn | Có dấu | Đúng 255 ký tự |
| city | Ngắn | Có dấu | Đúng 80 ký tự |
| telephone | Mẫu số A | Mẫu số B | Mẫu số C |

Cả ba mẫu số điện thoại đều gồm đúng 10 chữ số. Script thêm hậu tố riêng vào họ của mỗi ca để tìm đúng bản ghi vừa tạo mà vẫn giữ giới hạn ký tự. Các ca sai được chạy riêng để tránh một lỗi đầu vào che lỗi khác.

## Sinh ca và bao phủ

[Microsoft PICT 3.7.4](https://github.com/microsoft/pict/releases/tag/v3.7.4) được dùng với lệnh (chạy từ thư mục `KTPM` sau khi tải `pict.exe`):

```powershell
pict.exe pairwise_owner/owner_model.pict /o:2 /r:20261017
```

Đầu ra gồm **14 ca**, so với **243** tổ hợp nếu vét cạn. Script [run_owner_pairwise.mjs](run_owner_pairwise.mjs) kiểm tra độc lập mọi cặp lớp giá trị: **90/90 cặp được bao phủ**, không thiếu cặp nào. Kết quả chi tiết ở [coverage.json](evidence/coverage.json). PICT chỉ bảo đảm bao phủ từng cặp, không bảo đảm mọi tổ hợp ba trường trở lên.

Script [verify_pict.mjs](verify_pict.mjs) chạy lại PICT với cùng mô hình và tham số, rồi so sánh từng dòng với `owner_cases.tsv`. Lần kiểm tra ngày 17/10/2026 đạt: 14 ca sinh lại giống hệt tệp đã lưu. [Bằng chứng tái tạo](evidence/pict_verification.json) ghi mã SHA-256 của `pict.exe` được dùng. Bước này cần tệp PICT 3.7.4 tại `.tmp/pict.exe`, hoặc đặt `PICT_PATH` đến tệp thực thi đã cài.

## Kết quả thực thi ngày 17/10/2026

PetClinic chạy với Java 25, Spring Boot 4.1.0 và H2 trong bộ nhớ tại `http://localhost:8080`.

| Nhóm ca | Đã chạy | Đạt | Cách đối chiếu |
| --- | ---: | ---: | --- |
| Pairwise, dữ liệu hợp lệ | 14 | 14 | POST chuyển hướng tới hồ sơ; cả năm giá trị xuất hiện trong hồ sơ |
| Dữ liệu sai của chủ nuôi | 7 | 7 | Form báo lỗi ở đúng trường; tìm theo họ không thấy bản ghi |
| TC05: tên thú nuôi trùng | 1 | 1 | Form báo trùng; hồ sơ vẫn chỉ có một thú nuôi cùng tên |
| TC07: ngày khám hôm nay | 1 | 1 | Form báo lỗi; lượt khám không xuất hiện trong hồ sơ |

Bảy ca sai gồm: bỏ trống `firstName`, số điện thoại 9 chữ số, số điện thoại có chữ, `firstName` và `lastName` dài 31 ký tự, `address` dài 256 ký tự, `city` dài 81 ký tự. [results.json](evidence/results.json) ghi từng ca Pairwise và ca sai; [remaining_flows.json](evidence/remaining_flows.json) ghi TC05 và TC07. Thư mục `evidence/` còn có HTML phản hồi hoặc hồ sơ cho từng ca. Chuỗi demo hợp lệ TC01, TC04 và TC06 đã được ghi ở [bằng chứng trước đó](../output/bang_chung_chay_app/ket_qua.json).

Không có ca trượt trong bộ ca đã chạy. Kết luận này giới hạn ở các lớp dữ liệu và hai kịch bản âm tính nêu trên; nó không chứng minh ứng dụng không có lỗi ở các tổ hợp khác.

## Đối chiếu với bộ test của PetClinic

Ngày 17/10/2026, nhóm chạy `./mvnw.cmd test` trên cùng commit. Maven báo **BUILD SUCCESS**: 79 test được thống kê, 0 thất bại, 0 lỗi và 2 bỏ qua. Hai test `MySqlIntegrationTests` bị bỏ qua vì môi trường Windows này không có Docker; do đó có **77 test đạt**. Kết quả chi tiết do Maven tạo trong `spring-petclinic/target/surefire-reports/`. Bộ test này kiểm tra mã nguồn của PetClinic; 27 ca HTTP ở trên là bằng chứng thực thi riêng của bài K06.

## Chạy lại

Tại thư mục `spring-petclinic`, chạy `./mvnw.cmd spring-boot:run`. Tại thư mục `KTPM`, chạy:

```powershell
node run_r01_k06.mjs
```

Lệnh này chạy toàn bộ 27 ca, kiểm tra 90 cặp và ghi [JSON tổng hợp](../output/R01_K06_tong_hop.json) cùng [bảng CSV theo mã ca](../output/R01_K06_ket_qua_ca.csv). Nếu chỉ muốn chạy từng phần:

```powershell
node pairwise_owner/run_owner_pairwise.mjs --check
node pairwise_owner/run_owner_pairwise.mjs
node pairwise_owner/run_remaining_flows.mjs
```

`--check` chỉ kiểm tra tệp PICT và độ bao phủ, không cần mở ứng dụng. Hai lệnh sau tạo dữ liệu mới và ghi đè bằng chứng trong `pairwise_owner/evidence/`. Nếu ứng dụng dùng cổng khác, đặt biến `PETCLINIC_URL`. Dữ liệu H2 được tạo trong phiên chạy và mất khi dừng ứng dụng.

Muốn xác minh đầu ra được PICT tạo lại từ mô hình mà không cần mở PetClinic, chạy `node pairwise_owner/verify_pict.mjs` sau khi đặt `pict.exe` tại `.tmp/pict.exe`.

Script kiểm tra các lớp giá trị trong `owner_model.pict` khớp với mã chạy trước khi dùng `owner_cases.tsv`. Với ca sai, nó lưu cả HTML form báo lỗi và HTML trang tìm kiếm không thấy bản ghi, để có thể đối chiếu hai điều kiện đạt.
