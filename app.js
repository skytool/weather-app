// OpenWeatherMap API Key
const OWM_API_KEY = '5fedff8a3f0d39c64ae27cea9b4eae4b';

// Animated Weather Icons (Lottie URLs)
const animatedIcons = {
  'sunny': 'https://assets9.lottiefiles.com/temp/lf20_Stdaec.json',
  'clear-night': 'https://assets9.lottiefiles.com/temp/lf20_y6mY3F.json',
  'partly-cloudy': 'https://assets9.lottiefiles.com/temp/lf20_dgjK9i.json',
  'cloudy': 'https://assets5.lottiefiles.com/temp/lf20_VAmWRg.json',
  'rain': 'https://assets5.lottiefiles.com/temp/lf20_rpC1Rd.json',
  'thunder': 'https://assets5.lottiefiles.com/temp/lf20_XkF78Y.json',
  'snow': 'https://assets5.lottiefiles.com/temp/lf20_WtPCZs.json',
  'mist': 'https://assets9.lottiefiles.com/temp/lf20_kOfPKE.json',
};

// OpenWeatherMap icon code to animation mapping
const owmIconToAnim = {
  '01d': 'sunny', '01n': 'clear-night',
  '02d': 'partly-cloudy', '02n': 'partly-cloudy',
  '03d': 'cloudy', '03n': 'cloudy',
  '04d': 'cloudy', '04n': 'cloudy',
  '09d': 'rain', '09n': 'rain',
  '10d': 'rain', '10n': 'rain',
  '11d': 'thunder', '11n': 'thunder',
  '13d': 'snow', '13n': 'snow',
  '50d': 'mist', '50n': 'mist',
};

// Emoji fallback
const weatherEmoji = {
  'sunny': '☀️',
  'clear-night': '🌙',
  'partly-cloudy': '⛅',
  'cloudy': '☁️',
  'rain': '🌧️',
  'thunder': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Convert C to F
function cToF(c) {
  return Math.round((c * 9/5) + 32);
}

// Get animation type from OWM icon
function getAnimType(iconCode) {
  return owmIconToAnim[iconCode] || 'sunny';
}

// Get animated icon HTML
function getAnimatedIcon(iconCode, size = 120) {
  const animType = getAnimType(iconCode);
  const url = animatedIcons[animType];
  if (url) {
    return `<lottie-player src="${url}" background="transparent" speed="1" style="width: ${size}px; height: ${size}px;" loop autoplay></lottie-player>`;
  }
  return `<span style="font-size: ${size * 0.8}px">${weatherEmoji[animType]}</span>`;
}

// Check if night
function isNight() {
  const hour = new Date().getHours();
  return hour < 6 || hour > 18;
}

// Format hour
function formatHour(timestamp) {
  const date = new Date(timestamp * 1000);
  const hour = date.getHours();
  if (hour === new Date().getHours()) return 'Now';
  return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}PM` : `${hour === 0 ? 12 : hour}AM`;
}

// Get day name
function getDayName(timestamp, index) {
  if (index === 0) return 'Today';
  const date = new Date(timestamp * 1000);
  return days[date.getDay()];
}

// Update UI with OpenWeatherMap data
function updateUI(current, forecast, location) {
  const night = isNight();

  // Toggle night mode
  if (night) {
    document.body.classList.add('night');
  } else {
    document.body.classList.remove('night');
  }

  // Location
  document.getElementById('location-name').textContent = location;

  // Current weather with animated icon
  document.getElementById('current-icon').innerHTML = getAnimatedIcon(current.weather[0].icon, 140);
  
  // Temperature in C and F
  const tempC = Math.round(current.main.temp);
  const tempF = cToF(current.main.temp);
  document.getElementById('current-temp').innerHTML = `${tempC}°<span class="temp-unit">C</span> <span class="temp-divider">/</span> ${tempF}°<span class="temp-unit">F</span>`;
  
  document.getElementById('current-desc').textContent = current.weather[0].description;
  
  // Get today's high/low from forecast
  const todayData = forecast.list.filter(item => {
    const itemDate = new Date(item.dt * 1000).toDateString();
    return itemDate === new Date().toDateString();
  });
  const todayTemps = todayData.map(d => d.main.temp);
  const highC = Math.round(Math.max(...todayTemps, current.main.temp));
  const lowC = Math.round(Math.min(...todayTemps, current.main.temp));
  
  document.getElementById('temp-high').textContent = `${highC}°/${cToF(highC)}°`;
  document.getElementById('temp-low').textContent = `${lowC}°/${cToF(lowC)}°`;

  // Details - dual units
  const windKmh = Math.round(current.wind.speed * 3.6);
  const windMph = Math.round(current.wind.speed * 2.237);
  document.getElementById('wind').innerHTML = `${windKmh}<small>km/h</small><br>${windMph}<small>mph</small>`;
  document.getElementById('humidity').textContent = `${current.main.humidity}%`;
  const visKm = (current.visibility / 1000).toFixed(1);
  const visMi = (current.visibility / 1609.34).toFixed(1);
  document.getElementById('visibility').innerHTML = `${visKm}<small>km</small> / ${visMi}<small>mi</small>`;
  const feelsC = Math.round(current.main.feels_like);
  const feelsF = cToF(current.main.feels_like);
  document.getElementById('feels-like').innerHTML = `${feelsC}°<small>C</small> / ${feelsF}°<small>F</small>`;

  // Hourly forecast (next 12 hours from 3-hour intervals)
  const hourlyContainer = document.getElementById('hourly');
  hourlyContainer.innerHTML = forecast.list.slice(0, 8).map((hour, i) => `
    <div class="hour-item">
      <div class="hour-time">${i === 0 ? 'Now' : formatHour(hour.dt)}</div>
      <div class="hour-icon">${getAnimatedIcon(hour.weather[0].icon, 40)}</div>
      <div class="hour-temp">${Math.round(hour.main.temp)}°<small>/${cToF(hour.main.temp)}°</small></div>
    </div>
  `).join('');

  // 7-Day forecast (group by day)
  const dailyData = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyData[date]) {
      dailyData[date] = { temps: [], icons: [], dt: item.dt };
    }
    dailyData[date].temps.push(item.main.temp);
    dailyData[date].icons.push(item.weather[0].icon);
  });

  const dailyContainer = document.getElementById('daily');
  dailyContainer.innerHTML = Object.entries(dailyData).slice(0, 7).map(([date, data], i) => {
    const high = Math.round(Math.max(...data.temps));
    const low = Math.round(Math.min(...data.temps));
    // Get midday icon (or first available)
    const icon = data.icons[Math.floor(data.icons.length / 2)] || data.icons[0];
    return `
      <div class="day-item">
        <div class="day-name">${getDayName(data.dt, i)}</div>
        <div class="day-icon">${getAnimatedIcon(icon, 32)}</div>
        <div class="day-temps">
          <span class="day-high">${high}°<small>/${cToF(high)}°</small></span>
          <span class="day-low">${low}°<small>/${cToF(low)}°</small></span>
        </div>
      </div>
    `;
  }).join('');

  // Fetch alerts
  fetchAlerts(current.coord.lat, current.coord.lon);

  // Show weather, hide loading
  document.getElementById('loading').style.display = 'none';
  document.getElementById('weather-container').style.display = 'block';
}

// Show loading
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('weather-container').style.display = 'none';
}

// Fetch weather data from OpenWeatherMap
async function fetchWeather(query) {
  showLoading();
  try {
    let lat, lon, locationName;
    
    // If query is coordinates
    if (query && query.includes(',')) {
      [lat, lon] = query.split(',').map(Number);
    } else {
      // Geocode city name
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query || 'Dallas')}&limit=1&appid=${OWM_API_KEY}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      
      if (!geoData.length) throw new Error('City not found');
      
      lat = geoData[0].lat;
      lon = geoData[0].lon;
      locationName = geoData[0].state 
        ? `${geoData[0].name}, ${geoData[0].state}`
        : `${geoData[0].name}, ${geoData[0].country}`;
    }
    
    // Fetch current weather and forecast
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_API_KEY}`)
    ]);
    
    const current = await currentRes.json();
    const forecast = await forecastRes.json();
    
    if (current.cod !== 200) throw new Error(current.message);
    
    // Build location name if from coordinates
    if (!locationName) {
      locationName = current.sys.country === 'US' 
        ? `${current.name}` 
        : `${current.name}, ${current.sys.country}`;
    }
    
    updateUI(current, forecast, locationName);
  } catch (error) {
    console.error('Error fetching weather:', error);
    document.getElementById('loading').innerHTML = `
      <div class="loading-icon">⚠️</div>
      <p>Unable to load weather</p>
      <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
    `;
  }
}

