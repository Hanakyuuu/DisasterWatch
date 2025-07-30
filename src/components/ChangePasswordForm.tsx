'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const oldPassword = (form.oldPassword as HTMLInputElement).value;
        const newPassword = (form.newPassword as HTMLInputElement).value;
        const confirmPassword = (form.confirmPassword as HTMLInputElement).value;

        const actualOldPassword = "password123"; // 🔐 Replace with real logic

        // Reset errors
        setErrors({});

        // Validate
        let hasError = false;
        const newErrors: typeof errors = {};

        if (oldPassword !== actualOldPassword) {
            newErrors.oldPassword = "The old password you entered is incorrect.";
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

        // Simulate update
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
                duration: 3000,
            });
            setTimeout(() => {
                router.push("/user/profile");
            }, 8000);
        }, 1000);

    };

    return (
        <Card className="max-w-2xl w-full gradient-card border-border shadow-card">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-foreground">Change Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            ${errors.oldPassword ? "border-destructive" : "border-border"}
              `}
                            aria-invalid={!!errors.oldPassword}
                            aria-describedby="oldPassword-error"
                        />

                        {errors.oldPassword && (
                            <p
                                id="oldPassword-error"
                                className="mt-1 text-sm text-destructive"
                            >
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
                            ${errors.newPassword ? "border-destructive" : "border-border"}
              `}
                            aria-invalid={!!errors.newPassword}
                            aria-describedby="newPassword-error"
                        />
                        {errors.newPassword && (
                            <p
                                id="newPassword-error"
                                className="mt-1 text-sm text-destructive"
                            >
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
                            ${errors.confirmPassword ? "border-destructive" : "border-border"}
              `}
                            aria-invalid={!!errors.confirmPassword}
                            aria-describedby="confirmPassword-error"
                        />
                        {errors.confirmPassword && (
                            <p
                                id="confirmPassword-error"
                                className="mt-1 text-sm text-destructive"
                            >
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
