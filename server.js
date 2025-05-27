import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5500;

app.use(express.static(path.join(__dirname, "APITraining")));
app.get('/api/weather', async(req,res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'Missing city parameter' });

})
async function getData() {
    try {
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoResponse.json();

      if(!geoData.results || geoData.results.length === 0) {
          return res.status(404).json({ error: 'City not found' });
      }

      const { latitude, longitude } = geoData.results[0];

      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=auto`);
      const weatherData = await weatherResponse.json();

      res.json({
        location: geoData.results[0].name,
        weather: weatherData,
      });
  }
  catch(error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch data' });
  }
}

getData();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});