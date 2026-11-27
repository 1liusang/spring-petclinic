# Phân công công việc nhóm 3 thành viên — R01 + K06

**Dự án:** Spring PetClinic (R01)  
**Kỹ thuật:** Combinatorial / Pairwise Testing (K06), sử dụng Microsoft PICT  
**Nhóm:** 15  
**Mục đích:** Theo dõi công việc trên GitHub, làm căn cứ tạo Issues và đánh giá đóng góp.

> Đây là kế hoạch phân công đề xuất, không phải xác nhận công việc đã hoàn thành. Chỉ đánh dấu hoàn tất khi có sản phẩm và bằng chứng kiểm tra. Tên thành viên lấy theo tài liệu nhóm hiện có; các đường dẫn bàn giao bên dưới là cấu trúc đề xuất trong repo GitHub.

## 1. Phạm vi công việc chung

- Phân tích cấu trúc, kiến trúc và luồng dữ liệu của Spring PetClinic.
- Thiết lập môi trường và demo ít nhất 3 luồng: tạo chủ nuôi, thêm thú cưng, thêm lượt khám.
- Áp dụng Pairwise cho form tạo chủ nuôi với các trường `firstName`, `lastName`, `address`, `city`, `telephone`.
- Xây dựng mô hình đầu vào, sinh test bằng PICT, viết script chạy tự động và kiểm tra kết quả.
- Đo độ bao phủ cặp, so sánh số ca với vét cạn, phân tích lỗi và đóng gói tài liệu chạy lại.

Ưu tiên hoàn thiện form chủ nuôi trước. Chỉ mở rộng Pairwise sang thú cưng/lượt khám khi phần chính đã chạy ổn định.

## 2. Bảng phân công tổng quát

| Thành viên | Trách nhiệm chính | Sản phẩm phụ trách | Phần báo cáo |
|---|---|---|---|
| **Lương Đức Sang** | Phân tích hệ thống, môi trường, quản lý phiên bản và khả năng chạy lại | Sơ đồ kiến trúc, luồng dữ liệu, hướng dẫn cài đặt, script demo 3 luồng | A, B, C, H |
| **Lâm Văn Đức** | Nghiên cứu Pairwise, thiết kế mô hình, sinh test và kiểm tra bao phủ | Mô hình PICT, bộ dữ liệu test, tiêu chí mong đợi, script đo bao phủ cặp | D, E và số liệu mô hình ở G |
| **Đạo Ngọc Thạch** | Tự động hóa thực thi, kiểm tra validation, tổng hợp kết quả và bằng chứng | Test runner, log/report, danh sách lỗi, báo cáo kết quả và slide | F, G và tổng hợp báo cáo |

Mỗi người tự viết nội dung báo cáo cho phần mình phụ trách. Cả ba cùng review mã, chạy thử và thuyết trình; phần tổng hợp báo cáo không thay thế đóng góp kỹ thuật.

## 3. Danh sách task để tạo GitHub Issues

### Thành viên 1 — Lương Đức Sang

#### R01-01: Phân tích hệ thống và kiến trúc

- [ ] Ghi nhận mục tiêu hệ thống, tác nhân và các use case trong phạm vi.
- [ ] Mô tả cây thư mục, dependency chính và 3–5 module liên quan đến kiểm thử.
- [ ] Vẽ ít nhất 1 sơ đồ kiến trúc ở mức component/container.
- [ ] Mô tả luồng dữ liệu của 3 nghiệp vụ: tạo chủ nuôi, thêm thú cưng, thêm lượt khám.
- **Bàn giao:** `docs/system-analysis.md`, `docs/architecture.md`, sơ đồ trong `docs/diagrams/`.
- **Hoàn thành khi:** mô tả khớp mã nguồn tại commit đã chọn, có đường dẫn tới các thành phần liên quan và được một thành viên khác review.

#### R01-02: Thiết lập môi trường và cố định phiên bản

