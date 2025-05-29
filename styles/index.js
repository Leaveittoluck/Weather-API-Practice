
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

        // Display data
        weatherResults.textContent = `
        Location: ${data.location}\r\n
        Temperatures (hourly): ${data.weather.hourly.temperature_2m.join(', ')}
        Air Quality (Carbon dioxide): ${data.airQuality.hourly.carbon_dioxide.join(', ')}`;

    } catch (error) {
        weatherResults.textContent = `Error: ${error.message}`;
    }
    });
})

