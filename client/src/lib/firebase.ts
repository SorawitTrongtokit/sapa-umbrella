import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { getDatabase, ref, set, push, onValue, off, get, update } from "firebase/database";
import { UserProfile, UserRegistration, AdminUserUpdate } from "../../../shared/schema";
import { encryptPassword, decryptPassword } from "./encryption";

const firebaseConfig = {
  apiKey: "AIzaSyCKrI6yFRoRW9QlYQY9VxMe0DxC1yTEusw",
  authDomain: "umbrella-system-e0ae7.firebaseapp.com",
  databaseURL: "https://umbrella-system-e0ae7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "umbrella-system-e0ae7",
  storageBucket: "umbrella-system-e0ae7.firebasestorage.app",
  messagingSenderId: "644775621893",
  appId: "1:644775621893:web:76175ce428a8d99550336c",
  measurementId: "G-4J12KF1H0B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Authentication functions
export const adminLogin = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const adminLogout = async () => {
  return await signOut(auth);
};

// User authentication functions
export const userLogin = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const userRegister = async (userData: UserRegistration) => {
  // Create user account
  const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
  const user = userCredential.user;
  
  // Encrypt password for storage
  const encryptedPassword = encryptPassword(userData.password);
  
  // Save user profile to database with encrypted password
  const userProfile: UserProfile = {
    uid: user.uid,
    firstName: userData.firstName,
    lastName: userData.lastName,
    grade: userData.grade,
    studentNumber: userData.studentNumber,
    phone: userData.phone,
    email: userData.email,
    role: 'user',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    encryptedPassword: encryptedPassword
  };
  
  await set(ref(database, `users/${user.uid}`), userProfile);
  return userCredential;
};

export const userLogout = async () => {
  return await signOut(auth);
};

// Reset password
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// Owner/Admin functions for user management
export const getAllUsers = async (): Promise<UserProfile[]> => {
  return new Promise((resolve, reject) => {
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const users = Object.values(usersData) as UserProfile[];
        resolve(users);
      } else {
        resolve([]);
      }
    }, { onlyOnce: true });
  });
};

export const updateUserProfile = async (uid: string, userData: AdminUserUpdate): Promise<void> => {
  const userRef = ref(database, `users/${uid}`);
  const updatedData = {
    ...userData,
    updatedAt: Date.now()
  };
  
  console.log('Firebase update - UID:', uid);
  console.log('Firebase update - Data:', updatedData);
  
  await update(userRef, updatedData);
};

export const deleteUser = async (uid: string): Promise<void> => {
  const userRef = ref(database, `users/${uid}`);
  await set(userRef, null);
};

// Note: Password reset for other users requires Firebase Admin SDK
// This is a workaround using email reset
export const resetUserPassword = async (email: string): Promise<void> => {
  return await sendPasswordResetEmail(auth, email);
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  return new Promise((resolve) => {
    const userRef = ref(database, `users/${uid}`);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      resolve(userData);
    }, { onlyOnce: true });
  });
};

// Database functions
export const updateUmbrella = async (umbrellaId: number, data: any) => {
  const umbrellaRef = ref(database, `umbrellas/${umbrellaId}`);
  return await set(umbrellaRef, data);
};

export const addActivity = async (activity: any) => {
  const activitiesRef = ref(database, 'activities');
  return await push(activitiesRef, activity);
};

export const clearAllActivities = async () => {
  const activitiesRef = ref(database, 'activities');
  return await set(activitiesRef, null);
};

export const subscribeToUmbrellas = (callback: (data: any) => void) => {
  const umbrellasRef = ref(database, 'umbrellas');
  onValue(umbrellasRef, callback);
  return () => off(umbrellasRef, 'value', callback);
};

export const subscribeToActivities = (callback: (data: any) => void, limit = 50) => {
  // Limit activities to reduce bandwidth usage (Firebase free tier consideration)
  const activitiesRef = ref(database, 'activities');
  onValue(activitiesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Sort and limit to last 50 activities to save on data transfer
      const sortedData = Object.entries(data)
        .sort(([, a]: any, [, b]: any) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      callback({ val: () => sortedData });
    } else {
      callback(snapshot);
    }
  });
  return () => off(activitiesRef, 'value');
};

// Initialize umbrella data if not exists
export const initializeUmbrellas = async () => {
  const umbrellasRef = ref(database, 'umbrellas');
  
  for (let i = 1; i <= 21; i++) {
    const umbrellaRef = ref(database, `umbrellas/${i}`);
    let defaultLocation;
    
    if (i >= 1 && i <= 7) defaultLocation = "ใต้โดม";
    else if (i >= 8 && i <= 14) defaultLocation = "ศูนย์กีฬา";
    else defaultLocation = "โรงอาหาร";
    
    const defaultData = {
      id: i,
      status: "available",
      currentLocation: defaultLocation,
      history: []
    };
    
    // Only set if doesn't exist
    onValue(umbrellaRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(umbrellaRef, defaultData);
      }
    }, { onlyOnce: true });
  }
};

// Admin function to set temporary password for a user
export const setTemporaryPassword = async (userUid: string, tempPassword: string): Promise<void> => {
  const userRef = ref(database, `users/${userUid}`);
  const tempPasswordData = {
    temporaryPassword: tempPassword,
    tempPasswordCreated: Date.now(),
    tempPasswordExpires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    requirePasswordChange: true,
    updatedAt: Date.now()
  };
  
  await update(userRef, tempPasswordData);
};

// Get temporary password for a user (Owner only)
export const getTemporaryPassword = async (userUid: string): Promise<string | null> => {
  const userRef = ref(database, `users/${userUid}`);
  const snapshot = await get(userRef);
  
  if (snapshot.exists()) {
    const userData = snapshot.val();
    if (userData.temporaryPassword && userData.tempPasswordExpires > Date.now()) {
      return userData.temporaryPassword;
    }
  }
  
  return null;
};

// Generate random password
export const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Get decrypted password (Owner only)
export const getDecryptedPassword = async (userUid: string): Promise<string | null> => {
  try {
    const userRef = ref(database, `users/${userUid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.encryptedPassword) {
        return decryptPassword(userData.encryptedPassword);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting decrypted password:', error);
    throw new Error('Failed to get password');
  }
};
