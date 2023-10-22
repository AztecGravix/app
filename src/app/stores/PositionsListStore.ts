import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { Reactions } from '../utils/reactions.js'
import { GravixStore } from './GravixStore.js'
import { lastOfCalls } from '../utils/last-of-calls.js'
import { MarketStore } from './MarketStore.js'
import { WalletStore } from './WalletStore.js'
import { TPosition } from '../types.js'
import { BigNumber } from 'bignumber.js'
import { PriceStore } from './PriceStore.js'
import { notification } from 'antd'
import { decimalAmount } from '../utils/decimal-amount.js'
import { EventsStore } from './EventsStore.js'
import { AutoResyncStore } from './GaugesAutoResyncStore.js'

type State = {
    marketOrders?: TPosition[]
    positionsLoading: boolean
    closeLoading: { [k: string]: boolean | undefined }
}

const initialState: State = {
    closeLoading: {},
    positionsLoading: false,
}

export class PositionsListStore {
    protected reactions = new Reactions()
    protected state = initialState

    protected autoResync = new AutoResyncStore()

    constructor(
        protected wallet: WalletStore,
        protected gravix: GravixStore,
        protected market: MarketStore,
        protected price: PriceStore,
        protected events: EventsStore,
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
            reaction(() => [this.wallet.selectedAccount], this.reload),
            reaction(() => this.events.last, this.initApp.bind(this, false)),
            reaction(() => this.autoResync.counter, this.initApp.bind(this, true)),
        )
        this.autoResync.start()
    }

    reload() {
        this.state = initialState
        this.initApp().catch(console.error)
    }

    dispose() {
        this.autoResync.stop()
        this.reactions.destroy()
        this.state = initialState
    }

    protected onContract = lastOfCalls(() => {
        this.initApp().catch(console.error)
    }, 500)

    async initApp(silence?: boolean) {
        if (!silence) {
            runInAction(() => {
                this.state.positionsLoading = true
            })
        }

        try {
            if (!this.wallet.selectedAccount) {
                throw new Error('wallet.selectedAccount must be defined')
            }

            const vault = await this.wallet.getVault(this.wallet.selectedAccount)
            const wallet = this.wallet.getWallet(this.wallet.selectedAccount)

            if (!wallet) {
                throw new Error('wallet must be defined')
            }
            if (!vault) {
                throw new Error('vault must be defined')
            }
            if (!this.price.priceNormalized) {
                throw new Error('price must be defined')
            }

            const positionsUser = await vault?.methods.positions(wallet.getAddress()).view()

            const filteredPositions = positionsUser.filter((_: any) => {
                const posOwner = `0x${new BigNumber(_._value.owner.toString()).toString(16).padStart(64, '0')}`

                if (!_._is_some) return false
                if (this.wallet.selectedAccount !== posOwner) return false

                return _
            })

            const positionWithPnl = await Promise.all(
                filteredPositions.map(async (item: any) => {
                    const marketPrice = this.price.priceNormalized[item._value.marketIdx.toString()]
                    const res = await vault.methods.pnl_and_liq(item._value, BigInt(marketPrice ?? '0')).view()

                    return mapPosition({
                        ...item._value,
                        ...res,
                    })
                }),
            )

            runInAction(() => {
                this.state.marketOrders = positionWithPnl
                console.log(this.state.marketOrders, 'this.state.marketOrders')
                this.state.positionsLoading = false
            })
        } catch (e) {
            console.error(e)
        }
    }

    async closePos(key: string, marketIdx: string) {
        runInAction(() => {
            this.state.closeLoading[key] = true
        })

        try {
            if (!this.wallet.selectedAccount) {
                throw new Error('wallet.selectedAccount must be defined')
            }

            const vault = await this.wallet.getVault(this.wallet.selectedAccount)
            const wallet = this.wallet.getWallet(this.wallet.selectedAccount)

            if (!wallet) {
                throw new Error('wallet must be defined')
            }
            if (!vault) {
                throw new Error('vault must be defined')
            }

            notification.info({
                message: 'Position close request sent',
                placement: 'bottomRight',
            })

            const marketPrice = this.price.priceNormalized[marketIdx]

            if (!marketPrice) {
                throw new Error('price must be defined')
            }

            const tx = await vault.methods.close_position(+key, BigInt(marketPrice)).send().wait()
            console.log(tx, 'tx')
            await new Promise(res => setTimeout(res, 5000))
            await this.initApp()
            notification.info({
                message: 'Position removed!',
                placement: 'bottomRight',
                type: 'success',
            })
            runInAction(() => {
                this.state.closeLoading[key] = false
            })
        } catch (e) {
            console.error(e)
            runInAction(() => {
                this.state.closeLoading[key] = false
            })
        }
    }

    countSize(collateral: string, leverage: string) {
        const normLeverage = decimalAmount(leverage, this.gravix.baseNumber)
        return new BigNumber(collateral)
            .times(normLeverage)
            .div(10 ** 6)
            .toFixed(2)
    }

    public get allUserPositions(): TPosition[] {
        return this.state.marketOrders ?? []
    }

    // public get positionsViewById(): { [k: string]: WithoutArr<IGravix.PositionViewStructOutput> | undefined } {
    //     return this.state.marketOrdersPosView ? Object.fromEntries(this.state.marketOrdersPosView as any) : {}
    // }

    // public get positionsById(): { [k: string]: WithoutArr<TGravixPosition> | undefined } {
    //     return this.state.marketOrdersFull ? Object.fromEntries(this.state.marketOrdersFull as any) : {}
    // }

    public get posLoading(): boolean {
        return !!this.state.positionsLoading
    }

    public get closeLoading(): State['closeLoading'] {
        return this.state.closeLoading
    }
}

