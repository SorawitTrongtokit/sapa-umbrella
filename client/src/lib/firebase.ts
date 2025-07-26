import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, Auth } from "firebase/auth";
import { getDatabase, ref, set, push, onValue, off, get, update, Database } from "firebase/database";
import { UserProfile, UserRegistration, AdminUserUpdate } from "../../../shared/schema";
import { encryptPassword, decryptPassword } from "./encryption";

/**
 * Firebase Configuration with Error Handling
 * PCSHSPL Umbrella System
 */

// Default demo configuration for localhost testing
const demoConfig = {
  apiKey: "demo-api-key-for-localhost-testing",
  authDomain: "localhost",
  databaseURL: "http://localhost:9000/?ns=demo-project",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
  measurementId: "G-DEMO123"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || demoConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || demoConfig.authDomain,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || demoConfig.databaseURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || demoConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || demoConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || demoConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || demoConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || demoConfig.measurementId
};

// Check if we're in demo mode
const isDevelopment = import.meta.env.DEV;
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isDemoMode = isDevelopment && isLocalhost;

// Only log in development
if (isDevelopment) {
  console.log('🔧 Firebase Initialization:', {
    mode: isDemoMode ? 'Demo Mode (Safe for Testing)' : 'Production Mode',
    config: {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey
    }
  });
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDatabase: Database | null = null;

// Singleton pattern to prevent duplicate app initialization
function initializeFirebase() {
  if (firebaseApp) {
    console.log('🔄 Firebase already initialized, reusing existing instance');
    return { app: firebaseApp, auth: firebaseAuth, database: firebaseDatabase };
  }

  try {
    // Check if app already exists
    const existingApps = getApps();
    
    if (existingApps.length > 0) {
      console.log('🔄 Using existing Firebase app');
      firebaseApp = getApp();
    } else {
      console.log('🆕 Creating new Firebase app');
      firebaseApp = initializeApp(firebaseConfig);
    }
    
    firebaseAuth = getAuth(firebaseApp);
    firebaseDatabase = getDatabase(firebaseApp);
    
    console.log('✅ Firebase initialized successfully');
    return { app: firebaseApp, auth: firebaseAuth, database: firebaseDatabase };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    
    // Create mock services for development/demo
    console.log('🔄 Creating mock Firebase services for safe testing...');
    
    // Mock auth
    firebaseAuth = {
      currentUser: null,
      onAuthStateChanged: (callback: (user: any) => void) => {
        console.log('🧪 Mock auth state change listener added');
        setTimeout(() => callback(null), 100);
        return () => console.log('🧪 Mock auth listener removed');
      },
      signInWithEmailAndPassword: async (email: string, password: string) => {
        console.log('🧪 Mock login attempt:', email);
        if (email === 'admin@pcshspl.ac.th' && password === 'admin123') {
          return { 
            user: { 
              uid: 'mock-admin-uid', 
              email: 'admin@pcshspl.ac.th',
              emailVerified: true 
            } 
          };
        }
        throw new Error('Invalid credentials');
      },
      createUserWithEmailAndPassword: async (email: string, password: string) => {
        console.log('🧪 Mock registration:', email);
        return { 
          user: { 
            uid: 'mock-user-' + Date.now(), 
            email,
            emailVerified: true 
          } 
        };
      },
      signOut: async () => {
        console.log('🧪 Mock sign out');
        return Promise.resolve();
      },
      sendPasswordResetEmail: async (email: string) => {
        console.log('🧪 Mock password reset for:', email);
        return Promise.resolve();
      },
      updatePassword: async (password: string) => {
        console.log('🧪 Mock password update');
        return Promise.resolve();
      }
    } as any;

    // Mock database
    const mockData: any = {
      users: {},
      umbrellas: {},
      transactions: {},
      analytics: {}
    };

    firebaseDatabase = {
      ref: (path: string) => ({
        push: async (data: any) => {
          console.log('🧪 Mock database push:', path, data);
          const key = 'mock-' + Date.now();
          const pathParts = path.split('/');
          let current = mockData;
          for (const part of pathParts) {
            if (!current[part]) current[part] = {};
            current = current[part];
          }
          current[key] = data;
          return { key };
        },
        set: async (data: any) => {
          console.log('🧪 Mock database set:', path, data);
          const pathParts = path.split('/');
          let current = mockData;
          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!current[part]) current[part] = {};
            current = current[part];
          }
          current[pathParts[pathParts.length - 1]] = data;
          return Promise.resolve();
        },
        update: async (data: any) => {
          console.log('🧪 Mock database update:', path, data);
          return Promise.resolve();
        },
        on: (event: string, callback: (snapshot: any) => void) => {
          console.log('🧪 Mock database listener:', path, event);
          setTimeout(() => {
            const snapshot = {
              val: () => {
                const pathParts = path.split('/');
                let current = mockData;
                for (const part of pathParts) {
                  current = current[part];
                  if (!current) return null;
                }
                return current;
              },
              key: path.split('/').pop(),
              exists: () => true
            };
            callback(snapshot);
          }, 100);
          return () => console.log('🧪 Mock listener removed');
        },
        off: () => {
          console.log('🧪 Mock database off:', path);
        },
        once: async (event: string) => {
          console.log('🧪 Mock database once:', path, event);
          return {
            val: () => null,
            exists: () => false
          };
        },
        get: async () => {
          console.log('🧪 Mock database get:', path);
          return {
            val: () => null,
            exists: () => false
          };
        }
      })
    } as any;

    console.log('✅ Mock Firebase services created for safe testing');
    return { app: null, auth: firebaseAuth, database: firebaseDatabase };
  }
}

