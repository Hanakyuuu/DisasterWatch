const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');

// Initialize Firebase
const app = initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_CONFIG))
});
const firestore = getFirestore(app);

async function checkEarthquakes() {
  try {
    console.log('Checking earthquakes at', new Date().toISOString());
    
    // Get quakes from last 15 mins
    const now = new Date();
    const past = new Date(now.getTime() - 15 * 60 * 1000);
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${past.toISOString()}&endtime=${now.toISOString()}&minmagnitude=3`;
    
    const response = await fetch(url);
    const { features: quakes } = await response.json();

    // Get users with notifications enabled
    const usersSnapshot = await firestore.collection('user')
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