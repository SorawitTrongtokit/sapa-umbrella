# 🔒 Firebase Database Rules สำหรับระบบยืม-คืนร่ม

## 📋 โครงสร้าง Rules

### 🎯 หลักการความปลอดภัย
1. **อ่านได้ทุกคน** - ดูสถานะร่มได้โดยไม่ต้อง login
2. **เขียนแบบจำกัด** - นักเรียนยืม-คืนได้, Admin ทำได้ทุกอย่าง
3. **ตรวจสอบข้อมูล** - validate format และ logic
4. **ป้องกัน spam** - จำกัด timestamp และ rate limit

## 🛡️ Umbrellas Collection Rules

### การอ่านข้อมูล (Read)
```json
".read": true
```
- ✅ **ทุกคนอ่านได้** เพื่อดูสถานะร่มแบบ real-time
- 🎯 เหมาะสำหรับหน้าแรกที่แสดงสถานะทั้งหมด

### การเขียนข้อมูล (Write)
```json
".write": "auth != null"
```
- ✅ **Admin เขียนได้ทุกอย่าง** (มี authentication)
- ❌ **นักเรียนเขียนไม่ได้** ต้องผ่าน rule ของแต่ละร่ม

### การเขียนข้อมูลร่มแต่ละคัน
```json
".write": "auth != null || (ตรวจสอบเงื่อนไข)"
```

**เงื่อนไขสำหรับนักเรียน:**
1. **หมายเลขร่มถูกต้อง** (1-21 เท่านั้น)
2. **สถานะถูกต้อง** (borrowed หรือ available)
3. **ID ตรงกับ path** ($umbrellaId)
4. **มีข้อมูลครบ** (id, status, currentLocation)

### การตรวจสอบข้อมูล (Validation)
```json
".validate": "เงื่อนไขซับซ้อน"
```

**สำหรับร่มว่าง (available):**
- ✅ ไม่มีข้อมูล borrower
- ✅ สถานะ = "available"
- ✅ ตำแหน่งถูกต้อง (ใต้โดม/ศูนย์กีฬา/โรงอาหาร)

**สำหรับร่มที่ถูกยืม (borrowed):**
- ✅ มีข้อมูล borrower ครบ (nickname, phone, timestamp)
- ✅ เบอร์โทร 10 หลัก
- ✅ ชื่อเล่นไม่ว่าง
- ✅ timestamp มากกว่า 0

## 📊 Activities Collection Rules

### การอ่านข้อมูล (Read)
```json
".read": true
```
- ✅ **ทุกคนอ่านได้** เพื่อดูประวัติการใช้งาน

### การเขียนข้อมูล (Write)
```json
".write": "auth != null || (เงื่อนไขนักเรียน)"
```

**เงื่อนไขสำหรับนักเรียน:**
1. **ข้อมูลครบถ้วน** (type, umbrellaId, location, timestamp)
2. **ประเภทถูกต้อง** (borrow หรือ return เท่านั้น)
3. **หมายเลขร่มถูกต้อง** (1-21)
4. **ตำแหน่งถูกต้อง**
5. **Timestamp ไม่เก่าเกิน 5 นาที** (ป้องกัน replay attack)

**Admin สามารถ:**
- ✅ เพิ่ม activity ประเภท "admin_update"
- ✅ เขียนได้โดยไม่จำกัดเวลา

### การตรวจสอบข้อมูล (Validation)
```json
".validate": "เงื่อนไขเพิ่มเติม"
```
- ✅ **Timestamp ไม่อนาคต** (ไม่เกิน 1 นาที)
- ✅ **ข้อมูลมีครบทุก field**
- ✅ **Format ถูกต้องทั้งหมด**

## 🚀 การ Deploy Rules

### 1. ผ่าน Firebase Console
```bash
# ไปที่ Firebase Console > Database > Rules
# Copy-paste rule จาก firebase-rules.json
# กด Publish
```

### 2. ผ่าน Firebase CLI
```bash
# ติดตั้ง Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only database
# หรือ
npm run deploy:rules
```

## 🔍 การทดสอบ Rules

### ทดสอบในโหมด Development
```javascript
// ทดสอบอ่านข้อมูล (ควรสำเร็จ)
firebase.database().ref('umbrellas').once('value')

// ทดสอบเขียนโดยไม่ login (ควรล้มเหลว)
firebase.database().ref('umbrellas/1').set({invalid: true})

// ทดสอบเขียนข้อมูลถูกต้อง (ควรสำเร็จ)
firebase.database().ref('umbrellas/1').set({
  id: 1,
  status: 'borrowed',
  currentLocation: 'ใต้โดม',
  borrower: {
    nickname: 'ทดสอบ',
    phone: '0123456789',
    timestamp: Date.now()
  }
})
```

## 📈 ประสิทธิภาพและค่าใช้จ่าย

### การลด Bandwidth
- **จำกัด activities** เหลือ 50 รายการล่าสุด
- **Cache ที่ client** ลด request ซ้ำ
- **Indexed queries** เร็วและประหยัด

### Security Benefits
- 🔒 **ป้องกัน SQL Injection** (NoSQL = ปลอดภัย)
- 🔒 **ป้องกัน Data Manipulation** 
- 🔒 **Rate Limiting** ผ่าน timestamp check
- 🔒 **Input Validation** แบบเข้มงวด

## ⚠️ สิ่งที่ควรระวัง

### 1. การแก้ไข Rules
```bash
# อย่าลืม backup rules เก่า
# ทดสอบใน development ก่อน
# Deploy ช่วงที่ไม่มีคนใช้งาน
```

### 2. การ Monitor
```bash
# ดู Usage ใน Firebase Console
# ตรวจสอบ Error logs
# Monitor Performance
```

### 3. Emergency Access
```bash
# สร้าง admin user สำรอง
# เก็บ service account key ไว้
# ระบุใครเป็น super admin
```

---

## 🎯 สรุป: Rules นี้ให้ความปลอดภัยระดับ Production

✅ **นักเรียนยืม-คืนได้** แต่ไม่สามารถแก้ไขข้อมูลผิดๆ  
✅ **Admin ทำได้ทุกอย่าง** ผ่าน authentication  
✅ **ข้อมูลถูก validate** ป้องกัน bad data  
✅ **ป้องกัน spam** ด้วย timestamp check  
✅ **เหมาะสำหรับโรงเรียน** 800 คน ใช้งานปลอดภัย