// Initialize Firebase on module load
const { app, auth, database } = initializeFirebase();

export { app, auth, database };

// Authentication functions
export const adminLogin = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return await signInWithEmailAndPassword(auth, email, password);
};

export const adminLogout = async () => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return await signOut(auth);
};

// User authentication functions
export const userLogin = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  if (!database) throw new Error('Firebase database not initialized');
  
  try {
    // Try Firebase authentication first
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (firebaseError) {
    // If Firebase auth fails, check for temporary password
    console.log('Firebase auth failed, checking temporary password...');
    
    try {
      // Check public temp login (replace @ and . with _)
      const emailKey = email.replace(/[@.]/g, '_');
      const publicTempRef = ref(database, `public_temp_login/${emailKey}`);
      const tempSnapshot = await get(publicTempRef);
      
      if (tempSnapshot.exists()) {
        const tempData = tempSnapshot.val();
        
        // Check if temporary password exists and is valid
        if (tempData.temporaryPassword && 
            tempData.tempPasswordExpires && 
            tempData.tempPasswordExpires > Date.now() &&
            tempData.temporaryPassword === password) {
          
          console.log('Temporary password login successful');
          
          // Create a mock user credential for temporary login
          return {
            user: {
              uid: tempData.uid,
              email: email,
              emailVerified: true,
              isTemporaryLogin: true,
              requirePasswordChange: tempData.requirePasswordChange || true
            }
          };
        }
      }
    } catch (tempError) {
      console.error('Error checking temporary password:', tempError);
    }
    
    // Neither Firebase auth nor temporary password worked
    throw firebaseError;
  }
};

export const userRegister = async (userData: UserRegistration) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  if (!database) throw new Error('Firebase database not initialized');
  
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
  if (!auth) throw new Error('Firebase auth not initialized');
  return await signOut(auth);
};

// Reset password
export const resetPassword = async (email: string) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return await sendPasswordResetEmail(auth, email);
};

