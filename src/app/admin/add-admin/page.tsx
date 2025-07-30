'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CameraIcon,
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminProfile() {
  const { toast } = useToast();

  const initialData = {
    name: '',
    email: '',
    phone: '',
    gender: '',
    profileImage: '/robot4.png',
  };

  const [formData, setFormData] = useState(initialData);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
  });

  const isChanged = useMemo(() => {
    return (
      formData.name !== initialData.name ||
      formData.phone !== initialData.phone ||
      formData.gender !== initialData.gender ||
      formData.email !== initialData.email ||
      newImage !== null
    );
  }, [formData, newImage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // clear error on change
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const newErrors = {
      name: formData.name.trim() === '' ? 'Name is required' : '',
      email: formData.email.trim() === '' ? 'Email is required' : '',
      phone: formData.phone.trim() === '' ? 'Phone is required' : '',
      gender: formData.gender.trim() === '' ? 'Gender is required' : '',
    };
    setErrors(newErrors);

    const isFormValid = Object.values(newErrors).every(err => err === '');
    if (!isFormValid || !isChanged) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFormData(prev => ({
      ...prev,
      profileImage: newImage || prev.profileImage,
    }));
    setNewImage(null);
    setIsLoading(false);
    toast({
      title: 'Profile Updated',
      description: 'Admin profile has been successfully updated.',
      duration: 2000,
    });
  };

  return (
    <div className="w-[730px] h-[500px] ml-32 h-auto bg-background rounded-xl shadow-md">
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
            <span className="text-sm text-muted-foreground">Add Admin</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10 max-w-4xl space-y-8">
        <div className="p-5">
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <img
                src={newImage || formData.profileImage}
                alt="Admin"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/40"
              />
              <label className="absolute bottom-0 right-0 bg-primary p-1 rounded-full cursor-pointer">
                <CameraIcon className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="text-orange-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                </div>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="text-green-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                </div>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="text-purple-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </label>
                </div>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="text-pink-600 h-4 w-4" />
                  <label className="text-sm font-medium text-muted-foreground">
                    Gender
                  </label>
                </div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full h-11 rounded-md border border-border bg-white/80 px-3 text-sm font-medium text-foreground shadow-soft focus:outline-none"
                >
                  <option value="" disabled>Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender}</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="mt-6 btn-hover gradient-primary text-white shadow-soft hover:shadow-glow"
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
      </div>
    </div>
  );
}