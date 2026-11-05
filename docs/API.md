# เอกสาร API ระบบประเมินบุคลากร (ข้อ 4, 6.9, 6.10)

- Base URL: `http://localhost:3000/api`
- ทุก API (ยกเว้น login) ต้องส่ง header `Authorization: Bearer <token>`
- ทุก API ตอบกลับรูปแบบเดียวกัน

```json
{ "status": "success", "message": "สำเร็จ", "data": { } }
{ "status": "error", "message": "ไม่พบผู้ใช้", "data": null }
```

| HTTP Status | ความหมาย |
|---|---|
| 200 | สำเร็จ |
| 400 | ข้อมูลไม่ครบ / ไม่ถูกต้อง |
| 401 | ยังไม่ได้ login หรือ token ไม่ถูกต้อง (Unauthorized) |
| 403 | ไม่มีสิทธิ์ (บทบาทไม่ตรง หรือยังไม่เปลี่ยนรหัสผ่านครั้งแรก) |
| 404 | ไม่พบข้อมูล / ไม่พบ API (Not Found) |
| 500 | ระบบขัดข้อง |

## วิธีเริ่มยิง API (Postman / Thunder Client)

`http://localhost:3000/api` เป็นแค่ต้นทาง ยิงตรง ๆ จะได้ 404 "ไม่พบ API นี้" ต้องต่อท้ายด้วยชื่อ API เสมอ

1. **Login เอา token**: `POST http://localhost:3000/api/auth/login` → Body → raw → JSON
   ```json
   { "username": "admin", "password": "admin1234" }
   ```
   ได้ `data.token` กลับมา ให้คัดลอกค่านั้น
2. **ใส่ token**: แท็บ Authorization → Type = **Bearer Token** → วาง token (หรือใส่ Header `Authorization` = `Bearer <token>` มีเว้นวรรคหลัง Bearer)
3. **ยิง API ที่ต้องการ** เช่น `GET http://localhost:3000/api/users?role=evaluatee` → 200 ได้รายชื่อผู้รับการประเมิน
4. API ที่ส่งไฟล์ (`/api/self/details`, `/api/evaluate/:id/signature`) ใช้ Body → **form-data** ช่องไฟล์ชื่อ `file` (เลือกชนิดเป็น File)

> emp1 / eva1 ต้องเปลี่ยนรหัสก่อน (`PUT /api/auth/password`) ไม่อย่างนั้นทุก API จะได้ 403 ใช้ token ใหม่ที่ได้จากการเปลี่ยนรหัส
> token มีอายุ 8 ชั่วโมง ถ้าได้ 401 ให้ login ใหม่

## ตัวอย่างละเอียด 4 แบบ (GET / POST / PUT / DELETE)

### 6.1 GET `/api/users?role=evaluatee` — ดูรายชื่อผู้ใช้
- สิทธิ์: admin
- query: `role` (ไม่บังคับ) = `evaluatee` หรือ `evaluator`

```json
{ "status": "success", "message": "สำเร็จ",
  "data": [ { "id": 2, "username": "emp1", "full_name": "สมชาย ใจดี", "role": "evaluatee" } ] }
```

### 6.2 POST `/api/users` — เพิ่มผู้ใช้
- สิทธิ์: admin
- body (JSON):

| ชื่อ | ชนิด | บังคับ | หมายเหตุ |
|---|---|---|---|
| username | string | ✔ | ไม่เกิน 50 ตัว ห้ามซ้ำ |
| password | string | ✔ | อย่างน้อย 8 ตัว |
| full_name | string | ✔ | |
| role | string | ✔ | `evaluatee` หรือ `evaluator` |
| email | string | | ต้องเป็นรูปแบบอีเมล |
| department | string | | |

- สำเร็จ: `{ "status": "success", "message": "เพิ่มผู้ใช้แล้ว", "data": { "id": 6 } }`
- ผิดพลาด: 400 `รูปแบบอีเมลไม่ถูกต้อง`, 400 `ข้อมูลซ้ำกับที่มีอยู่แล้ว`

### 6.3 PUT `/api/users/:id` — แก้ไขผู้ใช้
- สิทธิ์: admin
- path: `id` = รหัสผู้ใช้
- body: `full_name`, `role`, `email`, `department`
- สำเร็จ: `{ "status": "success", "message": "แก้ไขผู้ใช้แล้ว", "data": null }`
- ผิดพลาด: 404 `ไม่พบผู้ใช้`

