import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}export const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
  if (ref.current) {
    ref.current.scrollTop = ref.current.scrollHeight;
  }
};



