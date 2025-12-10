import axios from 'axios'

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search'

export const fetchYoutubeShorts = async (query = 'Son Heung-min') => {
  console.log('Fetching YouTube Shorts...', { hasKey: !!YOUTUBE_API_KEY })

  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API Key is missing. Using fallback data.')
    return null
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoDuration: 'short',
        maxResults: 100,
        order: 'date',
        key: YOUTUBE_API_KEY,
      },
      timeout: 5000, // 5초 타임아웃 설정
    })

    console.log('YouTube API Response:', response.data)
    return response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
    }))
  } catch (error) {
    console.error('Error fetching YouTube Shorts:', error)
    return null
  }
}
