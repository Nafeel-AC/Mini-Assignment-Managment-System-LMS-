// Import the Firebase SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc ,doc,updateDoc} from "firebase/firestore"; // Add these imports
import { getStorage } from "firebase/storage";

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDdmZtBwG3LEOxbBc04Az9TTXCh4Lbta_8",
    authDomain: "lms-mini.firebaseapp.com",
    projectId: "lms-mini",
    storageBucket: "lms-mini.firebasestorage.app",
    messagingSenderId: "354022902764",
    appId: "1:354022902764:web:e775dc3df64ceb3987cec9",
    measurementId: "G-X3VN7JRGVW"
  };

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Optional: Initialize Firebase Storage (if needed for other purposes)
const storage = getStorage(app);

// Export Firebase services and methods
export { app, db, storage, collection, query, where, getDocs, addDoc,doc,updateDoc };
