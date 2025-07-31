import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { db } from '../DisasterWatch/src/lib/firebase-admin.js';
import nodemailer from 'nodemailer';
import fs from 'fs';

// Get current directory


// Debug directory structure
console.log('Current directory:', __dirname);
console.log('Directory contents:', fs.readdirSync(__dirname));

// In GitHub Actions, we won't have .env files - use environment variables directly
if (process.env.CI !== 'true') {
  // Try multiple possible env file locations for local development
  const envPaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env')
  ];

  // Find the first existing env file
  const envPath = envPaths.find(p => fs.existsSync(p));

  if (envPath) {
    console.log('Using environment file:', envPath);
    dotenv.config({ path: envPath });
  }
}

// Verify environment variables
console.log('Loaded Firebase credentials:', {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKeyPresent: !!process.env.FIREBASE_PRIVATE_KEY
});

// Ensure private key has proper newline characters
privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')


async function checkEarthquakes() {
  try {
    console.log('Checking earthquakes at', new Date().toISOString());
    
    // Get quakes from last 15 mins
    const now = new Date();
    const past = new Date(now.getTime() - 15 * 60 * 1000);
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${past.toISOString()}&endtime=${now.toISOString()}&minmagnitude=3`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch earthquakes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data || !data.features) {
      throw new Error('Invalid earthquake data received');
    }
    const quakes = data.features;

    // Get users with notifications enabled
    const usersSnapshot = await db.collection('user')
      .where('notificationEnabled', '==', true)
      .get();

    if (!usersSnapshot || !usersSnapshot.docs) {
      console.log('No users with notifications enabled found');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'crisiscompanion2025@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      if (!userData) continue;
      
      const { email, location, minMagnitude = 4 } = userData;
      if (!email || !location) continue;

      const relevantQuakes = quakes.filter(quake => 
        quake.properties.mag >= minMagnitude && 
        quake.properties.place.toLowerCase().includes(location.toLowerCase())
      );

      if (relevantQuakes.length > 0) {
        try {
          await transporter.sendMail({
            from: '"Crisis Companion" <crisiscompanion2025@gmail.com>',
            to: email,
            subject: `⚠️ ${relevantQuakes.length} New Earthquake(s) Near ${location}`,
            html: generateEmail(relevantQuakes)
          });
          console.log(`Alert sent to ${email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error in checkEarthquakes:', error.message);
    // Rethrow to ensure the error is visible in GitHub Actions
    throw error;
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

// Execute with error handling
checkEarthquakes().catch(error => {
  console.error('Unhandled error in main execution:', error);
  process.exit(1);
});