import { useState } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Type your message here...",
  value,
  onChange
}: ChatInputProps) {
  const [internalMessage, setInternalMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const isControlled = typeof value === 'string' && typeof onChange === 'function';
  const message = isControlled ? value : internalMessage;
  const setMessage = isControlled ? (() => {}) : setInternalMessage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = isControlled ? value : internalMessage;
    if (messageToSend?.trim() && !disabled) {
      onSendMessage(messageToSend.trim());
      if (!isControlled) {
        setInternalMessage("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording functionality
  };

  return (
    <div className="p-4 border-t border-border bg-background">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={isControlled && onChange ? onChange : (e) => setInternalMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-32 resize-none pr-12 py-3",
              "border-border focus:ring-primary transition-smooth",
              "placeholder:text-muted-foreground"
            )}
            rows={1}
          />
          
          {/* Voice recording button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-1 text-muted-foreground",
              isRecording && "text-destructive animate-pulse-soft"
            )}
            onClick={toggleRecording}
            disabled={disabled}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={disabled || !message.trim()}
          className={cn(
            "flex-shrink-0 text-primary transition-smooth",
            message.trim() 
              ? "bg-gradient-primary hover:shadow-medium" 
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive animate-fade-in">
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse-soft" />
          Recording... Tap mic to stop
        </div>
      )}
    </div>
  );
}