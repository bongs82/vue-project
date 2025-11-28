<script setup>
import { ref, onMounted, computed } from 'vue'

// 예제 데이터 리스트
const list = ref([
  {
    id: 1,
    list: '첫 번째 항목',
    detail:
      '첫 번째 항목의 상세 내용입니다. Vue는 멋져요!첫 번째 항목의 상세 내용입니다. Vue는 멋져요!첫 번째 항목의 상세 내용입니다. Vue는 멋져요!',
  },
  { id: 2, list: '두 번째 항목' }, // detail 속성이 없음
  {
    id: 3,
    list: '세 번째 항목',
    detail: '세 번째 항목의 상세 내용입니다. 컴포넌트 기반 아키텍처를 사용합니다.',
  },
  {
    id: 4,
    list: '네 번째 항목',
    detail: '네 번째 항목의 상세 내용입니다. 반응형 시스템이 특징입니다.',
  },
])

import { fetchNews } from '@/api/naver'
import { fetchExchangeRates, fetchHistoricalRates } from '@/api/exchange'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules'
import ExchangeChart from '@/components/ExchangeChart.vue'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/a11y'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const modules = [Navigation, Pagination, Autoplay, A11y]

// 환율 관련 로직
const exchangeRates = ref({ usd: null, ars: null })
const historicalData = ref({ dates: [], usdRates: [], arsRates: [] })

const loadExchangeRates = async () => {
  exchangeRates.value = await fetchExchangeRates()
}

const loadHistoricalRates = async () => {
  historicalData.value = await fetchHistoricalRates()
}

// 뉴스 관련 로직
const newsList = ref([])
const searchQuery = ref('IT')

const loadNews = async () => {
  newsList.value = await fetchNews(searchQuery.value)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 뉴스를 3개씩 그룹화
const groupedNews = computed(() => {
  const groups = []
  for (let i = 0; i < newsList.value.length; i += 3) {
    groups.push(newsList.value.slice(i, i + 3))
  }
  return groups
})

const swiperInstance = ref(null)
const _isSwiperAutoplay = ref(false)

const onSwiper = (swiper) => {
  console.log(swiper)
  swiperInstance.value = swiper
}

const onSlideChange = () => {
  console.log('slide change')
}

// 자동 재생 중지 메서드
const stopAutoplay = () => {
  if (swiperInstance.value) {
    console.log('Autoplay stopped', swiperInstance.value)
    swiperInstance.value.autoplay.stop()
    _isSwiperAutoplay.value = false
  }
}

// 자동 재생 시작 메서드
const startAutoplay = () => {
  if (swiperInstance.value) {
    console.log('Autoplay started', swiperInstance.value)
    swiperInstance.value.autoplay.start()
    _isSwiperAutoplay.value = true
  }
}

onMounted(() => {
  loadNews()
  loadExchangeRates()
  loadHistoricalRates()
})
</script>

<template>
  <div class="top-news">
    <section class="exchange-section">
      <h2>환율 정보</h2>
      <div class="exchange-rates">
        <div class="exchange-item">
          <span class="currency-name">🇺🇸 미국 1달러 (USD)</span>
          <span class="rate" v-if="exchangeRates.usd">₩{{ exchangeRates.usd }}</span>
          <span class="rate loading" v-else>로딩중...</span>
        </div>
        <div class="exchange-item">
          <span class="currency-name">🇦🇷 아르헨티나 1000페소 (ARS)</span>
          <span class="rate" v-if="exchangeRates.ars">₩{{ exchangeRates.ars }}</span>
          <span class="rate loading" v-else>로딩중...</span>
        </div>
      </div>
      <ExchangeChart
        v-if="historicalData.dates.length > 0"
        :dates="historicalData.dates"
        :usd-rates="historicalData.usdRates"
        :ars-rates="historicalData.arsRates"
      />
    </section>
    <section class="news-section">
      <h2>뉴스</h2>
      <div class="search-box">
        <input v-model="searchQuery" @keyup.enter="loadNews" placeholder="검색어 입력" />
        <button @click="loadNews">검색</button>
      </div>

      <div class="autoplay-buttons">
        <button v-if="_isSwiperAutoplay" @click="stopAutoplay" class="autoplay-btn stop">
          일시정지
        </button>
        <button v-else @click="startAutoplay" class="autoplay-btn start">재생</button>
      </div>
      <swiper
        v-if="groupedNews.length > 0"
        :modules="modules"
        :a11y="true"
        :autoplay="{
          enabled: _isSwiperAutoplay.value,
          delay: 3000,
        }"
        :loop="true"
        :slides-per-view="1"
        :space-between="20"
        :pagination="{ clickable: true }"
        class="news-swiper"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
      >
        <swiper-slide
          v-for="(group, groupIndex) in groupedNews"
          :key="groupIndex"
          class="news-slide-group"
        >
          <div class="news-grid">
            <div v-for="(news, index) in group" :key="index" class="news-item-card">
              <a :href="news.link" target="_blank" class="news-link">
                <h3 v-html="news.title"></h3>
                <p v-html="news.description"></p>
                <span class="news-date">{{ formatDate(news.pubDate) }}</span>
              </a>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </section>
  </div>
  <section class="list-section" :hidden="true">
    <h2>항목 리스트</h2>
    <ul class="item-list">
      <li v-for="item in list" :key="item.id" class="list-item">
        <!-- 왼쪽: list 속성 -->
        <div class="list-part">
          {{ item.list }}
        </div>
        <!-- 오른쪽: detail 속성 (있을 경우에만 표시) -->
        <div class="detail-part">
          <div v-if="item.detail" class="ellipsis-text">{{ item.detail }}</div>
          <div v-else class="no-detail">(상세 내용 없음)</div>
        </div>
      </li>
    </ul>
  </section>
</template>
