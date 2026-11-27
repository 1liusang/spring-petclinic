# Kịch bản demo và thuyết trình R01 K06

## Chuẩn bị trước buổi demo

Mở hai terminal ở đúng checkout đã pin. Kiểm tra Java, Node, PICT; khởi động H2 mới ở cổng riêng theo [setup](setup.md). Chạy thử `node run_r01_k06.mjs --verify-pict` để chắc công cụ có sẵn. Lưu log từ lần thực sự dùng để báo cáo, không đổi tên ảnh cũ thành ảnh của lần mới.

Trong buổi demo, chạy lệnh này một lần nữa để tạo run mới. Tên, ID và thời gian sẽ khác dữ liệu minh họa trong báo cáo. Dùng JSON của run vừa tạo để mở đúng owner. Không cần dữ liệu từ instance cũ.

## Phân vai đề xuất và nội dung trình bày

| Phần | Người phụ trách | Thời gian | Nội dung |
|---|---|---|---|
| 1 | Sang | 2 phút | Mục tiêu, phạm vi, kiến trúc, điều kiện môi trường và ba luồng |
| 2 | Đức | 3 phút | Mô hình 5 × 3 mức, PICT, 14/243 ca, 90/90 cặp và oracle |
| 3 | Thạch | 3 phút | Chạy harness, giải thích kết quả, giới hạn và bằng chứng tái lập |

Đây là phân vai để tập dượt; chưa xác nhận từng người đã trình bày thử.

## Dàn ý nội dung cho bộ slide

1. **R01 K06 nhóm 15:** hệ thống Spring PetClinic và mục tiêu kiểm thử form chủ nuôi.
2. **Phạm vi nghiệp vụ:** tạo/tìm chủ nuôi, thêm thú nuôi, thêm lượt khám. Nêu phần ngoài phạm vi.
3. **Kiến trúc:** dùng sơ đồ từ `architecture.md`; giải thích controller, validation, repository và H2.
4. **Môi trường tái lập:** commit `dc1ea45`, Java/Node/Maven, H2 mới, server tự báo commit khớp.
5. **Mô hình đầu vào:** bảng năm trường và ba mức từ test plan; giải thích hậu tố dữ liệu riêng.
6. **Pairwise và vét cạn:** 243 tổ hợp, 14 ca PICT, 90/90 cặp, giảm 94,24% số ca. Không nêu hệ số tăng tốc chưa đo.
7. **Ca âm tính và oracle:** bảy validation độc lập; chặn tên pet trùng và visit hôm nay. Đọc lại dữ liệu sau HTTP status.
8. **Demo automation:** chạy orchestrator; xem 27/27 và run ID; mở owner theo JSON.
9. **Kết quả và giới hạn:** Maven 77 đạt/2 skipped, không xác nhận defect trong bộ ca; không suy ra toàn ứng dụng không lỗi.
10. **Bằng chứng và công việc tiếp theo:** JSON/CSV/HTML, verifier hash, review chéo và phạm vi có thể mở rộng sau khi chốt bài.

Dàn ý này là nguồn nội dung cho deck cuối kỳ. File PowerPoint hiện có trong repo là bản cũ, chưa được cập nhật/kiểm tra theo kết quả tháng 11.

## Thao tác demo

```powershell
node pairwise_owner/run_owner_pairwise.mjs --check
node run_r01_k06.mjs --verify-pict
```

Giải thích output: bước đầu chứng minh bao phủ cặp; lệnh tổng hợp tái sinh PICT và thực thi các ca. Mở `output/R01_K06_tong_hop.json`, đọc status, total, passed, commit, serverInfo và runDirectory. Phân biệt run ID mới với snapshot đã lưu trong báo cáo.

Mở trình duyệt tới URL instance local và `/owners/{ownerId}` từ `demo/ket_qua.json` của run mới. Chỉ ra tên chủ nuôi, pet và ngày/mô tả visit. Với ca âm tính, mở HTML lỗi và trang sau thao tác trong thư mục `flows` để chỉ rõ lỗi đúng trường và dữ liệu không được lưu.

## Bằng chứng dự phòng

Nếu không thể mở ứng dụng trong buổi bảo vệ, dùng snapshot đã công bố để minh họa **kết quả đã lưu**, nói rõ không phải demo trực tiếp:

```powershell
node scripts/verify-evidence.mjs
```

Mở HTML/JSON/CSV tại `output/r01-k06/runs/mwymg1e7c11f2a/`. CSS của HTML có thể cần ứng dụng, nhưng nội dung phản hồi vẫn đọc được. Verifier kiểm tra bundle không cần server, không cần PICT executable.

## Câu hỏi cần tập trả lời

- 90 cặp được tính thế nào, và tại sao không phải 243?
- Vì sao tách dữ liệu sai khỏi ma trận hợp lệ?
- HTTP 200 và 302 chưa đủ để kết luận ra sao?
- Phân biệt bao phủ cặp, bao phủ mã nguồn và tỷ lệ lỗi phát hiện?
- Commit trong JSON, commit server và thời gian build khác nhau thế nào?
- Hai test Docker bị bỏ qua có được tính là đạt không?
- Vì sao ma trận 14 ca chưa bảo đảm tìm được lỗi tương tác ba trường?

Trả lời dựa trên test plan, log và source; không dùng các tỷ lệ lỗi thực nghiệm chung chưa có căn cứ trong bài để hứa mức bao phủ rủi ro.
