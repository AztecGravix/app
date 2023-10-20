import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { WalletStore } from './WalletStore.js'
import { Reactions } from '../utils/reactions.js'
import { Market } from '../types.js'
import { decimalLeverage, decimalPercent } from '../utils/gravix.js'

type State = {
    marketIdx: number
    market?: Market
}

const initialState: State = {
    marketIdx: 1,
}

export class MarketStore {
    protected state = initialState

    protected reactions = new Reactions()

    constructor(
        protected wallet: WalletStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    init() {
        this.reactions.create(
            reaction(() => [this.wallet.selectedAccount, this.marketIdx], this.syncData)
        )
    }

    dispose() {
        this.reactions.destroy()
    }

    setMarketIdx(val: number): void {
        this.state.marketIdx = val
    }

    async syncData(): Promise<void> {
        let market: Market

        if (this.wallet.selectedAccount) {
            try {
                const vault = await this.wallet.getVault(this.wallet.selectedAccount)
                market = await vault?.methods.market(1).view()
            }
            catch (e) {
                console.error(e)
            }
        }

        runInAction(() => {
            this.state.market = market
        })
    }

    get marketIdx(): number {
        return this.state.marketIdx
    }

    get market(): Market | undefined {
        return this.state.market
    }

    get maxLeverage(): string | undefined {
        return this.state.market ? decimalLeverage(this.state.market?.maxLeverage.toString()) : undefined
    }

    get openFeeRate(): string | undefined {
        return this.state.market ? decimalPercent(this.state.market.openFeeRate.toString()) : undefined
    }

    get baseSpreadRate(): string | undefined {
        return this.state.market ? decimalPercent(this.state.market?.baseSpreadRate.toString()) : undefined
    }

    get totalLongs(): string | undefined {
        return this.state.market?.totalLongs.toString()
    }

    get totalShorts(): string | undefined {
        return this.state.market?.totalShorts.toString()
    }

    get depth(): string | undefined {
        return '1'
    }
}
