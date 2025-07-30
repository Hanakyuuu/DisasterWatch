import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    joinDate: string;
    isVerified?: boolean;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="h-32 bg-profile-gradient rounded-t-xl"></div>

      {/* Profile content */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex justify-center -mt-16 mb-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-2 border-background shadow-avatar animate-float">
              <AvatarImage
                src="/robot3.png" // ✅ from public dir
                alt={user.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            {user.isVerified && (
              <div className="absolute -bottom-2 -right-2">
                <Badge className="bg-green-500 text-white border-2 border-background">
                  ✓
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            Member since {user.joinDate}
          </p>
        </div>
      </div>
    </div>
  );
}
