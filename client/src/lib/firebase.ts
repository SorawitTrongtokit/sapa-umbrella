import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, ref, set, push, onValue, off } from "firebase/database";

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
