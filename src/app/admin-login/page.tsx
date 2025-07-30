'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/landing/header2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Optionally add authentication logic here

        // Redirect to home page
        router.push('/');
    };

    return (
        <>
            <Header />
            <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                {/* Left: Login Form */}
                <div className="mt-[-80px] flex flex-col justify-center px-8 md:px-16">
                    <div className="max-w-md w-full mx-auto animate-fade-in-up">
                        <h1 className="text-3xl font-bold mb-6">Welcome, Admin !</h1>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium mb-1">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    Email
                                </label>
                                <Input id="email" type="email" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium mb-1">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                    Password
                                </label>
                                <Input id="password" type="password" placeholder="********" />
                            </div>
                            <Button type="submit" className="w-full mt-4 btn-hover">
                                Log In
                            </Button>
                        </form>
                        
                    </div>
                </div>

                {/* Right: Image */}
                <div className="hidden md:flex items-center justify-center relative px-4">
                    <div className="relative w-[400px] h-[400px] mt-[-100px]">
                        {/* Background Blobs */}
                        <div className="absolute top-[40px] left-[-20px] h-32 w-32 rounded-full bg-blue-300/50 opacity-70 blur-4xl z-0" />
                        <div className="absolute bottom-[30px] right-[-10px] h-52 w-52 rounded-full bg-blue-400/30 opacity-50 blur-4xl z-1" />

                        <div className="bubble1" />
                        <div className="bubble2" />
                        <div className="bubble3" />
                        
                        {/* Main Image */}
                        <Image
                            src="/robot.png"
                            width={400}
                            height={400}
                            alt="Hero Image"
                            className="relative z-10 overflow-hidden rounded-xl animate-float"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
