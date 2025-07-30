export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean;
}

export type ExerciseType = 'grounding' | 'breathing' | 'journaling' | null;

export interface ExerciseState {
  type: ExerciseType;
  step: number;
  answers: string[];
}

export type WellnessOption = 'grounding' | 'vent' | 'breathing' | 'journal';