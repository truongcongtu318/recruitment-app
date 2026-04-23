# Evidence Pack
- [Evidence Pack](#evidence-pack)
- [1. Cover](#1-cover)
- [2. Data Access Pattern Log](#2-data-access-pattern-log)
- [3. Deployment Evidence](#3-deployment-evidence)
- [4. Working Query Evidence](#4-working-query-evidence)
- [5. Lambda, Textract and Comprehend Evidence](#5-lambda-textract-and-comprehend-evidence)
- [6. VPC and Networking Evidence](#6-vpc-and-networking-evidence)
- [7. Negative Security Test](#7-negative-security-test)

# 1. Cover
- Group number: 12
- Member names
  - Ngô Nguyên Phúc
  - Huỳnh Nguyễn Ngọc Tân
  - Tạ Hoàng Huy
  - Trương Công Tú
  - Trần Quang Minh
  - Nguyễn Minh Hoàng
  - Lý Ngọc Hiếu
  - Nguyễn Vũ Hoàng
  - Võ Văn Tuấn Anh
  - Nguyễn Trúc Quỳnh
- Selected Database: **RDS Postgres / Relational**


# 2. Data Access Pattern Log 
- **Part A** 
  - List of applications for a job (HR dashboard): Fetch all applications with job metadata (title, company) via JOIN, sorted by submission time ( ~20 requests/min at peak )
  - Application submission: Candidate submit a new application with their information, CV reference ( ~10 requests/min )
  - List available jobs (Candidate view): Retrieve all job descriptions, sorted by job creation time ( ~50 requests/min )
  
- **Part B**
  - List available jobs
    - Engine: RDS (PostgreSQL)
    - Paradigm: Relational database
    - Mechanism: Index on `created_at` column to accelerate the default sort order. Without index, Postgres performs a full sequential scan and then sorts in-memory; with the index, Postgres reads rows in pre-sorted order directly from the B-tree index, avoiding an expensive sort step
        ```sql
            SELECT * FROM jobs ORDER BY created_at DESC;
        ```
    - Index: CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

  - List of applications for a job (HR dashboard)
    - Engine: RDS (PostgreSQL)
    - Paradigm: Relational database
    - Mechanism: 
      - Foreign key `job_id` in `applications` table, referencing `id` in `jobs` table. PostgreSQL does not automatically index foreign key columns, so we explicitly create an index: `CREATE INDEX idx_app_job_id ON applications(job_id);` to speed up the JOIN lookup.
      - Using JOIN to fetch job name along with every application record. Without the index on `job_id`, Postgres scans the entire applications table for the JOIN, which is costly as the number of applications grows
        ```sql
            SELECT 
                a.id, 
                a.full_name, 
                a.email, 
                a.submitted_at, 
                a.status,
                j.title as job_title,
                j.company as job_company
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            ORDER BY a.submitted_at DESC
        ```

  - Application Submission (Candidate Submit Application)
    - Engine: RDS (PostgreSQL)
    - Paradigm: Relational database
    - Mechanism: 
      - Foreign key `job_id` in `applications` table, referencing `id` in `jobs` table. Foreign key constraint ensures referential integrity.
      - INSERT operation with RETURNING clause to confirm record insertion. Without foreign key constraint, invalid job_id could be inserted, corrupting data consistency. ACID ensures that the application record is completely written or fully rolled back when an error occurs
        ```sql
            INSERT INTO applications (job_id, full_name, email, phone, experience_summary, cv_s3_key)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        ```

- **Part C: Wrong Paradigm Test**


<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th style="text-align: left;">App type</th>
      <th style="text-align: left;">Data shape</th>
      <th style="text-align: left;">Engine + paradigm</th>
      <th style="text-align: left;">"Wrong-paradigm" test</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Recruitment System</strong></td>
      <td>List of available jobs sorted by created_at DESC; future filtering by location and level via <code>WHERE location = $1 AND level = $2 ORDER BY created_at DESC</code> with 50 requests/min at peak</td>
      <td><strong>RDS PostgreSQL (relational)</strong></td>
      <td>DynamoDB requires every query pattern to be pre-designed as a GSI. While a single GSI (PK=location, SK=level) can serve one fixed filter, any new ad-hoc filter combination (e.g., salary range, job type) requires yet another GSI. RDS PostgreSQL handles this flexibly with composite B-tree indexes — a single <code>CREATE INDEX</code> supports arbitrary multi-column WHERE clauses without redesigning the table schema. Additionally, DynamoDB does not support ORDER BY across partitions, so sorting the full result set by created_at requires a full scan or client-side merge.</td>
    </tr>
    <tr>
      <td><strong>Recruitment System</strong></td>
      <td>List of applications for a job (HR dashboard): Fetch application information along with jobs via foreign key constraint. Using JOIN to fetch all applications for a job including job metadata (title, company), sorted by submitted_at DESC
      </td>
      <td><strong>RDS PostgreSQL (relational)</strong></td>
      <td>DocumentDB does not support JOIN operation. It must embed job information into every application document. When job information is updated, all embedded records must be updated separately, leading time consuming and inconsistency.</td>
    </tr>
    <tr>
      <td><strong>Recruitment System</strong></td>
      <td>Application Submission (Candidate Submit Application): Insert application with foreign key constraint ensuring referential integrity. The RETURNING clause confirms record insertion. Without foreign key constraint, invalid job_id could be inserted, corrupting data consistency.
      </td>
      <td><strong>RDS PostgreSQL (relational)</strong></td>
      <td>NoSQL (DynamoDB) does not support foreign key constraints. Hence, The invalid job_id values can be inserted without validation, corrupting referential integrity. It has to perform two actions: inserting into table and validate, which is complex to implement and costly.</td>
    </tr>
  </tbody>
</table>


# 3. Deployment Evidence 



# 4. Working Query Evidence 


# 5. Lambda, Textract and Comprehend Evidence 


# 6. VPC and Networking Evidence

# 7. Negative Security Test