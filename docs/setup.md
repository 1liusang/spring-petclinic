# Chạy R01/K06 từ gốc repo

## Điều kiện

- Java 17 trở lên theo `pom.xml`; máy kiểm tra dùng Liberica JDK 25.0.4.1.
- Node.js 18 trở lên, có `fetch` và `AbortSignal.timeout`; không có dependency npm cho harness.
- Git và kết nối tải dependency Maven ở lần build đầu. Maven Wrapper tải phiên bản trong `.mvn/wrapper/maven-wrapper.properties`.
- Cấu hình mặc định dùng H2 trong bộ nhớ; không cần cài DB hoặc Docker để chạy bài HTTP.
- Cài Microsoft PICT 3.7.4 riêng nếu muốn tái tạo TSV; đặt `PICT_PATH` trỏ đến executable. Binary không được đưa vào repo.

## Build, test và chạy ứng dụng

Mọi lệnh sau chạy tại **gốc repo `spring-petclinic`**, nơi có `pom.xml`, `mvnw.cmd` và các script Node.

Terminal 1, PowerShell:

```powershell
java -version
node --version
git rev-parse HEAD
.\mvnw.cmd test
$env:SERVER_PORT = '18086'
.\mvnw.cmd spring-boot:run
```

Đợi `Started PetClinicApplication`, mở `http://localhost:18086/`. Trên Linux/macOS dùng `./mvnw test`, sau đó `SERVER_PORT=18086 ./mvnw spring-boot:run`.

Terminal 2, cùng checkout:

```powershell
$env:PETCLINIC_URL = 'http://localhost:18086'
$env:PETCLINIC_APP_COMMIT = (git rev-parse HEAD)
node pairwise_owner/run_owner_pairwise.mjs --check
node run_r01_k06.mjs
```

Không dùng cổng đang chạy bản ứng dụng đã sửa ở checkout khác. Ngày của Java và Node phải cùng ngày địa phương khi chạy ca ngày hôm nay.

## DB, seed và reset

`src/main/resources/application.properties` chọn `database=h2`, `ddl-auto=none`. Khi ứng dụng khởi động, schema và seed được nạp từ `src/main/resources/db/h2/schema.sql`, `data.sql`: 10 chủ nuôi, 13 thú nuôi, 6 bác sĩ. Harness tạo tên riêng theo từng lần chạy để tránh trùng dữ liệu.

Để reset hoàn toàn, dừng đúng ứng dụng bằng `Ctrl+C` ở Terminal 1 rồi khởi động lại. Không cần xóa file DB vì cấu hình này dùng H2 trong bộ nhớ.

## Sinh lại PICT

```powershell
$env:PICT_PATH = 'C:/tools/pict.exe'
node pairwise_owner/verify_pict.mjs
```

Script chạy mô hình với `/o:2 /r:20261017`, so sánh đầu ra với TSV đã lưu và ghi SHA-256 binary. Khác phiên bản/thuật toán có thể sinh ma trận khác vẫn đủ cặp; phải kiểm tra bao phủ và cập nhật TSV có chủ đích thay vì tự chấp nhận thay đổi.

## Lỗi môi trường

- Cổng bận: chọn cổng trống và đặt cả `SERVER_PORT`, `PETCLINIC_URL` tương ứng.
- Không kết nối: kiểm tra log ứng dụng và URL. Harness phải thoát khác 0, không coi kết quả cũ là đạt.
- Lỗi thư mục tạm Windows: tạo thư mục có quyền ghi, rồi đặt `$env:JAVA_TOOL_OPTIONS = '-Djava.io.tmpdir=C:/duong-dan-tuyet-doi/temp'` trước khi chạy Maven.
- Không có Docker: test Testcontainers có thể bị bỏ qua; báo rõ số skipped, không tính chúng là test đạt.
- Validation đổi ngôn ngữ: thực nghiệm dùng cấu hình tiếng Anh mặc định; harness kiểm tra đúng trường và không tạo dữ liệu, không chỉ dựa vào HTTP status.

## Demo

Chạy `node demo_3_luong.mjs` để tạo chủ nuôi → tìm hồ sơ → thêm thú nuôi → thêm lượt khám ngày mai. Đọc `ownerId`, `petId`, `ownerName` trong JSON để mở hồ sơ trực tiếp. Dữ liệu mất sau reset; dùng HTML/log tương ứng run ID để đối chiếu kết quả đã lưu.
