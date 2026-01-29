// Animated Weather Icons (Lottie URLs from lottiefiles.com)
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

// Weather code to animation mapping
const codeToAnim = {
  '113': 'sunny',
  '116': 'partly-cloudy',
  '119': 'cloudy',
  '122': 'cloudy',
  '143': 'mist',
  '176': 'rain',
  '179': 'snow',
  '182': 'rain',
  '185': 'rain',
  '200': 'thunder',
  '227': 'snow',
  '230': 'snow',
  '248': 'mist',
  '260': 'mist',
  '263': 'rain',
  '266': 'rain',
  '281': 'rain',
  '284': 'rain',
  '293': 'rain',
  '296': 'rain',
  '299': 'rain',
  '302': 'rain',
  '305': 'rain',
  '308': 'rain',
  '311': 'rain',
  '314': 'rain',
  '317': 'snow',
  '320': 'snow',
  '323': 'snow',
  '326': 'snow',
  '329': 'snow',
  '332': 'snow',
  '335': 'snow',
  '338': 'snow',
  '350': 'rain',
  '353': 'rain',
  '356': 'rain',
  '359': 'rain',
  '362': 'snow',
  '365': 'snow',
  '368': 'snow',
  '371': 'snow',
  '374': 'rain',
  '377': 'rain',
  '386': 'thunder',
  '389': 'thunder',
  '392': 'thunder',
  '395': 'thunder',
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

// Get animation type
function getAnimType(code, isNight = false) {
  let anim = codeToAnim[code] || 'sunny';
  if (isNight && anim === 'sunny') anim = 'clear-night';
  return anim;
}

// Get animated icon HTML
function getAnimatedIcon(code, size = 120, isNight = false) {
  const animType = getAnimType(code, isNight);
  const url = animatedIcons[animType];
  if (url) {
    return `<lottie-player src="${url}" background="transparent" speed="1" style="width: ${size}px; height: ${size}px;" loop autoplay></lottie-player>`;
  }
  return `<span style="font-size: ${size * 0.8}px">${weatherEmoji[animType]}</span>`;
}

// Get emoji icon (for smaller displays)
function getEmoji(code, isNight = false) {
  const animType = getAnimType(code, isNight);
  return weatherEmoji[animType] || '☀️';
}

// Check if night
function isNight() {
  const hour = new Date().getHours();
  return hour < 6 || hour > 18;
}

// Format hour
function formatHour(time) {
  const hour = parseInt(time) / 100;
  if (hour === new Date().getHours()) return 'Now';
  return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}PM` : `${hour === 0 ? 12 : hour}AM`;
}

// Get day name from date string (YYYY-MM-DD)
function getDayName(dateStr, index) {
  if (index === 0) return 'Today';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return days[date.getDay()];
}

// Update UI with weather data
function updateUI(data) {
  const current = data.current_condition[0];
  const location = data.nearest_area[0];
  const forecast = data.weather;
  const night = isNight();

  // Toggle night mode
  if (night) {
    document.body.classList.add('night');
  } else {
    document.body.classList.remove('night');
  }

  // Location with state/region
  const cityName = location.areaName[0].value;
  const region = location.region[0].value;
  const country = location.country[0].value;
  
  // Fetch alerts for US locations
  const lat = location.latitude;
  const lon = location.longitude;
  if (country === 'United States of America' || country === 'USA') {
    fetchAlerts(lat, lon);
  } else {
    document.getElementById('alerts-container').style.display = 'none';
  }
  
  // Show: City, State (for US) or City, Region, Country
  let locationText = cityName;
  if (region && region !== cityName) {
    locationText += `, ${region}`;
  }
  if (country !== 'United States of America' && country !== 'USA') {
    locationText += `, ${country}`;
  }
  document.getElementById('location-name').textContent = locationText;

  // Current weather with animated icon
  document.getElementById('current-icon').innerHTML = getAnimatedIcon(current.weatherCode, 140, night);
  
  // Temperature in C and F
  const tempC = current.temp_C;
  const tempF = current.temp_F;
  document.getElementById('current-temp').innerHTML = `${tempC}°<span class="temp-unit">C</span> <span class="temp-divider">/</span> ${tempF}°<span class="temp-unit">F</span>`;
  
  document.getElementById('current-desc').textContent = current.weatherDesc[0].value;
  
  // High/Low in both units
  const highC = forecast[0].maxtempC;
  const lowC = forecast[0].mintempC;
  const highF = forecast[0].maxtempF;
  const lowF = forecast[0].mintempF;
  document.getElementById('temp-high').textContent = `${highC}°/${highF}°`;
  document.getElementById('temp-low').textContent = `${lowC}°/${lowF}°`;

  // Details - dual units
  document.getElementById('wind').innerHTML = `${current.windspeedKmph}<small>km/h</small><br>${current.windspeedMiles}<small>mph</small>`;
  document.getElementById('humidity').textContent = `${current.humidity}%`;
  const visKm = current.visibility;
  const visMi = (visKm * 0.621371).toFixed(1);
  document.getElementById('visibility').innerHTML = `${visKm}<small>km</small> / ${visMi}<small>mi</small>`;
  document.getElementById('feels-like').innerHTML = `${current.FeelsLikeC}°<small>C</small> / ${current.FeelsLikeF}°<small>F</small>`;

  // Hourly forecast
  const hourlyContainer = document.getElementById('hourly');
  const allHours = [];
  
  forecast.slice(0, 2).forEach((day, dayIndex) => {
    day.hourly.forEach(hour => {
      const hourNum = parseInt(hour.time) / 100;
      const isPast = dayIndex === 0 && hourNum < new Date().getHours();
      if (!isPast) {
        allHours.push({
          time: hour.time,
          tempC: hour.tempC,
          tempF: hour.tempF,
          icon: hour.weatherCode,
          isNight: hourNum < 6 || hourNum > 18
        });
      }
    });
  });

  hourlyContainer.innerHTML = allHours.slice(0, 12).map((hour, i) => `
    <div class="hour-item">
      <div class="hour-time">${i === 0 ? 'Now' : formatHour(hour.time)}</div>
      <div class="hour-icon">${getAnimatedIcon(hour.icon, 40, hour.isNight)}</div>
      <div class="hour-temp">${hour.tempC}°<small>/${hour.tempF}°</small></div>
    </div>
  `).join('');

  // Daily forecast
  const dailyContainer = document.getElementById('daily');
  dailyContainer.innerHTML = forecast.map((day, i) => {
    const dayName = getDayName(day.date, i);
    return `
      <div class="day-item">
        <div class="day-name">${dayName}</div>
        <div class="day-icon">${getAnimatedIcon(day.hourly[4].weatherCode, 40)}</div>
        <div class="day-temps">
          <span class="day-high">${day.maxtempC}°<small>/${day.maxtempF}°</small></span>
          <span class="day-low">${day.mintempC}°<small>/${day.mintempF}°</small></span>
        </div>
      </div>
    `;
  }).join('');

  // Show weather, hide loading
  document.getElementById('loading').style.display = 'none';
  document.getElementById('weather-container').style.display = 'block';
}

// Show loading
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('weather-container').style.display = 'none';
}

// Fetch weather data
async function fetchWeather(location = '') {
  showLoading();
  try {
    const url = location 
      ? `https://wttr.in/${encodeURIComponent(location)}?format=j1`
      : 'https://wttr.in/?format=j1';
    
    const response = await fetch(url);
    const data = await response.json();
    
    updateUI(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
    document.getElementById('loading').innerHTML = `
      <div class="loading-icon">⚠️</div>
      <p>Unable to load weather</p>
      <p style="font-size: 14px; margin-top: 10px;">Check your connection</p>
    `;
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

// Fetch weather alerts (US only - weather.gov)
async function fetchAlerts(lat, lon) {
  try {
    const response = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`);
    const data = await response.json();
    
    const alertsContainer = document.getElementById('alerts-container');
    const alertsDiv = document.getElementById('alerts');
    
    if (data.features && data.features.length > 0) {
      const alerts = data.features.slice(0, 3); // Show max 3 alerts
      
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
      
      // Set severity class
      const maxSeverity = alerts[0].properties.severity?.toLowerCase();
      alertsDiv.className = `alert-card alert-severity-${maxSeverity}`;
    } else {
      // Calm mode - no alerts
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

// Store coordinates for alerts
let currentCoords = null;

// Initialize
getLocation();
