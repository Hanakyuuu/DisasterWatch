'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArrowLeft, Camera, Save, X } from "lucide-react";
import { CalendarIcon, Phone, User, MapPin, Calendar, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EditProfileForm } from "@/components/EditProfileForm";
import { ProfileImageUpload } from "@/components/ProfileImgUpload";
import { useToast } from "@/hooks/use-toast";

interface UserData {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    location: string;
    profileImage?: string;
}

const EditProfile = () => {
    const router = useRouter();
    const { toast } = useToast();

    const [userData, setUserData] = useState<UserData>({
        name: "Full Name",
        email: "fullname@example.com",
        phone: "+95 9123 4567 89",
        dateOfBirth: "1992 03 15",
        gender: "Female",
        location: "San Francisco, CA",
        profileImage: "/robot5.png",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [profileImageChanged, setProfileImageChanged] = useState(false);

    const handleSave = async (formData: UserData) => {
        // If no changes at all, ignore save
        if (!isFormDirty && !profileImageChanged) return;
      
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setUserData(formData);
            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated.",
                duration: 2000,
            });
            router.push("/user/profile");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
                duration: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (image: string) => {
        setUserData(prev => ({ ...prev, profileImage: image }));
        setProfileImageChanged(image !== userData.profileImage);
    };

    const shouldDisableSave = React.useMemo(() => {
        return (!isFormDirty && !profileImageChanged) || isLoading;
      }, [isFormDirty, profileImageChanged, isLoading]);
      
    return (
        <div className="min-h-screen w-full mx-auto rounded-xl px-8 shadow-md bg-background">
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
            </div>


            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
                    <Card className="gradient-card border-border shadow-card">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-foreground">
                                Update My Profile
                            </h2>
                            <ProfileImageUpload
                                currentImage={userData.profileImage}
                                onImageChange={handleImageChange}
                            />
                        </div>
                    </Card>

                    <Card className="gradient-card border-border shadow-card">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6 text-foreground">
                                Personal Information
                            </h2>
                            <EditProfileForm
                                initialData={userData}
                                onSubmit={handleSave}
                                isLoading={isLoading}
                                onFormDirtyChange={setIsFormDirty}
                            />
                        </div>
                    </Card>

                    <div className="col-span-2 flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/user/profile")}
                            className="transition-smooth"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="profile-form"
                            id="profile-form"
                            disabled={shouldDisableSave}
                            className={cn(
                                "btn-hover gradient-primary text-primary-foreground shadow-soft hover:shadow-glow transition-smooth",
                                shouldDisableSave && "opacity-50 cursor-not-allowed"
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
            </div>
        </div>
    );
};

export default EditProfile;