// Fetch weather alerts (US only - weather.gov)
async function fetchAlerts(lat, lon) {
  try {
    const response = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`);
    const data = await response.json();
    
    const alertsContainer = document.getElementById('alerts-container');
    const alertsDiv = document.getElementById('alerts');
    
    if (data.features && data.features.length > 0) {
      const alerts = data.features.slice(0, 3);
      
      alertsDiv.innerHTML = alerts.map(alert => {
        const props = alert.properties;
        const severity = props.severity?.toLowerCase() || 'moderate';
        const icon = severity === 'extreme' ? '🚨' : severity === 'severe' ? '⚠️' : '⚡';
        
        return `
          <div class="alert-item">
            <div class="alert-icon">${icon}</div>
            <div class="alert-content">
              <div class="alert-title">${props.event}</div>
              <div class="alert-desc">${props.headline || ''}</div>
            </div>
          </div>
        `;
      }).join('');
      
      const maxSeverity = alerts[0].properties.severity?.toLowerCase();
      alertsDiv.className = `alert-card alert-severity-${maxSeverity}`;
    } else {
      alertsDiv.innerHTML = `
        <div class="alert-item calm">
          <div class="alert-icon">😌</div>
          <div class="alert-content">
            <div class="alert-title">All Clear</div>
            <div class="alert-desc">No active weather alerts. Enjoy your day!</div>
          </div>
        </div>
      `;
      alertsDiv.className = 'alert-card alert-calm';
    }
    alertsContainer.style.display = 'block';
  } catch (error) {
    console.log('Alerts not available:', error);
    document.getElementById('alerts-container').style.display = 'none';
  }
}

// Search functionality
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = searchInput.value.trim();
    if (city) {
      localStorage.setItem('weatherCity', city);
      fetchWeather(city);
      searchInput.blur();
    }
  }
});

// Get saved city or use geolocation
function getLocation() {
  const savedCity = localStorage.getItem('weatherCity');
  if (savedCity) {
    searchInput.value = savedCity;
    fetchWeather(savedCity);
    return;
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
      },
      error => {
        console.log('Location denied, using default');
        fetchWeather('Dallas');
      },
      { timeout: 5000 }
    );
  } else {
    fetchWeather('Dallas');
  }
}

// Initialize
getLocation();
