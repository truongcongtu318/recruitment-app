# Hướng Dẫn Triển Khai AWS Enterprise (Zero-Trust Architecture)

**Dự án:** G12 Recruitment Platform (Node.js Backend + Next.js Frontend)
**Mô hình:** Serverless Fargate, Internal ALB, CloudFront VPC Origin, Zero Public IPs.
**Mục tiêu:** Tối ưu chi phí (Không NAT Gateway), bảo mật tuyệt đối (Không ai từ Internet có thể truy cập trực tiếp Backend & DB).

---

## BƯỚC 1: KHỞI TẠO MẠNG LƯỚI (VPC & NETWORKING)
*Đây là nền móng để xây nhà. Tuyệt đối không xài VPC mặc định (Default VPC).*

1. Vào dịch vụ **VPC** -> Nhấn **Create VPC** -> Chọn **VPC and more**.
2. Cấu hình chi tiết:
   - Name tag auto-generation: `g12-vpc-v2`
   - IPv4 CIDR block: `10.0.0.0/16`
   - Number of Availability Zones (AZs): **2**
   - Number of public subnets: **2**
   - Number of private subnets: **2**
   - **NAT gateways ($):** Chọn **None** (Tuyệt đối không dùng để tiết kiệm 30$/tháng).
   - **VPC endpoints:** Chọn **S3 Gateway** (Cái này miễn phí, bắt buộc phải có để Fargate kéo code từ ECR và upload CV lên S3).
3. Nhấn **Create VPC** và chờ nó chạy xong.

---

## BƯỚC 2: TẠO "ĐƯỜNG ỐNG NGẦM" (VPC INTERFACE ENDPOINTS)
*Vì chúng ta đã vứt bỏ NAT Gateway, Fargate nằm trong Private Subnet sẽ bị mù hoàn toàn (không có Internet). Phải đào 4 đường ống ngầm nối thẳng tới các dịch vụ của AWS để kéo code và lấy mật khẩu.*

1. Trong giao diện VPC -> Cột trái chọn **Endpoints** -> Nhấn **Create endpoint**.
2. Bạn phải lặp lại thao tác tạo này **4 lần** cho 4 dịch vụ cực kỳ sống còn sau:
   - `com.amazonaws.ap-southeast-1.ecr.api` (Để chào hỏi lễ tân kho Docker)
   - `com.amazonaws.ap-southeast-1.ecr.dkr` (Ống cống khổng lồ để kéo cục code Docker về)
   - `com.amazonaws.ap-southeast-1.logs` (Để in console.log() ra màn hình CloudWatch)
   - `com.amazonaws.ap-southeast-1.ssm` (Để chui vào hầm chứa mật khẩu Systems Manager)
3. Cấu hình chung cho cả 4 Endpoints:
   - **VPC:** Chọn `g12-vpc-v2`.
   - **Subnets:** Tích chọn 2 cái **Private Subnets**.
   - **Security groups:** Nhấn tạo mới một SG đặt tên là `vpc-endpoint-sg`, cho phép Inbound Type **HTTPS (443)** từ Source `10.0.0.0/16` (Nghĩa là cho phép mọi máy ảo trong VPC được gọi vào ống ngầm này).

---

## BƯỚC 3: XÂY DỰNG 3 LỚP CỬA BẢO VỆ (SECURITY GROUPS)
*Tuyệt đối không xài chung 1 SG cho tất cả. Phải phân tách rạch ròi ông Lễ Tân, ông Đầu Bếp, ông Thủ Kho.*

Vào **EC2** -> **Security Groups** -> Nhấn Create security group.

1. **Cửa 1: Load Balancer (`alb-sg-v2`)**
   - Inbound rules: Type `HTTP (80)` | Source: `0.0.0.0/0` (Cho phép CloudFront kết nối tới).
   
2. **Cửa 2: Backend Fargate (`ecs-sg-v2`)**
   - Inbound rules: Type `Custom TCP (8000)` | Source: Bấm tìm kiếm và chọn đúng cái tên SG **`alb-sg-v2`** vừa tạo.
   *(Nghĩa là: Chỉ có ông Lễ Tân ALB mới được phép mở cửa bước vào gặp ông Đầu Bếp ECS).*

3. **Cửa 3: Database RDS (`rds-sg-v2`)**
   - Inbound rules: Type `PostgreSQL (5432)` | Source: Bấm tìm kiếm và chọn đúng cái tên SG **`ecs-sg-v2`**.
   *(Nghĩa là: Chỉ có ông Đầu Bếp ECS mới được phép chui vào kho nguyên liệu Database).*

---

## BƯỚC 4: TẠO CƠ SỞ DỮ LIỆU (RDS POSTGRESQL)
*Database bắt buộc nằm ở Private Subnet.*

