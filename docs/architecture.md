# Kiến trúc và luồng dữ liệu

```mermaid
flowchart TB
  QA[Nhân viên phòng khám / harness HTTP] --> Web
  subgraph App[Container ứng dụng Java — Spring Boot]
    Web[Spring MVC + form Thymeleaf]
    Web --> OwnerC[OwnerController]
    Web --> PetC[PetController]
    Web --> VisitC[VisitController]
    OwnerC --> Validation[Bean Validation / BindingResult]
    PetC --> PetV[PetValidator + quy tắc tên và ngày sinh]
    VisitC --> VisitV[Bean Validation + ngày sau hôm nay]
    Validation --> Repository[OwnerRepository / Spring Data JPA]
    PetV --> Repository
    VisitV --> Repository
    PetC --> Types[PetTypeRepository]
    Repository --> Entities[Owner → Pet → Visit]
  end
  Entities --> H2[(H2 in-memory trong cùng JVM)]
  Types --> H2
  Repository --> Web
  Web --> QA
```

Đây là kiến trúc một ứng dụng, không phải nhiều microservice. H2 chạy trong JVM của ứng dụng; khối H2 biểu diễn nơi lưu trữ logic. Các controller gọi repository trực tiếp. Template nhận model để dựng form lỗi hoặc trang chi tiết.

```mermaid
sequenceDiagram
  participant H as Harness
  participant C as Controller
  participant V as Validation
  participant R as OwnerRepository
  participant D as H2
  H->>C: POST form
  C->>V: bind và kiểm tra dữ liệu/quy tắc
  alt Không hợp lệ
    V-->>C: BindingResult có lỗi
    C-->>H: HTTP 200 + form lỗi đúng trường
    H->>C: GET tìm kiếm/hồ sơ
    C-->>H: Xác nhận không có bản ghi ngoài ý muốn
  else Hợp lệ
    C->>R: save hoặc saveAndFlush(owner)
    R->>D: Lưu cây entity theo cascade
    C-->>H: HTTP 302 Location hồ sơ
    H->>C: GET hồ sơ
    C->>R: findById
    R->>D: Đọc dữ liệu
    C-->>H: HTTP 200 + dữ liệu đã lưu
  end
```

Đối chiếu từng module và URL trong [phân tích hệ thống](system-analysis.md). Sơ đồ phản ánh mã nguồn đã pin trong [phiên bản](version.md); chức năng lịch hẹn/bệnh án chưa commit ở workspace khác không thuộc sơ đồ này.
