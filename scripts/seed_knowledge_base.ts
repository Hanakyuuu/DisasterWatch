// Script to seed Firestore knowledge_base collection with sample Q&A
// Usage: Run with `npx ts-node scripts/seed_knowledge_base.ts`

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const data = [
  {
    question: "what is an earthquake?",
    answer: "An earthquake is the shaking of the surface of the Earth caused by a sudden release of energy.",
    keywords: ["earthquake", "shaking", "energy", "surface"]
  },
  {
    question: "what is a flood?",
    answer: "A flood is an overflow of water that submerges land that is usually dry.",
    keywords: ["flood", "water", "overflow", "land"]
  },
  {
    question: "how to prepare for a hurricane?",
    answer: "To prepare for a hurricane, secure your home, stock emergency supplies, and follow evacuation orders.",
    keywords: ["hurricane", "prepare", "emergency", "evacuation", "supplies"]
  }
];

async function seed() {
  for (const item of data) {
    await addDoc(collection(db, "knowledge_base"), item);
    console.log(`Added: ${item.question}`);
  }
  console.log('Seeding complete.');
}

seed().catch(console.error);
