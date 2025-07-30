'use client';

import { LayoutDashboard, Bot, LifeBuoy , Calendar, UserCircle, User, KeyRound, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    console.log('Logging out...');
    // Add your logout logic here
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const navItems = [
    { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Chatbot', href: '/user/chatbot', icon: Bot },
    { name: 'Support', href: '/user/help', icon: LifeBuoy  },
    { name: 'Past Events', href: '/user/event', icon: Calendar },
  ];

  const profileSubItems = [
    { name: 'My Profile', href: '/user/profile', icon: User },
    { name: 'Password Change', href: '/user/changepassword', icon: KeyRound },
  ];

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarContent className="p-4">
        {/* Profile Avatar */}
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
              {/* Regular Nav Items */}
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center gap-3 px-5 py-5 rounded-lg transition-all duration-300 cursor-pointer 
              ${isActive ? 'bg-sky-500/20 text-sky-700 font-semibold' : 'hover:bg-black/10 text-muted-foreground'}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Collapsible Profile Section */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-5 py-5 rounded-lg text-muted-foreground hover:bg-black/10"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">Account</span>
                  </div>
                  {profileOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-4 h-4" />}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Submenu under Profile */}
              {!isCollapsed && profileOpen && (
                <SidebarMenu className="mt-1 space-y-1">
                  {profileSubItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          onClick={() => handleNavigation(item.href)}
                          className={`w-full flex items-center justify-center px-5 py-5 rounded-lg transition-all duration-300 cursor-pointer 
                            ${isActive ? 'bg-sky-500/20 text-sky-700 font-semibold' : 'hover:bg-black/10 text-muted-foreground'}`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-border">
        <Link href="/logout">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="group w-full flex gap-3 px-3 py-3 rounded-lg transition-all duration-300 hover:bg-black/10 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2"
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
