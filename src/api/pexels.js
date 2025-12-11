const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY

/**
 * Pexels API를 사용하여 고품질 배경 이미지 가져오기
 * @param {string} query - 검색 키워드 (nature, city 등)
 * @param {number} width - 이미지 너비
 * @param {number} height - 이미지 높이
 * @returns {Promise<string>} 이미지 URL
 */
export const fetchBackgroundImage = async (query = 'nature', width = 1920, height = 1080) => {
  try {
    if (!PEXELS_API_KEY) {
      console.warn('Pexels API key is missing. Skipping background image fetch.')
      return null
    }

    const response = await fetch(
      `/api/pexels/v1/search?query=${query}&orientation=landscape&size=large&per_page=15`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    )

    if (!response.ok) {
      // 401 Unauthorized etc.
      console.warn(`Pexels API error! status: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.photos && data.photos.length > 0) {
      // 랜덤으로 하나 선택
      const randomIndex = Math.floor(Math.random() * data.photos.length)
      const photo = data.photos[randomIndex]

      // 가장 큰 사이즈 이미지 반환
      return photo.src.original || photo.src.large2x || photo.src.large
    }

    return null
  } catch (error) {
    // 네트워크 에러(CORS 등)가 발생해도 앱이 멈추지 않도록 경고만 표시
    console.warn('Pexels image fetch failed (likely CORS or network issue):', error)
    return null
  }
}

/**
 * 시간대별로 적절한 검색 키워드 반환
 */
export const getTimeBasedQuery = () => {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 8) {
    return 'sunrise nature'
  } else if (hour >= 8 && hour < 12) {
    return 'morning landscape'
  } else if (hour >= 12 && hour < 17) {
    return 'nature landscape'
  } else if (hour >= 17 && hour < 20) {
    return 'sunset city'
  } else {
    return 'night city lights'
  }
}
