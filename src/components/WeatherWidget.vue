<script setup>
import { ref, onMounted } from 'vue'
import WeatherIcon from './WeatherIcon.vue'

const currentTemp = ref(0)
const currentCode = ref(0)
const weeklyForecast = ref([])

const fetchWeather = async () => {
  try {
    // 네이버 검색 결과 페이지 (SSR로 데이터 포함됨)
    // vite.config.js에서 /naver-weather -> https://search.naver.com 로 프록시 설정됨
    const response = await fetch(
      '/naver-weather/search.naver?query=%EC%84%9C%EC%9A%B8%EB%82%A0%EC%94%A8'
    )
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // 1. 현재 온도 파싱
    const tempElement = doc.querySelector('.temperature_text strong')
    if (tempElement) {
      // "현재 온도-3.1°" 같은 텍스트에서 숫자만 추출
      const tempText = tempElement.textContent || ''
      const match = tempText.match(/(-?\d+(\.\d+)?)/)
      currentTemp.value = match ? parseFloat(match[0]) : 0
    }

    // 2. 현재 날씨 상태 파싱
    const weatherStatusElement = doc.querySelector('.weather_main .wt_icon .blind')
    if (weatherStatusElement) {
      const statusText = weatherStatusElement.textContent.trim()
      currentCode.value = mapWeatherConditionToCode(statusText)
    }

    // 3. 주간 예보 파싱 (시간별 예보에서 날짜별 대표 날씨 추출)
    // 네이버 검색 결과는 약 3~4일치 데이터를 제공함
    const forecastList = []
    const hourlyItems = doc.querySelectorAll('.graph_inner._hourly_weather ul li')

    // 날짜별로 그룹화
    const dailyGroups = {}
    let currentDayKey = 'today' // 기본값

    hourlyItems.forEach((item) => {
      if (item.classList.contains('_day')) {
        if (item.dataset.day) {
          currentDayKey = item.dataset.day
        } else {
          // 날짜 텍스트가 있는 경우 (예: 12.06.)
          const timeText = item.querySelector('.time .text') || item.querySelector('.time')
          if (timeText) {
            currentDayKey = timeText.textContent.trim()
          }
        }
      }

      if (!dailyGroups[currentDayKey]) {
        dailyGroups[currentDayKey] = []
      }

      // 시간별 데이터 추출
      const weatherBox = item.querySelector('.weather_box .blind')
      const tempSpan = item.querySelector('.degree_point .num')

      if (weatherBox && tempSpan) {
        dailyGroups[currentDayKey].push({
          condition: weatherBox.textContent.trim(),
          temp: parseFloat(tempSpan.textContent),
        })
      }
    })

    // 그룹화된 데이터에서 일별 요약 생성
    const days = Object.keys(dailyGroups)
    const today = new Date()

    days.forEach((dayKey, index) => {
      const items = dailyGroups[dayKey]
      if (items.length === 0) return

      // 해당 일자의 최고/최저 기온 및 대표 날씨 계산
      let min = 100
      let max = -100

      // 날씨 상태 우선순위 (높을수록 중요)
      const weatherPriority = {
        번개: 10,
        뇌우: 10,
        눈: 9,
        '비 또는 눈': 9,
        비: 8,
        소나기: 8,
        안개: 5,
        흐림: 4,
        구름많음: 3,
        구름조금: 2,
        맑음: 1,
      }

      let mainCondition = items[0].condition
      let maxPriority = 0

      items.forEach((item) => {
        if (item.temp < min) min = item.temp
        if (item.temp > max) max = item.temp

        // 우선순위가 높은 날씨를 대표 날씨로 선정
        // 예: 하루 중 한 시간이라도 눈이 오면 '눈'으로 표시
        let currentPriority = 0
        for (const [key, value] of Object.entries(weatherPriority)) {
          if (item.condition.includes(key)) {
            currentPriority = value
            break
          }
        }

        if (currentPriority > maxPriority) {
          maxPriority = currentPriority
          mainCondition = item.condition
        }
      })

      // 요일 이름 결정
      let dayName = ''
      if (index === 0) dayName = '오늘'
      else if (index === 1) dayName = '내일'
      else if (index === 2) dayName = '모레'
      else {
        const date = new Date(today)
        date.setDate(today.getDate() + index)
        const weekDays = ['일', '월', '화', '수', '목', '금', '토']
        dayName = weekDays[date.getDay()]
      }

      forecastList.push({
        day: dayName,
        code: mapWeatherConditionToCode(mainCondition),
        tempMax: Math.round(max), // 최고 기온 표시
        tempMin: Math.round(min), // 최저 기온 표시
      })
    })

    weeklyForecast.value = forecastList
  } catch (error) {
    console.error('Failed to fetch weather:', error)
  }
}

const mapWeatherConditionToCode = (condition) => {
  // 네이버 날씨 텍스트를 WMO 코드로 변환
  if (condition.includes('맑음')) return 0
  if (condition.includes('구름조금')) return 1
  if (condition.includes('구름많음')) return 2
  if (condition.includes('흐림')) return 3
  if (condition.includes('비 또는 눈')) return 68 // 비 또는 눈 (Rain/Snow mix)
  if (condition.includes('비')) return 61
  if (condition.includes('눈')) return 71
  if (condition.includes('소나기')) return 80
  if (condition.includes('번개') || condition.includes('뇌우')) return 95
  if (condition.includes('안개')) return 45
  return 0 // 기본값
}

onMounted(() => {
  fetchWeather()
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
        <span class="day_temp">{{ day.tempMin }}° / {{ day.tempMax }}°</span>
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
