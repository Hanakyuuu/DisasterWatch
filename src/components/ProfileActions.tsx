import Link from "next/link"; // ✅ import for navigation
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Edit, 
  Lock,  
  Settings, 
  Share2
} from "lucide-react";

export function ProfileActions() {
  return (
    <Card className="shadow-profile animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Account Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Actions */}
        {/* Secondary Actions */}
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-1 gap-2">

            {/* Edit Profile */}
            <Link href="/user/editprofile" passHref>
              <Button 
                variant="ghost"
                className="w-full justify-start"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>

            {/* Change Password */}
            <Link href="/user/changepassword" passHref>
              <Button 
                variant="ghost"
                className="w-full justify-start"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </Link>

            {/* Share Profile */}
            <Link href="/share-profile" passHref>
              <Button 
                variant="ghost"
                className="w-full justify-start"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
            </Link>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
