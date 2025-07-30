'user client';

import { Header } from '@/components/landing/header2';
import { Footer } from '@/components/landing/footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, AlertTriangle, MessageCircle, Activity, Heart } from "lucide-react";

export default function About() {

    const features = [
        {
            icon: AlertTriangle,
            color: "text-red-500",
            title: "Real-time Alerts",
            description: "Local dangers such as floods, heatwaves, and more"
        },
        {
            icon: MessageCircle,
            color: "text-blue-500",
            title: "Chatbot Support",
            description: "Quick responses to urgent questions during crises"
        },
        {
            icon: Users,
            color: "text-purple-500",
            title: "Volunteer Management",
            description: "Coordinate support efficiently across communities"
        },
        {
            icon: Shield,
            color: "text-green-600",
            title: "Safety-First Design",
            description: "Accessible interface with responsive layouts"
        },
        {
            icon: Activity,
            color: "text-yellow-500",
            title: "Event Analysis",
            description: "Past event logs to improve emergency response"
        },
        {
            icon: Heart,
            color: "text-pink-500",
            title: "Community Care",
            description: "Direct contact forms for people in need"
        }
    ];


    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Hero Section */}
                <div className="relative">
                    {/* Background blobs */}
                    <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-blob-blue-light blur-4xl opacity-60 animate-float" />
                    <div className="absolute top-40 right-10 h-48 w-48 rounded-full bg-blob-blue blur-4xl opacity-40" />

                    <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16">

                        <div className="bubble1" />
                        <div className="bubble2" />
                        <div className="bubble3" />

                        <div className="text-center mb-6 z-[30] animate-fade-in-up">
                            <Badge variant="secondary" className="mb-1 text-sm px-4 py-1">
                                About Our Mission
                            </Badge>
                            <h1 className="text-5xl font-bold mb-1 bg-gradient-primary bg-clip-text text-transparent">
                                Crisis Companion
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                An intelligent, user-focused platform built to support communities during emergencies.
                                Connecting people with help, information, and tools they need — fast.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-6 pb-20">
                    {/* Features Grid */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-semibold text-center mb-8">What We Provide</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start space-x-4 p-5 bg-muted rounded-xl hover:shadow-md transition"
                                    >
                                        <div className={`p-2 rounded-lg bg-muted-foreground/20 group-hover:bg-muted-foreground/20 transition-colors`}>
                                            <Icon className={`w-6 h-6 ${feature.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Vision & Story Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <Card className="p-8 card-gradient hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-0 text-white">
                                <h2 className="text-2xl font-semibold text-primary mb-4">Our Vision</h2>
                                <p className="text-muted-foreground text-grey leading-relaxed mb-6">
                                    We envision a world where communities can act faster, stay safer, and recover quicker.
                                    Technology shouldn't just respond — it should predict, prevent, and empower.
                                </p>
                                <p className="text-muted-foreground text-white leading-relaxed">
                                    The interface was thoughtfully designed with accessibility in mind, offering responsive
                                    layouts and smooth animations to enhance user experience across all devices.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="p-8 card-gradient hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-0">
                                <h2 className="text-2xl font-semibold text-primary mb-4">How It Started</h2>
                                <p className="text-muted-foreground text-grey leading-relaxed mb-6">
                                    Originally born from a student-led initiative to enhance safety through AI and robotics,
                                    Crisis Companion has evolved into a multi-functional platform that blends smart design,
                                    real-time responsiveness, and human-centered features.
                                </p>
                                <p className="text-muted-foreground text-white leading-relaxed">
                                    From robotic arm simulations to live alert feeds, our journey reflects constant
                                    adaptation to real-world needs. We're proud to continue improving this project —
                                    not just as developers, but as people who care deeply about protecting others.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center mt-16">
                        <Card className="p-8 card-gradient from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                            <CardContent className="p-0">
                                <h3 className="text-2xl font-semibold mb-4">Ready to Get Involved?</h3>
                                <p className="text-muted-foreground text-white mb-6 max-w-2xl mx-auto">
                                    Join our community of volunteers and help make a difference in emergency response and crisis management.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="lg" className="btn-hover">
                                        Contact Us
                                    </Button>
                                    <Button variant="outline" size="lg" className="btn-hover text-white border-2">
                                        Learn More
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    );
}