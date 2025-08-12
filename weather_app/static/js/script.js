const apiKey = window.WEATHER_API_KEY;
const geoApiKey = window.GEODB_ON_RAPID_API_KEY;
const API_HOST = 'wft-geo-db.p.rapidapi.com';

const input = document.getElementById('city');
const list = document.getElementById('autocomplete-list');

let debounceTimeout;

input.addEventListener('input', function () {
    const value = this.value.trim();

      // Debounce API calls
    clearTimeout(debounceTimeout);
    if (value.length < 2) {
        list.innerHTML = '';
        return;
    }

    debounceTimeout = setTimeout(() => {
        fetch(`https://${API_HOST}/v1/geo/cities?limit=10&namePrefix=${value}`, {  //limit to 10 cities shown in a request due to Free subscription
          method: 'GET',
          headers: {
            'x-rapidapi-key': geoApiKey,
		        'x-rapidapi-host': API_HOST
          }
        })
        .then(response => response.json())
        .then(data => {
          list.innerHTML = '';
          const cities = data.data;
          console.log(cities);
          if (cities.length === 0) return;

          cities.forEach(city => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
            div.textContent = `${city.city}, ${city.country}`;
            div.addEventListener('click', () => {
              input.value = city.city;
              list.innerHTML = '';
            });
            list.appendChild(div);
          });
        })
        .catch(err => {
          console.error('Error fetching cities:', err);
        });
      }, 300); // 300ms debounce
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.form-group')) {
    list.innerHTML = '';
  }
});

const cityValue = document.getElementById("city");
const parameterSelect = document.getElementById("weather_cond");
const form = document.getElementById("weatherForm");

//get city and find the latitude and longitude
parameterSelect.addEventListener("change", function () {
  if (cityValue.value && this.value) {
    // Get both values
    const city = cityValue.value;
    const parameter = this.value;

    console.log("Selected City:", city);
    console.log("Selected Parameter:", parameter);

    if (!city || !parameter) {
      alert("Please select a city and a parameter.");
      return;
    }

      // Step 1: Geocode city to get coordinates
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        alert("City not found. Please enter a valid city.");
        return;
      }

      ({ lat, lon, name, country } = data[0]);
      console.log(`✅ Found: ${name}, ${country} — Lat: ${lat}, Lon: ${lon}`);
     
    })
    .then(() =>  getWeather(lat, lon, parameter, city))
    .catch(err => console.error(err));

  }
});


function getWeather(lat, lon, parameterValue, city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    // Step 3: Filter based on user choice
    let output;

    switch (parameterValue) {
      case "temp":
        output = `Temperature in ${city}: ${data.main.temp} °C`;
        break;
      case "cloud":
        output = `Clouds in ${city}: ${data.clouds.all}%`;
        break;
      case "pressure":
        output = `Pressure in ${city}: ${data.main.pressure} hPa`;
        break;
      case "wind":
        output = `Wind speed in ${city}: ${data.wind.speed} m/s`;
        break;
    }

    // Step 4: Display on frontend
    document.getElementById("weatherResult").innerText = output;
  });

}


//function to create weather layer
function createMap (weather_layer){
    let map_type = L.tileLayer(`https://tile.openweathermap.org/map/${weather_layer}/{z}/{x}/{y}.png?appid=${apiKey}`, {
        attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
        opacity: 0.5
    }).addTo(map);

    return map_type
}

let map = L.map('map').setView([50.1109, 8.6821], 5); //to be centered in Germany

//Use CartoDB to have a map with countries in english
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & CartoDB contributors',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

const temperature = createMap('temp_new');
const cloud = createMap('clouds_new');
const precip = createMap('precipitation_new');
const pressure = createMap('pressure_new');
const wind = createMap('wind_new');

// Define overlay options
const weather_overlays = {
    "Clouds": cloud,
    "Temperature": temperature,
    "Wind": wind,
    "Precipitation": precip,
    "Pressure": pressure
};

temperature.addTo(map);
L.control.layers(weather_overlays, null, { collapsed: true }).addTo(map);
