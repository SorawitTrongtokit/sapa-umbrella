/**
 * Data Cleanup Utility for Firebase Free Tier
 * จำกัดและทำความสะอาดข้อมูลให้อยู่ในขอบเขต Free Plan
 */

import { ref, get, set, push, remove } from 'firebase/database';
import { database } from './firebase';
import { FIREBASE_LIMITS } from './performance-config';

interface CleanupResult {
  activitiesRemoved: number;
  oldLogsRemoved: number;
  totalDataSaved: number;
}

/**
 * ทำความสะอาดข้อมูล Activities เก่า
 * เก็บไว้เฉพาะล่าสุด 50 รายการ
 */
export const cleanupActivities = async (): Promise<number> => {
  if (!database) return 0;

  try {
    const activitiesRef = ref(database, 'activities');
    const snapshot = await get(activitiesRef);
    
    if (!snapshot.exists()) return 0;
    
    const activities = snapshot.val();
    const activityEntries = Object.entries(activities);
    
    // ถ้ามีมากกว่า limit ให้ลบตัวเก่าทิ้ง
    if (activityEntries.length > FIREBASE_LIMITS.database.maxActivities) {
      // เรียงตามเวลา (timestamp)
      activityEntries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      // เก็บเฉพาะจำนวนที่อนุญาต
      const toKeep = activityEntries.slice(0, FIREBASE_LIMITS.database.maxActivities);
      const toRemove = activityEntries.slice(FIREBASE_LIMITS.database.maxActivities);
      
      // สร้าง object ใหม่ที่มีเฉพาะข้อมูลที่เก็บไว้
      const cleanedActivities = Object.fromEntries(toKeep);
      
      // อัพเดท database
      await set(activitiesRef, cleanedActivities);
      
      console.log(`🧹 Cleaned up ${toRemove.length} old activities`);
      return toRemove.length;
    }
    
    return 0;
  } catch (error) {
    console.error('Error cleaning up activities:', error);
    return 0;
  }
};

/**
 * ลบ log ข้อมูลเก่าที่ไม่จำเป็น
 */
export const cleanupLogs = async (): Promise<number> => {
  if (!database) return 0;

  try {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 วันที่แล้ว
    let removedCount = 0;

    // ลบ login attempts เก่า
    const loginsRef = ref(database, 'loginAttempts');
    const loginSnapshot = await get(loginsRef);
    
    if (loginSnapshot.exists()) {
      const logins = loginSnapshot.val();
      const cleanedLogins: any = {};
      
      Object.entries(logins).forEach(([key, value]: [string, any]) => {
        if (value.timestamp > cutoffTime) {
          cleanedLogins[key] = value;
        } else {
          removedCount++;
        }
      });
      
      await set(loginsRef, cleanedLogins);
    }

    console.log(`🧹 Cleaned up ${removedCount} old log entries`);
    return removedCount;
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    return 0;
  }
};

/**
 * ทำความสะอาดข้อมูลผู้ใช้ที่ไม่เคยเข้าใช้
 */
export const cleanupInactiveUsers = async (): Promise<number> => {
  if (!database) return 0;

  try {
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 วันที่แล้ว
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) return 0;
    
    const users = snapshot.val();
    let removedCount = 0;
    
    for (const [uid, userData] of Object.entries(users) as [string, any][]) {
      // ไม่ลบ admin และ owner
      if (userData.role === 'admin' || userData.role === 'owner') continue;
      
      // ลบผู้ใช้ที่ไม่เคยเข้าใช้และสร้างบัญชีมานานแล้ว
      if (!userData.lastLoginAt && userData.createdAt < cutoffTime) {
        await remove(ref(database, `users/${uid}`));
        removedCount++;
      }
    }

    console.log(`🧹 Cleaned up ${removedCount} inactive users`);
    return removedCount;
  } catch (error) {
    console.error('Error cleaning up inactive users:', error);
    return 0;
  }
};

/**
 * ทำความสะอาดทั้งหมด
 */
export const runFullCleanup = async (): Promise<CleanupResult> => {
  console.log('🧹 Starting data cleanup for Firebase Free Tier...');
  
  const result: CleanupResult = {
    activitiesRemoved: 0,
    oldLogsRemoved: 0,
    totalDataSaved: 0,
  };

  try {
    // ทำความสะอาดข้อมูลต่างๆ แบบ parallel
    const [activitiesRemoved, oldLogsRemoved] = await Promise.all([
      cleanupActivities(),
      cleanupLogs(),
    ]);

    result.activitiesRemoved = activitiesRemoved;
    result.oldLogsRemoved = oldLogsRemoved;
    result.totalDataSaved = activitiesRemoved + oldLogsRemoved;

    console.log('🧹 Cleanup completed:', result);
    
    // บันทึกเวลาที่ทำ cleanup ล่าสุด
    if (database) {
      await set(ref(database, 'system/lastCleanup'), Date.now());
    }

    return result;
  } catch (error) {
    console.error('Error during cleanup:', error);
    return result;
  }
};

/**
 * ตรวจสอบว่าควรทำ cleanup หรือไม่
 */
export const shouldRunCleanup = async (): Promise<boolean> => {
  if (!database) return false;

  try {
    const lastCleanupRef = ref(database, 'system/lastCleanup');
    const snapshot = await get(lastCleanupRef);
    
    if (!snapshot.exists()) return true;
    
    const lastCleanup = snapshot.val();
    const timeSinceCleanup = Date.now() - lastCleanup;
    
    // ทำ cleanup ทุก 24 ชั่วโมง
    return timeSinceCleanup > FIREBASE_LIMITS.database.cleanupInterval;
  } catch (error) {
    console.error('Error checking cleanup status:', error);
    return true; // ถ้าเกิดข้อผิดพลาด ให้ทำ cleanup เพื่อความปลอดภัย
  }
};

/**
 * Auto cleanup ที่เรียกเมื่อแอปเริ่มทำงาน
 */
export const autoCleanup = async (): Promise<void> => {
  if (import.meta.env.PROD && await shouldRunCleanup()) {
    // ทำ cleanup แบบ background ไม่บล็อก UI
    setTimeout(async () => {
      try {
        await runFullCleanup();
      } catch (error) {
        console.error('Background cleanup failed:', error);
      }
    }, 5000); // รอ 5 วินาทีหลังจากแอปโหลดเสร็จ
  }
};
