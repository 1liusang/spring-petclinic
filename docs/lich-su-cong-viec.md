# Lịch sử công việc và trạng thái nghiệm thu

## Căn cứ ghi nhận

Repo nhóm: https://github.com/1liusang/spring-petclinic. [Commit history](https://github.com/1liusang/spring-petclinic/commits/main) ghi thời điểm thực tế và nội dung các thay đổi. Theo yêu cầu chủ repo, author được đặt bằng tên và email GitHub noreply của từng người; việc triển khai được Codex hỗ trợ bằng quyền tài khoản chủ repo. Vì vậy bảng này là ánh xạ công việc và bằng chứng trong repo, không tự chứng minh mỗi người đã độc lập thực hiện hoặc hiểu toàn bộ phần được giao.

| Người phụ trách theo phân công | GitHub | Commit công việc chính |
|---|---|---|
| Lương Đức Sang — 2312735 | `1liusang` | `8343a47`: kiến trúc, phân tích, setup, metadata demo; `6e7fbf3`: input/kết quả từng bước |
| Lâm Văn Đức — 2314299 | `2314299-debug` | `309396e`: lý thuyết, test plan, oracle và metadata Pairwise; `18c1712`: thông báo validation và thời gian ca |
| Đạo Ngọc Thạch — 2314387 | `2314387-cmyk` | `6cb8206`: orchestrator; `7c89443`: snapshot/verifier; `dc1ea45`: sửa định dạng xuống dòng khi clone |

Các commit `cd86d19`, `bcc5614`, `5c80b8c`, `04aaeb3` đưa bảng phân công và gói file có sẵn lên repo. Chúng không đại diện cho một lần kiểm thử mới. PR #10–#13 đã đóng sau khi chủ repo yêu cầu push trực tiếp lên main; không coi các PR đó là review đã được phê duyệt.

## Trạng thái theo Issues

| Issue | Sản phẩm và bằng chứng hiện có | Phần còn phải xác nhận |
|---|---|---|
| #1 R01-01 | `docs/system-analysis.md`, `docs/architecture.md`, liên kết mã nguồn | Review bởi thành viên khác |
| #2 R01-02 | `docs/setup.md`, `docs/version.md`; build/test/run trên clone sạch | Thành viên khác chạy lại trên máy của mình |
| #3 R01-03 | Demo 4 bước đạt; HTML và JSON của ba luồng chính; README | Ảnh PNG mới cho từng luồng và review |
| #4 K06-01 | Lý thuyết, scope, giả định, rủi ro, oracle trong test plan | Review và giải thích của người phụ trách |
| #5 K06-02 | PICT/TSV, ánh xạ input, 7 ca âm tính; tái sinh khớp | Review bộ dữ liệu và xác nhận bàn giao |
| #6 K06-03 | Script coverage, 90/90 cặp, 14/243 ca, báo cáo coverage | Review kết luận và giới hạn |
| #7 K06-04 | Runner, timeout, JSON/CSV, expected/actual, exit code; test âm tính | Review runner và xác nhận sử dụng |
| #8 K06-05 | Run mới 27/27, log Maven, manifest/verifier, báo cáo kết quả/defects | Review bằng chứng |
| #9 K06-06 | Báo cáo Markdown A–H và kịch bản demo/thuyết trình | Deck Word/PDF/PowerPoint cuối kỳ, tập dượt, review và đánh giá chéo |

Các đường dẫn trong bảng là sản phẩm thực tế thay cho cấu trúc thư mục đề xuất ban đầu. Không đánh dấu review, họp nhóm, tập dượt hoặc đánh giá chéo hoàn thành nếu chưa có xác nhận thực tế từ thành viên.

## Mẫu ghi nhận đóng góp và review

Mỗi thành viên tự điền khi đã thực hiện, có thể dùng một bình luận trong Issue tương ứng:

```text
Họ tên / username:
Issue và commit đã đọc hoặc thực hiện:
Lệnh đã chạy, commit/DB/cấu hình:
Kết quả và đường dẫn log/run ID:
Vấn đề phát hiện hoặc nội dung đã chấp nhận:
Phần có thể trực tiếp giải thích khi bảo vệ:
Ngày xác nhận:
```

Chưa quy đổi số commit thành phần trăm đóng góp hoặc điểm cá nhân. Không backdate, tạo commit rỗng hoặc thay lịch sử để giả lập quá trình tham gia.
