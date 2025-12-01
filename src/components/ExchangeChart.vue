<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  dates: {
    type: Array,
    required: true
  },
  usdRates: {
    type: Array,
    required: true
  },
  arsRates: {
    type: Array,
    required: true
  }
})

const chartData = {
  labels: props.dates,
  datasets: [
    {
      label: 'USD (달러)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      data: props.usdRates,
      tension: 0.4
    },
    {
      label: 'ARS (페소)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      data: props.arsRates,
      tension: 0.4
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#fff'
      }
    },
    title: {
      display: true,
      text: '최근 30일 환율 추이',
      color: '#fff',
      font: {
        size: 16
      }
    }
  },
  scales: {
    y: {
      ticks: {
        color: '#fff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    x: {
      ticks: {
        color: '#fff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
}
</script>

<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 300px;
  margin-top: 20px;
}
</style>
