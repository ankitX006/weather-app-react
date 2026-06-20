import React, { useState, useEffect } from 'react';
import { Search, Wind, Droplets, Cloud, Sun, CloudRain, CloudLightning, Snowflake, Thermometer, ArrowUp, ArrowDown, Gauge, SunDim } from 'lucide-react';
import './App.css';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather('New Delhi');
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={90} color="#FFD700" />;
    if (code >= 1 && code <= 3) return <Cloud size={90} color="#E0E0E0" />;
    if (code >= 51 && code <= 67) return <CloudRain size={90} color="#4facfe" />;
    if (code >= 71 && code <= 77) return <Snowflake size={90} color="#ffffff" />;
    if (code >= 95 && code <= 99) return <CloudLightning size={90} color="#FFa500" />;
    return <Cloud size={90} />;
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
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchCity}&count=1`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please try another name.');
      }

      const location = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        name: location.name,
        country: location.country,
        temp: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        windspeed: weatherData.current.wind_speed_10m,
        pressure: weatherData.current.surface_pressure,
        code: weatherData.current.weather_code,
        high: weatherData.daily.temperature_2m_max[0],
        low: weatherData.daily.temperature_2m_min[0],
        uv: weatherData.daily.uv_index_max[0]
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
            placeholder="Search for any city..."
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
              {weather.name}, <span className="country-badge">{weather.country}</span>
            </h2>
            
            <div className="main-weather">
              {getWeatherIcon(weather.code)}
              <div className="temperature-container">
                <div className="temperature">
                  {Math.round(weather.temp)}<span className="unit">°C</span>
                </div>
                <div className="weather-description">
                  {getWeatherDescription(weather.code)}
                </div>
              </div>
            </div>

            <div className="high-low-container">
               <span className="hl-badge"><ArrowUp size={16}/> {Math.round(weather.high)}°</span>
               <span className="hl-badge"><ArrowDown size={16}/> {Math.round(weather.low)}°</span>
            </div>

            <div className="details-grid">
              <div className="detail-card">
                <Thermometer className="detail-icon" size={24} />
                <div className="detail-text">
                  <span className="detail-label">Feels Like</span>
                  <span className="detail-value">{Math.round(weather.feelsLike)}°C</span>
                </div>
              </div>

              <div className="detail-card">
                <Droplets className="detail-icon" size={24} />
                <div className="detail-text">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weather.humidity}%</span>
                </div>
              </div>

              <div className="detail-card">
                <Wind className="detail-icon" size={24} />
                <div className="detail-text">
                  <span className="detail-label">Wind</span>
                  <span className="detail-value">{weather.windspeed} km/h</span>
                </div>
              </div>

              <div className="detail-card">
                <SunDim className="detail-icon" size={24} />
                <div className="detail-text">
                  <span className="detail-label">UV Index</span>
                  <span className="detail-value">{weather.uv || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-card">
                <Gauge className="detail-icon" size={24} />
                <div className="detail-text">
                  <span className="detail-label">Pressure</span>
                  <span className="detail-value">{Math.round(weather.pressure)} hPa</span>
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
