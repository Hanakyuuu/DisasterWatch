'use client';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, User, Phone, MapPin, Users, Building2, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const states = ["Chin", "Kachin", "Kayah", "Kayin", "Mon", "Rakhine", "Shan"];
const regions = ["Ayeyarwady", "Bago", "Magway", "Mandalay", "Sagaing", "Tanintharyi", "Yangon", "Naypyidaw"];

export default function AddVolunteer() {
  const { toast } = useToast();

  const initialData = {
    name: '',
    region: '',
    organization: '',
    contact: '',
    location: '',
    type: '',
  };

  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isChanged = useMemo(() => {
    return Object.keys(formData).some(
      (key) => formData[key as keyof typeof formData] !== initialData[key as keyof typeof initialData]
    );
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSave = async () => {
    const requiredFields = ['name', 'region', 'organization', 'contact', 'location', 'type'];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] =
          field === 'region'
            ? 'State or Region is required.'
            : `${field[0].toUpperCase() + field.slice(1)} is required.`;
      }
    });

    setErrors(newErrors);

    const isFormValid = Object.values(newErrors).every((err) => err === '');
    if (!isFormValid || !isChanged) return;

    setIsLoading(true);

     try {
    const regionInput = formData.region.trim();

    let regionField: Record<string, string>;
    if (states.includes(regionInput)) {
      regionField = { state: regionInput };
    } else if (regions.includes(regionInput)) {
      regionField = { region: regionInput };
    } else {
      regionField = { "unknown-location": regionInput };
    }

    const dataToSave = {
      name: formData.name.trim(),
      organization: formData.organization.trim(),
      contact: formData.contact.trim(),
      location: formData.location.trim(),
      type: formData.type.trim(),
      ...regionField, // inject correctly named field here
    };

      await addDoc(collection(db, 'volunteers'), dataToSave);

      toast({
        title: 'Volunteer Info Saved',
        description: 'Volunteer data has been successfully saved to Firestore.',
        duration: 2000,
      });

      setFormData(initialData);
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        title: 'Error',
        description: 'Failed to save data to Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[730px] ml-32 h-auto bg-background rounded-xl shadow-md">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-soft">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <Link href="/">
              <Logo className="h-8 w-8 text-primary" />
            </Link>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-foreground text-xl">Crisis Companion</h2>
            <span className="text-sm text-muted-foreground">Add Volunteer</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-4xl space-y-8">
        <div className="p-3">
          <div className="flex flex-col items-center">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="text-orange-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                </div>
                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" className="h-11 bg-white/80" />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* Region */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">State or Region</label>
                </div>
                <Input name="region" value={formData.region} onChange={handleInputChange} placeholder="Enter state or region" className="h-11 bg-white/80" />
                {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="text-indigo-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">Organization</label>
                </div>
                <Input name="organization" value={formData.organization} onChange={handleInputChange} placeholder="Enter organization" className="h-11 bg-white/80" />
                {errors.organization && <p className="text-red-500 text-sm">{errors.organization}</p>}
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="text-purple-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">Contact</label>
                </div>
                <Input name="contact" value={formData.contact} onChange={handleInputChange} placeholder="Enter contact number" className="h-11 bg-white/80" />
                {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Landmark className="text-green-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                </div>
                <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="Enter location" className="h-11 bg-white/80" />
                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="text-pink-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                </div>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full h-11 rounded-md border border-border px-3 text-sm font-medium bg-white/80"
                >
                  <option value="" disabled>Select type</option>
                  <option value="medical">Medical</option>
                  <option value="rescue">Rescue</option>
                  <option value="food">Food</option>
                  <option value="support">Support</option>
                  <option value="crane services">Crane Services</option>
                  <option value="shelters">Shelters</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <Button onClick={handleSave} className="mt-10 btn-hover gradient-primary text-white shadow-soft hover:shadow-glow">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
