import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5500;

app.use(express.static(path.join(__dirname)));
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})
app.get('/api/weather', async(req,res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'Missing city parameter' });
    try {
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoResponse.json();

      if(!geoData.results || geoData.results.length === 0) {
          return res.status(404).json({ error: 'City not found' });
      }

      const { latitude, longitude } = geoData.results[0];

      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=auto`);
      const weatherData = await weatherResponse.json();

      const airQualityResponse = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=carbon_dioxide`);
      const airData = await airQualityResponse.json();

      const weeklyForecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&daily=temperature_2m_min,temperature_2m_max`);
      const weeklyForecastData = await weeklyForecastResponse.json();

      res.json({
        location: geoData.results[0].name,
        weather: weatherData,
        airQuality: airData,
        weeklyForecast: weeklyForecastData.daily

      });
  }
  catch(error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch data' });
  }
})



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});