'use client';

import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Logo } from '@/components/icons';
import { Search, Filter, Clock, Users, MapPin, Phone, Heart } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
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
  return (
    <div className="w-[960px] bg-background rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-soft">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <Link href="/" className="item-center gap-2" >
              <Logo className="h-8 w-8 text-primary" />
            </Link>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-foreground text-xl">Crisis Companion</h2>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-muted-foreground">Help & Support</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <div className="container mx-auto px-5 py-1 max-w-7xl">
        {/* Search and Filters */}
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

      <Card className="bg-gradient-subtle border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Emergency Response Teams ({filteredVolunteers.length} results)
            </CardTitle>
          </div>
        </CardHeader>
      <CardContent>
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-auto max-h-[500px]">
              <div className="min-w-[0px]">
                <table className="text-left">
                  <thead className="sticky top-0 bg-background z-0">
                  <tr>
                    <th className="px-4 py-4 min-w-[50px]">No.</th>
                    <th className="px-4 py-4 min-w-[200px]">Region</th>
                    <th className="px-4 py-4 min-w-[200px]">Organization</th>
                    <th className="px-4 py-4 min-w-[150px]">Contact</th>
                    <th className="px-4 py-4 min-w-[150px]">Name</th>
                    <th className="px-4 py-4 min-w-[200px]">Location</th>
                    <th className="px-4 py-4 min-w-[100px]">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((team, idx) => (
                    <tr key={team.id} className="border-t hover:bg-muted/100 transition-colors">
                      <td className="px-4 py-4">{idx + 1}</td>
                      <td className="px-4 py-4">{team.region}</td>
                      <td className="px-4 py-4">{team.organization}</td>
                      <td className="px-4 py-4">
                        <a href={`tel:${team.contact}`} className="text-primary flex items-center gap-1">
                          <Phone className="h-4 w-4" /> {team.contact}
                        </a>
                      </td>
                      <td className="px-4 py-4">{team.name}</td>
                      <td className="px-4 py-4 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" /> {team.location}
                </td>
                      <td className="px-4 py-4">
                        <Badge className={getTypeColor(team.type)}>{team.type}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>
      {/* Emergency Notice */}
        <Card className="mt-8 bg-destructive/5 border-destructive/20 mb-4">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-destructive/10">
                <Phone className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive mb-2">Emergency Contacts</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  In case of immediate life-threatening emergencies, please contact:
                </p>
                <div className="space-y-1 text-sm">
                  <p><strong>Emergency Services:</strong> 911</p>
                  <p><strong>Crisis Hotline:</strong> 988 (Suicide & Crisis Lifeline)</p>
                  <p><strong>Disaster Relief:</strong> 1-800-RED-CROSS</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}
