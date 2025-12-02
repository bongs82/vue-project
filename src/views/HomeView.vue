<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'

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
const moreNewsExchange = ref(false)

// 환율 관련 로직
const exchangeRates = ref({ krw: null, ars: null })
const historicalData = ref({ dates: [], krwRates: [], arsRates: [] })

const loadExchangeRates = async () => {
  exchangeRates.value = await fetchExchangeRates()
}

const loadHistoricalRates = async () => {
  historicalData.value = await fetchHistoricalRates()
}

// 뉴스 관련 로직
const newsList = ref([])
const searchQuery = ref('IT')
const newsKey = ref(0)

const loadNews = async () => {
  newsList.value = await fetchNews(searchQuery.value)
  newsKey.value++
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 뉴스를 1개씩 그룹화
const groupedNews = computed(() => {
  const groups = []
  const itemsPerSlide = 1
  for (let i = 0; i < newsList.value.length; i += itemsPerSlide) {
    groups.push(newsList.value.slice(i, i + itemsPerSlide))
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

//모드 전환 시 Swiper 높이 및 상태 업데이트
watch(moreNewsExchange, async (newVal) => {
  if (swiperInstance.value) {
    const swiper = swiperInstance.value
    await nextTick()

    // 방향 및 autoHeight 설정 업데이트
    setTimeout(() => {
      swiper.changeDirection(newVal ? 'horizontal' : 'vertical')
      swiper.update()
    }, 600)
    // swiper.params.autoHeight = newVal
    // swiper.update()

    // if (newVal) {
    //   // 펼쳐질 때: autoHeight 활성화 후 높이 재계산
    //   swiper.updateAutoHeight()
    //   setTimeout(() => {
    //     swiper.updateAutoHeight()
    //     console.log('update - expanded height:', swiper.wrapperEl.style.height)
    //   }, 600)
    // } else {
    //   // 접힐 때: wrapper 높이를 수동으로 설정
    //   if (swiper.wrapperEl) {
    //     swiper.wrapperEl.style.height = '5.5rem'
    //   }
    //   setTimeout(() => {
    //     swiper.update()
    //   }, 100)
    // }
  }
})
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
  <div class="top_news">
    <button
      :class="['more_btn', { more_btn_active: moreNewsExchange }]"
      @click="!moreNewsExchange ? (moreNewsExchange = true) : (moreNewsExchange = false)"
      :aria-label="'환율 , 뉴스 더보기 ' + (moreNewsExchange ? '숨기기' : '보기')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="arrow_icon"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
    <section class="exchange_section">
      <h2>환율 정보</h2>
      <div class="exchange_rates">
        <div class="exchange_item usd">
          <span class="currency_name">🇰🇷 한국 원화 (KRW)</span>
          <span class="rate" v-if="exchangeRates.krw">$1 = ₩{{ exchangeRates.krw }}</span>
          <span class="rate loading" v-else>로딩중...</span>
        </div>
        <div class="exchange_item ars">
          <span class="currency_name">🇦🇷 아르헨티나 페소 (ARS)</span>
          <span class="rate" v-if="exchangeRates.ars">$1 = ${{ exchangeRates.ars }}</span>
          <span class="rate loading" v-else>로딩중...</span>
        </div>
      </div>
      <div class="expand_wrapper" :class="{ open: moreNewsExchange }">
        <div class="expand_inner">
          <ExchangeChart
            v-if="historicalData.dates.length > 0"
            :dates="historicalData.dates"
            :krw-rates="historicalData.krwRates"
            :ars-rates="historicalData.arsRates"
          />
        </div>
      </div>
    </section>
    <section class="news_section">
      <h2>뉴스</h2>
      <div class="expand_wrapper" :class="{ open: moreNewsExchange }">
        <div class="expand_inner">
          <div class="search_box">
            <input v-model="searchQuery" @keyup.enter="loadNews" placeholder="검색어 입력" />
            <button @click="loadNews">검색</button>
          </div>
        </div>
      </div>

      <div class="autoplay_buttons">
        <button
          v-if="_isSwiperAutoplay"
          @click="stopAutoplay"
          class="autoplay_btn stop"
          aria-label="일시정지"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        <button v-else @click="startAutoplay" class="autoplay_btn start" aria-label="재생">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>
      <swiper
        v-if="groupedNews.length > 0"
        :key="newsKey"
        :modules="modules"
        :a11y="true"
        :autoplay="{
          enabled: _isSwiperAutoplay,
          delay: 3000,
        }"
        :loop="true"
        :direction="'vertical'"
        :slides-per-view="1"
        :pagination="{ el: '.news_pagination', clickable: true }"
        class="news_swiper"
        :class="{ vertical_mode: !moreNewsExchange }"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
      >
        <swiper-slide
          v-for="(group, groupIndex) in groupedNews"
          :key="groupIndex"
          class="news_slide_group"
        >
          <div class="news_grid">
            <div v-for="(news, index) in group" :key="index" class="news_item_card">
              <a :href="news.link" target="_blank" class="news_link">
                <h3 v-html="news.title"></h3>
                <div class="expand_wrapper" :class="{ open: moreNewsExchange }">
                  <div class="expand_inner">
                    <p v-html="news.description"></p>
                    <span class="news_date">{{ formatDate(news.pubDate) }}</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </swiper-slide>
      </swiper>
      <div class="news_pagination"></div>
    </section>
  </div>
  <section class="list_section" :hidden="true">
    <h2>항목 리스트</h2>
    <ul class="item_list">
      <li v-for="item in list" :key="item.id" class="list_item">
        <!-- 왼쪽: list 속성 -->
        <div class="list_part">
          {{ item.list }}
        </div>
        <!-- 오른쪽: detail 속성 (있을 경우에만 표시) -->
        <div class="detail_part">
          <div v-if="item.detail" class="ellipsis_text">{{ item.detail }}</div>
          <div v-else class="no_detail">(상세 내용 없음)</div>
        </div>
      </li>
    </ul>
  </section>
</template>