### 6.4 DELETE `/api/users/:id` — ลบผู้ใช้
- สิทธิ์: admin
- path: `id` = รหัสผู้ใช้ (ลบ admin ไม่ได้)
- สำเร็จ: `{ "status": "success", "message": "ลบผู้ใช้แล้ว", "data": null }`
- ผิดพลาด: 404 `ไม่พบผู้ใช้`

## รายการ API ทั้งหมด

### เข้าสู่ระบบ `/api/auth`
| Method | Path | สิทธิ์ | Parameter |
|---|---|---|---|
| POST | /auth/login | ทุกคน | body: username, password → data: token, user |
| GET | /auth/me | login | - |
| PUT | /auth/me | login | body: full_name, email, department |
| PUT | /auth/password | login | body: old_password, new_password → data: token ใหม่ |

### ผู้ใช้ `/api/users` (admin)
| Method | Path | Parameter |
|---|---|---|
| GET | /users | query: role |
| GET | /users/:id | path: id |
| POST | /users | body: username, password, full_name, role, email, department |
| PUT | /users/:id | path: id, body: full_name, role, email, department |
| PUT | /users/:id/reset-password | path: id, body: password (ผู้ใช้ต้องเปลี่ยนรหัสใหม่ตอนเข้าระบบ) |
| DELETE | /users/:id | path: id |

### รอบ หัวข้อ ตัวชี้วัด (admin)
| Method | Path | Parameter |
|---|---|---|
| GET | /periods | - |
| GET | /periods/:id | path: id → รอบ + topics + indicators |
| POST | /periods | body: name, start_date, end_date |
| PUT | /periods/:id | path: id, body: name, start_date, end_date |
| DELETE | /periods/:id | path: id |
| POST | /topics | body: period_id, name |
| PUT | /topics/:id | path: id, body: name |
| DELETE | /topics/:id | path: id |
| POST | /indicators | body: topic_id, name, detail, weight, score_type (`yesno`/`scale`), evidence |
| PUT | /indicators/:id | path: id, body: name, detail, weight, score_type, evidence |
| DELETE | /indicators/:id | path: id |

### มอบหมายกรรมการ (admin)
| Method | Path | Parameter |
|---|---|---|
| GET | /assignments | query: period_id |
| POST | /assignments | body: period_id, evaluatee_id, evaluator_id, committee_role (`chair`/`member`) |
| DELETE | /assignments/:id | path: id |

### ผู้รับการประเมิน `/api/self` (evaluatee)
| Method | Path | Parameter |
|---|---|---|
| GET | /self/periods | - |
| GET | /self/periods/:id | path: id → ตัวชี้วัด คะแนนตนเอง รายละเอียด ร้อยละความก้าวหน้า ความเห็นกรรมการ |
| PUT | /self/scores | body: indicator_id, score |
| POST | /self/details | form-data: indicator_id, detail, url, file (PDF/PNG/JPG ≤ 5MB) |
| PUT | /self/details/:id | path: id, body: detail, url |
| DELETE | /self/details/:id | path: id |

### กรรมการ `/api/evaluate` (evaluator)
| Method | Path | Parameter |
|---|---|---|
| GET | /evaluate | - |
| GET | /evaluate/:id | path: id (assignment) |
| PUT | /evaluate/:id | บันทึก/แก้ไขร่าง body: scores [{indicator_id, score}], comment |
| POST | /evaluate/:id/signature | form-data: file (PNG/JPG) |
| PUT | /evaluate/:id/confirm | ยืนยันและส่งผล (ต้องมีคะแนนครบ ความเห็น ลายเซ็น) |

### รายงาน ไฟล์ สำรองข้อมูล
| Method | Path | สิทธิ์ | Parameter |
|---|---|---|---|
| GET | /reports/dashboard | admin | - |
| GET | /reports/periods/:id | admin | path: id |
| GET | /reports/result/:periodId/:userId | admin, เจ้าของ, กรรมการที่ได้รับมอบหมาย | path: periodId, userId |
| GET | /files/:name | login | path: name, query: token (ใช้กับลิงก์ดาวน์โหลด) |
| GET | /backup | admin | ดาวน์โหลด backup.json |
| POST | /backup/restore | admin | body: เนื้อหา backup.json |
