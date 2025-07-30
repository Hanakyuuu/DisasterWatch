'use client';

import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { app, auth } from '@/services/firebase';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CameraIcon, Loader2, Save, User, Mail, Phone, Users, MapPin, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const LOCATION_OPTIONS = [
  'Kachin', 'Kayah', 'Kayin', 'Chin', 'Mon', 'Rakhine', 'Shan',
  'AyeYaWaddy', 'Bago', 'Magway', 'Tanintharyi', 'Yangon',
  'Mandalay', 'Sagaing', 'NayPyiDaw'
];

export default function AdminProfile() {
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    gender: "",
    dob: "",
    location: "",
    password: "",
    currentPassword: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
      } else {
        setEmail(null);
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!email) return;
      setLoading(true);
      try {
        const db = getFirestore(app);
        const docRef = doc(db, "admins", email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile({
            fullName: "-",
            phone: "-",
            gender: "-",
            dob: "-",
            location: "-",
            profileImage: '/robot4.png'
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchProfile();
  }, [email, toast]);

  useEffect(() => {
    if (profile && email) {
      setForm({
        email: email,
        fullName: profile.fullName === "-" ? "" : profile.fullName || "",
        phone: profile.phone === "-" ? "" : profile.phone || "",
        gender: profile.gender === "-" ? "" : profile.gender || "",
        dob: profile.dob === "-" ? "" : profile.dob || "",
        location: profile.location === "-" ? "" : profile.location || "",
        password: "",
        currentPassword: "",
      });
    }
  }, [profile, email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setShowPasswordFields(false);
    setNewImage(null);
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.phone.trim()) return "Phone is required.";
    if (!/^\+?\d{10,15}$/.test(form.phone.trim())) return "Phone must be a valid number (10-15 digits, may start with +).";
    if (!form.gender.trim()) return "Gender is required.";
    if (!form.dob.trim()) return "Date of birth is required.";
    if (new Date(form.dob) > new Date()) return "Date of birth cannot be in the future.";
    if (!form.location.trim()) return "Location is required.";
    if (showPasswordFields && form.password && form.password.length < 6) return "Password must be at least 6 characters.";
    if (showPasswordFields && !form.currentPassword) return "Current password is required for password change.";
    return null;
  };

  const handleSave = async () => {
    setLoading(true);
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      if (showPasswordFields && auth.currentUser && form.currentPassword) {
        const credential = EmailAuthProvider.credential(email || "", form.currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        if (form.password) {
          await updatePassword(auth.currentUser, form.password);
          toast({
            title: "Success",
            description: "Password updated successfully",
          });
        }
      }

      const db = getFirestore(app);
      const docRef = doc(db, "admins", email || "");
      const profileData = {
        fullName: form.fullName || "-",
        phone: form.phone || "-",
        gender: form.gender || "-",
        dob: form.dob || "-",
        location: form.location || "-",
        profileImage: newImage || profile.profileImage || '/robot4.png',
        updatedAt: new Date().toISOString()
      };

      try {
        await updateDoc(docRef, profileData);
      } catch (err) {
        await setDoc(docRef, {
          ...profileData,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setProfile({
        ...profile,
        ...profileData,
        profileImage: newImage || profile.profileImage || '/robot4.png'
      });
      setEditing(false);
      setShowPasswordFields(false);
      setNewImage(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-[730px] h-[550px] ml-32 bg-background rounded-xl shadow-md flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-[730px] h-[550px] ml-32 bg-background rounded-xl shadow-md">
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
            <span className="text-sm text-muted-foreground">Admin Profile</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10 max-w-4xl space-y-8">
        <div className="p-5">
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <img
                src={newImage || profile?.profileImage || '/robot4.png'}
                alt="Admin"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/40"
              />
              {editing && (
                <label className="absolute bottom-0 right-0 bg-primary p-1 rounded-full cursor-pointer">
                  <CameraIcon className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {editing ? (
              <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <User className="w-4 h-4 text-orange-600" />
                      Full Name
                    </label>
                    <Input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                    />
                  </div>

                  {/* Email (disabled) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Mail className="w-4 h-4 text-green-600" />
                      Email
                    </label>
                    <Input
                      value={email || ""}
                      disabled
                      className="h-11 font-bold bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Phone className="w-4 h-4 text-purple-600" />
                      Phone
                    </label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Users className="w-4 h-4 text-pink-600" />
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80 w-full rounded-md border p-2"
                    >
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Date of Birth
                    </label>
                    <Input
                      name="dob"
                      type="date"
                      value={form.dob}
                      onChange={handleChange}
                      className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4 text-red-600" />
                      Location
                    </label>
                    <select
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80 w-full rounded-md border p-2"
                    >
                      <option value="">Select Location</option>
                      {LOCATION_OPTIONS.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!showPasswordFields && (
                  <Button
                    type="button"
                    onClick={() => setShowPasswordFields(true)}
                    variant="outline"
                    className="w-full mt-6"
                  >
                    Change Password
                  </Button>
                )}

                {showPasswordFields && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                        Current Password
                      </label>
                      <Input
                        name="currentPassword"
                        type="password"
                        value={form.currentPassword}
                        onChange={handleChange}
                        className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                        New Password
                      </label>
                      <Input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current"
                        className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-6 justify-center">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-hover gradient-primary text-white shadow-soft hover:shadow-glow"
                  >
                    {loading ? (
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
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <User className="w-4 h-4 text-orange-600" />
                      Full Name
                    </label>
                    <div className="h-11 flex items-center font-medium">
                      {profile?.fullName || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Mail className="w-4 h-4 text-green-600" />
                      Email
                    </label>
                    <div className="h-11 flex items-center font-medium">
                      {email || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Phone className="w-4 h-4 text-purple-600" />
                      Phone
                    </label>
                    <div className="h-11 flex items-center font-medium">
                      {profile?.phone || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Users className="w-4 h-4 text-pink-600" />
                      Gender
                    </label>
                    <div className="h-11 flex items-center font-medium">
                      {profile?.gender || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Date of Birth
                    </label>
                    <div className="h-11 flex items-center font-medium">
                      {profile?.dob || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4 text-red-600" />
                      Location
                    </label>
                    <div className="h-11 flex items-center font-medium">
                      {profile?.location || "-"}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleEdit}
                  className="mt-6 btn-hover gradient-primary text-white shadow-soft hover:shadow-glow"
                >
                  Edit Profile
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}