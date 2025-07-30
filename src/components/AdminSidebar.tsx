'use client';

import {
    Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar,
} from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LayoutDashboard, Users, ShieldPlus, Eye, UserPlus, UserCircle, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from 'react';

const navSections = [
    {
        title: "Volunteer",
        items: [
            { name: "View Volunteer", href: "/admin/view-volunteer", icon: Eye },
            { name: "Add Volunteer", href: "/admin/add-volunteer", icon: UserPlus },
        ],
    },
    {
        title: "Admin",
        items: [
            { name: "View Admin", href: "/admin/view-admin", icon: Eye },
            { name: "Add Admin", href: "/admin/add-admin", icon: UserPlus },
        ],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        Volunteer: false,
        Admin: false,
    });

    const handleLogout = () => {
        console.log('Logging out...');
    };

    const handleNavigation = (href: string) => {
        router.push(href);
    };

    const toggleSection = (title: string) => {
        setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <Sidebar className="border-r border-border bg-card">
            <SidebarContent className="p-4">
                {/* Profile */}
                <div className="flex flex-col items-center justify-center mt-4 mb-2">
                    <div className="relative">
                        <Image
                            src="/robot4.png"
                            alt="Profile"
                            width={50}
                            height={50}
                            className="rounded-full border-2 border-primary/20 object-cover transition-all duration-200"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-700">@Full Name</p>
                </div>

                <SidebarGroup className="flex-1">
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-2">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => handleNavigation("/admin/admin-dashboard")}
                                    className={`relative w-full flex items-center gap-3 px-5 py-5 rounded-lg transition-all duration-300 cursor-pointer 
                                        ${pathname === '/admin/admin-dashboard' ? 'bg-sky-500/20 text-sky-700 font-semibold' : 'hover:bg-black/10 text-muted-foreground'}`}
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span className="font-medium">Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => handleNavigation("/admin/manage-user")}
                                    className={`relative w-full flex items-center gap-3 px-5 py-5 rounded-lg transition-all duration-300 cursor-pointer 
                                        ${pathname === '/admin/manage-user' ? 'bg-sky-500/20 text-sky-700 font-semibold' : 'hover:bg-black/10 text-muted-foreground'}`}
                                >
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">Manage User</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {navSections.map(section => (
                                <div key={section.title}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => toggleSection(section.title)}
                                            className="w-full flex items-center justify-between px-5 py-5 rounded-lg text-muted-foreground hover:bg-black/10"
                                        >   
                                            <span className="font-semibold">{section.title}</span>
                                            {expandedSections[section.title] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    {expandedSections[section.title] && section.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        const Icon = item.icon;
                                        return (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    onClick={() => handleNavigation(item.href)}
                                                    className={`w-full flex items-center gap-3 pl-10 pr-4 py-5 mb-3 rounded-lg transition-all duration-300 cursor-pointer 
                                            ${isActive ? 'bg-sky-500/20 text-sky-700 font-semibold' : 'hover:bg-black/10 text-muted-foreground'}`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="font-medium">{item.name}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </div>
                            ))}

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => handleNavigation("/admin/admin-profile")}
                                    className={`relative w-full flex items-center gap-3 px-5 py-5 rounded-lg transition-all duration-300 cursor-pointer 
                                        ${pathname === '/admin/admin-profile' ? 'bg-sky-500/20 text-sky-700 font-semibold' : 'hover:bg-black/10 text-muted-foreground'}`}
                                >
                                    <UserCircle className="w-5 h-5" />
                                    <span className="font-medium">Admin Profile</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Logout */}
                <div className="mt-auto pt-4 border-t border-border">
                <Link href="/logout">
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="group w-full flex gap-3 px-3 py-3 rounded-lg transition-all duration-300 hover:bg-black/10 text-muted-foreground hover:text-foreground"
                    >
                        <LogOut className="w-5 h-5 group-hover:text-foreground transition-colors duration-300" />
                        <span className="font-medium group-hover:text-foreground transition-colors duration-300">
                            Log Out
                        </span>
                    </Button>
                </Link>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}