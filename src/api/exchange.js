// 환율 정보 API (1달러 기준)
export const fetchExchangeRates = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      krw: data.rates.KRW ? data.rates.KRW.toFixed(2) : null,
      ars: data.rates.ARS ? data.rates.ARS.toFixed(2) : null,
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return { krw: null, ars: null }
  }
}

// 과거 30일 환율 데이터 생성 (1달러 기준)
export const fetchHistoricalRates = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const currentKRW = data.rates.KRW
    const currentARS = data.rates.ARS

    // 30일간의 데이터 시뮬레이션
    const days = 30
    const dates = []
    const krwRates = []
    const arsRates = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(`${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`)

      if (i === 0) {
        // 마지막 날(오늘)은 정확한 현재 환율 사용
        krwRates.push(currentKRW.toFixed(2))
        arsRates.push(currentARS.toFixed(2))
      } else {
        // 과거 데이터는 랜덤 변동 시뮬레이션 (±3%)
        const krwVariation = (Math.random() - 0.5) * 0.06
        const arsVariation = (Math.random() - 0.5) * 0.06

        krwRates.push((currentKRW * (1 + krwVariation)).toFixed(2))
        arsRates.push((currentARS * (1 + arsVariation)).toFixed(2))
      }
    }

    return { dates, krwRates, arsRates }
  } catch (error) {
    console.error('Error fetching historical rates:', error)
    return { dates: [], krwRates: [], arsRates: [] }
  }
}
