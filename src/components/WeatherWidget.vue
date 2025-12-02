<script setup>
import { ref, onMounted } from 'vue'
import WeatherIcon from './WeatherIcon.vue'

const currentTemp = ref(0)
const currentCode = ref(0)
const weeklyForecast = ref([])

const fetchWeather = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    )
    const data = await response.json()

    // Update Current Weather
    currentTemp.value = Math.round(data.current_weather.temperature)
    currentCode.value = data.current_weather.weathercode

    // Update Weekly Forecast
    weeklyForecast.value = data.daily.time.map((date, index) => {
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      // Use max temp for the day
      const temp = Math.round(data.daily.temperature_2m_max[index])
      const code = data.daily.weathercode[index]

      return {
        day: dayName,
        code: code,
        temp: temp,
      }
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
  }
}

onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        console.warn('Geolocation denied or failed, defaulting to Seoul', error)
        fetchWeather(37.5665, 126.978) // Default to Seoul
      }
    )
  } else {
    fetchWeather(37.5665, 126.978) // Default to Seoul
  }
})
</script>

<template>
  <div class="weather_widget">
    <div class="current_weather">
      <div class="icon_wrapper">
        <WeatherIcon :code="currentCode" />
      </div>
      <span class="temp">{{ currentTemp }}°C</span>
    </div>

    <div class="divider"></div>

    <div class="weekly_forecast">
      <div v-for="day in weeklyForecast" :key="day.day" class="day_item">
        <span class="day_name">{{ day.day }}</span>
        <div class="day_icon_wrapper">
          <WeatherIcon :code="day.code" />
        </div>
        <span class="day_temp">{{ day.temp }}°</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.weather_widget {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  // height: 40px;
  overflow: hidden;

  .current_weather {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1rem;
    white-space: nowrap;

    .icon_wrapper {
      width: 32px;
      height: 32px;
    }
  }

  .divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.3);
  }

  .weekly_forecast {
    display: flex;
    align-items: center;
    gap: 0.8rem;

    .day_item {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1;
      gap: 2px;

      .day_name {
        font-size: 0.6rem;
        opacity: 0.8;
        text-transform: uppercase;
      }

      .day_icon_wrapper {
        width: 20px;
        height: 20px;
      }

      .day_temp {
        font-size: 0.7rem;
        font-weight: 600;
      }
    }
  }
}
</style>
