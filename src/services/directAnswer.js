// src/services/directAnswer.js
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const MODEL = "llama3-70b-8192";
const OPENWEATHER_API_KEY = "your_openweather_api_key";

const DISASTER_KNOWLEDGE = {
  
};

const API_CONFIG = {
  OpenWeather: {
    url: 'https://api.openweathermap.org/data/2.5/onecall',
    enabled: true,
    params: {
      exclude: 'minutely,hourly',
      appid: OPENWEATHER_API_KEY,
      units: 'metric'
    }
  },
  USGS: {
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
    enabled: true,
    params: {
      format: 'geojson',
      limit: 100,
      starttime: '2025-01-01',
      endtime: '2025-12-31'
    }
  }
};

const fetchDisasterData = async (location) => {
  const apiData = {};
  
  if (API_CONFIG.OpenWeather.enabled && location) {
    try {
      const params = new URLSearchParams({
        ...API_CONFIG.OpenWeather.params,
        lat: location.latitude,
        lon: location.longitude
      });
      
      const response = await fetch(`${API_CONFIG.OpenWeather.url}?${params}`);
      if (!response.ok) throw new Error('OpenWeather API failed');
      
      const data = await response.json();
      apiData.weatherAlerts = data.alerts || [];
    } catch (error) {
      console.error('OpenWeather API error:', error);
      apiData.weatherAlerts = { error: 'Weather data unavailable' };
    }
  }
  
  return apiData;
};

// Myanmar geographic boundaries (approximate)
const MYANMAR_BOUNDS = {
  minLatitude: 9.5,   // Southernmost point
  maxLatitude: 28.5,  // Northernmost point
  minLongitude: 92.0, // Westernmost point
  maxLongitude: 101.0 // Easternmost point
};

const fetchMyanmarEarthquake2025 = async () => {
  try {
    const params = new URLSearchParams({
      format: 'geojson',
      starttime: '2025-01-01',
      endtime: '2025-12-31',
      minmagnitude: 5.0,
      minlatitude: MYANMAR_BOUNDS.minLatitude,
      maxlatitude: MYANMAR_BOUNDS.maxLatitude,
      minlongitude: MYANMAR_BOUNDS.minLongitude,
      maxlongitude: MYANMAR_BOUNDS.maxLongitude,
      limit: 100  // Increased limit for better coverage
    });

    const response = await fetch(`${API_CONFIG.USGS.url}?${params}`);
    if (!response.ok) throw new Error(`USGS API failed with status ${response.status}`);
    
    const data = await response.json();
    
    // Enhanced data processing with additional details
    return data.features.map(quake => ({
      magnitude: quake.properties.mag,
      location: quake.properties.place,
      time: new Date(quake.properties.time).toLocaleString(),
      depth: quake.geometry.coordinates[2],
      coordinates: {
        latitude: quake.geometry.coordinates[1],
        longitude: quake.geometry.coordinates[0]
      },
      significance: quake.properties.sig, // Added significance score
      tsunami: quake.properties.tsunami === 1 // Tsunami potential
    }));
  } catch (error) {
    console.error('USGS API error:', error);
    return { 
      error: "Earthquake data currently unavailable",
      details: error.message 
    };
  }
};


const analyzeWithRealTimeData = async (question, location) => {
  try {
    // Check for Myanmar 2025 earthquake specific query
    const isMyanmar2025Query = question.toLowerCase().includes('myanmar') && 
                              (question.includes('2025') || question.includes('recent'));
    
    let specificData = {};
    if (isMyanmar2025Query) {
      specificData.myanmarEarthquakes = await fetchMyanmarEarthquake2025();
    }

    // Get regular real-time data
    const realTimeData = location ? await fetchDisasterData(location) : {};
    const allData = { ...specificData, ...realTimeData };

    // Enhanced context for Myanmar earthquake queries
    const context = [{
      role: "system",
      content: `You're a disaster expert specializing in Asian seismic activity. Follow these rules:
      - For Myanmar earthquake queries, prioritize USGS data
      - Mention magnitude, location, and date when available
      - Compare to historical quakes if relevant
      - For 2025 quakes, verify if data exists (some may be predictions)
      - If no 2025 data exists, explain this clearly`
    }];

    // Add data context if available
    if (Object.keys(allData).length > 0) {
      context.push({
        role: "system",
        content: `Current disaster data: ${JSON.stringify(allData)}`
      });
    }

    // Add user question
    context.push({
      role: "user",
      content: question
    });

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: context,
        temperature: 0.2,
        max_tokens: 400
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error('Groq API failed');
    
    const responseData = await response.json();
    return responseData.choices[0].message.content;
  } catch (error) {
    console.error('Analysis error:', error);
    return null;
  }
};

export const getDisasterAnswer = async (question, location = null) => {
  // 1. Quick check against basic knowledge
  const lowerQuestion = question.toLowerCase();
  for (const [term, answer] of Object.entries(DISASTER_KNOWLEDGE)) {
    if (lowerQuestion.includes(term) && 
        !lowerQuestion.includes('current') && 
        !lowerQuestion.includes('real-time')) {
      return answer;
    }
  }

  // 2. Use enhanced analysis if API key exists
  if (GROQ_API_KEY) {
    const analysis = await analyzeWithRealTimeData(question, location);
    if (analysis) return analysis;
  }

  // 3. Fallback response
  return "I can provide information about floods, earthquakes, wildfires, and other disasters. " + 
         "For current conditions, please share your location.";
};

export const getMyanmarEarthquake2025Info = async () => {
  const question = "What is the latest information about earthquakes in Myanmar during 2025? " +
                 "Include magnitude, location, and potential impacts.";
  return await getDisasterAnswer(question);
};

export const getLocationBasedAnalysis = async (latitude, longitude) => {
  const question = "What are the current natural disaster risks in this area?";
  return await getDisasterAnswer(question, { latitude, longitude });
};