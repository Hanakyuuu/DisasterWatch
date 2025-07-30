// services/mentalHealthApi.ts
import { HuggingFaceInference } from '@huggingface/inference';

const hf = new HuggingFaceInference(process.env.HUGGINGFACE_API_KEY!);

export async function getMentalHealthResponse(question: string, context: string[]) {
  // Load dataset (you'll need to implement this server-side)
  const prompt = `
    You are a compassionate mental health counselor. Respond to the following concern:
    User: ${question}
    Context: ${context.join('\n')}
    
    Respond with empathy and professional insight:
  `;

  const response = await hf.textGeneration({
    model: 'Amod/mental_health_counseling_conversations',
    inputs: prompt,
    parameters: {
      max_new_tokens: 200,
      temperature: 0.7,
    }
  });

  return response.generated_text;
}