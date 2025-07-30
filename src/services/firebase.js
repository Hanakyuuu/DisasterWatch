// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, serverTimestamp,
  query, where, getDocs, orderBy, doc, updateDoc
} from 'firebase/firestore';
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
const db = getFirestore(app); // const analytics = getAnalytics(app); // Only use in browser

// Keyword extraction function
export const extractKeywords = (text) => {
  // Remove punctuation and split
  const words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, '')
    .split(/\s+/);

  const commonWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'what', 'how', 'why', 'when',
    'can', 'you', 'me', 'i', 'for', 'in', 'of', 'to', 'with'
  ]);

  // Extract phrases and important words
  const keywords = new Set();

  // Add 2-word phrases (e.g. "predict earthquakes")
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i+1]}`;
    if (phrase.length > 6 && !commonWords.has(words[i]) && !commonWords.has(words[i+1])) {
      keywords.add(phrase);
    }
  }

  // Add important single words
  words.forEach(word => {
    if (word.length > 3 && !commonWords.has(word)) {
      keywords.add(word);
    }
  });

  return Array.from(keywords).slice(0, 8);
};

// Helper functions for Q&A storage
const checkIfQuestionExists = async (questionText) => {
  const q = query(
    collection(db, "knowledge_base"),
    where("question", "==", questionText)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

const saveQuestionToFirestore = async (qnaItem) => {
  const exists = await checkIfQuestionExists(qnaItem.question);
  if (exists) {
    throw new Error("Question already exists in database");
  }

  const docRef = await addDoc(collection(db, "knowledge_base"), {
    ...qnaItem,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  });
  
  return docRef.id;
};

// Earthquake-related functions
const checkIfEarthquakeExists = async (usgsId) => {
  const q = query(
    collection(db, "earthquakes"),
    where("usgsId", "==", usgsId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

const saveEarthquakeToFirestore = async (earthquakeData) => {
  const exists = await checkIfEarthquakeExists(earthquakeData.usgsId);
  if (exists) {
    throw new Error("Earthquake already exists in database");
  }

  const docRef = await addDoc(collection(db, "earthquakes"), earthquakeData);
  return docRef.id;
};

// Export everything
export { 
  app,
  database,
  auth,
  firestore,
  db,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  saveQuestionToFirestore,
  checkIfQuestionExists,
  saveEarthquakeToFirestore,
  checkIfEarthquakeExists
};