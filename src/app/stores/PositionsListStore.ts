import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { Reactions } from '../utils/reactions.js'
import { GravixStore } from './GravixStore.js'
import { lastOfCalls } from '../utils/last-of-calls.js'
import { MarketStore } from './MarketStore.js'
import { WalletStore } from './WalletStore.js'
import { TPosition } from '../types.js'
import { decimalAmount } from '../utils/decimal-amount.js'
import { BigNumber } from 'bignumber.js'
import { PriceStore } from './PriceStore.js'

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

    constructor(
        protected wallet: WalletStore,
        protected gravix: GravixStore,
        protected market: MarketStore,
        protected price: PriceStore,
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
        this.reactions.create(reaction(() => [this.wallet.selectedAccount], this.reload))
    }

    reload() {
        this.state = initialState
        this.initApp().catch(console.error)
    }

    dispose() {
        this.reactions.destroy()
        this.state = initialState
    }

    protected onContract = lastOfCalls(() => {
        this.initApp().catch(console.error)
    }, 500)

    async initApp() {
        runInAction(() => {
            this.state.positionsLoading = true
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
            if (!this.price.priceNormalized) {
                throw new Error('price must be defined')
            }

            const marketPrice = this.price.priceNormalized

            const positionsUser = await vault?.methods.positions(wallet.getAddress()).view()

            const filteredPositions = positionsUser.filter((_: any) => {
                if (!_._is_some) return false
                // if (_._value?.owner.toString() !== wallet.getAddress().toString()) return false
                return _
            })

            const positionWithPnl = await Promise.all(
                filteredPositions.map(async (_: any) => {
                    const res = await vault.methods.pnl_and_liq(_._value, BigInt(marketPrice)).view()

                    console.log(res, 'res')
                    return mapPosition({
                        ..._._value,
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

    async closePos(key: string) {
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
            if (!this.price.priceNormalized) {
                throw new Error('price must be defined')
            }

            const marketPrice = this.price.priceNormalized
            console.log(key, 'closePos')
            const tx = await vault.methods.close_position(+key, BigInt(marketPrice)).send().wait()
            console.log(tx, 'tx')
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
