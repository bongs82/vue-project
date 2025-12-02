<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { fetchNews } from '@/api/naver'

const issues = ref([])
const currentIssueIndex = ref(0)
const isHovered = ref(false)
const isLoading = ref(false)
let rotationTimer = null

const currentIssue = computed(() => {
  return issues.value[currentIssueIndex.value] || null
})

// HTML 태그 제거 함수
const stripHtml = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// 시간 포맷 함수
const formatTime = (pubDate) => {
  const now = new Date()
  const published = new Date(pubDate)
  const diffMs = now - published
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  return `${diffDays}일 전`
}

const fetchTrendingIssues = async () => {
  isLoading.value = true
  try {
    // 네이버 뉴스 API를 사용하여 실시간 뉴스 가져오기
    const newsItems = await fetchNews('실시간')

    if (newsItems && newsItems.length > 0) {
      issues.value = newsItems.slice(0, 10).map((item, index) => ({
        id: index + 1,
        title: stripHtml(item.title),
        source: stripHtml(item.originallink || item.link).split('/')[2] || '뉴스',
        time: formatTime(item.pubDate),
        link: item.link,
        originalLink: item.originallink,
      }))
    } else {
      // API 실패 시 더미 데이터 사용
      issues.value = [
        { id: 1, title: '2024년 IT 트렌드 전망', source: '테크뉴스', time: '10분 전', link: '#' },
        { id: 2, title: 'AI 기술의 새로운 돌파구', source: 'AI타임즈', time: '25분 전', link: '#' },
        { id: 3, title: '글로벌 경제 동향 분석', source: '경제신문', time: '1시간 전', link: '#' },
        {
          id: 4,
          title: '환경 보호를 위한 새로운 정책',
          source: '환경일보',
          time: '2시간 전',
          link: '#',
        },
        {
          id: 5,
          title: '스포츠 하이라이트: 오늘의 경기',
          source: '스포츠뉴스',
          time: '3시간 전',
          link: '#',
        },
        {
          id: 6,
          title: '문화 예술계 새로운 소식',
          source: '문화일보',
          time: '4시간 전',
          link: '#',
        },
        { id: 7, title: '건강과 웰빙 트렌드', source: '헬스뉴스', time: '5시간 전', link: '#' },
        { id: 8, title: '교육 혁신 사례', source: '교육신문', time: '6시간 전', link: '#' },
        { id: 9, title: '부동산 시장 동향', source: '부동산뉴스', time: '7시간 전', link: '#' },
        { id: 10, title: '여행 추천 명소', source: '여행매거진', time: '8시간 전', link: '#' },
      ]
    }
  } catch (error) {
    console.error('Failed to fetch trending issues:', error)
    // 에러 시에도 더미 데이터 표시
    issues.value = [
      { id: 1, title: '뉴스를 불러올 수 없습니다', source: '시스템', time: '방금', link: '#' },
    ]
  } finally {
    isLoading.value = false
  }
}

const startRotation = () => {
  rotationTimer = setInterval(() => {
    currentIssueIndex.value = (currentIssueIndex.value + 1) % issues.value.length
  }, 3000)
}

const stopRotation = () => {
  if (rotationTimer) {
    clearInterval(rotationTimer)
    rotationTimer = null
  }
}

const handleMouseEnter = () => {
  isHovered.value = true
  stopRotation()
}

const handleMouseLeave = () => {
  isHovered.value = false
  startRotation()
}

onMounted(() => {
  fetchTrendingIssues().then(() => {
    startRotation()
  })
})

onUnmounted(() => {
  stopRotation()
})
</script>

<template>
  <div class="trending_issues" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="trend_btn" aria-label="실시간 이슈">
      <span class="trend_icon">🔥</span>
      <Transition name="slide" mode="out-in">
        <div v-if="currentIssue" :key="currentIssue.id" class="current_issue">
          <span class="issue_number">{{ currentIssueIndex + 1 }}</span>
          <span class="issue_text">{{ currentIssue.title }}</span>
        </div>
        <div v-else class="current_issue">
          <span class="issue_text">로딩 중...</span>
        </div>
      </Transition>
    </div>

    <Transition name="dropdown">
      <div v-if="isHovered && issues.length > 0" class="issues_dropdown">
        <div class="issues_dropdown_content">
          <div class="dropdown_header">
            <h3>🔥 실시간 이슈 TOP 10</h3>
          </div>

          <ul class="issues_list">
            <li
              v-for="(issue, index) in issues"
              :key="issue.id"
              class="issue_item"
              :class="{ active: index === currentIssueIndex }"
            >
              <a
                :href="issue.link || issue.originalLink || '#'"
                target="_blank"
                rel="noopener noreferrer"
                class="issue_link"
              >
                <div class="issue_rank">{{ index + 1 }}</div>
                <div class="issue_content">
                  <h4 class="issue_title">{{ issue.title }}</h4>
                  <div class="issue_meta">
                    <span class="issue_source">{{ issue.source }}</span>
                    <span class="issue_time">{{ issue.time }}</span>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>
