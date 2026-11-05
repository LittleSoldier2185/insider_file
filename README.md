# ระบบประเมินบุคลากร (เฉลยตามเกณฑ์ ปวช. 2569)

โค้ดชุดนี้เขียนใหม่ให้อ่านง่าย: หลังบ้าน Express 5 + MySQL, หน้าบ้าน Vue 3 + Vuetify + Vue Router + Axios
CSS เขียนเองแค่ไฟล์เดียว 11 บรรทัด (ตอนพิมพ์) ที่เหลือใช้ component ของ Vuetify

## วิธีรัน
1. ติดตั้ง Docker Desktop
2. เปิด Terminal ในโฟลเดอร์นี้ แล้วพิมพ์ `docker compose up`
3. เปิดเว็บ http://localhost:5173 (API: http://localhost:3000, phpMyAdmin: http://localhost:8080)

| ชื่อผู้ใช้ | รหัสผ่าน | บทบาท |
|---|---|---|
| admin | admin1234 | ฝ่ายบุคลากร |
| emp1, emp2 | emp12345 | ผู้รับการประเมิน (ต้องเปลี่ยนรหัสครั้งแรก) |
| eva1, eva2 | eva12345 | กรรมการ (ต้องเปลี่ยนรหัสครั้งแรก) |

ทดสอบ: `docker compose exec backend npm test` และ `docker compose exec backend npm run test:api`

## โครงสร้างไฟล์
```
backend/
  server.js        รวม router + จัดการ error
  db.js            เชื่อม MySQL
  auth.js          JWT: createToken, login, allow(role)
  helpers.js       ok(), error(), คิดคะแนน percent()
  upload.js        รับไฟล์ด้วย multer
  schema.sql       8 ตาราง
  seed.js          สร้างตาราง + ข้อมูลตัวอย่าง
  routes/          1 ไฟล์ = 1 กลุ่ม API
  tests/           ทดสอบฟังก์ชันคะแนน และทดสอบ API
frontend/src/
  main.js, App.vue (เมนูตามบทบาท), router.js, api.js (axios + rules)
  components/ScoreSelect.vue  ช่องเลือกคะแนน มี/ไม่มี หรือ 1-4
  pages/           1 ไฟล์ = 1 หน้าจอ
docs/API.md        เอกสาร API
```

## ตรงกับเกณฑ์ข้อไหน
| เกณฑ์ | อยู่ที่ |
|---|---|
| 5.1.1-5.1.4 หัวข้อ วันเปิด-ปิด ตัวชี้วัด มี/ไม่มี สเกล 1-4 | PeriodsPage, CriteriaPage |
| 5.1.5-5.1.7 เพิ่มผู้รับ กรรมการ Reset Password | UsersPage |
| 5.1.8-5.1.9 มอบหมายกรรมการ ประธาน/กรรมการร่วม | AssignPage |
| 5.1.10-5.1.12 สรุปรายกรรมการ/รายผู้รับ สถานะ 3 แบบ ร้อยละการบันทึก | TrackPage |
| 5.1.13, 5.2.8, 5.3.6 รายงานรายบุคคล + Export PDF | ResultPage |
| 5.2.1 บังคับเปลี่ยนรหัสครั้งแรก | PasswordPage + auth.js |
| 5.2.2 ข้อมูลส่วนตัว | ProfilePage |
| 5.2.3-5.2.7, 5.2.9 คะแนนตนเอง รายละเอียดหลายรายการ หลักฐาน ความก้าวหน้า ความเห็นกรรมการ | SelfPage |
| 5.3.1-5.3.10 ให้คะแนน ความเห็น บันทึกร่าง แก้ร่าง ลายเซ็น ยืนยัน | EvaluateListPage, EvaluatePage |
| 6.1-6.12 API | backend/routes + docs/API.md |
| 7.4 / 8.2 Validation | rules ใน api.js + ตรวจซ้ำในทุก route |
| 7.5, 7.1-7.3, 7.6 ทดสอบ | backend/tests |
| 7.10 Responsive | v-row / v-col + เมนูพับได้บนมือถือ |
| 8.1 Dashboard | DashboardPage |
| 8.3 Upload/Download | upload.js, routes/files.js |
| 8.4 Backup & Restore | BackupPage, routes/backup.js |
| 8.5 Reporting | TrackPage, ResultPage |
"# insider_file" 
"# insider_file" 