// const mapPositionView = (item: IGravix.PositionViewStructOutput, positionKey: string): PositionViewData => {
//     return {
//         '1': {
//             position: item.position,
//             positionSizeUSD: item.positionSizeUSD,
//             closePrice: item.closePrice,
//             borrowFee: item.borrowFee,
//             fundingFee: item.fundingFee,
//             closeFee: item.closeFee,
//             liquidationPrice: item.liquidationPrice,
//             pnl: item.pnl,
//             liquidate: item.liquidate,
//             viewTime: item.viewTime,
//         },
//         '0': positionKey,
//     }
// }
// const mapFullPosition = (item: IGravix.UserPositionInfoStructOutput): FullPositionData => {
//     return {
//         '1': {
//             accUSDFundingPerShare: item[1].accUSDFundingPerShare,
//             baseSpreadRate: item[1].baseSpreadRate,
//             borrowBaseRatePerHour: item[1].borrowBaseRatePerHour,
//             closeFeeRate: item[1].closeFeeRate,
//             createdAt: item[1].createdAt,
//             initialCollateral: item[1].initialCollateral,
//             leverage: item[1].leverage,
//             liquidationThresholdRate: item[1].liquidationThresholdRate,
//             marketIdx: item[1].marketIdx,
//             markPrice: item[1].markPrice,
//             openFee: item[1].openFee,
//             openPrice: item[1].openPrice,
//             positionType: item[1].positionType,
//         },
//         '0': item[0].toString(),
//     }
// }

const mapPosition = (item: any): TPosition => {
    console.log(item.liqPrice.toString(), item.id, 'LIQ PRICE')
    return {
        id: item.id,
        marketIdx: item.marketIdx,
        posType: item.posType,
        initialCollateral: item.initialCollateral,
        openFee: item.openFee,
        openPrice: item.openPrice,
        markPrice: item.markPrice,
        leverage: item.leverage,
        liquidationThresholdRate: item.liquidationThresholdRate,
        liqPrice: item.liqPrice,
        owner: item.owner,
        pnl: new BigNumber(item.pnl).times(item.positive ? 1 : -1).toFixed(4),
        secretHash: item.secret_hash,
        secret: item.secret,
    }
}
