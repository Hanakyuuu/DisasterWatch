'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  MapPin,
  Briefcase
} from "lucide-react";

interface ProfileInfoProps {
  user: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    location?: string;
    occupation?: string;
  };
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const infoItems = [
    {
      icon: User,
      label: "Full Name",
      value: user.name,
      color: "text-blue-600"
    },
    {
      icon: Mail,
      label: "Email",
      value: user.email,
      color: "text-green-600"
    },
    {
      icon: Phone,
      label: "Phone",
      value: user.phone,
      color: "text-purple-600"
    },
    {
      icon: Calendar,
      label: "Date of Birth",
      value: user.dateOfBirth,
      color: "text-orange-600"
    },
    {
      icon: Users,
      label: "Gender",
      value: user.gender,
      color: "text-pink-600"
    },
    {
      icon: MapPin,
      label: "Location",
      value: user.location || "Not specified",
      color: "text-red-600"
    },
  ];

  return (
    <Card className="shadow-profile animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {infoItems.map((item, index) => (
          <div
            
            key={item.label} 
            className="flex items-center gap-4 p-3 rounded-lg transition-colors group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`p-2 rounded-full bg-muted group-hover:bg-background transition-colors`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
              <p className="font-medium text-foreground">{item.value}</p>
            </div>
            {item.label === "Email" && (
              <Badge variant="outline" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}