import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('Test Output:', {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 10) + '...'
});