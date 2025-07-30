const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Add null checks for environment variables
const firebaseConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
  })
};

// Verify all required vars exist
if (!firebaseConfig.credential.projectId || 
    !firebaseConfig.credential.clientEmail || 
    !firebaseConfig.credential.privateKey) {
  throw new Error('Missing Firebase environment variables');
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { app, db };