import { Market } from "./stores/MarketStore.js"

export const mapChartSymbol = (market: Market) => {
    switch (market) {
        case Market.BTC:
            return 'BITSTAMP:BTCUSD'
        case Market.ETH:
            return 'BITFINEX:ETHUSD'
        case Market.BNB:
            return 'CRYPTOCAP:BNB'
        default:
            throw new Error('Unknown market')
    }
}
