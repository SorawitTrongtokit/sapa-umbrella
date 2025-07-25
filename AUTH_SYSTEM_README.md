# ระบบ Authentication - Umbrella Borrowing System

## 🔐 คุณสมบัติใหม่

ระบบยืม-คืนร่มได้เพิ่มระบบ Authentication สำหรับผู้ใช้ทั่วไป โดยมีคุณสมบัติดังนี้:

### ✅ การสมัครสมาชิก (User Registration)
- **ชื่อ** และ **นามสกุล**
- **ชั้น** (เช่น ม.4/1)
- **เลขที่**
- **เบอร์โทรศัพท์** (10 หลัก)
- **อีเมล**
- **รหัสผ่าน** (อย่างน้อย 6 ตัวอักษร)
- **ยืนยันรหัสผ่าน**

### ✅ การเข้าสู่ระบบ (User Login)
- เข้าสู่ระบบด้วย **อีเมล** และ **รหัสผ่าน**
- แสดงข้อผิดพลาดที่เข้าใจง่ายภาษาไทย

### ✅ หน้าโปรไฟล์ผู้ใช้
- แสดงข้อมูลส่วนตัวทั้งหมด
- ปุ่มออกจากระบบ
- ปุ่มแก้ไขข้อมูล (จะพัฒนาต่อในอนาคต)

### ✅ ระบบป้องกัน (Protected Routes)
- ผู้ใช้ต้องเข้าสู่ระบบก่อนใช้งาน
- หน้าหลัก, ยืม, คืน จะต้องผ่านการ Authentication
- หน้า Admin แยกต่างหาก

### ✅ Integration กับฟอร์มยืมร่ม
- ข้อมูลชื่อและเบอร์โทรจะถูกกรอกอัตโนมัติจากโปรไฟล์
- ไม่ต้องกรอกซ้ำทุกครั้ง

## 🗂️ โครงสร้างไฟล์ใหม่

```
client/src/
├── hooks/
│   └── use-user-auth.ts          # Hook สำหรับ User Authentication
├── pages/
│   ├── login.tsx                 # หน้าเข้าสู่ระบบ
│   └── register.tsx              # หน้าสมัครสมาชิก
├── components/
│   ├── protected-route.tsx       # Component สำหรับป้องกัน routes
│   └── user-profile.tsx          # Component แสดงโปรไฟล์ผู้ใช้
└── lib/
    └── firebase.ts (updated)     # เพิ่ม User Auth functions

shared/
└── schema.ts (updated)           # เพิ่ม User schemas
```

## 🔥 Firebase Database Structure

```
users/
  {uid}/
    ├── uid: string
    ├── firstName: string
    ├── lastName: string
    ├── grade: string
    ├── studentNumber: string
    ├── phone: string
    ├── email: string
    ├── role: "user" | "admin"
    ├── createdAt: number
    └── updatedAt: number
```

## 🚀 การใช้งาน

### สำหรับผู้ใช้ทั่วไป
1. เข้า `http://localhost:5173` จะถูกนำไปหน้า Login
2. หากยังไม่มีบัญชี คลิก "สมัครสมาชิก"
3. กรอกข้อมูลครบถ้วนในหน้า Register
4. หลังสมัครสำเร็จ เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
5. ใช้งานระบบยืม-คืนร่มตามปกติ

### สำหรับผู้ดูแลระบบ
- Admin Dashboard ยังคงเข้าได้ที่ `/admin` โดยตรง
- ระบบ Admin แยกจาก User Authentication

## 🔐 ความปลอดภัย

- รหัสผ่านถูกเข้ารหัสโดย Firebase Authentication
- ข้อมูลผู้ใช้ถูกเก็บใน Firebase Realtime Database
- Session management ผ่าน Firebase Auth
- Protected Routes ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต

## 🎯 แผนการพัฒนาต่อไป

- [ ] หน้าแก้ไขโปรไฟล์ผู้ใช้
- [ ] ระบบรีเซ็ตรหัสผ่าน
- [ ] การยืนยันอีเมล
- [ ] ระบบจัดการบทบาทผู้ใช้
- [ ] ประวัติการยืม-คืนของผู้ใช้แต่ละคน
- [ ] ระบบแจ้งเตือนผ่าอีเมล

## 🛠️ วิธีกลับไปเวอร์ชันเดิม

หากต้องการกลับไปใช้เวอร์ชันก่อนมีระบบ Authentication:

```bash
git checkout backup-before-auth-system
```

เวอร์ชันเดิมจะไม่มีระบบ Login/Register และสามารถใช้งานได้ทันที
