import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  //apiKey: "..", add your own details here
  //authDomain: "..", add your own details here
  //projectId: "..", add your own details here
  //storageBucket: "..", add your own details here
  //messagingSenderId: "..", add your own details here
  //appId: "..", add your own details here
  //measurementId: ".." add your own details here
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  // Initialize Firestore
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  console.warn("App will run in offline mode (using LocalStorage).");
}

export { app, db };