1. Vào **RDS** -> **Databases** -> **Create database**.
2. Standard create -> PostgreSQL -> Free tier.
3. DB instance identifier: `g12-recruitment-db`.
4. Master username: `postgres` | Nhập Master password.
5. Instance configuration: `db.t3.micro`.
6. **Connectivity (Sống còn):**
   - Compute resource: Don't connect to an EC2.
   - VPC: `g12-vpc-v2`.
   - DB Subnet group: Tự động chọn nhóm subnet.
   - **Public access:** Bắt buộc chọn **No** (Hacker sẽ khóc thét vì không thể ddos).
   - VPC security group: Tích chọn **Choose existing** -> Chọn cái **`rds-sg-v2`**. Xóa cái default đi.
7. **Additional configuration (Sống còn phần 2):**
   - Initial database name: Nhập **`postgres`**. (Đừng bỏ trống kẻo mất công sửa lỗi 'database does not exist').
8. Nhấn Create -> Đợi nó tạo xong, copy cái dãy Endpoint (vd: `g12-recru...rds.amazonaws.com`).

---

## BƯỚC 5: TỦ SẮT CHỨA MẬT KHẨU (SSM PARAMETER STORE)
*Không bao giờ để mật khẩu trong code.*

1. Vào **Systems Manager** -> **Parameter Store** -> **Create parameter**.
2. Tạo lần lượt 6 cái Key này (Loại: `SecureString` để mã hóa hoặc `String` đều được):
   - `/g12/recruit/db_host`: (Dán cái Endpoint RDS vừa copy ở Bước 4 vào)
   - `/g12/recruit/db_port`: `5432`
   - `/g12/recruit/db_name`: `postgres`
   - `/g12/recruit/db_user`: `postgres`
   - `/g12/recruit/db_password`: (Mật khẩu bạn gõ ở Bước 4)
   - `/g12/recruit/s3_bucket`: (Tên Bucket S3 chuẩn bị tạo để lưu CV)

---

## BƯỚC 6: PHÂN QUYỀN TRUY CẬP KÉP (IAM ROLES CHO ECS)
*ECS Fargate làm việc cần 2 thẻ căn cước (Roles).*

Vào **IAM** -> **Roles** -> **Create role** -> AWS service -> Elastic Container Service Task.

1. **Thẻ 1: `g12-ecs-task-execution-role-v2` (Cho ông Quản lý Hạ Tầng)**
   - Add Policy có sẵn: `AmazonECSTaskExecutionRolePolicy`.
   - Add Inline Policy (Tự viết) để cấp quyền lấy chìa khóa tủ sắt SSM:
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [{"Effect": "Allow", "Action": ["ssm:GetParameters"], "Resource": "arn:aws:ssm:*:*:parameter/g12/recruit/*"}]
     }
     ```
2. **Thẻ 2: `g12-ecs-task-role-v2` (Cho ông App Node.js)**
   - Trắng trơn, không có policy mặc định.
   - Add Inline Policy (Tự viết) để cấp quyền cho App Node.js nhét CV vào S3:
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [{"Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject"], "Resource": "arn:aws:s3:::tên-s3-lưu-cv-của-bạn/*"}]
     }
     ```

---

## BƯỚC 7: TẠO "LỄ TÂN" CHIA VIỆC (INTERNAL ALB VÀ TARGET GROUP)
*Internal ALB là cổng nối nội bộ, hoàn toàn vô hình trên Internet.*

1. **Vào EC2 -> Target Groups -> Create target group:**
   - Target type: **IP** (Bắt buộc với Fargate `awsvpc`).
   - Name: `g12-ecs-tg-v2`.
   - Protocol & Port: **HTTP | 8000** (Vì code Node.js chạy port 8000).
   - VPC: `g12-vpc-v2`.
   - Health check path: gõ **/api/health** (Code Express.js phải có API này trả về 200). Nhấn Create.

2. **Vào EC2 -> Load Balancers -> Create (Application Load Balancer):**
   - Name: `g12-internal-alb-v2`.
   - Scheme: **Internal** (Bắt buộc! Nó sẽ không có IP Public).
   - VPC: `g12-vpc-v2`.
   - Subnets: Chọn 2 **Private Subnets**. (Phải là Private).
   - Security groups: Xóa default, chọn cái **`alb-sg-v2`** đã tạo ở Bước 3.
   - Listeners: HTTP 80 -> Forward to -> Chọn cái Target Group `g12-ecs-tg-v2` ở trên. Nhấn Create.

---

