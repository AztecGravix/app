import { makeAutoObservable, reaction, runInAction } from 'mobx'

import { MarketStore } from './MarketStore.js'
import { mapApiSymbol } from '../utils/gravix.js'
import { Reactions } from '../utils/reactions.js'
import { normalizeAmount } from '../utils/normalize-amount.js'
import { BigNumber } from 'bignumber.js'

type State = {
    price: {[k: string]: string | undefined}
}

const initialState: State = {
    price: {}
}

export class PriceStore {
    protected state = initialState

    protected reactions = new Reactions()

    protected timer?: NodeJS.Timeout

    constructor(protected market: MarketStore) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    init() {
        this.reactions.create(reaction(() => this.market.marketIdx, this.resync, { fireImmediately: true }))
    }

    dispose() {
        this.state = initialState
        clearInterval(this.timer)
    }

    resync() {
        clearInterval(this.timer)

        this.state.price = {}

        this.timer = setInterval(this.syncAllPrices, 5000)

        this.syncAllPrices().catch(console.error)
    }

    async syncAllPrices(): Promise<void> {
        try {
            const [btc, eth, bsc] = await Promise.all([
                PriceStore.syncPrice(1),
                PriceStore.syncPrice(2),
                PriceStore.syncPrice(3)
            ])
            runInAction(() => {
                this.state.price = {
                    1: btc ? new BigNumber(btc).decimalPlaces(8, BigNumber.ROUND_DOWN).toFixed() : this.state.price[1],
                    2: eth ? new BigNumber(eth).decimalPlaces(8, BigNumber.ROUND_DOWN).toFixed() : this.state.price[2],
                    3: bsc ? new BigNumber(bsc).decimalPlaces(8, BigNumber.ROUND_DOWN).toFixed() : this.state.price[3],
                }
            })
        }
        catch (e) {
            console.error(e)
        }
    }

    get price(): {[k: string]: string | undefined} {
        return this.state.price
    }

    get priceNormalized(): {[k: string]: string | undefined} {
        if (this.price) {
            const entries = Object.entries(this.state.price).map(([idx, price]) => {
                return price ? [idx, normalizeAmount(price, 8)] : [idx, undefined]
            })
            return Object.fromEntries(entries)
        }
        return {}
    }

    static async syncPrice(marketIdx: number): Promise<string | undefined> {
        let price: string | undefined

        try {
            const fetchBTCFeed = await fetch(
                `https://api.binance.com/api/v3/avgPrice?symbol=${mapApiSymbol(marketIdx)}`,
            )

            const priceFeed = await fetchBTCFeed.json()

            price = priceFeed?.price
        } catch (e) {
            console.error(e)
        }

        return price
    }
}
