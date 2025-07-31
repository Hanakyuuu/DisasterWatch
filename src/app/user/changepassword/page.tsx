'use client'; 

import Link from 'next/link';
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Logo } from '@/components/icons';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/ChangePasswordForm"; // ✅ Use the reusable form

const ChangePassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    router.push("/profile");
  };

  return (
    <div className="w-[800px] ml-20 rounded-xl px-8 shadow-md bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-soft">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <Link href="/" className="item-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
            </Link>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-foreground text-xl">Crisis Companion</h2>
            <span className="font-semibold text-sm text-muted-foreground">
              Change Password
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <ChangePasswordForm isLoading={isLoading} setIsLoading={setIsLoading} />
      </div>
    </div>
  );
};

export default ChangePassword;