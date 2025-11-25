import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Securely access configuration via Environment Variables
// This prevents sensitive project details from being committed to GitHub.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

try {
  // We check if the config is valid before initializing
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Missing Firebase Configuration in Environment Variables.");
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  // Initialize Firestore
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  // If config is missing or invalid, we catch the error here.
  // The storageService.ts handles 'undefined' db by falling back to LocalStorage.
  console.warn("Firebase initialization skipped:", error);
  console.info("App running in Offline Mode (LocalStorage only). Configure env vars to enable Firestore.");
}

export { app, db };
