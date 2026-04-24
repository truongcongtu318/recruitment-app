Mình đã tổng hợp tất cả các nội dung thảo luận thành một tài liệu chuẩn bị thuyết trình hoàn chỉnh. Bạn có thể dùng tài liệu này để ôn tập hoặc in ra làm "phao" khi trả lời câu hỏi của Trainer.

# Tài liệu Chuẩn bị Thuyết trình W3 - Nhóm 12

## 1. Tổng quan Kiến trúc (W3 Architecture)
Hệ thống được thiết kế theo mô hình 3 lớp chuẩn (3-tier Architecture) nhằm đảm bảo tính bảo mật và khả năng mở rộng:
*   **Web Tier:** Next.js App chạy trên Local/ECS (Public).
*   **Application Tier:** Node.js Backend chạy trên ECS Fargate (Private).
*   **Database Tier:** RDS PostgreSQL (Private).
*   **Networking:** VPC với 3 tầng Subnet, sử dụng S3 Gateway Endpoint để tối ưu lưu lượng nội bộ.

---

## 2. Tại sao chọn RDS Postgres? (The "Why")
Đối với hệ thống Tuyển dụng (Recruitment System), chúng em ưu tiên **tính toàn vẹn dữ liệu** và **khả năng truy vấn phức tạp**:
1.  **Quan hệ dữ liệu chặt chẽ:** Jobs, Candidates và Applications có mối liên kết mật thiết. SQL hỗ trợ JOIN giúp lấy dữ liệu nhanh chóng và chính xác.
2.  **Ràng buộc dữ liệu (Constraints):** Sử dụng Foreign Keys để đảm bảo không có dữ liệu rác (ví dụ: ứng tuyển vào một Job không tồn tại).
3.  **Tiêu chuẩn ngành:** PostgreSQL là tiêu chuẩn cho các ứng dụng doanh nghiệp nhờ sự ổn định và hỗ trợ cộng đồng lớn.

---

## 3. So sánh & Đánh đổi (Trade-off: RDS vs. DynamoDB)

| Tiêu chí | RDS Postgres (Relational) | DynamoDB (NoSQL) |
| :--- | :--- | :--- |
| **Điểm mạnh** | Truy vấn linh hoạt (ad-hoc), hỗ trợ JOIN, chuẩn ACID tuyệt đối. | Tốc độ cực cao (ms), quy mô không giới hạn, chi phí serverless. |
| **Điểm yếu** | Khó mở rộng ngang (Scale-out), chi phí instance cố định. | Truy vấn bị hạn chế (phải thiết kế GSI trước), không hỗ trợ JOIN. |
| **Tại sao chọn RDS?** | Vì ứng dụng Recruitment cần các báo cáo phức tạp và tính nhất quán cao. | DynamoDB chỉ phù hợp nếu chúng em có hàng triệu lượt ghi/giây và query cực đơn giản. |

**Kết luận Trade-off:** Chúng em đánh đổi *khả năng mở rộng vô hạn* của DynamoDB để lấy *sự linh hoạt trong truy vấn và tính an toàn dữ liệu* của RDS.

---

## 4. Giải thích Khái niệm Cốt lõi

### ACID Compliance là gì?
Là cam kết bảo vệ dữ liệu của database thông qua 4 tính chất:
*   **A (Atomicity):** Giao dịch thành công tất cả hoặc không có gì.
*   **C (Consistency):** Dữ liệu luôn đúng quy tắc (ví dụ: đúng định dạng, đúng khóa ngoại).
*   **I (Isolation):** Các giao dịch chạy song song không làm nhiễu nhau.
*   **D (Durability):** Dữ liệu đã lưu là vĩnh viễn, kể cả khi sập nguồn.

### S3 Gateway Endpoint để làm gì?
Giúp kết nối từ App Tier đến S3 không phải đi qua Internet Gateway.
*   **Lợi ích:** Tăng bảo mật (traffic không rời khỏi mạng AWS) và tiết kiệm chi phí băng thông internet.

---

## 5. User Flow thực tế & Kịch bản Demo

### Luồng người dùng:
1.  **Candidate:** Tìm Job (Index Scan) -> Nộp đơn (Insert RDS & Upload S3).
2.  **Hệ thống:** S3 Event -> Lambda -> Textract (Đọc chữ) -> Comprehend (Phân tích kỹ năng).
3.  **Admin:** Xem danh sách ứng viên (JOIN Query) -> Xem kết quả AI bóc tách.

### Điểm nhấn khi Demo (Acceptance Criteria):
*   **Tính năng:** Show câu lệnh `SELECT ... JOIN` trả về dữ liệu thực tế.
*   **Bảo mật:** Show hình ảnh DB bị chặn truy cập từ bên ngoài (Negative Test).
*   **Serverless:** Show CloudWatch Logs chứng minh Lambda đã chạy khi có CV mới.

---

## 6. Câu hỏi "Bẫy" thường gặp
*   **Q: Tại sao dùng m7g.large mà không dùng t3.micro cho rẻ?**
    *   *A: Để đảm bảo hiệu năng cho môi trường Production và tận dụng chip Graviton (tiết kiệm điện & hiệu năng cao).*
*   **Q: Nếu mất điện ở một Datacenter, app bạn có sập không?**
    *   *A: Không, vì chúng em đã bật **Multi-AZ**, RDS sẽ tự động failover sang AZ khác trong vài giây.*

---
> [!TIP]
> Hãy giữ thái độ tự tin. Nếu gặp câu hỏi không biết, hãy trả lời theo hướng: *"Đó là một case rất hay, hiện tại kiến trúc của chúng em đang tập trung vào [A], nhưng trong tương lai có thể mở rộng theo hướng [B] mà anh/chị vừa gợi ý."*