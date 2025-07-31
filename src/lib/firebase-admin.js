import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '..', '.env.local'); // Adjust path as needed
dotenv.config({ path: envPath });

// Helper function to validate environment variables
function validateFirebaseConfig() {
  const requiredVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing required Firebase environment variables:', missingVars);
    return false;
  }
  return true;
}

// Initialize Firebase
function initializeFirebase() {
  if (!validateFirebaseConfig()) {
    throw new Error('Failed to initialize Firebase due to missing configuration');
  }

  // Format private key (handle both escaped and unescaped newlines)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  try {
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });

    console.log('Firebase initialized successfully');
    return app;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    throw error;
  }
}

// Main initialization
let db;
try {
  const app = initializeFirebase();
  db = getFirestore(app);
} catch (error) {
  console.error('Critical error initializing Firebase Firestore:', error.message);
  process.exit(1); // Exit if we can't initialize Firebase
}

export { db };