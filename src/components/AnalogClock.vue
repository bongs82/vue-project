<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const hourDeg = ref(0)
const minuteDeg = ref(0)
const secondDeg = ref(0)
let timer = null

const updateClock = () => {
  const now = new Date()
  const seconds = now.getSeconds()
  const minutes = now.getMinutes()
  const hours = now.getHours()

  secondDeg.value = seconds * 6
  minuteDeg.value = minutes * 6 + seconds * 0.1
  hourDeg.value = (hours % 12) * 30 + minutes * 0.5
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="analog-clock">
    <svg viewBox="0 0 100 100">
      <!-- Clock Face -->
      <circle
        cx="50"
        cy="50"
        r="48"
        stroke="white"
        stroke-width="2"
        fill="rgba(255, 255, 255, 0.1)"
      />

      <!-- Markers -->
      <line x1="50" y1="6" x2="50" y2="12" stroke="white" stroke-width="2" />
      <line x1="94" y1="50" x2="88" y2="50" stroke="white" stroke-width="2" />
      <line x1="50" y1="94" x2="50" y2="88" stroke="white" stroke-width="2" />
      <line x1="6" y1="50" x2="12" y2="50" stroke="white" stroke-width="2" />

      <!-- Hands -->
      <!-- Hour Hand -->
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="25"
        stroke="white"
        stroke-width="4"
        stroke-linecap="round"
        :transform="`rotate(${hourDeg}, 50, 50)`"
      />
      <!-- Minute Hand -->
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="15"
        stroke="white"
        stroke-width="3"
        stroke-linecap="round"
        :transform="`rotate(${minuteDeg}, 50, 50)`"
      />
      <!-- Second Hand -->
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="10"
        stroke="#ff4757"
        stroke-width="1"
        stroke-linecap="round"
        :transform="`rotate(${secondDeg}, 50, 50)`"
      />

      <!-- Center Dot -->
      <circle cx="50" cy="50" r="2" fill="#ff4757" />
    </svg>
  </div>
</template>

<style scoped>
.analog-clock {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
</style>
