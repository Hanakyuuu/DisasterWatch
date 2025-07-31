// ... All your existing imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { db } from '../DisasterWatch/src/lib/firebase-admin.js';
import nodemailer from 'nodemailer';
import fs from 'fs';

if (process.env.CI !== 'true') {
  const envPaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env')
  ];
  const envPath = envPaths.find(p => fs.existsSync(p));
  if (envPath) dotenv.config({ path: envPath });
}

console.log('Loaded Firebase credentials:', {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKeyPresent: !!process.env.FIREBASE_PRIVATE_KEY
});

process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Nearby city mapping
const nearbyCities = {
  Yangon: ['Twin Hills','North Dagon', 'Insein', 'Hmawbi', 'Hlegu', 'Thanlyin', 'Bago'],
  Mandalay: ['Pyin Oo Lwin', 'Amarapura', 'Myitnge'],
  Bago: ['Yangon', 'Taungoo', 'Waw'],
  Naypyidaw: ['Pyinmana', 'Lewe'],
  // Add more as needed
};

function normalize(str) {
  return str.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9\s]/gi, '').trim();
}

function shouldNotifyUser(userLocation, quakePlace) {
  const normUser = normalize(userLocation);
  const normQuake = normalize(quakePlace);

  if (normQuake.includes(normUser) || normUser.includes(normQuake)) return true;

  const nearby = nearbyCities[userLocation] || [];
  return nearby.some(city => {
    const normCity = normalize(city);
    return normQuake.includes(normCity) || normCity.includes(normQuake);
  });
}

async function checkEarthquakes() {
  try {
    console.log('Checking earthquakes at', new Date().toISOString());

    const now = new Date();
    const past = new Date(now.getTime() - 15 * 60 * 1000);
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${past.toISOString()}&endtime=${now.toISOString()}&minmagnitude=1`;

    console.log('Fetching earthquake data from:', url);
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Failed to fetch earthquakes: ${response.status} ${response.statusText}`);

    const data = await response.json();
    const quakes = data?.features || [];
    console.log(`Found ${quakes.length} earthquakes in time period`);
    quakes.forEach(q => console.log(`- ${q.properties.mag} magnitude at ${q.properties.place}`));

    const usersSnapshot = await db.collection('user')
      .where('notificationEnabled', '==', true)
      .get();

    if (!usersSnapshot?.docs?.length) {
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
      const { email, location, minMagnitude = 1 } = userData || {};
      if (!email || !location) continue;

      console.log(`Checking user ${email} in ${location} (min mag: ${minMagnitude})`);

      const relevantQuakes = quakes.filter(quake => {
        const magOk = quake.properties.mag >= minMagnitude;
        const locOk = shouldNotifyUser(location, quake.properties.place);
        return magOk && locOk;
      });

      if (relevantQuakes.length > 0) {
        try {
          console.log(`Sending alert for ${relevantQuakes.length} quakes to ${email}`);
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
      } else {
        console.log(`No matching quakes for user ${email}`);
      }
    }
  } catch (error) {
    console.error('Error in checkEarthquakes:', error.message);
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
          Time (MMT): ${new Date(quake.properties.time).toLocaleString('en-US', {
            timeZone: 'Asia/Yangon',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })}
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
