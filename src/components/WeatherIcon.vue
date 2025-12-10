<script setup>
import { computed } from 'vue'

const props = defineProps({
  code: {
    type: Number,
    required: true,
  },
})

const weatherType = computed(() => {
  const c = props.code
  if (c === 0 || c === 1) return 'clear'
  if (c === 2 || c === 3 || c === 45 || c === 48) return 'cloudy'
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rain'
  if ((c >= 71 && c <= 77) || (c >= 85 && c <= 86)) return 'snow'
  if (c === 68) return 'rain_snow'
  if (c >= 95 && c <= 99) return 'thunder'
  return 'unknown'
})
</script>

<template>
  <div class="weather-icon" :class="weatherType">
    <svg viewBox="0 0 64 64">
      <!-- Clear: Sun -->
      <g v-if="weatherType === 'clear'" class="sun-group">
        <circle cx="32" cy="32" r="12" fill="#FFD700" />
        <g class="rays">
          <line
            x1="32"
            y1="10"
            x2="32"
            y2="4"
            stroke="#FFD700"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="32"
            y1="54"
            x2="32"
            y2="60"
            stroke="#FFD700"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="54"
            y1="32"
            x2="60"
            y2="32"
            stroke="#FFD700"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="10"
            y1="32"
            x2="4"
            y2="32"
            stroke="#FFD700"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="47.55"
            y1="16.45"
            x2="51.8"
            y2="12.2"
            stroke="#FFD700"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="16.45"
            y1="47.55"
            x2="12.2"
            y2="51.8"
            stroke="#FFD700"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="47.55"
            y1="47.55"
            x2="51.8"
            y2="51.8"
            stroke="#FFD700"
            stroke-width="3"
            stroke-linecap="round"
          />
          <line
            x1="16.45"
            y1="16.45"
            x2="12.2"
            y2="12.2"
            stroke="#FFD700"
            stroke-width="3"
            stroke-linecap="round"
          />
        </g>
      </g>

      <!-- Cloudy: Cloud -->
      <g v-if="weatherType === 'cloudy'" class="cloud-group">
        <path
          d="M46,46 H18 c-4.4,0 -8,-3.6 -8,-8 0,-4.4 3.6,-8 8,-8 0.6,0 1.2,0.1 1.8,0.2 C18.9,24.7 23.6,20 29,20 c4.8,0 8.8,3.4 9.8,8 0.7,-0.2 1.5,-0.3 2.2,-0.3 5.5,0 10,4.5 10,10 0,4.6 -3.2,8.5 -7.5,9.6"
          fill="#E0E0E0"
        />
      </g>

      <!-- Rain: Cloud + Drops -->
      <g v-if="weatherType === 'rain'" class="rain-group">
        <path
          d="M46,40 H18 c-4.4,0 -8,-3.6 -8,-8 0,-4.4 3.6,-8 8,-8 0.6,0 1.2,0.1 1.8,0.2 C18.9,18.7 23.6,14 29,14 c4.8,0 8.8,3.4 9.8,8 0.7,-0.2 1.5,-0.3 2.2,-0.3 5.5,0 10,4.5 10,10 0,4.6 -3.2,8.5 -7.5,9.6"
          fill="#B0BEC5"
        />
        <line
          x1="24"
          y1="44"
          x2="24"
          y2="52"
          stroke="#4FC3F7"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop d1"
        />
        <line
          x1="32"
          y1="44"
          x2="32"
          y2="52"
          stroke="#4FC3F7"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop d2"
        />
        <line
          x1="40"
          y1="44"
          x2="40"
          y2="52"
          stroke="#4FC3F7"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop d3"
        />
      </g>

      <!-- Snow: Cloud + Flakes -->
      <g v-if="weatherType === 'snow'" class="snow-group">
        <path
          d="M46,40 H18 c-4.4,0 -8,-3.6 -8,-8 0,-4.4 3.6,-8 8,-8 0.6,0 1.2,0.1 1.8,0.2 C18.9,18.7 23.6,14 29,14 c4.8,0 8.8,3.4 9.8,8 0.7,-0.2 1.5,-0.3 2.2,-0.3 5.5,0 10,4.5 10,10 0,4.6 -3.2,8.5 -7.5,9.6"
          fill="#E0E0E0"
        />
        <circle cx="24" cy="48" r="2" fill="white" class="snow-flake f1" />
        <circle cx="32" cy="48" r="2" fill="white" class="snow-flake f2" />
        <circle cx="40" cy="48" r="2" fill="white" class="snow-flake f3" />
      </g>

      <!-- Rain & Snow: Cloud + Drops + Flakes -->
      <g v-if="weatherType === 'rain_snow'" class="rain-snow-group">
        <path
          d="M46,40 H18 c-4.4,0 -8,-3.6 -8,-8 0,-4.4 3.6,-8 8,-8 0.6,0 1.2,0.1 1.8,0.2 C18.9,18.7 23.6,14 29,14 c4.8,0 8.8,3.4 9.8,8 0.7,-0.2 1.5,-0.3 2.2,-0.3 5.5,0 10,4.5 10,10 0,4.6 -3.2,8.5 -7.5,9.6"
          fill="#CFD8DC"
        />
        <!-- Rain drops on left -->
        <line
          x1="22"
          y1="44"
          x2="22"
          y2="52"
          stroke="#4FC3F7"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop d1"
        />
        <line
          x1="30"
          y1="44"
          x2="30"
          y2="52"
          stroke="#4FC3F7"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop d2"
        />
        <!-- Snow flakes on right -->
        <circle cx="38" cy="48" r="2" fill="white" class="snow-flake f2" />
        <circle cx="46" cy="48" r="2" fill="white" class="snow-flake f3" />
      </g>

      <!-- Thunder: Cloud + Bolt -->
      <g v-if="weatherType === 'thunder'" class="thunder-group">
        <path
          d="M46,40 H18 c-4.4,0 -8,-3.6 -8,-8 0,-4.4 3.6,-8 8,-8 0.6,0 1.2,0.1 1.8,0.2 C18.9,18.7 23.6,14 29,14 c4.8,0 8.8,3.4 9.8,8 0.7,-0.2 1.5,-0.3 2.2,-0.3 5.5,0 10,4.5 10,10 0,4.6 -3.2,8.5 -7.5,9.6"
          fill="#607D8B"
        />
        <polygon points="28,42 36,42 32,58" fill="#FFEB3B" class="lightning" />
      </g>

      <!-- Unknown: Question Mark -->
      <text
        v-if="weatherType === 'unknown'"
        x="32"
        y="40"
        text-anchor="middle"
        fill="white"
        font-size="24"
      >
        ?
      </text>
    </svg>
  </div>
</template>

<style scoped lang="scss">
.weather-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
}

// Animations

// Sun Rays
.rays {
  animation: spin 10s linear infinite;
  transform-origin: 32px 32px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Cloud Float
.cloud-group,
.rain-group,
.snow-group,
.rain-snow-group,
.thunder-group {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

// Rain Drops
.rain-drop {
  animation: rain 1s linear infinite;
}
.d1 {
  animation-delay: 0s;
}
.d2 {
  animation-delay: 0.3s;
}
.d3 {
  animation-delay: 0.6s;
}

@keyframes rain {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(10px);
    opacity: 0;
  }
}

// Snow Flakes
.snow-flake {
  animation: snow 2s linear infinite;
}
.f1 {
  animation-delay: 0s;
}
.f2 {
  animation-delay: 0.7s;
}
.f3 {
  animation-delay: 1.4s;
}

@keyframes snow {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(10px);
    opacity: 0;
  }
}

// Lightning
.lightning {
  animation: flash 2s infinite;
  transform-origin: center;
}

@keyframes flash {
  0%,
  90%,
  100% {
    opacity: 0;
  }
  92%,
  96% {
    opacity: 1;
  }
}
</style>
