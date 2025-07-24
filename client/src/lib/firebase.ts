import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, ref, set, push, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "644775621893",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

// Database functions
export const updateUmbrella = async (umbrellaId: number, data: any) => {
  const umbrellaRef = ref(database, `umbrellas/${umbrellaId}`);
  return await set(umbrellaRef, data);
};

export const addActivity = async (activity: any) => {
  const activitiesRef = ref(database, 'activities');
  return await push(activitiesRef, activity);
};

export const subscribeToUmbrellas = (callback: (data: any) => void) => {
  const umbrellasRef = ref(database, 'umbrellas');
  onValue(umbrellasRef, callback);
  return () => off(umbrellasRef, 'value', callback);
};

export const subscribeToActivities = (callback: (data: any) => void) => {
  const activitiesRef = ref(database, 'activities');
  onValue(activitiesRef, callback);
  return () => off(activitiesRef, 'value', callback);
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
