import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean;
}

export function ChatMessage({ message, isUser, timestamp, isTyping }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex gap-3 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-soft",
        isUser 
          ? "bg-gradient-primary text-chat-user-foreground" 
          : "bg-chat-bot text-chat-bot-foreground border border-border"
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "max-w-[75%] flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl shadow-soft transition-smooth",
          isUser 
            ? "bg-chat-user text-chat-user-foreground rounded-br-md" 
            : "bg-chat-bot text-chat-bot-foreground border border-border rounded-bl-md"
        )}>
          {isTyping ? (
            <div className="flex items-center gap-1">
              <span className="animate-pulse-soft">●</span>
              <span className="animate-pulse-soft delay-100">●</span>
              <span className="animate-pulse-soft delay-200">●</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-2">
          {timestamp}
        </span>
      </div>
    </div>
  );
}