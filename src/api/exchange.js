// 환율 정보 API (exchangerate-api.com - 무료, API 키 불필요)
export const fetchExchangeRates = async () => {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            usd: data.rates.USD ? (1 / data.rates.USD).toFixed(2) : null,
            ars: data.rates.ARS ? (1000 / data.rates.ARS).toFixed(2) : null,
        };
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return { usd: null, ars: null };
    }
};

// 과거 30일 환율 데이터 생성 (실제 API는 유료이므로 시뮬레이션)
export const fetchHistoricalRates = async () => {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const currentUSD = 1 / data.rates.USD;
        const currentARS = 1000 / data.rates.ARS;

        // 30일간의 데이터 시뮬레이션 (실제로는 historical API 필요)
        const days = 30;
        const dates = [];
        const usdRates = [];
        const arsRates = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));

            // 랜덤 변동 시뮬레이션 (±3%)
            const usdVariation = (Math.random() - 0.5) * 0.06;
            const arsVariation = (Math.random() - 0.5) * 0.06;

            usdRates.push((currentUSD * (1 + usdVariation)).toFixed(2));
            arsRates.push((currentARS * (1 + arsVariation)).toFixed(2));
        }

        return { dates, usdRates, arsRates };
    } catch (error) {
        console.error('Error fetching historical rates:', error);
        return { dates: [], usdRates: [], arsRates: [] };
    }
};