- [ ] Lưu URL repo gốc, commit SHA/tag dùng cho đề tài.
- [ ] Ghi phiên bản Java, công cụ build, cấu hình DB, cổng và biến môi trường cần thiết theo phiên bản đã chọn.
- [ ] Viết hướng dẫn build/run, nạp dữ liệu ban đầu và xử lý lỗi cài đặt thường gặp.
- [ ] Hướng dẫn reset dữ liệu để các lần chạy test có điều kiện ban đầu tương đương.
- [ ] Nhờ một thành viên khác làm theo hướng dẫn để xác nhận chạy lại được.
- **Bàn giao:** `docs/setup.md`, `docs/version.md`, phần bắt đầu nhanh trong `README.md`.
- **Hoàn thành khi:** thành viên khác có thể dựng ứng dụng và mở được trang chủ bằng hướng dẫn.

#### R01-03: Demo 3 luồng và tích hợp hướng dẫn chạy

- [ ] Chuẩn bị dữ liệu và script demo tạo chủ nuôi → thêm thú cưng → thêm lượt khám.
- [ ] Kiểm tra dữ liệu tạo ra xuất hiện đúng trên trang chi tiết.
- [ ] Lưu log và ảnh minh chứng cho từng luồng.
- [ ] Tích hợp lệnh sinh test, chạy test và xem kết quả vào README sau khi nhận bàn giao từ Đức và Thạch.
- **Bàn giao:** `scripts/demo-flows.*`, `evidence/demo/`, `README.md`.
- **Hoàn thành khi:** 3 luồng chạy thành công và các bước chạy lại được ghi rõ.

### Thành viên 2 — Lâm Văn Đức

#### K06-01: Lý thuyết và kế hoạch kiểm thử Pairwise

- [ ] Giải thích Pairwise, tương tác 2 chiều và khác biệt với vét cạn.
- [ ] Chốt phạm vi form chủ nuôi, giả định, rủi ro và giới hạn của kỹ thuật.
- [ ] Đọc validation tại phiên bản đã chọn để xác định các lớp dữ liệu hợp lệ, không hợp lệ và biên.
- [ ] Định nghĩa precondition, expected result và tiêu chí pass/fail cho từng nhóm ca.
- **Bàn giao:** `docs/test-plan.md`, `docs/pairwise-theory.md`.
- **Hoàn thành khi:** từng lớp dữ liệu có lý do lựa chọn; kỳ vọng dựa trên quy tắc thực tế, không tự giả định ràng buộc.

#### K06-02: Xây dựng mô hình PICT và sinh test

- [ ] Mô hình hóa 5 trường đầu vào với các mức giá trị đại diện và constraint nếu có.
- [ ] Lưu ánh xạ từ mức giá trị trong mô hình sang dữ liệu cụ thể để runner sử dụng.
- [ ] Sinh bộ Pairwise bằng Microsoft PICT; lưu phiên bản công cụ, câu lệnh và seed nếu sử dụng.
- [ ] Bổ sung ca âm tính, ca biên riêng để tránh một lỗi đầu vào che khuất lỗi khác.
- [ ] Bàn giao dữ liệu có ID ổn định và expected result cho Thạch triển khai runner.
- **Bàn giao:** `tests/models/owner.pict`, `tests/data/owner-pairwise.tsv`, `tests/data/owner-validation.json`.
- **Hoàn thành khi:** sinh lại được bộ test và mọi ca có dữ liệu thực thi cùng kỳ vọng rõ ràng.

#### K06-03: Kiểm tra bao phủ và so sánh với vét cạn

