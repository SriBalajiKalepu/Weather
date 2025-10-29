const express = require('express');
const axios = require('axios');
const Weather = require('../models/Weather');

const router = express.Router();

// GET /api/weather?city=CityName
router.get('/weather', async (req, res) => {
  const city = (req.query.city || '').toString().trim();
  if (!city) {
    return res.status(400).json({ error: 'City query parameter is required' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const owUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey || ''}&units=metric`;

  try {
    if (!apiKey) throw { response: { status: 401, data: { message: 'Missing API key' } } };
    const response = await axios.get(owUrl);
    const data = response.data;
    return res.json({
      cityName: data.name,
      temperature: data.main?.temp,
      humidity: data.main?.humidity,
      conditions: data.weather?.[0]?.description,
      source: 'openweather'
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const upstream = err.response?.data || null;
    // If OpenWeather fails due to auth/rate limit, try Open-Meteo fallback
    if (status === 401 || status === 403 || status === 429) {
      try {
        // 1) Geocode city to lat/lon (Open-Meteo geocoding)
        const geoResp = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
          params: { name: city, count: 1 }
        });
        const loc = geoResp.data?.results?.[0];
        if (!loc) throw new Error('City not found in geocoding');

        // 2) Fetch current weather by lat/lon
        const meteoResp = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            current: 'temperature_2m,relative_humidity_2m,weather_code'
          }
        });
        const cur = meteoResp.data?.current || {};

        // Map Open-Meteo weather_code to a simple description
        const code = cur.weather_code;
        const codeMap = {
          0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
          45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
          61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
          80: 'Rain showers', 81: 'Rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Thunderstorm w/ heavy hail'
        };

        return res.json({
          cityName: loc.name,
          temperature: cur.temperature_2m,
          humidity: cur.relative_humidity_2m,
          conditions: codeMap[code] || 'Unknown conditions',
          source: 'open-meteo'
        });
      } catch (fallbackErr) {
        const fbStatus = fallbackErr.response?.status || 500;
        const fbUpstream = fallbackErr.response?.data || null;
        console.error('Fallback error:', fbStatus, fbUpstream || fallbackErr.message);
        return res.status(status).json({
          error: 'Failed to fetch weather',
          details: err.message,
          upstream,
        });
      }
    }

    console.error('OpenWeather error:', status, upstream || err.message);
    return res.status(status).json({
      error: 'Failed to fetch weather',
      details: err.message,
      upstream,
    });
  }
});

// POST /api/saveWeather
router.post('/saveWeather', async (req, res) => {
  try {
    const { cityName, temperature, humidity, conditions } = req.body || {};

    if (!cityName || temperature === undefined || humidity === undefined || !conditions) {
      return res.status(400).json({
        error:
          'cityName, temperature, humidity, and conditions are required to save weather data',
      });
    }

    const weatherDoc = new Weather({ cityName, temperature, humidity, conditions });
    const saved = await weatherDoc.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save weather', details: err.message });
  }
});

module.exports = router;


