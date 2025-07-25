# 🚀 การ Deploy บน Firebase (Free Plan)

## เตรียมโปรเจค

### 1. ติดตั้ง Dependencies เพิ่มเติม
```bash
npm install --save-dev terser
```

### 2. สร้างไอคอน PWA
สร้างไฟล์ไอคอนในโฟลเดอร์ `client/public/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `favicon.ico`

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
```

## Deploy Steps

### 1. Build โปรเจค
```bash
npm run build
```

### 2. Deploy Database Rules
```bash
npm run deploy:rules
```

### 3. Deploy Hosting
```bash
npm run deploy:hosting
```

## การ Monitor Performance

### 1. ตรวจสอบ Bundle Size
```bash
npm run analyze
```

### 2. ทดสอบ PWA
```bash
npm run lighthouse
```

## การปรับแต่งสำหรับ Free Plan

### Firebase Quotas (Free Spark Plan):
- **Realtime Database**: 1GB stored, 10GB/month transfer
- **Hosting**: 10GB storage, 360MB/day transfer  
- **Authentication**: 50,000 MAU

### การลด Data Usage:
1. จำกัด Activities เก็บไว้แค่ 50 รายการล่าสุด
2. ใช้ Cache เพื่อลด API calls
3. Compress images และ assets
4. ใช้ CDN caching headers

### PWA Features:
- ✅ Offline support with Service Worker
- ✅ Install prompt สำหรับ mobile
- ✅ Push notifications (ไม่ใช้ FCM quota)
- ✅ Background sync
- ✅ App-like experience

## Security Best Practices

### Firebase Security Rules:
- Validate ข้อมูลทุกชิ้นก่อนบันทึก
- จำกัด read/write permissions
- Rate limiting built-in

### Frontend Security:
- API keys ปลอดภัยสำหรับ client-side
- No sensitive data in localStorage
- CSP headers จาก Firebase Hosting

## การ Monitor Usage

1. **Firebase Console**: ตรวจสอบ usage quotas
2. **Google Analytics**: ติดตาม user behavior (ฟรี)
3. **Browser DevTools**: Performance monitoring

## Troubleshooting

### ถ้า Bundle Size ใหญ่เกินไป:
```bash
# ลบ dependencies ที่ไม่จำเป็น
npm remove unused-package

# ใช้ dynamic imports
const Component = lazy(() => import('./Component'));
```

### ถ้า Firebase Quota เกิน:
1. ตรวจสอบ database rules
2. ใช้ pagination สำหรับ activities
3. Implement data cleanup script

### PWA ไม่ทำงาน:
1. ตรวจสอบ HTTPS (required)
2. Validate manifest.json
3. Check service worker registration

---

**หมายเหตุ**: การตั้งค่านี้เหมาะสำหรับ Firebase Free Plan และจะทำงานได้ดีกับผู้ใช้ประมาณ 100-500 คนต่อเดือน
