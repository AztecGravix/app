import { makeAutoObservable } from 'mobx'
import { BigNumber } from 'bignumber.js'
import { PriceStore } from './PriceStore.js'
import { MarketStore } from './MarketStore.js'
import { Reactions } from '../utils/reactions.js'

export class MarketStatsStore {
    protected reactions = new Reactions()

    constructor(
        protected price: PriceStore,
        protected market: MarketStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    public get openInterestL(): string | undefined {
        const price = this.price.price[this.market.idx]
        return this.market.totalLongs && price
            ? new BigNumber(this.market.totalLongs)
                  .times(price)
                  .dividedBy(10 ** 6)
                  .toFixed(0)
            : undefined
    }

    public get maxTotalLongsUSD(): string | undefined {
        return this.market.maxTotalLongsUSD
    }

    public get openInterestS(): string | undefined {
        const price = this.price.price[this.market.idx]
        return this.market.totalShorts && price
            ? new BigNumber(this.market.totalShorts)
                  .times(price)
                  .dividedBy(10 ** 6)
                  .toFixed(0)
            : undefined
    }

    public get maxTotalShortsUSD(): string | undefined {
        return this.market.maxTotalShortsUSD
    }
}
