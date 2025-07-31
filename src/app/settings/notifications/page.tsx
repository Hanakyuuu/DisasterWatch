// app/settings/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '@/services/firebase';
import Link from 'next/link';

export default function NotificationSettings() {
  
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [magnitude, setMagnitude] = useState(4);
  
const user = auth.currentUser;

useEffect(() => {
  const currentUser = auth.currentUser;
  if (currentUser?.email) {
    const email = currentUser.email.toLowerCase();  // <-- here, TS knows email is not null
    const fetchSettings = async () => {
      const userDoc = await getDoc(doc(firestore, 'user', email));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setEnabled(data.notificationEnabled ?? false);
        setMagnitude(data.minMagnitude ?? 4);
      }
      setLoading(false);
    };
    fetchSettings();
  } else {
    setLoading(false);
  }
}, []);

const handleToggle = async (value: boolean) => {
  const currentUser = auth.currentUser;
  if (!currentUser?.email) return; // early exit if no email
  const email = currentUser.email.toLowerCase();

  setEnabled(value);

  await updateDoc(doc(firestore, 'user', email), {
    notificationEnabled: value
  });
};

const handleMagnitudeChange = async (value: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser?.email) return; // early exit if no email
  const email = currentUser.email.toLowerCase();

  const numValue = parseInt(value);
  setMagnitude(numValue);

  await updateDoc(doc(firestore, 'user', email), {
    minMagnitude: numValue
  });
};


  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-md mx-auto p-6">
        <div className="mb-4">
  <Link href="/user/event">
    <button className="bg-muted text-foreground hover:bg-muted/80 px-4 py-2 rounded shadow transition">
      ← Back to Event Page
    </button>
  </Link>
</div>

      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications">Earthquake Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email alerts when earthquakes occur near you
            </p>
          </div>
          <Switch
            id="notifications"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {enabled && (
          <div>
            <Label htmlFor="magnitude">Minimum Magnitude</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Only notify me about earthquakes at or above this strength
            </p>
            <Select
              value={magnitude.toString()}
              onValueChange={handleMagnitudeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select magnitude" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1.0+ (Very Minor)</SelectItem>
                <SelectItem value="2">2.0+ (Minor)</SelectItem>
                <SelectItem value="3">3.0+ (Light)</SelectItem>
                <SelectItem value="4">4.0+ (Moderate)</SelectItem>
                <SelectItem value="5">5.0+ (Strong)</SelectItem>
                <SelectItem value="6">6.0+ (Very Strong)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        )}
      </div>
      
    </div>
  );
}