'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Bell } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';

interface UserInfo {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  gender?: string;
  address?: string;
  role?: string;
  dob?: string;
  createdAt?: string;
}

export default function UserManagement() {
  const db = getFirestore(app);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  const usersCollection = collection(db, 'user');

  const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
    const userMap = new Map<string, UserInfo>();

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Extract and normalize
      const email = (data.email || '').trim();
      const name = (data.fullName || data.name || '').trim();
      const phone = (data.phone || '').trim();
      const gender = (data.gender || '').trim().toLowerCase();
      const address = (data.address || data.location || '').trim();
      const dob = (data.dob || '').trim();
      const role = (data.role || '').trim().toLowerCase();

      // Define what counts as invalid/unknown
      const isInvalid = (value: string) =>
        value === '' || value === '—' || value.toLowerCase() === 'unknown';

      // Skip if any required field is invalid or role is admin
      if (
        isInvalid(email) ||
        isInvalid(name) ||
        isInvalid(phone) ||
        isInvalid(gender) ||
        isInvalid(address) ||
        isInvalid(dob) ||
        role === 'admin'
      ) {
        return;
      }

      // Use email as key to remove duplicates
      if (!userMap.has(email)) {
        userMap.set(email, {
          uid: doc.id,
          email,
          name,
          phone,
          gender,
          address,
          dob,
          role,
          createdAt: data.createdAt || '—',
        });
      }
    });

    setUsers(Array.from(userMap.values()));
  });

  return () => unsubscribe();
}, []);

  const filteredUsers = users.filter(user => {
    if (user.role === 'admin') return false;
    
    return (
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto bg-background rounded-xl shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Link href="/">
              <Logo className="h-8 w-8 text-primary" />
            </Link>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-foreground text-xl">User Management</h2>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>

        <div className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              User Details ({filteredUsers.length} users)
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Gender</th>
                      <th className="px-4 py-3 text-left">Address</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-muted/50">
                        <td className="px-4 py-3">{user.name || '—'}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.phone || '—'}</td>
                        <td className="px-4 py-3 capitalize">{user.gender || '—'}</td>
                        <td className="px-4 py-3">{user.address || '—'}</td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="ghost">
                            <Bell className="h-4 w-4 mr-1" /> Alert
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}