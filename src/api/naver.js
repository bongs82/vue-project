const CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET

export const fetchNews = async (query = 'IT') => {
  try {
    // Vite proxy will redirect /api/naver to https://openapi.naver.com
    const response = await fetch(
      `/api/naver/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=sim`,
      {
        method: 'GET',
        headers: {
          'X-Naver-Client-Id': CLIENT_ID,
          'X-Naver-Client-Secret': CLIENT_SECRET,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

// Fetch worldwide top news (Google News RSS) – returns array of items {title, link, pubDate}
export const fetchGlobalTopNews = async () => {
  try {
    const response = await fetch('/google-news/rss?hl=ko&gl=KR&ceid=KR:ko')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const rssText = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(rssText, 'application/xml')
    const items = Array.from(xmlDoc.querySelectorAll('item')).map((item) => ({
      title: item.querySelector('title')?.textContent || 'No title',
      link: item.querySelector('link')?.textContent || '#',
      pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
    }))
    return items
  } catch (error) {
    console.error('Error fetching global top news:', error)
    return []
  }
}
