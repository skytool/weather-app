// Weather Icons Map (based on weather codes)
const weatherIcons = {
  '113': '☀️',  // Sunny
  '116': '⛅',  // Partly cloudy
  '119': '☁️',  // Cloudy
  '122': '☁️',  // Overcast
  '143': '🌫️',  // Mist
  '176': '🌦️',  // Patchy rain
  '179': '🌨️',  // Patchy snow
  '182': '🌧️',  // Patchy sleet
  '185': '🌧️',  // Patchy freezing drizzle
  '200': '⛈️',  // Thundery outbreaks
  '227': '❄️',  // Blowing snow
  '230': '❄️',  // Blizzard
  '248': '🌫️',  // Fog
  '260': '🌫️',  // Freezing fog
  '263': '🌧️',  // Patchy light drizzle
  '266': '🌧️',  // Light drizzle
  '281': '🌧️',  // Freezing drizzle
  '284': '🌧️',  // Heavy freezing drizzle
  '293': '🌧️',  // Patchy light rain
  '296': '🌧️',  // Light rain
  '299': '🌧️',  // Moderate rain
  '302': '🌧️',  // Heavy rain
  '305': '🌧️',  // Heavy rain
  '308': '🌧️',  // Heavy rain
  '311': '🌧️',  // Freezing rain
  '314': '🌧️',  // Heavy freezing rain
  '317': '🌨️',  // Light sleet
  '320': '🌨️',  // Moderate sleet
  '323': '🌨️',  // Patchy light snow
  '326': '🌨️',  // Light snow
  '329': '❄️',  // Patchy moderate snow
  '332': '❄️',  // Moderate snow
  '335': '❄️',  // Heavy snow
  '338': '❄️',  // Heavy snow
  '350': '🌧️',  // Ice pellets
  '353': '🌧️',  // Light rain shower
  '356': '🌧️',  // Heavy rain shower
  '359': '🌧️',  // Torrential rain
  '362': '🌨️',  // Light sleet showers
  '365': '🌨️',  // Heavy sleet showers
  '368': '🌨️',  // Light snow showers
  '371': '❄️',  // Heavy snow showers
  '374': '🌧️',  // Light ice pellets
  '377': '🌧️',  // Heavy ice pellets
  '386': '⛈️',  // Thundery rain
  '389': '⛈️',  // Heavy thunder
  '392': '⛈️',  // Thundery snow
  '395': '⛈️',  // Heavy thundery snow
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Get weather icon
function getIcon(code, isNight = false) {
  const icon = weatherIcons[code] || '☀️';
  if (isNight && icon === '☀️') return '🌙';
  return icon;
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
  // Parse the date string properly
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

  // Location
  const cityName = location.areaName[0].value;
  const country = location.country[0].value;
  document.getElementById('location-name').textContent = `${cityName}, ${country}`;

  // Current weather
  document.getElementById('current-icon').textContent = getIcon(current.weatherCode, night);
  document.getElementById('current-temp').textContent = `${current.temp_C}°`;
  document.getElementById('current-desc').textContent = current.weatherDesc[0].value;
  document.getElementById('temp-high').textContent = forecast[0].maxtempC;
  document.getElementById('temp-low').textContent = forecast[0].mintempC;

  // Details
  document.getElementById('wind').textContent = `${current.windspeedKmph} km/h`;
  document.getElementById('humidity').textContent = `${current.humidity}%`;
  document.getElementById('visibility').textContent = `${current.visibility} km`;
  document.getElementById('feels-like').textContent = `${current.FeelsLikeC}°`;

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
          temp: hour.tempC,
          icon: hour.weatherCode,
          isNight: hourNum < 6 || hourNum > 18
        });
      }
    });
  });

  hourlyContainer.innerHTML = allHours.slice(0, 12).map((hour, i) => `
    <div class="hour-item">
      <div class="hour-time">${i === 0 ? 'Now' : formatHour(hour.time)}</div>
      <div class="hour-icon">${getIcon(hour.icon, hour.isNight)}</div>
      <div class="hour-temp">${hour.temp}°</div>
    </div>
  `).join('');

  // Daily forecast - using the date from API
  const dailyContainer = document.getElementById('daily');
  dailyContainer.innerHTML = forecast.map((day, i) => {
    const dayName = getDayName(day.date, i);
    return `
      <div class="day-item">
        <div class="day-name">${dayName}</div>
        <div class="day-icon">${getIcon(day.hourly[4].weatherCode)}</div>
        <div class="day-temps">
          <span class="day-high">${day.maxtempC}°</span>
          <span class="day-low">${day.mintempC}°</span>
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
      // Save to localStorage
      localStorage.setItem('weatherCity', city);
      fetchWeather(city);
      searchInput.blur();
    }
  }
});

// Get saved city or use geolocation
function getLocation() {
  // Check for saved city first
  const savedCity = localStorage.getItem('weatherCity');
  if (savedCity) {
    searchInput.value = savedCity;
    fetchWeather(savedCity);
    return;
  }

  // Try geolocation
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
      },
      error => {
        console.log('Location denied, using default');
        // Default to Dallas (Aldoss's area)
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
