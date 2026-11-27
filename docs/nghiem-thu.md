# Đối chiếu nghiệm thu R01 K06

## Phần kỹ thuật đã xác minh

| Yêu cầu | Bằng chứng | Kết luận |
|---|---|---|
| A Mục tiêu, tác nhân, module, dependency, luồng dữ liệu | `system-analysis.md`, phần A trong báo cáo | Có sản phẩm và liên kết source |
| B Sơ đồ kiến trúc, module kiểm thử | `architecture.md`, phần B trong báo cáo | Có component/sequence Mermaid |
| C Môi trường, phiên bản, DB/seed/reset, 3 luồng chạy được | `setup.md`, `version.md`, run `mwymg1e7c11f2a`, log server/Maven | Clone sạch chạy được; HTML/JSON mới đầy đủ |
| D Nguyên lý, scope, giả định, rủi ro, pass/fail | `pairwise-theory.md`, `test-plan.md` | Ghi rõ giới hạn của mô hình |
| E Mô hình, dữ liệu, expected result | PICT/TSV, ánh xạ test plan, input/expected/actual trong JSON | 14 ca hợp lệ, 7 validation, 6 bước/ca bổ sung |
| F Mã chạy tự động và README | Root runner, script con, `tests/README.md` | Đủ 27 ca có thời gian từng ca; lỗi trả exit khác 0 |
| G Log, kết quả, coverage, phân tích | `reports/test-results.md`, `pairwise-coverage.md`, `defects.md` | 27/27 HTTP, 90/90 cặp; không xác nhận defect sản phẩm |
| H Pin commit, config và cách tái lập | Commit `dc1ea45d8e5eedfbb3a3c9e7b7bcb7d1a38b567e`, snapshot, manifest | Clone lại từ GitHub xác minh được bundle |
| Tính nhất quán hồ sơ | `scripts/verify-evidence.mjs`, 9 test harness/verifier | Đạt; 51 file được đối chiếu hash |
| Lịch sử công việc | Git commits theo tên phân công, Issues, `lich-su-cong-viec.md` | Có lịch sử thay đổi thực tế; chưa suy ra đóng góp độc lập |

Bộ Java có 79 test được thống kê: 77 đạt, 2 skipped. Không cộng các test này hoặc 9 test công cụ vào 27 ca HTTP. Test skipped không được tính là đạt.

Sau khi push báo cáo, clone sạch từ GitHub tại `180bb4685604f5d0270f609799513e731166e324` đã chạy lại 9 test công cụ và verifier thành công. Kiểm tra này xác nhận file sau khi qua Git vẫn khớp manifest, bao gồm sửa lỗi CRLF/LF. Không chạy lại Maven chỉ vì thay đổi tài liệu; source ứng dụng giữ nguyên.

## Phần còn thiếu để chốt toàn bộ đề tài

- [ ] Một thành viên khác review phân tích/kiến trúc và xác nhận kết quả (#1).
- [ ] Thành viên khác làm theo README trên máy của mình, lưu commit/cấu hình và kết quả (#2).
- [ ] Có ảnh PNG mới cho các luồng của run mới (#3). Ảnh tháng 10 không thay thế ảnh mới.
- [ ] Đức/Thạch xác nhận bàn giao mô hình và định dạng dữ liệu (#5, #7).
- [ ] Có bộ slide cuối kỳ đã được render/kiểm tra. Hiện đã có dàn ý và kịch bản trong `kich-ban-demo.md`, còn file PowerPoint cũ chưa được cập nhật (#9).
- [ ] Nhóm review báo cáo, tập dượt demo, từng người giải thích được phần mình và điền đánh giá chéo thực tế (#9).
- [ ] Nếu hồ sơ nộp yêu cầu Word/PDF/PowerPoint, xuất và kiểm tra lại các bản cuối từ số liệu mới. Những file cũ đang có chưa phải hồ sơ cuối kỳ đã nghiệm thu.

## Giới hạn công cụ đang gặp

Computer Use dừng khi chọn cửa sổ Cốc Cốc vì trình duyệt hiện tại chưa được hỗ trợ kiểm soát URL. Vì vậy không tự động chụp được ảnh mới. Các thao tác HTTP và kiểm tra HTML vẫn thực hiện được qua harness.

Đã thử chuẩn bị slide bằng công cụ Presentations. Dịch vụ trả `artifact_preparation_failed`, `retryable=false` khi chuẩn bị tài liệu. Chưa có slide nội dung nào được lưu. Bản trống vừa tạo đã được đưa vào Trash và xác nhận hoàn tất; không coi nó là sản phẩm bàn giao. Cần dịch vụ hoạt động lại hoặc một phương thức làm slide khác được cho phép trước khi đóng phần này.

## Trạng thái Issues

#4, #6, #8 đã đóng theo tiêu chí kỹ thuật có bằng chứng. #1, #2, #3, #5, #7, #9 còn mở vì các mục trên. Các checklist không ghi thay việc họp, review, chạy lại, tập dượt hoặc đóng góp cá nhân chưa được xác nhận.

Để xác nhận, thành viên dùng mẫu ở `lich-su-cong-viec.md` và ghi username, Issue, commit, lệnh đã chạy, run ID/log hoặc nội dung review. Không cần tạo commit rỗng hoặc sửa ngày để thể hiện tham gia.
