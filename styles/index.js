
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weatherForm');
    const cityInput = document.getElementById('cityInput');
    const weatherResults = document.getElementById('weatherResults');
    const dayButtons = document.getElementsByClassName('buttonsClass');

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

        for(i = 0; i < 7; i++) {
            dayButtons[i].textContent = localWeeklyForecastArray[i][0];
            dayButtons[i].style.display = "inline";
        }
        // Display data
         
        setupDayButtons(localdailyForecastArray, dayButtons, weatherResults);

        // const today = new Date();
        // const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        // const todayWeather = localdailyForecastArray[todayName];

        // if (todayWeather) {
        //     const formattedDay = todayWeather
        //         .map(([time, temp]) => `${time.split("T")[1]}h: ${temp}°C`)
        //         .join('\r\n');

        //     weatherResults.textContent = `Location: ${data.location}\r\n\n${todayName} Forecast:\r\n${formattedDay}`;
        // }

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

function getClosestHourWeather(dayWeather) {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');

  return dayWeather.find(([time]) => {
    const hourFromData = time.split('T')[1].split(':')[0];
    return hourFromData === currentHour;
  });
}

function setupDayButtons(localdailyForecastArray, dayButtons, weatherResults) {
    Array.from(dayButtons).forEach(button => {
        button.addEventListener("click", () => {
            const selectDay = button.textContent;
            const dayWeather = localdailyForecastArray[selectDay];

            if(dayWeather) {
                const closest = getClosestHourWeather(dayWeather);

                if(closest) {
                    const [time, temp] = closest;

                    // Display current hour forecast
                    weatherResults.innerHTML = `
                        <p><strong>${selectDay}</strong>: ${time.split('T')[1]}h. - ${temp}°C</p>
                        <button id="moreInfoBtn">More Info</button>
                    `;

                    const moreInfoBtn = document.getElementById("moreInfoBtn");
                    moreInfoBtn.addEventListener('click', () => {
                        weatherResults.innerHTML = '';
                        const header = document.createElement('p');
                        header.classList.add('dayFullForecast');
                        header.innerHTML = `<span style="font-weight: bold;">${selectDay}</span> Full Day Forecast:`;
                        weatherResults.appendChild(header);

                        const columnContainer = document.createElement('div');
                        columnContainer.classList.add('forecast-column'); // class for styling

                        dayWeather.forEach(([time,temp]) =>{
                            const hourDiv = document.createElement('div');
                            hourDiv.classList.add('forecast-entry');
                            hourDiv.innerHTML = `${time.split('T')[1]}h. - ${temp}°C`;
                            columnContainer.appendChild(hourDiv);
                        });

                        weatherResults.appendChild(columnContainer);

                    })
                }
            }
        })
    })
    
}

// function showCurrentHourWeather(day, localdailyForecastArray, weatherResults) {
//     const closest = getClosestHourWeather(localdailyForecastArray);
//     if (closest) {
//         const [time, temp] = closest;
//         return `${day} current hour: ${time.split('T')[1]} - ${temp}°C`;
//     }
//     return `${day} current hour: No data available`;
// }


