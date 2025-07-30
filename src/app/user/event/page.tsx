'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { useState, useMemo, useEffect } from "react";
import { fetchEarthquakes } from '@/services/earthquakeApi';
import { Search, Filter, Clock, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function getSeverity(mag: number) {
  if (mag < 3) return 'weak';
  if (mag < 4) return 'light';
  if (mag < 5) return 'moderate';
  return 'strong';
}

const regions = ['All Regions', 'Myanmar'];
const myanmarCities = ['All Cities', 'Yangon', 'Mandalay', 'Sagaing', 'Bago', 'Shan', 'Kachin'];

// Helper function to check if coordinates are within a city's approximate bounds
function isInCity(place: string, city: string) {
  const placeLower = place.toLowerCase();
  if (city === 'Yangon') return placeLower.includes('yangon');
  if (city === 'Mandalay') return placeLower.includes('mandalay');
  if (city === 'Sagaing') return placeLower.includes('sagaing');
  if (city === 'Bago') return placeLower.includes('bago');
  if (city === 'Shan') return placeLower.includes('shan') || placeLower.includes('taunggyi');
  if (city === 'Kachin') return placeLower.includes('kachin') || placeLower.includes('myitkyina');
  return false;
}

const PastEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  useEffect(() => {
    if (mounted) {
      setSelectedCity("All Cities"); // Reset city when region changes
      loadData();
    }
  }, [selectedRegion]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchEarthquakes({
      limit: 2000,
      region: selectedRegion !== 'All Regions' ? selectedRegion : undefined
    });
    setEvents(data);
    setLoading(false);
  };

  const filteredEvents = useMemo(() => {
  let result = events.filter(feature => {
    const props = feature.properties;
    const place = props.place || "";
    const mag = props.mag ? props.mag.toString() : "";
    const type = props.type || "earthquake";
    
    return (
      type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mag.includes(searchTerm)
    );
  });

  // Apply city filter if Myanmar is selected and a specific city is chosen
  if (selectedRegion === 'Myanmar' && selectedCity !== 'All Cities') {
    result = result.filter(feature => {
      const place = feature.properties.place || "";
      return isInCity(place, selectedCity);
    });
  }

  // Filter strictly for Myanmar if "All Cities" is selected
  if (selectedRegion === 'Myanmar' && selectedCity === 'All Cities') {
    result = result.filter(feature => {
      const place = feature.properties.place || "";
      return place.toLowerCase().includes('myanmar');
    });
  }

  return result;
}, [searchTerm, events, selectedRegion, selectedCity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'weak': return 'bg-yellow-500';
      case 'light': return 'bg-orange-500';
      case 'moderate': return 'bg-red-500';
      case 'strong': return 'bg-red-700';
      default: return 'bg-gray-400';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'weak': return 'secondary';
      case 'light': return 'secondary';
      case 'moderate': return 'destructive';
      case 'strong': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="w-[900px] h-[740px] ml-6 rounded-xl px-8 shadow-md bg-background">
      <div className="max-w-4xl mx-auto">
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
                <span className="font-semibold text-sm text-muted-foreground">Past Events</span>
              </div>
            </div>
          </div><div className="flex justify-end mt-4">
  <Link
    href="/settings/notifications"
    className="bg-primary text-white px-4 py-2 rounded-md shadow hover:bg-primary/90 transition"
  >
    Notification Settings
  </Link>
</div>

        </div>

        {/* Search and Filters */}
        <div className="mb-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 border border-border rounded-md text-sm shadow-soft hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <Input
                    placeholder="Search by type, location, or magnitude..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48 border border-border rounded-md text-sm shadow-soft hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue />
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
              </div>
              {selectedRegion === 'Myanmar' && (
                <div className="w-full md:w-48 border border-border rounded-md text-sm shadow-soft hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {myanmarCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </div>

        {/* Events List */}
        <Card className="mb-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Earthquake Activities ({filteredEvents.length} results)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border overflow-y-auto max-h-[400px]">
              {!mounted ? null : loading ? (
                <div className="p-6 text-center text-muted-foreground">Loading earthquake data...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No earthquake events found.</div>
              ) : filteredEvents.map((feature) => {
                const props = feature.properties;
                const id = feature.id;
                const mag = props.mag;
                const place = props.place || "Unknown location";
                const time = new Date(props.time);
                const type = props.type || "earthquake";
                const depth = feature.geometry?.coordinates?.[2] ? `${feature.geometry.coordinates[2]} km` : "-";
                const severity = getSeverity(mag);
                
                return (
                  <div key={id} className="flex items-start p-4 hover:bg-muted/100 transition-colors">
                    <div className={`w-1 h-16 rounded-full mr-4 ${getSeverityColor(severity)}`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </h3>
                        <Badge variant={getSeverityBadgeVariant(severity)} className="text-xs">
                          {time.toLocaleDateString()} {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-4 mb-1">
                          <span>{place}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <span>Magnitude: <strong>{mag}</strong></span>
                          <span>Depth: <strong>{depth}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{place}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PastEvents;