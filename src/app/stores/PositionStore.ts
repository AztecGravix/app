import { makeAutoObservable, reaction } from 'mobx'
import { BigNumber } from 'bignumber.js'
import {
    calcCollateral,
    calcLimitedPnl,
    calcNetValue,
    calcNetValueChange,
    calcNetValueChangePercent,
    calcPnlAfterFees,
    calcPnlAfterFeesPercent,
} from './utils/index.js'
import { decimalLeverage } from '../utils/gravix.js'
import { PositionsListStore } from './PositionsListStore.js'
import { PriceStore } from './PriceStore.js'
import { MarketStore } from './MarketStore.js'
import { GravixStore } from './GravixStore.js'
import { Reactions } from '../utils/reactions.js'
import { TPosition } from '../types.js'
import { decimalAmount } from '../utils/decimal-amount.js'

type State = {
    positionView?: TPosition
}

export class PositionStore {
    protected state: State = {}
    protected reactions = new Reactions()

    constructor(
        protected gravix: GravixStore,
        protected market: MarketStore,
        protected price: PriceStore,
        protected positions: PositionsListStore,
        public readonly positionIdx: string,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        this.reactions.create(
            reaction(() => [this.positions.allUserPositions.length], this.init, { fireImmediately: true }),
        )
    }

    init() {
        const foundPos = this.positions.allUserPositions.find(_ => _.id.toString() === this.positionIdx)
        console.log(foundPos, 'foundPos')
        if (foundPos) this.state.positionView = foundPos
    }

    public dispose(): void {
        this.state = {}
    }

    public get position(): TPosition | undefined {
        return this.state.positionView
    }

    public get leverage(): string | undefined {
        return this.position ? decimalLeverage(this.position.leverage?.toString()) : undefined
    }

    public get type(): string | undefined {
        return this.state.positionView?.posType?.toString()
    }

    public get netValue(): string | undefined {
        return this.initialCollateral && this.openFee && this.limitedPnl
            ? calcNetValue(this.initialCollateral, this.openFee, this.limitedPnl)
            : undefined
    }

    public get netValueChange(): string | undefined {
        return this.limitedPnl ? calcNetValueChange(this.limitedPnl) : undefined
    }

    public get receiveValue(): string | undefined {
        return this.initialCollateral && this.fees && this.limitedPnl
            ? new BigNumber(this.initialCollateral).plus(this.limitedPnl).minus(this.fees).toFixed()
            : undefined
    }

    public get receiveValuePercent(): string | undefined {
        return this.receiveValue && this.initialCollateral
            ? new BigNumber(this.receiveValue)
                  .minus(this.initialCollateral)
                  .times(100)
                  .dividedBy(this.initialCollateral)
                  .decimalPlaces(2)
                  .toFixed()
            : undefined
    }

    public get netValueChangePercent(): string | undefined {
        return this.collateral && this.netValueChange
            ? calcNetValueChangePercent(this.collateral, this.netValueChange)
            : undefined
    }

    public get size(): string | undefined {
        if (!this.position || !this.collateral) return undefined
        const normLeverage = decimalAmount(this.position.leverage.toString(), this.gravix.baseNumber)
        return new BigNumber(this.collateral)
            .times(normLeverage)
            .div(10 ** 6)
            .toFixed(2)
    }

    public get collateral(): string | undefined {
        return this.position && this.position.openFee
            ? calcCollateral(this.position.initialCollateral?.toString(), this.position.openFee?.toString())
            : undefined
    }

    public get fees(): string | undefined {
        return this.openFee && this.state.positionView ? new BigNumber(this.openFee).toFixed() : undefined
    }

    public get feesInverted(): string | undefined {
        return this.fees ? new BigNumber(this.fees).times(-1).toFixed() : undefined
    }

    public get pnlAfterFees(): string | undefined {
        return this.limitedPnl && this.openFee && this.state.positionView && this.initialCollateral
            ? calcPnlAfterFees(this.limitedPnl, this.openFee, this.initialCollateral)
            : undefined
    }

    public get pnlAfterFeesPercent(): string | undefined {
        return this.initialCollateral && this.pnlAfterFees
            ? calcPnlAfterFeesPercent(this.pnlAfterFees, this.initialCollateral)
            : undefined
    }

    public get initialCollateral(): string | undefined {
        return this.position?.initialCollateral?.toString()
    }

    public get pnl(): string | undefined {
        return this.state.positionView ? this.state.positionView.pnl.toString() : undefined
    }

    public get limitedPnl(): string | undefined {
        return this.pnl && this.initialCollateral && this.openFee
            ? calcLimitedPnl(this.initialCollateral, this.openFee, this.pnl, this.gravix.maxPnlRate)
            : undefined
    }

    public get limitedPnlPercent(): string | undefined {
        return this.initialCollateral && this.limitedPnl
            ? new BigNumber(this.limitedPnl).times(100).dividedBy(this.initialCollateral).decimalPlaces(2).toFixed()
            : undefined
    }

    public get marketPrice(): string | undefined {
        return this.price.priceNormalized?.toString()
    }

    public get openPrice(): string | undefined {
        return this.position?.openPrice?.toString()
    }

    public get openFee(): string | undefined {
        return this.position?.openFee?.toString()
    }

    public get openFeeInverted(): string | undefined {
        return this.openFee ? new BigNumber(this.openFee).times(-1).toFixed() : undefined
    }

    public get liquidationPrice(): string | undefined {
        return this.state.positionView?.liqPrice?.toString()
    }

    public get marketIdx(): string | undefined {
        return this.market?.marketIdx?.toString() ?? undefined
    }
}
