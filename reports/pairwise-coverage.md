# Bao phủ cặp và so sánh số ca

Mô hình [owner_model.pict](../pairwise_owner/owner_model.pict) có 5 trường, mỗi trường 3 mức hợp lệ độc lập, không có constraint liên trường. [Test plan](../docs/test-plan.md) giải thích ánh xạ từng mức sang dữ liệu thực thi.

| Chỉ số | Giá trị | Cách tính hoặc kiểm tra |
|---|---:|---|
| Tổ hợp vét cạn | 243 | `3 × 3 × 3 × 3 × 3` |
| Ca PICT | 14 | Đếm hàng dữ liệu TSV, tái sinh với seed cố định |
| Cặp tham số | 10 | `5 × 4 / 2` |
| Cặp mức giá trị cần phủ | 90 | `10 × 3 × 3` |
| Cặp đã phủ | 90 | Liệt kê độc lập rồi đối chiếu mọi hàng TSV |
| Cặp thiếu | 0 | `missingPairs: []` |
| Bao phủ cặp | 100% | `90 / 90 × 100` |
| Giảm số ca so với vét cạn | 94,24% | `(243 − 14) / 243 × 100` |

[Coverage của run](../output/r01-k06/runs/mwymg1e7c11f2a/owner/coverage.json) và [xác minh PICT](../output/r01-k06/runs/mwymg1e7c11f2a/owner/pict_verification.json) cùng thuộc run `mwymg1e7c11f2a`, commit `dc1ea45d8e5eedfbb3a3c9e7b7bcb7d1a38b567e`.

SHA-256 executable PICT thực sự dùng: `80aba862739cf18b4faa13d408163324d188a1c4efccdd977d9c5ba3f8950bbd`. Mô hình chạy với `/o:2 /r:20261017`; kết quả 14 ca tái tạo khớp từng dòng sau chuẩn hóa xuống dòng.

```powershell
node pairwise_owner/run_owner_pairwise.mjs --check
node pairwise_owner/verify_pict.mjs
```

Lệnh đầu kiểm tra coverage, không cần server/PICT. Lệnh sau cần executable qua `PICT_PATH`. Bộ test harness xác nhận khi chỉ giữ một hàng dữ liệu thì kiểm tra thiếu cặp phải thất bại, và mức giá trị lạ phải bị từ chối.

14 ca là kết quả bộ sinh, chưa chứng minh tối thiểu về toán học. Ba số điện thoại là ba giá trị đại diện của cùng miền hợp lệ, không phải ba loại hành vi validation khác nhau. Không suy ra tỷ lệ phát hiện lỗi hoặc mức tăng tốc từ tỷ lệ giảm số ca này.
