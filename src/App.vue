<script setup>
import { RouterLink, RouterView } from 'vue-router'
import '@/assets/main.scss'
import { onMounted, ref } from 'vue'
import { auth } from '@/firebase'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import domtoimage from 'dom-to-image'
import html2canvas from 'html2canvas'
import WeatherWidget from '@/components/WeatherWidget.vue'
import AnalogClock from '@/components/AnalogClock.vue'
const user = ref(null)
const isLoggedIn = ref(false)

const container = ref(null)
const currentTime = ref(new Date().toLocaleTimeString('en-US', { hour12: false }))

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    isLoggedIn.value = !!currentUser
  })

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

// const saveAsImage = () => {
//   if (!container.value) return

//   const target = container.value;
//   html2canvas(target, {
//     width: target.scrollWidth,
//     height: target.scrollHeight,
//     useCORS: true
//   }).then((canvas) => {
//     const link = document.createElement('a')
//     link.download = 'list-capture.png'
//     link.href = canvas.toDataURL('image/png')
//     link.click()
//   })
// }

const saveAsImage = () => {
  if (!container.value) return

  const node = container.value

  domtoimage
    .toPng(node, {
      // 캡처할 요소의 전체 너비와 높이를 지정하여 내용이 잘리지 않도록 합니다.
      width: node.scrollWidth,
      height: node.scrollHeight,
      // 배경색을 지정하여 검은색으로 나오는 문제를 해결합니다.
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
</script>

<template>
  <div id="app-container" ref="container">
    <nav class="gnb">
      <div class="gnb-links">
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
      <div class="gnb-auth">
        <span v-if="isLoggedIn">Welcome, {{ user.displayName }}</span>
        <button v-if="!isLoggedIn" @click="loginWithGoogle" class="auth-btn">
          Login with Google
        </button>
        <button v-if="isLoggedIn" @click="logout" class="auth-btn">Logout</button>
        <button
          @click="saveAsImage"
          class="save-btn"
          type="button"
          aria-label="이미지로 저장"
        ></button>
      </div>
    </nav>
    <div class="main-view">
      <aside class="lnb" :hidden="true">
        <!-- LNB (Local Navigation Bar) -->
        <p>LNB Area</p>
      </aside>
      <main class="contents">
        <RouterView />
      </main>
    </div>
  </div>
</template>
