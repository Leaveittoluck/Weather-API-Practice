
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
        let localdailyForecastArray = {};

        for(let i = 0; i < 7; i++) {
            let currentMaxTemp = data.weeklyForecast.temperature_2m_max[i];
            let currentMinTemp = data.weeklyForecast.temperature_2m_min[i];
            let currentDateTime = new Date(data.weeklyForecast.time[i]);
            let currentDay = currentDateTime.toLocaleDateString('en-US', {weekday: 'long'});

            localWeeklyForecastArray[i] = [currentDay, formatDate(currentDateTime),currentMinTemp,currentMaxTemp];
        }
        console.log(localWeeklyForecastArray);

        let timeFromDataArray = JSON.parse(JSON.stringify(data.weather.hourly));
        for(let i = 0; i < 7; i++) {
            const currentDay = localWeeklyForecastArray[i][0];
            localdailyForecastArray[currentDay] = [];
            for(let y = 0; y < 24; y++) {
                localdailyForecastArray[currentDay].push([timeFromDataArray.time[y], timeFromDataArray.temperature_2m[y]]);
            }
            timeFromDataArray.time = timeFromDataArray.time.slice(24);
            timeFromDataArray.temperature_2m = timeFromDataArray.temperature_2m.slice(24);
        }
        console.log(localdailyForecastArray);
        //Fomatting the data into readable results on the page
        const formattedAllDays = Object.entries(localdailyForecastArray)
            .map(([day, entries]) => {
                const formattedEntries = entries
                    .map(([time,temp]) => {
                        const hour = time.split("T")[1];
                        return `${hour}h: ${temp}°C`;
                    })
                    .join('\r\n');
                    return `${day}: \r\n${formattedEntries}`;
            })
            .join('\r\n\r\n');
        // Display data
        weatherResults.textContent = `
        Location: ${data.location}\r\n
        Weather For Random Day Test: ${formattedAllDays},
        TimeHours: \r\n${localdailyForecastArray},
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

