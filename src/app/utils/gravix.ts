import { BigNumber } from 'bignumber.js'

export const mapIdxToTicker = (marketIdx: number) => {
    switch (marketIdx) {
        case 1:
            return 'BTC/USD'
        case 2:
            return 'ETH/USD'
        case 3:
            return 'BNB/USD'
        default:
            throw new Error('Unknown idx')
    }
}

export const mapChartSymbol = (marketIdx: number) => {
    switch (marketIdx) {
        case 1:
            return 'BINANCE:BTCUSDT'
        case 2:
            return 'BINANCE:ETHUSDT'
        case 3:
            return 'BINANCE:BNBUSDT'
        default:
            throw new Error('Unknown market')
    }
}

export const mapApiSymbol = (marketIdx: number) => {
    switch (marketIdx) {
        case 1:
            return 'BTCUSDT'
        case 2:
            return 'ETHUSDT'
        case 3:
            return 'BNBUSDT'
        default:
            throw new Error('Unknown market')
    }
}

export const decimalPercent = (value: string): string =>
    new BigNumber(value)
        .dividedBy(10 ** 12)
        .times(100)
        .toFixed()

export const normalizePercent = (value: string): string =>
    new BigNumber(value)
        .dividedBy(100)
        .times(10 ** 12)
        .toFixed()

export const decimalLeverage = (value: string | number): string => new BigNumber(value).dividedBy(1000000).toFixed()

export const normalizeLeverage = (value: string | number): string =>
    new BigNumber(value).times(1000000).decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed()
