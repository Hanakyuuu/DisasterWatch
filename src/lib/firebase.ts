// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Analytics is optional in server-side/SSR

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1gxPh44whPiZraTecv5RJuK3O-qRnQKk",
  authDomain: "crisiscompanion-b48dc.firebaseapp.com",
  databaseURL: "https://crisiscompanion-b48dc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crisiscompanion-b48dc",
  storageBucket: "crisiscompanion-b48dc.appspot.com",
  messagingSenderId: "695344690190",
  appId: "1:695344690190:web:e7cd279eb972814241385f",
  measurementId: "G-J08HHLVD9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const db = getFirestore(app);// const analytics = getAnalytics(app); // Only use in browser

// Initialize Firestore
export { app, database, auth, firestore, db, collection, addDoc };
