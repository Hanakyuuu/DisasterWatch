'use client'

import Link from 'next/link'
import { Shield, Heart, Phone, Mail } from 'lucide-react'
import { Logo } from '@/components/icons' // Optional: you can still use your logo if needed

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Brand and Description */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Link href="#" className="flex items-center gap-2" prefetch={false}>
                <Logo className="h-15 w-15 text-primary" />
              </Link>
              <div>
                <h3 className="text-xl font-bold">Crisis Companion</h3>
                <p className="text-sm text-background/70">Support when you need it most</p>
              </div>
            </div>
            <p className="text-background/80 leading-relaxed">
              Providing reliable crisis support, mental health resources, 
              and emergency preparedness tools to help communities stay safe and connected.
            </p>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Quick Access</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-background/80 hover:text-background transition-smooth">Crisis Chat</Link></li>
              <li><Link href="#" className="text-background/80 hover:text-background transition-smooth">Emergency Hotlines</Link></li>
              <li><Link href="#" className="text-background/80 hover:text-background transition-smooth">Safety Guides</Link></li>
              <li><Link href="#" className="text-background/80 hover:text-background transition-smooth">Local Resources</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-background/80 hover:text-background transition-smooth">Mental Health</Link></li>
              <li><Link href="#" className="text-background/80 hover:text-background transition-smooth">Disaster Prep</Link></li>
              <li><Link href="#" className="text-background/80 hover:text-background transition-smooth">Community</Link></li>
              <li><Link href="#" className="text-background/80 hover:text-background transition-smooth">Help Center</Link></li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Emergency Contacts</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-destructive" />
                <span className="text-background/80">911 - Emergency Services</span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-background/80">988 - Crisis Lifeline</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-background/60" />
                <span className="text-background/80">support@crisiscompanion.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-background/60 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Crisis Companion. Dedicated to supporting communities in crisis.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="#" className="text-background/80 hover:text-background transition-smooth">Privacy Policy</Link>
              <Link href="#" className="text-background/80 hover:text-background transition-smooth">Terms of Service</Link>
              <Link href="#" className="text-background/80 hover:text-background transition-smooth">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}