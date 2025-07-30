// src/services/voiceInput.ts
export function initVoiceInput(onText: (text: string) => void) {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onText(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Voice recognition error', event.error);
    };
    
    return recognition;
  }
  return null;
}