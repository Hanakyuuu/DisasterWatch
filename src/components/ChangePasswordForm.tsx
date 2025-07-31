'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { auth } from "@/services/firebase"; // adjust import path as needed
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

interface ChangePasswordFormProps {
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  isLoading,
  setIsLoading,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  // State for errors
  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const oldPassword = (form.oldPassword as HTMLInputElement).value;
    const newPassword = (form.newPassword as HTMLInputElement).value;
    const confirmPassword = (form.confirmPassword as HTMLInputElement).value;

    // Reset errors
    setErrors({});

    // Client-side validation
    let hasError = false;
    const newErrors: typeof errors = {};

    if (!oldPassword) {
      newErrors.oldPassword = "Old password is required.";
      hasError = true;
    }

    if (newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters.";
      hasError = true;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "New password and confirm password do not match.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("User not authenticated");
      }

      // Reauthenticate
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
        duration: 3000,
      });

      form.reset();

      setTimeout(() => {
        router.push("/user/profile");
      }, 3000);

    } catch (error: any) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setErrors({ oldPassword: "The old password you entered is incorrect." });
      } else if (error.code === "auth/weak-password") {
        setErrors({ newPassword: "New password must be at least 8 characters." });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update password.",
          variant: "destructive",
        });
      }
      setIsLoading(false); // <-- IMPORTANT: reset loading here to allow retry!
    }
  };

  return (
    <Card className="max-w-2xl w-full gradient-card border-border shadow-card">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-foreground">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              className={`w-full h-11 px-4 border border-border rounded-md text-sm shadow-soft 
                hover:border-primary focus:border-primary 
                focus:outline-none focus:ring-1 focus:ring-primary 
                ${errors.oldPassword ? "border-destructive" : "border-border"}`}
              aria-invalid={!!errors.oldPassword}
              aria-describedby="oldPassword-error"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
            {errors.oldPassword && (
              <p id="oldPassword-error" className="mt-1 text-sm text-destructive">
                {errors.oldPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              className={`w-full h-11 px-4 border border-border rounded-md text-sm shadow-soft 
                hover:border-primary focus:border-primary 
                focus:outline-none focus:ring-1 focus:ring-primary 
                ${errors.newPassword ? "border-destructive" : "border-border"}`}
              aria-invalid={!!errors.newPassword}
              aria-describedby="newPassword-error"
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            {errors.newPassword && (
              <p id="newPassword-error" className="mt-1 text-sm text-destructive">
                {errors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className={`w-full h-11 px-4 border border-border rounded-md text-sm shadow-soft 
                hover:border-primary focus:border-primary 
                focus:outline-none focus:ring-1 focus:ring-primary 
                ${errors.confirmPassword ? "border-destructive" : "border-border"}`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby="confirmPassword-error"
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1 text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 gradient-primary btn-hover text-primary-foreground shadow-soft hover:shadow-glow transition-smooth"
          >
            {isLoading ? "Saving..." : "Save Password"}
          </Button>
        </form>
      </div>
    </Card>
  );
};
