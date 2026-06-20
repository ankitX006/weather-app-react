import React, { useState, useEffect } from 'react';
import { Search, Wind, Droplets, Cloud, Sun, CloudRain, CloudLightning, Snowflake, Thermometer, ArrowUp, ArrowDown, Gauge, Eye } from 'lucide-react';
import './App.css';

const API_KEY = 'ae4bb30524602a1f1de53a3c19880829';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather('New Delhi');
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 800) return <Sun size={90} color="#FFD700" />;
    if (code >= 801 && code <= 804) return <Cloud size={90} color="#E0E0E0" />;
    if (code >= 300 && code < 600) return <CloudRain size={90} color="#4facfe" />;
    if (code >= 600 && code < 700) return <Snowflake size={90} color="#ffffff" />;
    if (code >= 200 && code < 300) return <CloudLightning size={90} color="#FFa500" />;
    return <Cloud size={90} />;
  };

  const fetchWeather = async (searchCity) => {
    if (!searchCity) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
      );
      
      const data = await response.json();

      if (data.cod !== 200) {
        throw new Error(data.message || 'City not found');
      }

      setWeather({
        name: data.name,
        country: data.sys.country,
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        windspeed: (data.wind.speed * 3.6).toFixed(1), // convert m/s to km/h
        pressure: data.main.pressure,
        code: data.weather[0].id,
        description: data.weather[0].description,
        high: data.main.temp_max,
        low: data.main.temp_min,
        visibility: (data.visibility / 1000).toFixed(1) // convert m to km
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

        {error && <div className="error-message" style={{textTransform: 'capitalize'}}>{error}</div>}

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
                <div className="weather-description" style={{textTransform: 'capitalize'}}>
                  {weather.description}
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
                <Eye className="detail-icon" size={24} />
                <div className="detail-text">
                  <span className="detail-label">Visibility</span>
                  <span className="detail-value">{weather.visibility} km</span>
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
