
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
                localdailyForecastArray[currentDay]
                    .push(
                    [   timeFromDataArray.time[y], 
                        timeFromDataArray.temperature_2m[y],
                        timeFromDataArray.precipitation_probability[y],
                        timeFromDataArray.lightning_potential[y],
                        timeFromDataArray.cloud_cover[y]
                    ]
                    );
            }
            timeFromDataArray.time = timeFromDataArray.time.slice(24);
            timeFromDataArray.temperature_2m = timeFromDataArray.temperature_2m.slice(24);
            timeFromDataArray.precipitation_probability = timeFromDataArray.precipitation_probability.slice(24);
            timeFromDataArray.lightning_potential = timeFromDataArray.lightning_potential.slice(24);
            timeFromDataArray.lightning_potential = timeFromDataArray.cloud_cover.slice(24);
        }
        console.log(localdailyForecastArray);

        for(i = 0; i < 7; i++) {
            dayButtons[i].textContent = localWeeklyForecastArray[i][0];
            dayButtons[i].style.display = "inline";
        }
        // Display data
         
        setupDayButtons(localdailyForecastArray, dayButtons, weatherResults, data.timezone);
        console.log('Sun Template:', document.getElementById('sunTemplate'));
        weatherResults.innerHTML = `<p><strong>Click on any day to display the current weather</strong></p>`;
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

function getClosestHourWeather(dayWeather, timezone) {
  const now = new Date();

    // Convert current UTC time to target location local time
    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        hour12: false,
        timeZone: timezone,
    });

    const currentHourInCity = formatter.format(now);

    return dayWeather.find(([time,temp,precProb,lightningProbability,cloudCover]) => {
        const hourFromData = time.split('T')[1].split(':')[0];
        return hourFromData === currentHourInCity;
    });
}

function setupDayButtons(localdailyForecastArray, dayButtons, weatherResults, timezone) {
    Array.from(dayButtons).forEach(button => {
        button.addEventListener("click", () => {
            const selectDay = button.textContent;
            const dayWeather = localdailyForecastArray[selectDay];

            if(dayWeather) {
                const closest = getClosestHourWeather(dayWeather, timezone);

                if(closest) {
                    const [time, temp, precProb, lightningProbability, cloudCover] = closest;

                    const sunClone = document.getElementById('sunTemplate').innerHTML;
                    const rainThunderClone = document.getElementById('rainThunderTemplate').innerHTML;
                    const partlyCloudyClone = document.getElementById('partlyCloudyTemplate').innerHTML;
                    const cloudyClone = document.getElementById('cloudyTemplate').innerHTML;

                    // Display current hour forecast
                    weatherResults.innerHTML = `<p><strong>${selectDay}</strong>: ${weatherIconVisualizer(closest)}</p>
                                                <button id="moreInfoBtn">More Info</button>`

                    const moreInfoBtn = document.getElementById("moreInfoBtn");
                    moreInfoBtn.addEventListener('click', () => {
                        weatherResults.innerHTML = '';
                        const header = document.createElement('p');
                        header.classList.add('dayFullForecast');
                        header.innerHTML = `<span style="font-weight: bold;">${selectDay}</span> Full Day Forecast:`;
                        weatherResults.appendChild(header);

                        const columnContainer = document.createElement('div');
                        columnContainer.classList.add('forecast-column'); // class for styling

                        dayWeather.forEach(([time,temp,precProb, lightningProbability, cloudCover]) =>{
                            const hourDiv = document.createElement('div');
                            hourDiv.classList.add('forecast-entry');
                            hourDiv.dataset.info = `${time}|${temp}|${precProb}|${lightningProbability}|${cloudCover}`;
                            hourDiv.innerHTML = weatherIconVisualizer([time, temp, precProb, lightningProbability, cloudCover]);
                            columnContainer.appendChild(hourDiv);
                        });

                        weatherResults.appendChild(columnContainer);

                        const backdrop = document.getElementById('backdrop');

                        columnContainer.querySelectorAll('.forecast-entry').forEach(entry => {
                            entry.addEventListener('click', () => {
                                document.querySelectorAll('.forecast-entry.expanded').forEach(el => {
                                    el.classList.remove('expanded');
                                    const extra = el.querySelector('.forecast-extra');
                                    if (extra) extra.remove();
                                })

                                entry.classList.add('expanded');

                                const extra = document.createElement('div');
                                extra.classList.add('forecast-extra');
                                const [time, temp, precProb, lightningProbability, cloudCover] = entry.dataset.info.split('|');
                                extra.innerHTML = `
                                <strong>Details:</strong><br>
                                Time: ${time}<br>
                                Temp: ${temp}°C<br>
                                Precip: ${precProb}%<br>
                                Lightning: ${lightningProbability}%<br>
                                Cloud Cover: ${cloudCover}%
                                `;
                                entry.appendChild(extra);

                                backdrop.style.display = 'block';
                            })
                        })

                        document.getElementById('backdrop').addEventListener('click', () => {
                            document.querySelectorAll('.forecast-entry.expanded').forEach(el => {
                                el.classList.remove('expanded');
                                const extra = el.querySelector('.forecast-extra');
                                if (extra) extra.remove();
                            });
                        document.getElementById('backdrop').style.display = 'none';
                        });
                    })
                }
            }
        })
    })
    
}

function weatherIconVisualizer(entry) {
    const [time, temp, precProb, lightningProbability, cloudCover] = entry;

    const hour = time.split('T')[1];

    const icon = (
        precProb > 20 && lightningProbability > 31 ? document.getElementById('rainThunderTemplate').innerHTML
        : cloudCover > 51 && cloudCover <= 70 ? document.getElementById('partlyCloudyTemplate').innerHTML
        : cloudCover > 70 ? document.getElementById('cloudyTemplate').innerHTML
        : precProb > 20 && lightningProbability < 31 ? document.getElementById('rainyTemplate').innerHTML
        : hour.split(':')[0] > 20 || hour.split(':')[0] <= 6 && precProb < 20 && cloudCover < 51 ? document.getElementById('clearMoonTemplate').innerHTML
        : hour.split(':')[0] > 20 || hour.split(':')[0] <= 6 && precProb > 20 ? document.getElementById('rainyMoonTemplate').innerHTML
        : document.getElementById('sunTemplate').innerHTML
    )

    return `${hour}h. - ${temp}°C ${icon} - Precipitation: ${precProb}%`;
}

