'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/landing/header2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, User, MessageSquare, Phone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                {/* Left: Contact Form */}
                <div className="flex flex-col justify-center px-8 md:px-16">
                    <div className="max-w-md w-full mx-auto animate-fade-in-up">
                        <ContactForm />
                    </div>
                </div>

                {/* Right: Image with floating animation and blob background */}
                <div className="hidden md:flex items-center justify-center relative px-4">
                    <div className="relative w-[500px] h-[400px] mt-[-50px]">
                        {/* Background Blobs */}
                        <div className="absolute top-[20px] left-[-30px] h-40 w-40 rounded-full bg-blob-blue-light opacity-70 blur-3xl z-0" />
                        <div className="absolute bottom-[10px] right-[-20px] h-60 w-60 rounded-full bg-blob-blue opacity-50 blur-3xl z-0" />

                        <div className="bubble1" />
                        <div className="bubble2" />
                        <div className="bubble3" />
                        {/* Floating Robot Image */}
                        <Image
                            src="/robot6.png"
                            width={400}
                            height={400}
                            alt="Hero Image"
                            className="relative z-10 overflow-hidden rounded-xl animate-float object-cover"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

function ContactForm() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!formData.name || !formData.email || !formData.message) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }
    
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send message');
            }
    
            toast({
                title: "Message Sent!",
                description: "Thank you for your message. We'll get back to you soon.",
                duration: 2000,
            });
    
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            toast({
                title: "Error",
                description: "There was a problem sending your message.",
                variant: "destructive",
            });
        }
    };
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <>
            <h1 className="text-3xl font-bold mt-6 mb-6">Contact Us</h1>
            <p className="text-muted-foreground mb-8">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Full Name *
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email Address *
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="message" className="flex items-center gap-2 text-sm font-medium mb-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        Message *
                    </Label>
                    <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you..."
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Button type="submit" className="w-full mt-6 btn-hover">
                    Send Message
                </Button>
            </form>

            <p className="text-sm mt-6 text-center text-muted-foreground">
                Need immediate assistance?{' '}
                <a href="mailto:support@example.com" className="text-primary hover:underline">
                    Email us directly
                </a>
            </p>
        </>
    );
}
