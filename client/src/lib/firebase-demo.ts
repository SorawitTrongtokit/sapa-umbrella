import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

/**
 * Firebase Configuration for PCSHSPL Umbrella System
 * 
 * For local development, this uses Firebase emulators
 * For production, this uses real Firebase services
 */

// Demo configuration for localhost testing
const demoConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  databaseURL: "http://localhost:9000/?ns=demo-project",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

// Production configuration (from environment variables)
const prodConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || demoConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || demoConfig.authDomain,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || demoConfig.databaseURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || demoConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || demoConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || demoConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || demoConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Use demo config for localhost testing
const isDevelopment = import.meta.env.DEV;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const useDemo = isDevelopment && isLocalhost;

const firebaseConfig = useDemo ? demoConfig : prodConfig;

console.log('🔧 Firebase Configuration:', {
  mode: useDemo ? 'Demo Mode (Localhost)' : 'Production Mode',
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
let app: any;
let auth: any;
let database: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);

  // Connect to emulators in demo mode
  if (useDemo) {
    console.log('🧪 Connecting to Firebase Emulators for local testing...');
    
    // Connect to Auth emulator
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('✅ Auth emulator connected');
    } catch (error) {
      console.warn('⚠️ Auth emulator not available, using mock auth');
    }

    // Connect to Database emulator
    try {
      connectDatabaseEmulator(database, 'localhost', 9000);
      console.log('✅ Database emulator connected');
    } catch (error) {
      console.warn('⚠️ Database emulator not available, using mock database');
    }
  }

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Fallback: Create mock services for development
  if (isDevelopment) {
    console.log('🔄 Creating mock Firebase services for development...');
    
    // Mock auth service
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback: any) => {
        // Simulate no user logged in
        setTimeout(() => callback(null), 100);
        return () => {}; // unsubscribe function
      },
      signInWithEmailAndPassword: async (email: string, password: string) => {
        console.log('🧪 Mock sign in:', email);
        return { user: { uid: 'mock-user', email } };
      },
      createUserWithEmailAndPassword: async (email: string, password: string) => {
        console.log('🧪 Mock sign up:', email);
        return { user: { uid: 'mock-user', email } };
      },
      signOut: async () => {
        console.log('🧪 Mock sign out');
      }
    };

    // Mock database service
    database = {
      ref: (path: string) => ({
        push: async (data: any) => {
          console.log('🧪 Mock database push:', path, data);
          return { key: 'mock-key' };
        },
        set: async (data: any) => {
          console.log('🧪 Mock database set:', path, data);
        },
        on: (event: string, callback: any) => {
          console.log('🧪 Mock database listener:', path, event);
          // Simulate empty data
          setTimeout(() => callback({ val: () => null }), 100);
        },
        off: () => {
          console.log('🧪 Mock database off:', path);
        },
        once: async (event: string) => {
          console.log('🧪 Mock database once:', path, event);
          return { val: () => null };
        }
      })
    };

    console.log('✅ Mock Firebase services created');
  }
}

export { app, auth, database };
export default app;
