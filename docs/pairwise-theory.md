# Cơ sở Pairwise và mô hình K06

Vét cạn tích Descartes chọn mọi tổ hợp mức giá trị của các tham số. Với 5 tham số, mỗi tham số 3 mức, số ca là `3^5 = 243`.

Pairwise chọn một tập ca sao cho với hai tham số bất kỳ, mọi cặp mức giá trị hợp lệ của chúng xuất hiện ít nhất một lần. Đó là covering array strength 2. Không yêu cầu mọi bộ ba/bốn/năm mức đều xuất hiện; không có bảo đảm phát hiện một tỷ lệ lỗi cố định cho mọi ứng dụng.

Trong mô hình này không có constraint giữa các trường: 3 mức của từng trường đều là dữ liệu hợp lệ độc lập theo quy tắc ở `Person`, `Owner`. Do đó số cặp cần phủ là `C(5,2) × 3 × 3 = 90`. Nếu thêm constraint, phải đổi bộ kiểm tra để chỉ tính các cặp có thể mở rộng thành một tổ hợp hợp lệ; không chỉ xóa tùy ý các cặp chưa phủ.

PICT với seed cố định sinh bộ TSV đang lưu gồm 14 ca. Đây là số đo từ bộ sinh, không phải khẳng định 14 là số ca tối thiểu lý thuyết. Tỷ lệ giảm số ca là `(243 − 14) / 243 × 100 = 94,24%`.

Harness liệt kê độc lập toàn bộ 90 cặp rồi đối chiếu với các hàng TSV; kiểm tra cả tên cột, số cột, mức giá trị và mô hình. `verify_pict.mjs` là bước khác: gọi executable để xác nhận TSV tái sinh khớp. Bao phủ đủ không tự chứng minh TSV được sinh bằng PICT, nên cần cả hai bằng chứng.

Các ca dữ liệu sai được tách riêng, mỗi ca chỉ làm sai một trường. Nếu ghép nhiều trường sai vào cùng ca, ứng dụng có thể dừng ở một lỗi và che mất lỗi khác. Pairwise trên bộ dữ liệu hợp lệ được bổ sung bằng các ca validation và nghiệp vụ; không dùng kết quả này để kết luận bao phủ mã nguồn hay bảo mật/hiệu năng toàn hệ thống.

Mô hình, ánh xạ cụ thể và tiêu chí thực thi: [test plan](test-plan.md). Công cụ được dùng: [mã nguồn Microsoft PICT](https://github.com/microsoft/pict), phiên bản và checksum thực tế nằm trong `pict_verification.json` của lần chạy.
