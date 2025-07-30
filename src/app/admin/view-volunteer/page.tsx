'use client';

import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Search, Filter, Clock, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const regions = [
  'All States & Regions',
  'Kachin', 'Kayah', 'Kayin', 'Chin', 'Sagaing', 'Tanintharyi',
  'Bago', 'Magway', 'Mandalay', 'Mon', 'Rakhine', 'Yangon',
  'Shan', 'Ayeyarwady', 'Naypyidaw'
];

const volunteerTypes = ['Medical', 'Food', 'Support', 'Rescue'];

export default function VolunteerPage() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All States & Regions");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  useEffect(() => {
    const fetchVolunteers = async () => {
      const snapshot = await getDocs(collection(db, "volunteers"));
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        const regionValue = d.region || d["state"] || d["state or region"] || "";
        return {
          id: doc.id,
          ...d,
          region: regionValue,
        };
      });
      setVolunteers(data);
    };
    fetchVolunteers();
  }, []);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = Object.values(v).some((value) =>
        typeof value === 'string' && value.toLowerCase().includes(search)
      );
      const matchesRegion = selectedRegion.toLowerCase() === 'all states & regions' || v.region?.toLowerCase() === selectedRegion.toLowerCase();
      return matchesSearch && matchesRegion;
    });
  }, [volunteers, searchTerm, selectedRegion]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Medical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Rescue': return 'bg-primary/10 text-primary border-primary/20';
      case 'Support': return 'bg-muted text-muted-foreground border-border';
      case 'Food': return 'bg-yellow-200 text-yellow-800 border-yellow-300';
      case 'Crane Services': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Shelters': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const startEdit = (volunteer: any) => {
    setEditingId(volunteer.id);
    setEditForm({ ...volunteer });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    if (!editForm) return;
    setVolunteers((prev) =>
      prev.map(v => v.id === editingId ? { ...v, ...editForm } : v)
    );
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div className="w-[960px] bg-background rounded-xl shadow-md mx-auto mt-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-soft">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <Link href="/" className="item-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
            </Link>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-foreground text-xl">Crisis Companion</h2>
            <span className="font-semibold text-sm text-muted-foreground">Edit Volunteers</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-6 pt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-5" />
            Search & Filter Volunteers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by name, organization, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-2/3"
            />
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Volunteer Information ({filteredVolunteers.length} results)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-auto max-h-[500px]">
              <table className="text-left w-full min-w-[700px]">
                <thead className="sticky top-0 bg-background z-50">
                   <tr>
                    <th className="px-4 py-4 min-w-[50px]">No.</th>
                    <th className="px-4 py-4 min-w-[200px]">State or Region</th>
                    <th className="px-4 py-4 min-w-[200px]">Organization</th>
                    <th className="px-4 py-4 min-w-[150px]">Contact</th>
                    <th className="px-4 py-4 min-w-[150px]">Name</th>
                    <th className="px-4 py-4 min-w-[200px]">Location</th>
                    <th className="px-4 py-4 min-w-[100px]">Type</th>
                    <th className="px-4 py-4 min-w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((v, idx) => {
                    const isEditing = editingId === v.id;
                    return (
                      <tr key={v.id} className="border-t hover:bg-muted/100 transition-colors">
                        <td className="px-4 py-4">{idx + 1}</td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              name="region"
                              value={editForm.region}
                              onChange={handleEditChange}
                              className="w-full rounded border border-border px-2 py-1 text-sm"
                            />
                          ) : v.region}
                        </td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              name="organization"
                              value={editForm.organization}
                              onChange={handleEditChange}
                              className="w-full rounded border border-border px-2 py-1 text-sm"
                            />
                          ) : v.organization}
                        </td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              name="contact"
                              value={editForm.contact}
                              onChange={handleEditChange}
                              className="w-full rounded border border-border px-2 py-1 text-sm"
                            />
                          ) : (
                            <a href={`tel:${v.contact}`} className="text-primary flex items-center gap-1">
                              <Phone className="h-4 w-4" /> {v.contact}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              name="name"
                              value={editForm.name}
                              onChange={handleEditChange}
                              className="w-full rounded border border-border px-2 py-1 text-sm"
                            />
                          ) : v.name}
                        </td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              name="location"
                              value={editForm.location}
                              onChange={handleEditChange}
                              className="w-full rounded border border-border px-2 py-1 text-sm"
                            />
                          ) : v.location}
                        </td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <select
                              name="type"
                              value={editForm.type}
                              onChange={handleEditChange}
                              className="w-full rounded border border-border px-2 py-1 text-sm"
                            >
                              {volunteerTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          ) : (
                            <Badge className={getTypeColor(v.type)}>{v.type}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <div className="flex flex-col gap-2 items-start">
                              <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                              <Button size="sm" onClick={saveEdit}>Save</Button>
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => startEdit(v)}>Edit</Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}