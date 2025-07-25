# 🎓 คู่มือการติดตั้งระบบยืม-คืนร่มสำหรับโรงเรียน

## 📊 ข้อมูลการใช้งาน
- **ผู้ใช้งานประมาณ**: 100 คน/วัน จากนักเรียน 800 คน
- **Firebase Free Plan**: เพียงพอสำหรับการใช้งาน
- **ระบบ**: PWA สามารถติดตั้งเป็น app บนมือถือได้

## 🚀 ขั้นตอนการติดตั้ง

### 1. เตรียมโปรเจค Firebase
```bash
# 1. สร้าง Firebase Project ใหม่
https://console.firebase.google.com/

# 2. เปิดใช้งาน Realtime Database (asia-southeast1)
# 3. เปิดใช้งาน Authentication (Email/Password)
# 4. เปิดใช้งาน Hosting
```

### 2. ติดตั้งและ Build
```bash
# Clone และติดตั้ง dependencies
npm install

# สร้าง environment variables
# สร้างไฟล์ .env ในโฟลเดอร์หลัก
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_APP_ID=your_app_id_here  
VITE_FIREBASE_PROJECT_ID=your_project_id_here

# Build โปรเจค
npm run build

# Deploy ไป Firebase
npm run deploy
```

### 3. ตั้งค่า Database Rules
```bash
# อัพโหลด security rules
npm run deploy:rules
```

### 4. สร้าง Admin User
1. เข้า Firebase Console > Authentication
2. เพิ่มผู้ใช้ใหม่ด้วย Email/Password
3. จดอีเมลและรหัสผ่านไว้สำหรับเข้าหน้า Admin

## 📱 การใช้งานในโรงเรียน

### สำหรับนักเรียน:
1. **เปิดเว็บไซต์** บนมือถือ
2. **ติดตั้ง PWA** (เพิ่มไปหน้าหลัก)
3. **ดูสถานะร่ม** หน้าแรก
4. **ยืมร่ม** เมื่อฝนตก
5. **คืนร่ม** ที่ตำแหน่งเดิม

### สำหรับผู้ดูแล:
1. **เข้าหน้า Admin** (/admin)
2. **ตรวจสอบสถานะ** ร่มทั้งหมด
3. **ดูประวัติการใช้งาน**
4. **บังคับคืนร่ม** เมื่อจำเป็น

## 🎯 คุณสมบัติใหม่ที่เพิ่ม

### ✨ หน้าแรกปรับปรุง:
- **Activity ใหม่สุดข้างบน** จากใหม่ไปเก่า
- **สถิติรายวัน** จำนวนยืมวันนี้
- **อัตราการใช้งาน** % ของร่มที่ถูกยืม
- **เปรียบเทียบกับเมื่อวาน**

### 🔄 หน้าคืนปรับปรุง:
- **ไม่ต้องเลือกสถานที่** คืนที่เดิมอัตโนมัติ
- **แสดงข้อมูลชัดเจน** ผู้ยืม เวลา สถานที่
- **UI สวยงาม** ดูง่าย เข้าใจง่าย

### 📱 PWA Features:
- **ติดตั้งได้** เป็น app บนมือถือ
- **ใช้งาน offline** ได้บางส่วน
- **แจ้งเตือน** เมื่อร่มว่าง
- **Cache ข้อมูล** ลดการใช้ internet

## 💰 ค่าใช้จ่าย Firebase Free Plan

### Realtime Database:
- **1GB storage** (เพียงพอ)
- **10GB/month transfer** (เพียงพอสำหรับ 100 คน/วัน)

### Hosting:
- **10GB storage** (เพียงพอ)
- **360MB/day transfer** (เพียงพอ)

### Authentication:
- **50,000 monthly active users** (เพียงพอ)

## 🛡️ ความปลอดภัย
- ✅ Firebase Security Rules ป้องกันข้อมูล
- ✅ Admin authentication
- ✅ Data validation
- ✅ Input sanitization

## 📞 การติดต่อสำหรับช่วยเหลือ
หากมีปัญหาการใช้งาน สามารถ:
1. ตรวจสอบ console ใน browser (F12)
2. ดู Firebase Console > Database/Hosting
3. ตรวจสอบ network connection

---

**🎉 ระบบพร้อมใช้งานสำหรับโรงเรียน 800 คน!**
