export const fetchEarthquakes = async (options = {}) => {
  const { limit = 2000, region } = options;
  
  try {
    let url;
    
    // For Myanmar specifically, we can use geographic coordinates
    if (region === 'Myanmar') {
       url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-01-01&minlatitude=9.5&maxlatitude=28.5&minlongitude=92.2&maxlongitude=101.2`;

    } else {
      // Base URL for all earthquakes
      url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson`;
    }

    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features.slice(0, limit);
    
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return [];
  }
};