- [ ] Viết script liệt kê các cặp giá trị cần bao phủ và kiểm tra bộ test đã sinh.
- [ ] Tính bao phủ cặp = số cặp hợp lệ đã xuất hiện / tổng số cặp hợp lệ cần bao phủ.
- [ ] Nếu có constraint, loại các cặp bất khả thi khỏi mẫu số và giải thích cách xác định.
- [ ] So sánh số ca Pairwise với số tổ hợp vét cạn trên cùng mô hình.
- [ ] Ghi số ca thực tế, tỷ lệ giảm và các cặp còn thiếu nếu có.
- **Bàn giao:** `scripts/check-pairwise-coverage.*`, `reports/pairwise-coverage.md`.
- **Hoàn thành khi:** bao phủ đạt 100% các cặp hợp lệ trong mô hình đã chốt; có kết quả kiểm tra tự động. Bao phủ cặp không đồng nghĩa bao phủ mã nguồn hoặc phát hiện mọi lỗi.

### Thành viên 3 — Đạo Ngọc Thạch

#### K06-04: Viết test runner tự động

- [ ] Thống nhất với Đức định dạng dữ liệu đầu vào và expected result.
- [ ] Đọc bộ test được sinh và gửi dữ liệu tới ứng dụng local qua HTTP hoặc công cụ tự động hóa giao diện đã chọn.
- [ ] Kiểm tra ca hợp lệ: phản hồi/chuyển hướng đúng và dữ liệu hiển thị hoặc được lưu đúng.
- [ ] Kiểm tra ca không hợp lệ: lỗi đúng trường, đúng nội dung cần kiểm tra và không tạo bản ghi ngoài ý muốn.
- [ ] Quản lý dữ liệu test, timeout và lỗi kết nối; tách lỗi môi trường khỏi lỗi chức năng.
- [ ] Xuất kết quả từng ca gồm ID, input, expected, actual, pass/fail và thời gian chạy.
- **Bàn giao:** `tests/runner/`, file dependency cần thiết, `tests/README.md`.
- **Hoàn thành khi:** chạy toàn bộ bộ test bằng lệnh được tài liệu hóa, có báo cáo và mã thoát khác 0 khi test thất bại.

#### K06-05: Thực thi, lưu bằng chứng và phân tích lỗi

- [ ] Chạy bộ Pairwise, bộ validation và các ca bổ sung trên phiên bản đã cố định.
- [ ] Lưu tổng số ca, pass/fail, thời gian chạy và log gắn với commit/cấu hình tương ứng.
- [ ] Với ca fail, phân biệt lỗi sản phẩm, lỗi script, lỗi dữ liệu và lỗi môi trường.
- [ ] Lập defect có bước tái hiện, expected/actual, bằng chứng và phân tích nguyên nhân nếu xác nhận được lỗi sản phẩm.
- [ ] Nếu không phát hiện lỗi, trình bày kết quả và độ bao phủ đã đo cùng giới hạn của phạm vi.
- **Bàn giao:** `reports/test-results.md`, `reports/defects.md`, `evidence/test-runs/`.
- **Hoàn thành khi:** mọi ca fail đều có giải thích; số liệu trong báo cáo truy được về log. Chỉ so sánh thời gian Pairwise/vét cạn khi đã thực sự đo cả hai trong điều kiện tương đương.

#### K06-06: Tổng hợp báo cáo và chuẩn bị bảo vệ

- [ ] Ghép các phần A–H từ nội dung từng thành viên bàn giao.
- [ ] Kiểm tra tính thống nhất giữa mô hình, số ca, log, bảng kết quả và kết luận.
- [ ] Chuẩn bị slide, kịch bản demo và bằng chứng dự phòng.
- [ ] Tổng hợp bảng đóng góp thực tế dựa trên Issues, PR và commit.
- **Bàn giao:** báo cáo cuối kỳ, slide và kịch bản trong `docs/`.
- **Hoàn thành khi:** cả nhóm review nội dung, chạy thử demo và mỗi người giải thích được phần mình làm.

## 4. Thứ tự thực hiện và review chéo

| Giai đoạn | Việc cần chốt | Người chính | Người review |
|---|---|---|---|
| 1 | Kiến trúc, môi trường, commit và demo 3 luồng | Sang | Đức |
| 2 | Kế hoạch, validation, mô hình PICT và dữ liệu test | Đức | Thạch |
| 3 | Runner, kết quả, lỗi và bằng chứng | Thạch | Sang |
| 4 | Bao phủ cặp, báo cáo, README và chạy lại trên máy khác | Cả nhóm | Review chéo |

