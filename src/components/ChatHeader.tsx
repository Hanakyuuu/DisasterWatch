'use client';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { MoreVertical, X, Heart} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  isOnline?: boolean;
   actionButton?: React.ReactNode;isTherapyMode?: boolean;
  onTherapyModeToggle?: () => void;
}

export function ChatHeader({ 
  title, 
  subtitle, 
  onClose,
  isOnline = true,
actionButton,
  isTherapyMode = false,
  onTherapyModeToggle
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-soft">
      <div className="flex items-center gap-3">
        {/* Bot Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
        <Link href="/" className="item-center gap-2" >
          <Logo className="h-6 w-6 text-primary" />
        </Link>
        </div>

        {/* Title and Status */}
        <div className="flex flex-col">
          <h2 className="font-semibold text-foreground text-lg">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{subtitle}</span>
            <Badge 
              variant={isOnline ? "default" : "secondary"}
              className={cn(
                "text-xs px-2 py-0 pointer-events-none",
                isOnline 
                  ? "bg-green-400 text-white" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {onTherapyModeToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onTherapyModeToggle}
           className={cn(
              "text-muted-foreground hover:text-foreground",
              isTherapyMode ? "text-red-500 hover:text-red-600" : "text-blue-500 hover:text-blue-600"
            )}
            title={isTherapyMode ? "Switch to Crisis Mode" : "Switch to Therapy Mode"}
          >
            <Heart className="w-4 h-4" />
          </Button>
        )}
        {actionButton}

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}