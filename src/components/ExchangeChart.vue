<script setup>
import { computed, inject } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  dates: {
    type: Array,
    required: true,
  },
  krwRates: {
    type: Array,
    required: true,
  },
  arsRates: {
    type: Array,
    required: true,
  },
})

const isDark = inject('isDark')

const chartData = computed(() => {
  return {
    labels: props.dates,
    datasets: [
      {
        label: 'KRW (원화)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderColor: '#dc2626',
        borderWidth: 2,
        pointBackgroundColor: '#dc2626',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 8,
        data: props.krwRates,
        tension: 0.4,
      },
      {
        label: 'ARS (페소)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: '#2563eb',
        borderWidth: 2,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 8,
        data: props.arsRates,
        tension: 0.4,
      },
    ],
  }
})

// 최대값/최저값 포인트에 별/해 표시를 추가하는 플러그인
const maxPointPlugin = {
  id: 'maxPointPlugin',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart

    data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)

      // 최대값/최저값의 인덱스를 직접 찾기 (문자열을 숫자로 변환)
      let maxIndex = 0
      let maxValue = Number(dataset.data[0])
      let minIndex = 0
      let minValue = Number(dataset.data[0])

      dataset.data.forEach((value, index) => {
        const numValue = Number(value)
        if (numValue > maxValue) {
          maxValue = numValue
          maxIndex = index
        }
        if (numValue < minValue) {
          minValue = numValue
          minIndex = index
        }
      })

      // 최대값에 별 표시
      if (meta.data[maxIndex]) {
        const point = meta.data[maxIndex]
        const x = point.x
        const y = point.y

        ctx.save()
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#FFD700' // 금색
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
        ctx.strokeText('⭐', x, y)
        ctx.fillText('⭐', x, y)
        ctx.restore()
      }

      // 최저값에 해 표시
      if (meta.data[minIndex] && minIndex !== maxIndex) {
        const point = meta.data[minIndex]
        const x = point.x
        const y = point.y

        ctx.save()
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#FFA500' // 오렌지색
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
        ctx.strokeText('☀️', x, y)
        ctx.fillText('☀️', x, y)
        ctx.restore()
      }
    })
  },
}

const chartOptions = computed(() => {
  const textColor = isDark?.value ? '#000' : '#fff'
  const gridColor = isDark?.value ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: 'top',
        labels: {
          color: textColor,
        },
      },
      title: {
        display: false,
        text: '최근 30일 환율 추이',
        color: textColor,
        position: 'bottom',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  }
})
</script>

<template>
  <div class="chart_container">
    <Line :data="chartData" :options="chartOptions" :plugins="[maxPointPlugin]" />
  </div>
</template>

<style scoped>
.chart_container {
  height: 150px;
  margin-top: 5px;
}
</style>
