# Phân tích hệ thống R01 — Spring PetClinic

## Mục tiêu và tác nhân

Ứng dụng mẫu quản lý chủ nuôi, thú nuôi, lượt khám và danh sách bác sĩ thú y. Trong phạm vi bài, nhân viên phòng khám nhập thông tin chủ nuôi, thêm thú nuôi, ghi lượt khám và tìm hồ sơ. Đây là vai trò nghiệp vụ khi sử dụng; bản đang kiểm thử không có đăng nhập hay phân quyền theo các vai trò này.

## Cấu trúc và dependency

| Đường dẫn | Vai trò |
|---|---|
| `src/main/java/.../petclinic/owner/` | Controller chủ nuôi/thú nuôi/lượt khám; entity, validator và repository |
| `src/main/java/.../petclinic/vet/` | Danh sách bác sĩ, chuyên môn và repository |
| `src/main/java/.../petclinic/model/` | `BaseEntity`, `NamedEntity`, `Person` dùng chung |
| `src/main/java/.../petclinic/system/` | Trang chủ, trang lỗi, cache và cấu hình web |
| `src/main/resources/templates/` | Form và trang Thymeleaf |
| `src/main/resources/db/` | Schema và seed H2/MySQL/PostgreSQL |
| `src/test/java/` | Bộ test gốc Java, tách biệt bộ HTTP K06 |
| `pairwise_owner/`, `scripts/` | Mô hình và harness kiểm thử của nhóm |

Tiền tố `...` là `org/springframework/samples`. `pom.xml` cố định Spring Boot 4.1.0; dùng Spring MVC, Thymeleaf, Bean Validation, Spring Data JPA/Hibernate, H2 và Maven Wrapper. Dependency MySQL/PostgreSQL có sẵn nhưng bài thực nghiệm dùng H2. Test Java dùng bộ test Spring Boot, JUnit và Testcontainers; Docker chỉ cần cho các test CSDL container.

## Module trong phạm vi

1. **Chủ nuôi:** [OwnerController](../src/main/java/org/springframework/samples/petclinic/owner/OwnerController.java) xử lý tạo, tìm và xem hồ sơ. [Owner](../src/main/java/org/springframework/samples/petclinic/owner/Owner.java) kế thừa [Person](../src/main/java/org/springframework/samples/petclinic/model/Person.java). Tạo mới là mục tiêu Pairwise.
2. **Thú nuôi:** [PetController](../src/main/java/org/springframework/samples/petclinic/owner/PetController.java) dùng [PetValidator](../src/main/java/org/springframework/samples/petclinic/owner/PetValidator.java), kiểm tra tên trùng trong cùng chủ và ngày sinh tương lai.
3. **Lượt khám:** [VisitController](../src/main/java/org/springframework/samples/petclinic/owner/VisitController.java) kiểm tra ngày phải sau hôm nay; [Visit](../src/main/java/org/springframework/samples/petclinic/owner/Visit.java) yêu cầu mô tả không trắng, tối đa 255 ký tự. Không coi luồng này là một hệ thống đặt lịch hẹn riêng.
4. **Lưu trữ:** [OwnerRepository](../src/main/java/org/springframework/samples/petclinic/owner/OwnerRepository.java) kế thừa `JpaRepository`. Quan hệ `Owner → Pet → Visit` dùng cascade. Thêm thú nuôi/lượt khám thông qua lưu chủ nuôi, không có service nghiệp vụ riêng nằm giữa controller và repository trong các luồng này.
5. **Giao diện:** form Thymeleaf phản hồi lỗi validation với HTTP 200; tạo hợp lệ chuyển hướng HTTP 302. HTTP 200 tự nó không chứng minh một ca âm tính đạt.

## Ba luồng dữ liệu và một bước tra cứu

| Luồng | Input | Xử lý và output |
|---|---|---|
| Tạo chủ nuôi | `POST /owners/new`: 5 trường | `@Valid Owner` → `BindingResult` → `owners.save` → redirect `/owners/{id}`; đọc lại hồ sơ để xác nhận |
| Tìm chủ nuôi | `GET /owners?lastName=...` | Repository tìm tiền tố họ, có phân trang; một kết quả chuyển hướng hồ sơ, không có kết quả trả form báo không tìm thấy |
| Thêm thú nuôi | `POST /owners/{id}/pets/new` | Nạp chủ; bind `Pet`; validator + kiểm tra tên trùng/ngày sinh; `saveAndFlush(owner)` → redirect hồ sơ |
| Thêm lượt khám | `POST /owners/{id}/pets/{petId}/visits/new` | Nạp đúng pet thuộc owner; `@Valid Visit` + ngày tương lai; lưu qua owner → redirect hồ sơ |

Các ca HTTP kiểm tra phản hồi form và đọc lại hồ sơ/tìm kiếm để xác nhận tác động lưu trữ qua hành vi ứng dụng. Chúng không truy vấn trực tiếp CSDL.
