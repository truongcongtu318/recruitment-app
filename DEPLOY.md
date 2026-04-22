# Deploy Guide — Recruitment App on AWS

## Architecture
```
Users → CloudFront → S3 (FE)
             ↓
           ALB → ECS Fargate (BE) → RDS PostgreSQL
                                  → S3 (CV uploads)
```

---

## BƯỚC 1 — Tạo S3 Buckets (Console)

### Bucket 1: Frontend static website
1. S3 → Create bucket → tên: `recruit-frontend-<yourname>`
2. Region: `ap-southeast-1`
3. Uncheck "Block all public access" → confirm
4. Vào bucket → Properties → Static website hosting → Enable
   - Index document: `index.html`
5. Vào Permissions → Bucket policy → paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::recruit-frontend-<yourname>/*"
  }]
}
```

### Bucket 2: CV uploads (private)
1. S3 → Create bucket → tên: `recruit-cvs-<yourname>`
2. Region: `ap-southeast-1`
3. Giữ nguyên "Block all public access" → **KHÔNG** uncheck
4. Encryption: Enable SSE-S3

---

## BƯỚC 2 — Tạo RDS PostgreSQL (Console)

1. RDS → Create database → Standard create
2. Engine: PostgreSQL 16
3. Template: **Free tier**
4. DB instance: `db.t3.micro`
5. DB name: `recruitment`
6. Username: `postgres` / đặt password
7. Connectivity:
   - VPC: Default VPC (hoặc VPC bạn tạo)
   - Public access: **No** (private subnet)
   - VPC security group: tạo mới tên `sg-rds`
8. Lưu lại **endpoint** sau khi tạo xong

---

## BƯỚC 3 — Tạo IAM Role cho ECS Task

1. IAM → Roles → Create role
2. Trusted entity: **AWS service** → **Elastic Container Service Task**
3. Attach policies:
   - Tạo inline policy tên `RecruitAppPolicy`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::recruit-cvs-<yourname>/*"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "*"
    }
  ]
}
```
4. Role name: `role-ecs-recruit-task`

> **Đây là điểm quan trọng để present**: container truy cập S3 qua role này, không có access key nào trong code.

---

## BƯỚC 4 — Tạo ECR Repository & Push Docker Image

### 4a. Tạo ECR Repository (Console)
1. Tìm kiếm **ECR** (Elastic Container Registry) trên thanh tìm kiếm AWS Console
2. ECR → Repositories → **Create repository**
3. Visibility: **Private**
4. Repository name: `recruit-backend`
5. Tag immutability: Mutable (đủ cho demo)
6. Encryption: AES-256 (default)
7. Nhấn **Create repository**
8. Lưu lại URI có dạng: `<account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/recruit-backend`

### 4b. Build & Push Image

```bash
# 1. Build image
cd recruitment-app/backend
docker build -t recruit-backend .

# 2. Login ECR — lấy lệnh này thẳng từ console:
# ECR → Repositories → recruit-backend → View push commands → copy lệnh đầu tiên
# Hoặc chạy tay:
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com

# 3. Tag và push
docker tag recruit-backend:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/recruit-backend:latest
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/recruit-backend:latest
```

---

## BƯỚC 5 — Tạo ECS Cluster + Task Definition + Service

### 5a. Tạo Cluster
1. ECS → Clusters → Create cluster
2. Tên: `recruit-cluster`
3. Infrastructure: **AWS Fargate**

### 5b. Tạo Task Definition
1. ECS → Task Definitions → Create
2. Launch type: **Fargate**
3. Task role: `role-ecs-recruit-task`
4. CPU: `0.25 vCPU` / Memory: `0.5 GB`
5. Container:
   - Image URI: `<account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/recruit-backend:latest`
   - Port: `3000`
   - Environment variables:
     ```
     PORT=3000
     DB_HOST=<rds-endpoint>
     DB_PORT=5432
     DB_NAME=recruitment
     DB_USER=postgres
     DB_PASSWORD=<your-password>
     S3_BUCKET=recruit-cvs-<yourname>
     AWS_REGION=ap-southeast-1
     CORS_ORIGIN=https://<cloudfront-domain>
     ```
6. Log configuration: awslogs → log group `/ecs/recruit-backend`

### 5c. Tạo ALB
1. EC2 → Load Balancers → Create → Application Load Balancer
2. Tên: `recruit-alb`
3. Scheme: Internet-facing
4. Listener: HTTP:80
5. Target group: tạo mới → IP type → port 3000 → health check path `/health`

### 5d. Tạo ECS Service
1. Vào cluster → Services → Create
2. Launch type: Fargate
3. Task definition: chọn task vừa tạo
4. Desired tasks: `1`
5. Load balancer: chọn ALB vừa tạo
6. Security group: mở port 3000 từ ALB security group

---

## BƯỚC 6 — Setup CloudFront cho FE

1. CloudFront → Create distribution
2. Origin: chọn S3 bucket frontend (dùng website endpoint)
3. Default cache behavior: Redirect HTTP to HTTPS
4. Lưu lại domain: `xxxx.cloudfront.net`

---

## BƯỚC 7 — Cập nhật FE với API URL

Trong `index.html` và `apply.html`, thêm trước thẻ `</body>`:
```html
<script>window.__API_URL__ = 'http://<alb-dns-name>';</script>
```

Upload lên S3:
```bash
aws s3 sync recruitment-app/frontend/ s3://recruit-frontend-<yourname>/
```

---

## Security Groups Summary

| SG | Inbound | Source |
|---|---|---|
| `sg-alb` | 80, 443 | 0.0.0.0/0 |
| `sg-ecs` | 3000 | sg-alb |
| `sg-rds` | 5432 | sg-ecs |

---

## Demo Script (thứ 6)

```bash
# 1. Chứng minh container dùng IAM role, không có credentials file
aws ecs execute-command --cluster recruit-cluster \
  --task <task-id> --container recruit-backend \
  --command "ls ~/.aws" --interactive
# → Kết quả: No such file or directory ✓

# 2. Chứng minh role có thể upload S3
aws s3 cp test.pdf s3://recruit-cvs-<yourname>/test.pdf
# → upload: test.pdf to s3://... ✓

# 3. Chứng minh identity không có quyền bị từ chối
# Tạo IAM user không có policy → chạy lệnh trên → AccessDenied ✓
```
