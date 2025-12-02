<script setup>
import { RouterLink, RouterView } from 'vue-router'
import '@/assets/main.scss'
import { onMounted, ref, provide } from 'vue'
import { auth } from '@/firebase'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import domtoimage from 'dom-to-image'
import html2canvas from 'html2canvas'
import WeatherWidget from '@/components/WeatherWidget.vue'
import AnalogClock from '@/components/AnalogClock.vue'
import TrendingIssues from '@/components/TrendingIssues.vue'
import { fetchBackgroundImage as fetchPexelsImage, getTimeBasedQuery } from '@/api/pexels'
import ColorThief from 'colorthief'

const user = ref(null)
const isLoggedIn = ref(false)
const backgroundImage = ref('')

const container = ref(null)
const currentTime = ref(new Date().toLocaleTimeString('en-US', { hour12: false }))

const imageUrl = ref([])
const imgRef = ref(null)
const dominantColor = ref('')
const isDark = ref(false)

provide('isDark', isDark)

function getLuminance(hexcolor) {
  const c = hexcolor.substring(1) // # 제거
  const rgb = parseInt(c, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff

  // ITU-R BT.709 표준에 따른 휘도 계산
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

  // 밝기 기준점 설정 (예: 128)
  // 255의 절반인 127.5를 기준으로 삼는 것이 일반적입니다.
  return luminance < 127.5 ? (isDark.value = true) : (isDark.value = false)
}

const extractColor = () => {
  const img = imgRef.value
  if (img && img.complete && img.naturalWidth > 0) {
    try {
      const colorThief = new ColorThief()
      // getColor 함수는 RGB 값 배열 [R, G, B]을 반환합니다.
      const colorRgb = colorThief.getColor(img)
      dominantColor.value = `rgb(${colorRgb.join(', ')})`
      console.log('추출된 주요 색상 (RGB):', colorRgb)
      getLuminance(dominantColor.value)
    } catch (e) {
      console.warn('Color extraction failed:', e)
    }
  }
}

// Pexels API로 고품질 배경 이미지 가져오기
const fetchBackgroundImage = async () => {
  const width = window.innerWidth
  const height = window.innerHeight

  // 시간대별 검색 키워드 가져오기
  const query = getTimeBasedQuery()

  // Pexels API로 이미지 URL 가져오기
  const url = await fetchPexelsImage(query, width, height)

  if (url) {
    try {
      // 이미지를 Blob으로 가져와서 로컬 URL 생성 (CORS 문제 해결)
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      imageUrl.value = objectUrl // img 태그용 (ColorThief 등)
      backgroundImage.value = `url(${objectUrl})` // 배경 이미지용
    } catch (e) {
      console.error('Failed to load image as blob:', e)
      // 실패 시 URL 직접 사용 (CORS 문제 발생 가능성 있음)
      imageUrl.value = url
      backgroundImage.value = `url(${url})`
    }
  } else {
    // API 실패 시 폴백 그라데이션
    const hour = new Date().getHours()
    let gradient = ''

    if (hour >= 5 && hour < 12) {
      gradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    } else if (hour >= 12 && hour < 17) {
      gradient = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    } else if (hour >= 17 && hour < 20) {
      gradient = 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 50%, #a960ee 100%)'
    } else {
      gradient = 'linear-gradient(135deg, #2e1437 0%, #1f4037 50%, #99f2c8 100%)'
    }

    backgroundImage.value = gradient
  }
}

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    isLoggedIn.value = !!currentUser
  })

  // 배경 이미지 로드
  fetchBackgroundImage()

  const timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('en-US', { hour12: false })
  }, 1000)

  // Cleanup interval on component unmount (though App.vue rarely unmounts)
  return () => clearInterval(timer)
})

const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    console.error('Login failed', error)
  }
}

const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Logout failed', error)
  }
}