## BƯỚC 8: VẬN HÀNH NHÀ XƯỞNG (ECS FARGATE)
1. **Vào ECS -> Clusters -> Create Cluster:** Tên `g12-cluster-v2`. Chọn hạ tầng Fargate.
2. **Task Definitions -> Create new task definition:**
   - Name: `g12-backend-task-v2`. Launch type: AWS Fargate.
   - OS: Linux/X86_64. CPU: 1 vCPU. Memory: 2 GB.
   - Task role: Chọn `g12-ecs-task-role-v2`.
   - Task execution role: Chọn `g12-ecs-task-execution-role-v2`.
   - **Container 1:** Name `g12-container-v2` | Dán URI ảnh Docker từ ECR.
   - Container port: **8000** | Protocol: TCP.
   - **Environment variables:**
     - TUYỆT ĐỐI KHÔNG TẠO BIẾN `PORT`.
     - Tạo lần lượt các biến: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `S3_BUCKET`.
     - Dạng Value: Tích sang **ValueFrom** và dán chính xác cái ARN của biến SSM ở Bước 5 vào.
   - Nhấn Create.
3. **Quay lại Cluster -> Tab Services -> Create:**
   - Compute: Fargate. Task def: Chọn cái vừa tạo.
   - Name: `g12-backend-svc-v2`. Desired tasks: 1.
   - **Networking:** VPC `g12-vpc-v2` | Subnets: Chọn 2 **Private Subnets**.
   - **Auto-assign public IP:** Bắt buộc **DISABLED** (Vì đã có VPC Endpoints ở Bước 2 đào hầm rồi).
   - Security Group: Chọn cái **`ecs-sg-v2`**.
   - **Load Balancing:** Chọn Application Load Balancer -> Chọn cái `g12-internal-alb-v2` -> Trỏ container port 8000 vào Target group `g12-ecs-tg-v2`.
   - Nhấn Create. Qua tab Target Group F5 liên tục tới khi báo **1 Healthy 🟢**.

---

## BƯỚC 9: KẾT NỐI HAI THẾ GIỚI (CLOUDFRONT & VPC ORIGIN)
*Đây là bước ma thuật biến hầm kín Private ALB thành Server phục vụ khách toàn cầu.*

1. Tạo một S3 Bucket chứa Frontend: Tên `g12-staticweb-v2`. Để nguyên **Block all public access là ON** (Private tuyệt đối).
2. **Vào CloudFront -> Cột trái chọn VPC origins -> Create:**
   - Origin domain: Xổ ra chọn cái Internal ALB `g12-internal-alb-v2`.
   - Nhấn Create và chờ trạng thái báo Ready. (Đường hầm từ Internet vào hầm đã thông).
3. **CloudFront -> Distributions -> Create Distribution:**
   - Origin domain: Chọn cái S3 Bucket Frontend của bạn.
   - Origin access: Đổi sang **Origin access control settings (recommended)** -> Create new OAC -> Nhấn **Copy policy** *(Mang đoạn policy này dán vào tab Permissions -> Bucket Policy của S3 để cấp thẻ ra vào cho CloudFront).*
   - Default root object: Gõ `index.html`. Nhấn Create.
4. **Mở Distribution vừa tạo -> Tab Origins -> Create origin:**
   - Origin domain: Xổ xuống chọn cái **VPC Origin** bạn làm ở mục 2. Đặt tên là `Backend-VPC-Origin`.
5. **Chuyển sang Tab Behaviors -> Create behavior (Phân luồng cho API):**
   - Path pattern: Gõ **`/api/*`**
   - Origin: Chọn cái `Backend-VPC-Origin`.
   - Viewer protocol policy: Redirect HTTP to HTTPS.
   - Allowed HTTP methods: Chọn dòng cuối `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`.
   - **Cache policy:** Cực kỳ quan trọng, BẮT BUỘC chọn **`CachingDisabled`** (Tuyệt đối không lưu cache cho Data Database).
   - **Origin request policy:** Chọn **`AllViewer`** (Đẩy toàn bộ Cookies, IP, Headers xuống Backend).
   - Nhấn Create.
6. **Bắt lỗi Next.js SPA (Tab Error pages):**
   - Create custom error response -> Bắt mã `403 Forbidden` -> Trả về `/index.html` với mã `200 OK`.
   - Create custom error response -> Bắt mã `404 Not Found` -> Trả về `/index.html` với mã `200 OK`.

---

## BƯỚC 10: XUẤT XƯỞNG FRONTEND (NEXT.JS)
1. Trong source code Next.js, mở file `.env`:
   ```env
   NEXT_PUBLIC_API_URL=/api
   ```
2. Mở file `next.config.ts`:
   ```typescript
   import type { NextConfig } from "next";
   const nextConfig: NextConfig = {
     output: 'export',
     trailingSlash: true,
     images: { unoptimized: true },
   };
   export default nextConfig;
   ```
3. Chạy lệnh: `npm run build`
4. Up ruột của thư mục `out/` vào S3 Bucket Frontend.
5. Lấy link Domain của CloudFront (dạng `d1234abcd.cloudfront.net`) ném lên trình duyệt và TẬN HƯỞNG HỆ THỐNG XỊN NHẤT QUẢ ĐẤT! 🚀
