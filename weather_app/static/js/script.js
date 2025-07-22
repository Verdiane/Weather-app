const apiKey = window.WEATHER_API_KEY;
console.log ('key present here is', apiKey);

function createMap (weather_layer){
    let map_type = L.tileLayer(`https://tile.openweathermap.org/map/${weather_layer}/{z}/{x}/{y}.png?appid=${apiKey}`, {
        attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
    }).addTo(map);

    return map_type
}

// button.addEventListener('click', 
//   async function (){
//     console.log('welcome to our webapp in Flask');

//     const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=44.34&lon=10.99&appid=${apikey}`);
//     const jsonResults = await response.json();
//     const weatherResults = JSON.stringify(jsonResults);

//     console.log(weatherResults);
//   }
// )

let map = L.map('map').setView([20, 0], 2);

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
