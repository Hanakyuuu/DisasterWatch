'use client';

import {
  MessageCircle,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Info,
  Heart,
  Bell,
  Clock,
  CheckCircle,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

// ------------ FeatureCard Component (Same) ----------------

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: 'emergency' | 'safety' | 'info' | 'warning';
  onClick?: () => void;
}

const variantStyles = {
  emergency: 'hover:shadow-[0_8px_30px_-6px_hsl(0,84%,60%,0.3)] border-destructive/20 bg-gradient-to-br from-destructive-soft to-white',
  safety: 'hover:shadow-[0_8px_30px_-6px_hsl(142,76%,36%,0.3)] border-success/20 bg-gradient-to-br from-success-soft to-white',
  info: 'hover:shadow-[0_8px_30px_-6px_hsl(199,89%,48%,0.3)] border-info/20 bg-gradient-to-br from-info-soft to-white',
  warning: 'hover:shadow-[0_8px_30px_-6px_hsl(38,92%,50%,0.3)] border-warning/20 bg-gradient-to-br from-warning-soft to-white',
};

const iconStyles = {
  emergency: 'text-destructive bg-destructive-soft',
  safety: 'text-success bg-success-soft',
  info: 'text-info bg-info-soft',
  warning: 'text-warning bg-warning-soft',
};

const FeatureCard = ({ title, description, icon: Icon, variant, onClick }: FeatureCardProps) => (
  <Card
    className={`p-4 transition-all duration-300 bg-sky cursor-pointer group hover:scale-105 border-2 ${variantStyles[variant]}`}
    onClick={onClick}
  >
    <div className="flex items-start gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${iconStyles[variant]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </Card>
);

// ------------ AdminDashboardHero ----------------

const AdminDashboardHero = () => {
  const features = [
    {
      title: 'Manage Alerts',
      icon: AlertTriangle,
      description: 'Review and issue emergency alerts to users.',
      variant: 'emergency' as const,
    },
    {
      title: 'Track Locations',
      icon: MapPin,
      description: 'Monitor reported user locations during emergencies.',
      variant: 'info' as const,
    },
    {
      title: 'Chatbot Logs',
      icon: MessageCircle,
      description: 'Analyze user queries and support sessions.',
      variant: 'info' as const,
    },
    {
      title: 'Upload Resources',
      icon: ShieldCheck,
      description: 'Add and maintain safety guidelines and documents.',
      variant: 'safety' as const,
    },
    {
      title: 'User Support',
      icon: Heart,
      description: 'Respond to support requests and mental health reports.',
      variant: 'safety' as const,
    },
    {
      title: 'Crisis Protocols',
      icon: Info,
      description: 'Update and verify emergency response protocols.',
      variant: 'warning' as const,
    },
  ];

  return (
    <div className="w-[900px] min-h-[800px] ml-6 relative overflow-hidden bg-background shadow-md rounded-2xl p-5 text-primary mb-8">
      <div className="absolute inset-0 opacity-50">
        <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
              <Link href="/" className="item-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
              </Link>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
              <p className="text-primary text-lg">Control center for crisis management</p>
            </div>
          </div>

          <Link href="/admin/alerts" className="item-center gap-2">
            <Button
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm text-black-hover border-white/30 hover:bg-white/30 transition-smooth"
            >
              <Bell className="w-4 h-4 mr-2" />
              View All Alerts
            </Button>
          </Link>
        </div>

        <RecentAlerts />

        <div className="m-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              variant={feature.variant}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------ RecentAlerts (Reused) ----------------

type Severity = 'high' | 'medium' | 'low';
type Status = 'active' | 'resolved';

interface Alert {
  id: number;
  type: string;
  message: string;
  location: string;
  time: string;
  severity: Severity;
  status: Status;
}

const alerts: Alert[] = [
  {
    id: 1,
    type: 'Weather Alert',
    message: 'Severe thunderstorm warning in your area',
    location: 'Downtown District',
    time: '2 hours ago',
    severity: 'high',
    status: 'active',
  },
  {
    id: 2,
    type: 'Safety Update',
    message: 'All clear - Emergency situation resolved',
    location: 'City Center',
    time: '1 day ago',
    severity: 'low',
    status: 'resolved',
  },
];

const severityStyles: Record<Severity, string> = {
  high: 'bg-destructive text-destructive-foreground',
  medium: 'bg-warning text-warning-foreground',
  low: 'bg-success text-success-foreground',
};

const statusStyles: Record<Status, string> = {
  active: 'bg-info/10 text-info border-info/20',
  resolved: 'bg-success/10 text-success border-success/20',
};

const RecentAlerts = () => (
  <div className="p-6 -mt-5 bg-white/10 backdrop-blur-md border-white/20">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-black/70">Recent Alerts</h2>
      <Badge variant="outline" className="text-green border-white/40">
        {alerts.filter((alert) => alert.status === 'active').length} Active
      </Badge>
    </div>

    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-medium ${statusStyles[alert.status]}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {alert.status === 'resolved' ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold">{alert.type}</h3>
                  <p className="text-sm text-primary/80">{alert.message}</p>
                </div>
                <Badge className={`${severityStyles[alert.severity]} flex-shrink-0`} variant="outline">
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-primary/70">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{alert.time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ------------ Main Page ----------------

const AdminDashboard = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 py-3">
        <AdminDashboardHero />
        <footer className="text-center bg-white py-2 border-t text-primary pt-4 border-border">
          <p className="text-primary text-sm">
            © {new Date().getFullYear()} Crisis Companion Admin. Managing safety with care.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
