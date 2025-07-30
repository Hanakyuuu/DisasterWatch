'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Save, X, Upload, Loader2, User, Phone, Calendar, Users, MapPin, Mail, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function UserProfile() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: 'Full Name',
    email: 'fullname@example.com',
    phone: '+95 9123 4567 89',
    dateOfBirth: '1990-01-01',
    gender: 'Female',
    location: 'Yangon, Myanmar',
    profileImage: '/robot3.png',
  });

  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };
  

  const handleImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImage(reader.result as string);
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const removeImage = () => {
    setTempImage('');
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000));

    setFormData(prev => ({
      ...prev,
      profileImage: tempImage !== null ? tempImage : prev.profileImage,
    }));

    setIsDirty(false);
    setIsLoading(false);

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
      duration:2000,
    });
  };

  const displayImage = tempImage !== null ? tempImage : formData.profileImage;

  return (
    <div className="w-[800px] h-[870px] ml-20 rounded-xl px-8 shadow-md bg-background">
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
              <span className="font-semibold text-sm text-muted-foreground">My Profile</span>
            </div>
          </div>
        </div>
      </div>      {/* Header */}
      <div className="flex justify-center m-8">
        <div className="relative group">
          <Avatar className="w-32 h-32 border-4 border-primary/40 shadow-soft">
            <AvatarImage src={displayImage} />
            <AvatarFallback className="bg-primary text-white text-2xl">
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>

          {/* Camera Icon */}
          <label className="absolute bottom-0 right-0 bg-primary p-1 rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-all">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileInput}
            />
          </label>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="max-w-[1200px] col-span-2">
        <div className="shadow-profile animate-fade-in bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </h2>

          {/* Full Name */}
          <div className="flex items-center gap-4 p-3 rounded-lg transition-colors group hover:bg-muted/100">
            <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-transparent  font-medium focus:outline-none border-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg transition-colors group hover:bg-muted/100">
            <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors">
              <Mail className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{formData.email}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              Verified
            </Badge>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4 p-3 rounded-lg transition-colors group hover:bg-muted/100">
            <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors">
              <Phone className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="bg-transparent text-foreground font-medium focus:outline-none border-none w-full"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex items-center gap-4 p-3 rounded-lg transition-colors group hover:bg-muted/100">
            <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="bg-transparent text-foreground font-medium focus:outline-none border-none w-full"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center gap-4 p-3 rounded-lg transition-colors group hover:bg-muted/100">
            <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors">
              <Users className="h-4 w-4 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="bg-transparent text-foreground font-medium focus:outline-none border-none w-full cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>


          {/* Location */}
          <div className="flex items-center gap-4 p-3 rounded-lg transition-colors group hover:bg-muted/100">
            <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors">
              <MapPin className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="bg-transparent text-foreground font-medium focus:outline-none border-none w-full"
              />
            </div>
          </div>
        </div>
      </div>


      {/* Save Button */}
      <div className="text-center mt-6">
        <Button
          onClick={handleSave}
          disabled={!isDirty || isLoading}
          className={cn(
            "btn-hover gradient-primary text-white shadow-soft hover:shadow-glow",
            (!isDirty || isLoading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