// Owner/Admin functions for user management
export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!database) throw new Error('Firebase database not initialized');
  
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
  if (!database) throw new Error('Firebase database not initialized');
  
  const userRef = ref(database, `users/${uid}`);
  const updatedData = {
    ...userData,
    updatedAt: Date.now()
  };
  
  console.log('Firebase update - UID:', uid);
  console.log('Firebase update - Data:', updatedData);
  
  await update(userRef, updatedData);
};

export const updateUserPassword = async (uid: string, encryptedPassword: string, tempPassword?: string): Promise<void> => {
  if (!database) throw new Error('Firebase database not initialized');
  
  const userRef = ref(database, `users/${uid}`);
  const updateData: any = {
    encryptedPassword,
    lastPasswordReset: new Date().toISOString(),
    updatedAt: Date.now()
  };
  
  if (tempPassword) {
    updateData.tempPassword = tempPassword;
  }
  
  // Debug logging only in development
  if (import.meta.env.DEV) {
    console.log('Password update - UID:', uid);
    console.log('Password update - Data:', updateData);
  }
  
  await update(userRef, updateData);
};

export const deleteUser = async (uid: string): Promise<void> => {
  if (!database) throw new Error('Firebase database not initialized');
  const userRef = ref(database, `users/${uid}`);
  await set(userRef, null);
};

// Note: Password reset for other users requires Firebase Admin SDK
// This is a workaround using email reset
export const resetUserPassword = async (email: string): Promise<void> => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return await sendPasswordResetEmail(auth, email);
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!database) throw new Error('Firebase database not initialized');
  
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
  if (!database) throw new Error('Firebase database not initialized');
  const umbrellaRef = ref(database, `umbrellas/${umbrellaId}`);
  return await set(umbrellaRef, data);
};

export const addActivity = async (activity: any) => {
  if (!database) throw new Error('Firebase database not initialized');
  const activitiesRef = ref(database, 'activities');
  return await push(activitiesRef, activity);
};

export const clearAllActivities = async () => {
  if (!database) throw new Error('Firebase database not initialized');
  const activitiesRef = ref(database, 'activities');
  return await set(activitiesRef, null);
};

export const subscribeToUmbrellas = (callback: (data: any) => void) => {
  if (!database) throw new Error('Firebase database not initialized');
  const umbrellasRef = ref(database, 'umbrellas');
  onValue(umbrellasRef, callback);
  return () => off(umbrellasRef, 'value', callback);
};

