// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 과거 30일 환율 데이터 가져오기 (실제 API 사용)
export const fetchHistoricalRates = async () => {
  try {
    const days = 30
    const dates = []
    const krwRates = []
    const arsRates = []

    // 각 날짜별로 실제 환율 데이터 가져오기
    const promises = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)

      // 기본적으로 날짜별 엔드포인트 사용
      let url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/usd.json`

      // 오늘 날짜(i === 0)인 경우, 아직 날짜별 파일이 생성되지 않았을 수 있으므로 @latest 엔드포인트 사용
      // 이렇게 하면 404 에러를 방지하고 가장 최신 데이터를 가져올 수 있음
      if (i === 0) {
        url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
      }

      // Fawaz Ahmed Currency API 사용 (무료, API 키 불필요, CDN 기반)
      // https://github.com/fawazahmed0/exchange-api
      promises.push(
        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error(`Status ${res.status}`)
            return res.json()
          })
          .then((data) => ({
            date: `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`,
            krw: data.usd?.krw || null,
            ars: data.usd?.ars || null,
          }))
          .catch((err) => {
            // 404 등의 에러 발생 시 (아직 오늘 데이터가 없는 경우 등)
            // 전날 데이터나 null을 반환하도록 처리할 수 있으나, 여기서는 null로 처리하고
            // 그래프에서 null 값은 건너뛰거나 이전 값으로 채우는 로직이 필요할 수 있음
            // 우선은 에러 로그만 남기고 null 반환
            console.warn(
              `Data not found for ${dateStr}, likely due to timezone or future date.`,
              err
            )
            return {
              date: `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`,
              krw: null,
              ars: null,
            }
          })
      )
    }

    // 모든 요청 완료 대기
    const results = await Promise.all(promises)

    // 결과 정리
    results.forEach((result) => {
      dates.push(result.date)

      let krw = result.krw
      let ars = result.ars

      // 보정 로직: 현재 값이 null이면 배열의 마지막 값(어제 값)을 사용
      // 주의: krwRates에 이미 들어있는 값은 문자열(toFixed됨)일 수 있음
      if (krw === null && krwRates.length > 0) {
        krw = krwRates[krwRates.length - 1] // 이미 문자열임
      } else if (krw !== null) {
        krw = Number(krw).toFixed(2) // 숫자인 경우 포맷팅
      }

      if (ars === null && arsRates.length > 0) {
        ars = arsRates[arsRates.length - 1] // 이미 문자열임
      } else if (ars !== null) {
        ars = Number(ars).toFixed(2) // 숫자인 경우 포맷팅
      }

      krwRates.push(krw)
      arsRates.push(ars)
    })

    return {
      dates,
      krwRates,
      arsRates,
      // 최신 데이터(오늘)를 현재 환율로 반환
      currentRates: {
        krw: krwRates[krwRates.length - 1],
        ars: arsRates[arsRates.length - 1],
      },
    }
  } catch (error) {
    console.error('Error fetching historical rates:', error)
    return { dates: [], krwRates: [], arsRates: [], currentRates: { krw: null, ars: null } }
  }
}

// 환율 정보 API (최신 데이터 전용 엔드포인트 사용)
export const fetchExchangeRates = async () => {
  try {
    // 최신 데이터는 @latest 엔드포인트 사용
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      krw: data.usd.krw ? data.usd.krw.toFixed(2) : null,
      ars: data.usd.ars ? data.usd.ars.toFixed(2) : null,
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    // 에러 발생 시 fetchHistoricalRates의 캐시된 데이터라도 사용할 수 있도록 시도해볼 수 있음
    return { krw: null, ars: null }
  }
}
