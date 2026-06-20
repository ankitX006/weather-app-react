import React, { useState, useEffect } from 'react';
import { Search, Wind, Droplets, Cloud, Sun, CloudRain, CloudLightning, Snowflake } from 'lucide-react';
import './App.css';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default city on load
  useEffect(() => {
    fetchWeather('New Delhi');
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={80} color="#FFD700" />;
    if (code >= 1 && code <= 3) return <Cloud size={80} color="#E0E0E0" />;
    if (code >= 51 && code <= 67) return <CloudRain size={80} color="#4facfe" />;
    if (code >= 71 && code <= 77) return <Snowflake size={80} color="#ffffff" />;
    if (code >= 95 && code <= 99) return <CloudLightning size={80} color="#FFa500" />;
    return <Cloud size={80} />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 51 && code <= 67) return 'Rain / Drizzle';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Cloudy';
  };

  const fetchWeather = async (searchCity) => {
    if (!searchCity) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Get coordinates for the city
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchCity}&count=1`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please try another name.');
      }

      const location = geoData.results[0];

      // 2. Get weather data using coordinates
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&hourly=relativehumidity_2m`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        name: location.name,
        country: location.country,
        temp: weatherData.current_weather.temperature,
        windspeed: weatherData.current_weather.windspeed,
        code: weatherData.current_weather.weathercode,
        humidity: weatherData.hourly.relativehumidity_2m[new Date().getHours()] || 50, // Approximation using hourly data
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
    setCity('');
  };

  return (
    <div className="app-container">
      <div className="weather-card">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" className="search-button">
            <Search size={20} />
          </button>
        </form>

        {loading && <div className="loading">Fetching Weather...</div>}

        {error && <div className="error-message">{error}</div>}

        {weather && !loading && (
          <div className="weather-info">
            <h2 className="location-name">
              {weather.name}, <span style={{fontSize: '1.2rem', color: 'var(--text-secondary)'}}>{weather.country}</span>
            </h2>
            
            <div style={{ margin: '20px 0' }}>
              {getWeatherIcon(weather.code)}
            </div>

            <div className="temperature">
              {Math.round(weather.temp)}<span className="unit">°C</span>
            </div>
            
            <div className="weather-description">
              {getWeatherDescription(weather.code)}
            </div>

            <div className="weather-details">
              <div className="detail-item">
                <Droplets className="detail-icon" size={28} />
                <div className="detail-text">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weather.humidity}%</span>
                </div>
              </div>
              <div className="detail-item">
                <Wind className="detail-icon" size={28} />
                <div className="detail-text">
                  <span className="detail-label">Wind Speed</span>
                  <span className="detail-value">{weather.windspeed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
