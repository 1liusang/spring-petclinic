# Bộ kiểm thử R01/K06

Điều kiện và cách mở ứng dụng: [setup](../docs/setup.md). Chỉ dùng module chuẩn Node.js, không cần `npm install`.

```powershell
node --test tests/harness.test.mjs
node pairwise_owner/run_owner_pairwise.mjs --check
node pairwise_owner/verify_pict.mjs
node run_r01_k06.mjs
```

Hai lệnh đầu không cần ứng dụng. Lệnh verify cần PICT 3.7.4 và `PICT_PATH`; lệnh cuối cần PetClinic đang chạy. Có thể chạy demo/owner/flows riêng theo [test plan](../docs/test-plan.md).

Khi chạy tổng hợp, mỗi lần tạo thư mục riêng `output/r01-k06/runs/<runId>/` gồm `demo`, `owner`, `flows`, JSON và CSV tổng hợp. Bản tổng hợp gần nhất được sao ra `output/R01_K06_tong_hop.json` và CSV cạnh nó. Luôn kiểm tra status/run ID/commit, kể cả lần chạy thất bại; không dùng bản cũ để kết luận cho lần mới.

Biến môi trường:

| Biến | Mặc định / ý nghĩa |
|---|---|
| PETCLINIC_URL | `http://localhost:8080`, URL instance local |
| PETCLINIC_APP_COMMIT | Commit checkout đã build ứng dụng do người chạy khai báo |
| R01_K06_TIMEOUT_MS | 15000, timeout mỗi HTTP request |
| R01_K06_OUTPUT | `output` ở gốc repo, nơi ghi kết quả tổng hợp |
| R01_K06_RUN_ID | Tự sinh từ thời gian + random; cần duy nhất nếu tự đặt |
| R01_K06_RUN_DIR | Thư mục bằng chứng cho script con, orchestrator tự đặt |
| PICT_PATH | Đường dẫn executable khi tái sinh PICT |
| PICT_CASES_FILE | TSV thay thế để kiểm tra mô hình; dùng cho kiểm thử harness |

Harness thoát 0 khi đạt; khác 0 khi ca fail, thiếu ca, thiếu cặp hoặc lỗi môi trường. `--check` chỉ xác minh mô hình và bao phủ, không phải chạy HTTP hay sinh lại bằng PICT.

Kiểm thử harness có chủ đích: loại bớt hàng TSV phải báo thiếu cặp; mức không có trong mô hình phải bị từ chối; HTTP 503 phải ghi đè bản PASS cũ thành FAIL; request treo phải dừng theo timeout. Các kiểm tra này chạy từ working directory khác gốc repo để bắt lỗi đường dẫn.

## Kiểm tra snapshot đã công bố

```powershell
node scripts/verify-evidence.mjs
node --test tests/harness.test.mjs tests/evidence.test.mjs
```

Verifier đối chiếu 27 mã ca, metadata server/run, nội dung HTML, JSON/CSV, coverage tính lại và SHA-256 toàn bộ bundle. Test bổ sung cố ý xóa HTML, sửa dữ liệu đã lưu, làm trùng mã CSV, sửa log và bỏ file khỏi manifest; verifier phải từ chối.

Để thu bộ kết quả mới có cả bước xác minh PICT, dùng `node run_r01_k06.mjs --verify-pict` sau khi đặt `PICT_PATH`. Verifier hiện kiểm tra **snapshot đã công bố** theo manifest; một run mới ghi đè JSON/CSV gần nhất chưa cập nhật manifest sẽ bị báo không khớp. Không sửa manifest cũ để làm nó trông như đã xác minh run mới. Hãy lưu bundle/manifest mới có chủ đích khi công bố kết quả tiếp theo.