Đức có thể nghiên cứu mô hình trong lúc Sang thiết lập môi trường. Thạch có thể chuẩn bị runner ngay khi thống nhất định dạng test; kết quả chính thức chỉ ghi nhận sau khi mô hình và môi trường đã chốt.

## 5. Cách đưa công việc lên GitHub

1. Commit file phân công này vào repo của nhóm.
2. Tạo một Issue cho mỗi mã công việc ở mục 3, dùng tiêu đề tương ứng và sao chép checklist, sản phẩm bàn giao, tiêu chí hoàn thành vào nội dung Issue.
3. Gán Assignee theo bảng phân công; thêm nhãn như `documentation`, `setup`, `test-design`, `automation`, `report` nếu cần.
4. Mỗi người tạo branch cho task, ví dụ `docs/R01-01-system-analysis`, `test/K06-02-pict-model`, `test/K06-04-runner`.
5. Commit theo phần việc thực tế; mở PR liên kết Issue và ghi cách kiểm tra cùng kết quả.
6. Một thành viên khác review trước khi merge. Chỉ đóng Issue khi sản phẩm đáp ứng tiêu chí hoàn thành.

Không cần chia số commit bằng nhau. Đánh giá đóng góp dựa trên công việc, chất lượng sản phẩm, review và khả năng giải thích kết quả.

## 6. Checklist trước khi nộp

- [ ] Có phân tích hệ thống, sơ đồ kiến trúc và bằng chứng 3 luồng nghiệp vụ.
- [ ] Có hướng dẫn cài đặt, commit SHA/tag và cách reset dữ liệu.
- [ ] Có mô hình PICT, dữ liệu test, constraint và expected result.
- [ ] Có script chạy tự động và hướng dẫn dependency/lệnh chạy.
- [ ] Có kiểm tra bao phủ cặp và so sánh số ca với vét cạn.
- [ ] Có log/report thực tế, phân tích lỗi hoặc giải thích kết quả không tìm thấy lỗi.
- [ ] Thành viên khác chạy lại được theo README.
- [ ] Có lịch sử Issues, PR, commit và bảng đóng góp thực tế của cả 3 thành viên.

## 7. Tài liệu làm căn cứ

- `ban_phan_cong_de_tai (3).md`: yêu cầu phần A–H và kỹ thuật K06.
- `Kich_Ban_Thuyet_Trinh_R01_K06_Nhom15.md`: danh sách thành viên và định hướng phân vai hiện có.

## 8. Liên kết GitHub Issues

| Task | Người phụ trách | Issue |
|---|---|---|
| R01-01 | Lương Đức Sang | [#1](https://github.com/1liusang/spring-petclinic/issues/1) |
| R01-02 | Lương Đức Sang | [#2](https://github.com/1liusang/spring-petclinic/issues/2) |
| R01-03 | Lương Đức Sang | [#3](https://github.com/1liusang/spring-petclinic/issues/3) |
| K06-01 | Lâm Văn Đức | [#4](https://github.com/1liusang/spring-petclinic/issues/4) |
| K06-02 | Lâm Văn Đức | [#5](https://github.com/1liusang/spring-petclinic/issues/5) |
| K06-03 | Lâm Văn Đức | [#6](https://github.com/1liusang/spring-petclinic/issues/6) |
| K06-04 | Đạo Ngọc Thạch | [#7](https://github.com/1liusang/spring-petclinic/issues/7) |
| K06-05 | Đạo Ngọc Thạch | [#8](https://github.com/1liusang/spring-petclinic/issues/8) |
| K06-06 | Đạo Ngọc Thạch | [#9](https://github.com/1liusang/spring-petclinic/issues/9) |

Người phụ trách được ghi theo tên trong nội dung Issue. GitHub Assignee của các thành viên sẽ được gán khi có username tương ứng.
