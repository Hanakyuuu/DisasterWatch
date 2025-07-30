// Earthquake API fetcher: fetches earthquakes since 2010
export const fetchEarthquakes = async (limit = 2000) => {
  // USGS API: https://earthquake.usgs.gov/fdsnws/event/1/
  // We'll use the GeoJSON API with a starttime of 2010-01-01
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2010-01-01&limit=${limit}&orderby=time`;
  try {
    const response = await axios.get(url);
    return response.data.features || [];
  } catch (error) {
    console.error('[fetchEarthquakes] Error fetching data:', error);
    return [];
  }
};
// src/services/qaApi.js
import axios from 'axios';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
console.log('[qaApi.js] Loaded GROQ_API_KEY:', GROQ_API_KEY ? 'present' : 'missing');
const MODEL = "llama3-70b-8192";

// Local knowledge base (default)
const LOCAL_QNA = [
  {
    question: "What is an earthquake?",
    answer: "An earthquake is the shaking of the ground caused by sudden movements along faults in Earth's crust.",
    keywords: ["earthquake", "definition", "basics"]
  },
  {
    question: "What should I do during an earthquake?",
    answer: "Drop, Cover, and Hold On. Stay indoors until shaking stops and stay away from windows.",
    keywords: ["safety", "during", "protection"]
  },
  {
    question: "How are earthquakes measured?",
    answer: "Earthquakes are measured using seismographs which record seismic waves. The magnitude is reported on the Richter scale.",
    keywords: ["measurement", "richter", "seismograph"]
  }
];

// Default export - uses local Q&A only
export const getDefaultQnA = () => {
  console.log("Using local Q&A knowledge base");
  return LOCAL_QNA;
};

// Flexible AI-powered Q&A generation
export const generateQnAPairs = async (userQuestion = null) => {
  if (!GROQ_API_KEY) {
    console.warn('Groq API key missing — falling back to local Q&A');
    return LOCAL_QNA;
  }

  try {
    const messages = [
      {
        role: "system",
        content: `You are a geology expert. Generate valid JSON with earthquake Q&A pairs in this format: 
        {qna: [{question: string, answer: string, keywords: string[]}]}`
      }
    ];

    // Customize prompt based on whether we have a specific question
    if (userQuestion) {
      messages.push({
        role: "user",
        content: `Generate a detailed long answer and explain in two sentence for: "${userQuestion}". Return ONLY JSON with one Q&A pair.`
      });
    } else {
      messages.push({
        role: "user",
        content: "Generate 5 Q&A pairs about earthquakes (safety, science, history). Return ONLY JSON."
      });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: MODEL,
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" },
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const content = JSON.parse(response.data.choices[0].message.content);
    return content.qna || LOCAL_QNA;

  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    return LOCAL_QNA;
  }
};

// Helper function to search both local and AI-generated Q&A
export const searchQnA = async (question) => {
  // First check local Q&A
  const localMatch = LOCAL_QNA.find(item => 
    item.question.toLowerCase().includes(question.toLowerCase()) ||
    item.answer.toLowerCase().includes(question.toLowerCase())
  );
  
  if (localMatch) return [localMatch];

  // If no local match, try generating a specific answer
  try {
    const aiResults = await generateQnAPairs(question);
    return Array.isArray(aiResults) ? aiResults : [aiResults];
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};