export const subscribeToActivities = (callback: (data: any) => void, limit = 50) => {
  if (!database) throw new Error('Firebase database not initialized');
  
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
  if (!database) throw new Error('Firebase database not initialized');
  
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
  if (!database) throw new Error('Firebase database not initialized');
  
  // First get user email
  const userRef = ref(database, `users/${userUid}`);
  const userSnapshot = await get(userRef);
  
  if (!userSnapshot.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userSnapshot.val();
  const userEmail = userData.email;
  
  // Create public temp login entry (replace @ and . with _)
  const emailKey = userEmail.replace(/[@.]/g, '_');
  const publicTempRef = ref(database, `public_temp_login/${emailKey}`);
  
  const tempPasswordData = {
    temporaryPassword: tempPassword,
    tempPasswordCreated: Date.now(),
    tempPasswordExpires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    requirePasswordChange: true,
    updatedAt: Date.now(),
    uid: userUid
  };
  
  // Set in both locations
  await Promise.all([
    update(userRef, tempPasswordData),
    set(publicTempRef, tempPasswordData)
  ]);
};

// Get temporary password for a user (Owner only)
export const getTemporaryPassword = async (userUid: string): Promise<string | null> => {
  if (!database) throw new Error('Firebase database not initialized');
  
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
  if (!database) throw new Error('Firebase database not initialized');
  
  try {
    const userRef = ref(database, `users/${userUid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      // Check if there's an encrypted password
      if (userData.encryptedPassword) {
        try {
          return decryptPassword(userData.encryptedPassword);
        } catch (decryptError) {
          console.warn('Failed to decrypt password, checking for plain text password:', decryptError);
          
          // If decryption fails, check if there's a plain text password to re-encrypt
          if (userData.password) {
            console.log('Found plain text password, re-encrypting...');
            const newEncrypted = encryptPassword(userData.password);
            
            // Update the database with the new encrypted password
            await update(userRef, {
              encryptedPassword: newEncrypted,
              password: null // Remove plain text password
            });
            
            return userData.password;
          }
          
          throw new Error('Unable to decrypt password and no fallback available');
        }
      }
      
      // If no encrypted password but has plain text password, encrypt it
      if (userData.password) {
        console.log('Found plain text password, encrypting for security...');
        const newEncrypted = encryptPassword(userData.password);
        
        await update(userRef, {
          encryptedPassword: newEncrypted,
          password: null // Remove plain text password for security
        });
        
        return userData.password;
      }
      
      // Last resort: check if there's any temporary password
      if (userData.tempPassword) {
        return userData.tempPassword;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting decrypted password:', error);
    throw new Error('Failed to get password');
  }
};

// Utility function to fix all user passwords in the database
export const fixAllUserPasswords = async (): Promise<void> => {
  if (!database) throw new Error('Firebase database not initialized');
  
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      
      for (const [uid, userData] of Object.entries(users) as [string, any][]) {
        const userRef = ref(database, `users/${uid}`);
        
        // If user has plain text password, encrypt it
        if (userData.password && !userData.encryptedPassword) {
          console.log(`Encrypting password for user: ${userData.email}`);
          const encrypted = encryptPassword(userData.password);
          
          await update(userRef, {
            encryptedPassword: encrypted,
            password: null // Remove plain text for security
          });
        }
        
        // If user has encrypted password but can't decrypt, check for issues
        if (userData.encryptedPassword && !userData.password) {
          try {
            decryptPassword(userData.encryptedPassword);
            console.log(`Password encryption OK for user: ${userData.email}`);
          } catch (error) {
            console.warn(`Password encryption issue for user: ${userData.email}`, error);
          }
        }
      }
      
      console.log('✅ Password encryption check completed');
    }
  } catch (error) {
    console.error('Error fixing user passwords:', error);
    throw error;
  }
};

// Reset passwords for users with encryption problems
export const resetProblemUserPasswords = async (): Promise<{ success: boolean; usersFixed: string[] }> => {
  if (!database) throw new Error('Firebase database not initialized');
  
  const usersFixed: string[] = [];
  const problemUsers = [
    { email: 'chonchanok.sop@pccpl.ac.th', newPassword: 'chonchanok123' },
    { email: 'normaluser@pccpl.ac.th', newPassword: 'normaluser123' },
    { email: 'sapa@pccpl.ac.th', newPassword: 'sapa123' }
  ];
  
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      
      for (const [uid, userData] of Object.entries(users) as [string, any][]) {
        const userEmail = userData.email;
        const problemUser = problemUsers.find(u => u.email === userEmail);
        
        if (problemUser) {
          console.log(`🔄 Resetting password for user: ${userEmail}`);
          
          // Create new encrypted password
          const newEncryptedPassword = encryptPassword(problemUser.newPassword);
          
          // Update user data
          const userRef = ref(database, `users/${uid}`);
          await update(userRef, {
            encryptedPassword: newEncryptedPassword,
            password: null, // Remove any plain text password
            tempPassword: problemUser.newPassword, // Store temp password for reference
            lastPasswordReset: new Date().toISOString()
          });
          
          usersFixed.push(userEmail);
          console.log(`✅ Password reset for ${userEmail} - New password: ${problemUser.newPassword}`);
        }
      }
    }
    
    console.log(`🎉 Successfully reset passwords for ${usersFixed.length} users`);
    return { success: true, usersFixed };
    
  } catch (error) {
    console.error('Error resetting problem passwords:', error);
    throw error;
  }
};
