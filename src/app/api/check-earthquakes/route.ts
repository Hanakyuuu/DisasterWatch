// app/api/check-earthquakes/route.ts
import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@/services/firebase';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);

const starttime = yesterday.toISOString().split('T')[0]; // e.g. "2025-07-29"
const endtime = now.toISOString().split('T')[0];        // e.g. "2025-07-30"

const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${starttime}&endtime=${endtime}&minmagnitude=3`;

const earthquakeResponse = await fetch(url);
const earthquakeData = await earthquakeResponse.json();


    const fakeEarthquake = {
      type: "Feature",
      properties: {
        mag: 5.5,
        place: '10 km SE of Mandalay, Myanmar',

        time: Date.now(),
        type: "earthquake"
      },
      geometry: {
        type: "Point",
        coordinates: [96.16, 16.85, 10] // Approximate Yangon coords
      },
      id: "fake123"
    };

    earthquakeData.features.unshift(fakeEarthquake); 
    // Get all users with notifications enabled
    const usersQuery = query(
      collection(firestore, 'user'),
      where('notificationEnabled', '==', true)
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'crisiscompanion2025@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let notificationsSent = 0;
    
    // For each user, check if any earthquakes match their location and magnitude preference
    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      if (!user.email || !user.location) continue;
      
      const userMagnitude = user.minMagnitude || 4;
      
      // Filter earthquakes that match user's criteria
      const relevantQuakes = earthquakeData.features.filter((quake: any) => {
        return (
          quake.properties.mag >= userMagnitude &&
          isNearLocation(quake, user.location)
        );
      });
      
      if (relevantQuakes.length > 0) {
        await sendNotificationEmail(transporter, user.email, relevantQuakes);
        notificationsSent++;
      }
    }
     console.log('Total quakes including fake:', earthquakeData.features.length);
    return NextResponse.json({
      success: true,
      usersChecked: usersSnapshot.size,
      notificationsSent,
      message: 'Notification check completed'
    });
    
  } catch (error) {
  if (error instanceof Error) {
    console.error('Notification error:', error.message);
    return NextResponse.json(
      { error: `Failed to check earthquakes: ${error.message}` },
      { status: 500 }
    );
  } else {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: 'Failed to check earthquakes: Unknown error' },
      { status: 500 }
    );
  }
}


}

function isNearLocation(quake: any, userLocation: any) {
  // Implement location comparison logic
  // This could be based on coordinates or city/region names
  // For simplicity, we'll check if the quake's place includes the user's location
  const quakePlace = quake.properties.place.toLowerCase();
  return quakePlace.includes(userLocation.toLowerCase());
}

async function sendNotificationEmail(transporter: any, email: string, quakes: any[]) {
  const mailOptions = {
    from: '"Crisis Companion Alerts" <crisiscompanion2025@gmail.com>',
    to: email,
    subject: `⚠️ Earthquake Alert: ${quakes.length} new event(s) near you`,
    html: buildNotificationEmail(quakes),
  };

  await transporter.sendMail(mailOptions);
}

function buildNotificationEmail(quakes: any[]) {
  let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">⚠️ Earthquake Alert</h2>
      <p>There ${quakes.length === 1 ? 'has been' : 'have been'} ${quakes.length} 
      significant earthquake${quakes.length === 1 ? '' : 's'} near your location:</p>
      <ul style="list-style: none; padding: 0;">
  `;

  quakes.forEach(quake => {
    const props = quake.properties;
    const time = new Date(props.time).toLocaleString();
    html += `
      <li style="margin-bottom: 15px; padding: 15px; background: #fff8e1; border-left: 4px solid #ffa000;">
        <strong>Magnitude ${props.mag}</strong> at ${time}<br>
        Location: ${props.place}<br>
        Depth: ${quake.geometry.coordinates[2]} km
      </li>
    `;
  });

  html += `
      </ul>
      <p style="margin-top: 20px;">
        <a href="https://yourwebsite.com/settings" style="color: #1976d2; text-decoration: none;">
          Adjust your notification settings
        </a>
      </p>
      <p style="font-size: 12px; color: #757575;">
        You're receiving this alert because you've enabled earthquake notifications in Crisis Companion.
      </p>
    </div>
  `;

  return html;
}