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
    
    // Extended time window to 45 minutes
    const now = new Date();
    const past = new Date(now.getTime() - 15 * 60 * 1000);
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${past.toISOString()}&endtime=${now.toISOString()}&minmagnitude=1`;
    
    console.log('Fetching earthquake data from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch earthquakes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data || !data.features) {
      throw new Error('Invalid earthquake data received');
    }
    
    const quakes = data.features;
    console.log(`Found ${quakes.length} earthquakes in time period`);
    quakes.forEach(q => console.log(`- ${q.properties.mag} magnitude at ${q.properties.place}`));

    // Get users with notifications enabled
    const usersSnapshot = await db.collection('user')
      .where('notificationEnabled', '==', true)
      .get();

    if (!usersSnapshot || !usersSnapshot.docs) {
      console.log('No users with notifications enabled found');
      return;
    }

    console.log(`Found ${usersSnapshot.docs.length} users with notifications enabled`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'crisiscompanion2025@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  // Enhanced location matching function
    const isLocationMatch = (quakePlace, userLocation) => {
      const normalize = (str) => str.toLowerCase()
        .replace(/[’']/g, "'")       // Normalize apostrophes
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .trim();
      
      const normQuake = normalize(quakePlace);
      const normUser = normalize(userLocation);
      
      // Check if either contains the other
      return normQuake.includes(normUser) || normUser.includes(normQuake);
    };
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      if (!userData) continue;
      
      const { email, location, minMagnitude = 1
        
       } = userData;
      if (!email || !location) continue;

      console.log(`Checking user ${email} in ${location} (min mag: ${minMagnitude})`);
      
       const relevantQuakes = quakes.filter(quake => {
        const magnitudeMatch = quake.properties.mag >= minMagnitude;
        const locationMatch = isLocationMatch(quake.properties.place, location);
        
        if (magnitudeMatch && locationMatch) {
          console.log(`MATCH: ${quake.properties.mag} magnitude at ${quake.properties.place}`);
          console.log(`  (User location: "${location}" found in quake location)`);
          return true;
        }
        
        if (magnitudeMatch && !locationMatch) {
          console.log(`NO LOCATION MATCH: ${quake.properties.mag} at ${quake.properties.place}`);
          console.log(`  (User location: "${location}" not found)`);
        }
        
        return false;
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