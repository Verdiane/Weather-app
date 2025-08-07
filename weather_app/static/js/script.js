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
