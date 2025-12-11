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
      if (i === 0) {
        url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
      } else if (i === 1) {
        // 어제 날짜(i === 1)도 API 업데이트 시점에 따라 404가 발생할 수 있음
        // 이 경우 404 에러를 방지하기 위해 요청을 건너뛰거나, latest를 사용할 수 있지만
        // 여기서는 에러 방지를 위해 일단 건너뛰고, 이전 데이터로 채우도록 함 (null 반환)
        // 필요하다면 latest를 한 번 더 호출할 수도 있음
        // url = ...
      }

      // Fawaz Ahmed Currency API 사용 (무료, API 키 불필요, CDN 기반)
      // https://github.com/fawazahmed0/exchange-api
      // i === 1 (어제)인 경우 404가 자주 발생하므로 스킵 (null 처리)
      if (i === 1) {
        promises.push(
          Promise.resolve({
            date: `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`,
            krw: null,
            ars: null,
          })
        )
        continue
      }

      promises.push(
        fetch(url)
          .then((res) => {
            if (!res.ok) {
              if (res.status === 404) {
                // 404 is expected for future dates or just-changed dates
                return null
              }
              throw new Error(`Status ${res.status}`)
            }
            return res.json()
          })
          .then((data) => {
            if (!data) return null
            return {
              date: `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`,
              krw: data.usd?.krw || null,
              ars: data.usd?.ars || null,
            }
          })
          .catch((err) => {
            // 404 에러는 자연스러운 현상이므로 경고 로그도 최소화
            // console.debug(`Skipping data for ${dateStr}:`, err)
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

    // 결과 정리 (null 값 제외)
    results
      .filter((result) => result !== null)
      .forEach((result) => {
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
