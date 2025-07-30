'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { app } from '@/services/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Clock } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdminInfo {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  gender?: string;
  location?: string;
  dob?: string;
  createdAt?: any; // Changed to any to handle Firestore Timestamp
}

export default function AdminManagement() {
  const db = getFirestore(app);
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());

  useEffect(() => {
    const adminsCollection = collection(db, 'admins');
    const unsubscribe = onSnapshot(adminsCollection, (snapshot) => {
      const adminList: AdminInfo[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        adminList.push({
          uid: doc.id,
          email: data.email || doc.id,
          name: data.fullName || data.name,
          phone: data.phone,
          gender: data.gender,
          location: data.location,
          dob: data.dob,
          createdAt: data.createdAt // Keep as is for now
        });
      });
      setAdmins(adminList);
      setLastUpdated(new Date().toLocaleString());
    });

    return () => unsubscribe();
  }, [db]);

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm(`Are you sure you want to remove this admin?`)) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'admins', adminId));
    } catch (err) {
      console.error('Error removing admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.email.toLowerCase().includes(searchLower) ||
      (admin.name && admin.name.toLowerCase().includes(searchLower)) ||
      (admin.phone && admin.phone.includes(searchTerm))
    );
  });

  const formatDate = (dateInput?: any) => {
    if (!dateInput) return '—';
    
    try {
      // Handle Firestore Timestamp
      const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
      return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
    } catch {
      return '—';
    }
  };

  return (
    <div className="w-[960px] h-[850px] bg-background rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-soft">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <Link href="/">
              <Logo className="h-8 w-8 text-primary" />
            </Link>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-foreground text-xl">Crisis Companion</h2>
            <span className="text-sm text-muted-foreground">Admin Management</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Search Card */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Admin Information ({filteredAdmins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.uid}>
                      <TableCell>{admin.name || '—'}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phone || '—'}</TableCell>
                      <TableCell className="capitalize">{admin.gender || '—'}</TableCell>
                      <TableCell>{admin.location || '—'}</TableCell>
                      <TableCell>{formatDate(admin.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAdmin(admin.uid)}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}