'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-semibold">Crisis Companion</span>
        </Link>
        <nav className="hidden md:flex gap-12">
          <Link href="\" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="user/chatbot" className="text-sm font-medium transition-colors hover:text-primary">
            Chatbot
          </Link>
          <Link href="user/help" className="text-sm font-medium transition-colors hover:text-primary">
            Support
          </Link>
          <Link href="contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contact
          </Link>
          <Link href="about" className="text-sm font-medium transition-colors hover:text-primary">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button className="btn-hover" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
