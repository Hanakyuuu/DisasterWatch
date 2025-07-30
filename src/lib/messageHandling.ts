import { Message } from "@/types";
import { formatTime } from "@/lib/utils";

export const createMessage = (
  content: string,
  isUser: boolean,
  isTyping = false
): Message => ({
  id: Date.now().toString(),
  content,
  isUser,
  timestamp: formatTime(new Date()),
  ...(isTyping && { isTyping: true }),
});

export const addMessageToState = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  message: Message
) => {
  setMessages((prev) => [...prev, message]);
};

export const handleErrorResponse = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  error: unknown
) => {
  const errorMessage = createMessage(
    "Sorry, I'm having trouble responding. Please try again later.",
    false
  );
  addMessageToState(setMessages, errorMessage);
};