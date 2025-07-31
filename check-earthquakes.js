import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../DisasterWatch/src/lib/firebase-admin.js';
import nodemailer from 'nodemailer';
import fs from 'fs';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try multiple possible env file locations
const envPaths = [
  path.join(__dirname, '..', '.env.local'),
  path.join(__dirname, '..', '.env'),
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env')
];

// Find the first existing env file
const envPath = envPaths.find(p => fs.existsSync(p));

if (!envPath) {
  console.error('No environment file found. Tried:', envPaths);
  process.exit(1);
}

console.log('Using environment file:', envPath);
dotenv.config({ path: envPath });

// Verify environment variables
console.log('Environment variables:', {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? '✔️' : '❌',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '✔️' : '❌',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? '✔️' : '❌',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? '✔️' : '❌'
});

// Rest of your code...
async function checkEarthquakes() {
  try {
// DEBUG: Show current directory and env file loading
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('Running from:', __dirname);

// Load environment
const envPath = new URL('../.env.local', import.meta.url).pathname;
// For Windows, remove leading slash if needed
const normalizedPath = envPath.startsWith('/') ? envPath.slice(1) : envPath; 
dotenv.config({ path: normalizedPath });
// DEBUG: Show loaded values
console.log({
  projectId: process.env.FIREBASE_PROJECT_ID?.substring(0, 3) + '...',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.substring(0, 3) + '...',
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 10) + '...'
});

    console.log('Checking earthquakes at', new Date().toISOString());
    
    // Get quakes from last 15 mins
    const now = new Date();
    const past = new Date(now.getTime() - 15 * 60 * 1000);
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${past.toISOString()}&endtime=${now.toISOString()}&minmagnitude=3`;
    
    const response = await fetch(url);
    const { features: quakes } = await response.json();

    // Get users with notifications enabled
    const usersSnapshot = await db.collection('user')
      .where('notificationEnabled', '==', true)
      .get();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'crisiscompanion2025@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    for (const doc of usersSnapshot.docs) {
      const { email, location, minMagnitude = 4 } = doc.data();
      if (!email || !location) continue;

      const relevantQuakes = quakes.filter(quake => 
        quake.properties.mag >= minMagnitude && 
        quake.properties.place.toLowerCase().includes(location.toLowerCase())
      );

      if (relevantQuakes.length > 0) {
        await transporter.sendMail({
          from: '"Crisis Companion" <crisiscompanion2025@gmail.com>',
          to: email,
          subject: `⚠️ ${relevantQuakes.length} New Earthquake(s) Near ${location}`,
          html: generateEmail(relevantQuakes)
        });
        console.log(`Alert sent to ${email}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

function generateEmail(quakes) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #d32f2f;">⚠️ Earthquake Alert</h2>
      ${quakes.map(quake => `
        <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid #ff9800;">
          <strong>Magnitude ${quake.properties.mag}</strong><br>
          Location: ${quake.properties.place}<br>
          Time: ${new Date(quake.properties.time).toUTCString()}
        </div>
      `).join('')}
      <p><small>To unsubscribe, update your settings in the app.</small></p>
    </div>
  `;
}

// Execute
checkEarthquakes();