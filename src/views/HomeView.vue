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

// YouTube Shorts 데이터 리스트
const shortsList = ref([])
const isLoadingShorts = ref(true)

// Fallback Data (API 키가 없거나 호출 실패 시 사용)
const fallbackShorts = [
  { id: 'qZ_0_R11-t0', title: '축구계 최고의 신사 손흥민' },
  { id: 'wV-oF2T7e_s', title: '베프를 만난 손흥민의 반응' },
  { id: 'Q6wR_k0aJ-g', title: '머리 스타일이 별로라는 벤 데이비스' },
  { id: 'c0Zt_6kR5bQ', title: '손흥민 웃긴 장면 모음 2' },
  { id: 'e_R5g_5Q74Q', title: '손흥민 웃긴 장면 모음 3' },
  { id: 'eG1g2j_3q1M', title: '손흥민 웃긴 장면 컴필레이션' },
  { id: '-0p5CJdJpg8', title: '빵 터진 손흥민' },
  { id: 'qZ_0_R11-t0', title: '쏘니의 훈훈한 순간들' },
  { id: 'wV-oF2T7e_s', title: '절친과의 재회' },
  { id: 'Q6wR_k0aJ-g', title: '쏘니 vs 벤 데이비스' },
]

import { fetchNews } from '@/api/naver'
import { fetchExchangeRates, fetchHistoricalRates } from '@/api/exchange'
import { fetchYoutubeShorts } from '@/api/youtube'
import { Swiper, SwiperSlide } from 'swiper/vue'
import {
  Navigation,
  Pagination,
  Autoplay,
  A11y,
  EffectCoverflow,
  EffectCards,
} from 'swiper/modules'
import ExchangeChart from '@/components/ExchangeChart.vue'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/a11y'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-cards'

const modules = [Navigation, Pagination, Autoplay, A11y, EffectCoverflow, EffectCards]
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
const searchQuery = ref('손흥민')
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
const playingIndex = ref(-1)

const playVideo = (index) => {
  playingIndex.value = index
}

const onSwiper = (swiper) => {
  console.log(swiper)
  swiperInstance.value = swiper
}

const onSlideChange = () => {
  console.log('slide change')
}

const onShortsSlideChange = () => {
  playingIndex.value = -1
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

onMounted(async () => {
  console.log('HomeView Mounted')
  loadNews()
  loadExchangeRates()
  loadHistoricalRates()

  // YouTube Shorts 로드
  console.log('Starting to load shorts...')
  isLoadingShorts.value = true
  try {
    const fetchedShorts = await fetchYoutubeShorts('손흥민')
    console.log('Fetched Shorts:', fetchedShorts)

    if (fetchedShorts && fetchedShorts.length > 0) {
      // 100개 중 랜덤하게 10개 선택
      const shuffled = fetchedShorts.sort(() => 0.5 - Math.random())
      shortsList.value = shuffled.slice(0, 10)
    } else {
      console.warn('YouTube API returned no results or failed. Using fallback.')
      shortsList.value = fallbackShorts
    }
  } catch (e) {
    console.error('Failed to load shorts', e)
    shortsList.value = fallbackShorts
  } finally {
    console.log('Finished loading shorts. Setting isLoadingShorts to false.')
    isLoadingShorts.value = false
  }
})
</script>

<template>
  <div class="media">
    <h2>손흥민 유튜브 숏츠</h2>
    <div v-if="isLoadingShorts" class="loading_shorts">
      <p>최신 숏츠를 불러오는 중입니다...</p>
    </div>
    <swiper
      v-else
      :modules="modules"
      :effect="'cards'"
      :grab-cursor="true"
      :pagination="{ clickable: true }"
      :navigation="true"
      :loop="true"
      class="shorts_swiper"
      @slideChange="onShortsSlideChange"
    >
      <swiper-slide v-for="(short, index) in shortsList" :key="index" class="shorts_slide">
        <div class="video_wrapper" @click="playVideo(index)">
          <div v-if="playingIndex === index" class="iframe_container">
            <iframe
              :src="`https://www.youtube.com/embed/${short.id}?autoplay=1`"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
          <div v-else class="thumbnail_container">
            <img
              :src="`https://i.ytimg.com/vi/${short.id}/hqdefault.jpg`"
              :alt="short.title"
              class="thumbnail"
            />
            <div class="play_button">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <p class="shorts_title">{{ short.title }}</p>
      </swiper-slide>
    </swiper>
  </div>
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
        :direction="moreNewsExchange ? 'horizontal' : 'vertical'"
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

<style scoped>
/* YouTube Shorts Carousel Styles */
.media {
  width: 35rem;
  margin: 0 auto;
  padding: 2rem;
  /* background-color: #f9f9f9;
  border-bottom: 1px solid #eee; */
}

.media h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.shorts_swiper {
  width: 100%;
  padding-bottom: 3rem; /* Space for pagination */
}

.shorts_slide {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  width: 300px; /* Fixed width for 3D effect */
}

.shorts_slide:hover {
  transform: translateY(-5px);
}

.video_wrapper {
  position: relative;
  width: 100%;
  padding-top: 177.77%; /* 9:16 Aspect Ratio for Shorts */
  background: #000;
  cursor: pointer;
}

.iframe_container,
.thumbnail_container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video_wrapper iframe,
.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play_button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.video_wrapper:hover .play_button {
  background: rgba(255, 0, 0, 0.8);
}

.shorts_title {
  overflow: hidden;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  box-sizing: border-box;
  text-overflow: ellipsis;
}

/* Custom Swiper Navigation/Pagination Styles if needed */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #333;
}

.loading_shorts {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

:deep(.swiper-pagination-bullet-active) {
  background: #333;
}
</style>
