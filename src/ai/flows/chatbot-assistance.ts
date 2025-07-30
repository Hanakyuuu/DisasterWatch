'use server';

/**
 * @fileOverview Provides an AI chatbot for registered users to receive emotional support and disaster-related information.
 *
 * - chatbotAssistance - A function that handles the chatbot interaction.
 * - ChatbotAssistanceInput - The input type for the chatbotAssistance function.
 * - ChatbotAssistanceOutput - The return type for the chatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotAssistanceInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  userId: z.string().describe('The ID of the user interacting with the chatbot.'),
});
export type ChatbotAssistanceInput = z.infer<typeof ChatbotAssistanceInputSchema>;

const ChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
});
export type ChatbotAssistanceOutput = z.infer<typeof ChatbotAssistanceOutputSchema>;

export async function chatbotAssistance(input: ChatbotAssistanceInput): Promise<ChatbotAssistanceOutput> {
  return chatbotAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotAssistancePrompt',
  input: {schema: ChatbotAssistanceInputSchema},
  output: {schema: ChatbotAssistanceOutputSchema},
  prompt: `You are a helpful AI chatbot designed to provide emotional support and answer disaster-related questions.  You are interacting with user {{userId}}. Be supportive, informative and concise.

User message: {{{message}}}`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const chatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'chatbotAssistanceFlow',
    inputSchema: ChatbotAssistanceInputSchema,
    outputSchema: ChatbotAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
