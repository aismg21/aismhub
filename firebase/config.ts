import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTd0fopHZNsBn7YhbEm7_xfBlWXSU5Kgo",
  authDomain: "aismg-2e343.firebaseapp.com",
  projectId: "aismg-2e343",
  storageBucket: "aismg-2e343.appspot.com",
  messagingSenderId: "796368183141",
  appId: "1:796368183141:web:a2bad920fcc767d8f78b8c",
};

// For debugging locally only
if (process.env.NODE_ENV === "development") {
  console.log("ENV LOADED →", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
}

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
