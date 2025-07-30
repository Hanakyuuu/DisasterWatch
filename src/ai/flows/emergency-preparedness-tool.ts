'use server';

/**
 * @fileOverview A tool that helps users determine what data to collect in preparation for various types of emergencies.
 *
 * - emergencyPreparednessTool - A function that suggests useful data to collect for emergency preparedness.
 * - EmergencyPreparednessInput - The input type for the emergencyPreparednessTool function.
 * - EmergencyPreparednessOutput - The return type for the emergencyPreparednessTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmergencyPreparednessInputSchema = z.object({
  emergencyType: z
    .string()
    .describe('The type of emergency to prepare for (e.g., earthquake, hurricane, flood, fire).'),
  location: z.string().describe('The user\u2019s location.'),
});

export type EmergencyPreparednessInput = z.infer<typeof EmergencyPreparednessInputSchema>;

const EmergencyPreparednessOutputSchema = z.object({
  suggestedData: z
    .array(z.string())
    .describe(
      'A list of data points that would be useful for users to collect in preparation for the specified type of emergency, specific to the user location.'
    ),
});

export type EmergencyPreparednessOutput = z.infer<typeof EmergencyPreparednessOutputSchema>;

export async function emergencyPreparednessTool(input: EmergencyPreparednessInput): Promise<EmergencyPreparednessOutput> {
  return emergencyPreparednessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emergencyPreparednessPrompt',
  input: {schema: EmergencyPreparednessInputSchema},
  output: {schema: EmergencyPreparednessOutputSchema},
  prompt: `You are an expert in emergency preparedness.

  Based on the type of emergency and the user's location, suggest a list of data points that would be useful for users to collect in preparation. Consider specific needs for the type of emergency and location.

  Type of emergency: {{{emergencyType}}}
  Location: {{{location}}}

  Return a JSON array of strings, each representing a suggested data point to collect.
  Example: ["Emergency contact information", "Evacuation routes", "Local shelter locations"]`,
});

const emergencyPreparednessFlow = ai.defineFlow(
  {
    name: 'emergencyPreparednessFlow',
    inputSchema: EmergencyPreparednessInputSchema,
    outputSchema: EmergencyPreparednessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
