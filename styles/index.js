
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weatherForm');
    const cityInput = document.getElementById('cityInput');
    const weatherResults = document.getElementById('weatherResults');

    form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const city = cityInput.value.trim();
    if (!city) return;

    weatherResults.textContent = 'Loading...';

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        if (!response.ok) throw new Error('City not found');

        const data = await response.json();
        console.log(data);
        //Saving data locally to extract the exact weekDay of each datetime
        let localWeeklyForecastArray = new Array(7);
        for(let i = 0; i < 7; i++) {
            let currentMaxTemp = data.weeklyForecast.temperature_2m_max[i];
            let currentMinTemp = data.weeklyForecast.temperature_2m_min[i];
            let currentDateTime = new Date(data.weeklyForecast.time[i]);
            let currentDay = currentDateTime.toLocaleDateString('en-US', {weekday: 'long'});

            localWeeklyForecastArray[i] = [currentDay, formatDate(currentDateTime),currentMinTemp,currentMaxTemp];
        }
        console.log(localWeeklyForecastArray);
        // Display data
        weatherResults.textContent = `
        Location: ${data.location}\r\n
        Temperatures (hourly): ${data.weather.hourly.temperature_2m.join(', ')}
        Air Quality (Carbon dioxide): ${data.airQuality.hourly.carbon_dioxide.join(', ')}
        Weekly Forecast: ${localWeeklyForecastArray.join(',')}`;

    } catch (error) {
        weatherResults.textContent = `Error: ${error.message}`;
    }
    });
})

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}-${month}-${year}`;
}