const saveAsImage = () => {
  if (!container.value) return

  const node = container.value

  domtoimage
    .toPng(node, {
      width: node.scrollWidth,
      height: node.scrollHeight,
      bgcolor: '#ffffff',
    })
    .then((dataUrl) => {
      const link = document.createElement('a')
      link.download =
        'capture_' +
        new Date().getFullYear() +
        '_' +
        (new Date().getMonth() + 1) +
        '_' +
        new Date().getDate() +
        '_' +
        new Date().getHours() +
        '_' +
        new Date().getMinutes() +
        '.png'
      link.href = dataUrl
      link.click()
    })
    .catch((error) => {
      console.error('이미지 변환에 실패했습니다!', error)
    })
}

// const saveAsImage = () => {
//   if (!container.value) return
//
//   const node = container.value
//
//   domtoimage
//     .toPng(node, {
//       // 캡처할 요소의 전체 너비와 높이를 지정하여 내용이 잘리지 않도록 합니다.
//       width: node.scrollWidth,
//       height: node.scrollHeight,
//       // 배경색을 지정하여 검은색으로 나오는 문제를 해결합니다.
//       bgcolor: '#ffffff',
//     })
//     .then((dataUrl) => {
//       const link = document.createElement('a')
//       link.download =
//         'capture_' +
//         new Date().getFullYear() +
//         '_' +
//         (new Date().getMonth() + 1) +
//         '_' +
//         new Date().getDate() +
//         '_' +
//         new Date().getHours() +
//         '_' +
//         new Date().getMinutes() +
//         '.png'
//       link.href = dataUrl
//       link.click()
//     })
//     .catch((error) => {
//       console.error('이미지 변환에 실패했습니다!', error)
//     })
// }

// const imageRef = ref(null);
// const dominantColor = ref([]);
// const palette = ref([]);

// const extractColor = () => {
//   if (imageRef.value) {
//     const colorThief = new ColorThief();

//     // 주요 색상 추출
//     const color = colorThief.getColor(imageRef.value);
//     dominantColor.value = color;

//     // 팔레트 추출 (예: 8가지 색상)
//     const colorPalette = colorThief.getPalette(imageRef.value, 8);
//     palette.value = colorPalette;
//   }
// }

// onMounted(() => {
//   // 이미지가 로드된 후에 extractColor 함수가 실행되도록 @load 이벤트 핸들러를 사용합니다.
//   // 이미지가 캐시되어 @load 이벤트가 발생하지 않을 경우를 대비하여 onMounted에서 직접 호출할 수도 있습니다.
//   if (imageRef.value && imageRef.value.complete) {
//     extractColor();
//   }
// })
</script>

<template>
  <div
    id="app_container"
    ref="container"
    :style="{ background: backgroundImage }"
    :class="{ dark_mode: isDark }"
  >
    <nav class="gnb">
      <div class="gnb_links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/user">User</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
      </div>
      <div class="time">
        <AnalogClock />
        <span>{{ currentTime }}</span>
      </div>
      <WeatherWidget class="weather" />
      <TrendingIssues />
      <div class="gnb_auth">
        <span v-if="isLoggedIn">Welcome, {{ user.displayName }}</span>
        <button v-if="!isLoggedIn" @click="loginWithGoogle" class="auth_btn">
          Login with Google
        </button>
        <button v-if="isLoggedIn" @click="logout" class="auth_btn">Logout</button>
        <button
          @click="saveAsImage"
          class="save_btn"
          type="button"
          aria-label="이미지로 저장"
        ></button>
      </div>
    </nav>
    <div class="main_view">
      <aside class="lnb" :hidden="true">
        <!-- LNB (Local Navigation Bar) -->
        <p>LNB Area</p>
      </aside>
      <main class="contents">
        <img
          ref="imgRef"
          v-if="imageUrl"
          :src="imageUrl"
          alt="이미지"
          crossorigin="anonymous"
          @load="extractColor"
          :hidden="true"
          style="display: none"
        />
        <div v-if="dominantColor" :style="{ backgroundColor: dominantColor }" class="color_swatch">
          주요 색상: {{ dominantColor }}
        </div>
        <RouterView />
      </main>
    </div>
  </div>
</template>
