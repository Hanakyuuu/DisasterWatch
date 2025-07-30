// lib/huggingface.ts
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HF_API_URL = 'https://api-inference.huggingface.co/models';

interface HuggingFaceResponse {
  generated_text: string;
  conversation_id?: string;
  warnings?: string[];
}

export const useHuggingFace = () => {
  /**
   * Make direct API calls to Hugging Face inference endpoints
   */
  const queryHuggingFace = async (
    model: string,
    inputs: string,
    parameters = {}
  ): Promise<any> => {
    try {
      const response = await fetch(`${HF_API_URL}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs, parameters }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw error;
    }
  };

  /**
   * Get mental health response using the counseling dataset
   */
  const getMentalHealthResponse = async (
    message: string,
    conversationHistory: string[] = []
  ): Promise<string> => {
    try {
      const context = conversationHistory.join('\n');
      const prompt = `
        [INST] <<SYS>>
        You are a compassionate mental health counselor. 
        Provide supportive, empathetic responses to the user's concerns.
        Keep responses professional but warm.
        <</SYS>>
        
        ${context ? `Conversation Context:\n${context}\n\n` : ''}
        User's message: ${message}
        
        Counselor's response: [/INST]
      `;

      const response = await queryHuggingFace(
        'Amod/mental_health_counseling_conversations',
        prompt,
        {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false
        }
      );

      // Handle both array and object responses
      const generatedText = Array.isArray(response) 
        ? response[0]?.generated_text 
        : response?.generated_text;

      return generatedText?.trim() || "I'm here to listen. Could you tell me more about how you're feeling?";
    } catch (error) {
      console.error('Mental health response error:', error);
      return "I'm having some trouble responding. Could you try again?";
    }
  };

  /**
   * Basic sentiment analysis
   */
  const analyzeMessage = async (text: string) => {
    try {
      const response = await queryHuggingFace(
        'distilbert-base-uncased-finetuned-sst-2-english',
        text
      );
      
      const result = Array.isArray(response) ? response[0] : response;
      return {
        sentiment: result?.label || 'neutral',
        score: result?.score || 0
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { sentiment: 'neutral', score: 0 };
    }
  };

  return {
    getMentalHealthResponse,
    analyzeMessage,
    queryHuggingFace
  };
};