import { makeAutoObservable, runInAction } from 'mobx'
import { notification } from 'antd'
import { BigNumber } from 'bignumber.js'
import { Reactions } from '../utils/reactions.js'
import { PriceStore } from './PriceStore.js'
import { normalizeAmount } from '../utils/normalize-amount.js'
import { mapIdxToTicker, normalizeLeverage, normalizePercent } from '../utils/gravix.js'
import { MarketStore } from './MarketStore.js'
import { WalletStore } from './WalletStore.js'
import { Fr, NotePreimage, computeMessageSecretHash } from '@aztec/aztec.js'
import { decimalAmount } from '../utils/decimal-amount.js'
import { getSafeProcessingId } from '../utils/get-safe-processing-id.js'
import { EventName, EventsStore } from './EventsStore.js'

export enum DepositType {
    Long = '0',
    Short = '1',
}

type State = {
    loading?: boolean
    depositType: DepositType
    leverage: string
    collateral?: string
    slippage?: string
    position?: string
}

const initialState: State = {
    depositType: DepositType.Long,
    leverage: '1',
    slippage: '1',
}

export class DepositStore {
    protected reactions = new Reactions()

    protected state = initialState

    constructor(
        protected wallet: WalletStore,
        protected price: PriceStore,
        protected market: MarketStore,
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

    setType(val: DepositType): void {
        this.state.depositType = val
    }

    setCollateral(value: string): void {
        this.state.collateral = value
        this.calcPosition()
    }

    setPosition(value: string): void {
        this.state.position = value
        this.calcCollateral()
    }

    setLeverage(value: string): void {
        this.state.leverage = value
        this.calcPosition()
    }

    setSlippage(value: string): void {
        this.state.slippage = value
    }

    calcCollateral(): void {
        this.state.collateral =
            this.position && this.leverage && this.market.openFeeRate
                ? new BigNumber(this.position)
                      .dividedBy(
                          new BigNumber(1)
                              .minus(new BigNumber(this.leverage).times(this.market.openFeeRate).dividedBy(100))
                              .times(this.leverage),
                      )
                      .decimalPlaces(6)
                      .toString()
                : undefined
    }

    calcPosition(): void {
        this.state.position =
            this.collateral && this.openFee && this.leverage
                ? new BigNumber(this.collateral).minus(this.openFee).times(this.leverage).decimalPlaces(6).toString()
                : undefined
    }

    async submit(): Promise<void> {
        let success = false

        runInAction(() => {
            this.state.loading = true
        })

        try {
            if (!this.wallet.selectedAccount) {
                throw new Error('wallet.selectedAccount must be defined')
            }

            const vault = await this.wallet.getVault(this.wallet.selectedAccount)
            const wallet = this.wallet.getWallet(this.wallet.selectedAccount)

            if (!vault) {
                throw new Error('vault must be defined')
            }

            if (!wallet) {
                throw new Error('wallet must be defined')
            }

            if (!this.collateralNormalized) {
                throw new Error('collateralNormalized must be defined')
            }

            if (!this.openPriceNormalized) {
                throw new Error('openPriceNormalized must be defined')
            }

            if (!this.leverageNormalized) {
                throw new Error('leverageNormalized must be defined')
            }

            notification.info({
                message: 'Position request sent',
                placement: 'bottomRight',
            })

            const secret = Fr.random()
            const secretHash = await computeMessageSecretHash(secret)

            const id = getSafeProcessingId()
            const openPrice = BigInt(this.openPriceNormalized)
            const collateral = BigInt(this.collateralNormalized)
            const leverage = BigInt(this.leverageNormalized)

            console.log(
                {
                    id,
                    collateral,
                    marketIdx: this.market.marketIdx,
                    openPrice,
                    depositType: this.depositType === DepositType.Long ? 0 : 1,
                    leverage,
                    wallet: wallet.getAddress(),
                    secretHash,
                },
                'PAYLOAD construct_position',
            )
            const pos = await vault.methods
                .construct_position(
                    id,
                    collateral,
                    this.market.marketIdx,
                    openPrice,
                    this.depositType === DepositType.Long ? 0 : 1,
                    leverage,
                    wallet.getAddress(),
                    secretHash,
                )
                .view()

            const serialized = await vault.methods.serialize_pos(pos).view()

            console.log(
                {
                    id,
                    collateral,
                    leverage,
                    depositType: this.depositType === DepositType.Long ? 0 : 1,
                    marketIdx: this.market.marketIdx,
                    openPrice,
                    secretHash,
                },
                'PAYLOAD open_position',
            )
            const tx = await vault.methods
                .open_position(
                    id,
                    collateral,
                    leverage,
                    this.depositType === DepositType.Long ? 0 : 1,
                    this.market.marketIdx,
                    openPrice,
                    secretHash,
                )
                .send()
                .wait()

            const storageSlot = new Fr(5)

            const preimage = new NotePreimage(serialized.map((i: any) => new Fr(i)))

            await wallet.addNote(wallet.getAddress(), vault.address, storageSlot, preimage, tx.txHash)

            const resultTx = await vault.methods.resolve_open_position(secret).send().wait()
            console.log(resultTx.txHash)

            this.events.add(EventsStore.create(EventName.DepositSuccess))

            const price = decimalAmount(openPrice.toString(), 8)
            const ticker = mapIdxToTicker(this.market.marketIdx)
            const type = DepositType.Long ? 'Long' : 'Short'
            notification.success({
                message: 'Market order executed',
                description: `${ticker} ${type} open at $${price}`,
                placement: 'bottomRight',
            })

            success = true
        } catch (e) {
            console.error(e)
            notification.error({
                message: 'Market order canceled',
                placement: 'bottomRight',
            })
        }

        runInAction(() => {
            this.state.collateral = success ? '' : this.collateral
            this.state.leverage = success ? '1' : this.leverage
            this.state.position = success ? '' : this.position
            this.state.loading = false
        })
    }

    get loading(): boolean {
        return !!this.state.loading
    }

    get collateral(): string | undefined {
        return this.state.collateral
    }

    get collateralNormalized(): string | undefined {
        return this.state.collateral ? normalizeAmount(this.state.collateral, 6) : undefined
    }

    get amountIsValid(): boolean {
        return true
    }

    get depositType(): DepositType {
        return this.state.depositType
    }

    get slippage(): string | undefined {
        return this.state.slippage
    }

    get leverage(): string {
        return this.state.leverage
    }

    get leverageNormalized(): string | undefined {
        return this.leverage ? normalizeLeverage(this.leverage) : undefined
    }

    get openFee(): string | undefined {
        return this.collateral && this.leverage && this.market.openFeeRate
            ? new BigNumber(this.collateral)
                  .times(this.leverage)
                  .times(this.market.openFeeRate)
                  .dividedBy(100)
                  .toFixed()
            : undefined
    }

    get liquidationPrice(): string | undefined {
        if (
            this.collateral &&
            this.openFee &&
            this.openPrice &&
            this.leverage &&
            this.market.baseSpreadRate &&
            new BigNumber(this.collateral).gt(0)
        ) {
            const isLong = this.depositType === DepositType.Long

            const collateral = new BigNumber(this.collateral).minus(this.openFee)

            const liqPriceDistance = new BigNumber(this.openPrice)
                .times(collateral)
                .times(0.9)
                .dividedBy(this.collateral)
                .dividedBy(this.leverage)

            return new BigNumber(this.openPrice)
                .plus(new BigNumber(liqPriceDistance).times(isLong ? -1 : 1))
                .dividedBy(
                    new BigNumber(1).plus(
                        new BigNumber(this.market.baseSpreadRate).dividedBy(100).times(isLong ? -1 : 1),
                    ),
                )
                .decimalPlaces(8, BigNumber.ROUND_DOWN)
                .toFixed()
        }
        return undefined
    }

    get position(): string | undefined {
        return this.state.position
    }

    get positionNormalized(): string | undefined {
        return this.position ? normalizeAmount(this.position, 6) : undefined
    }

    get spread(): string | undefined {
        return this.market.baseSpreadRate
    }

    get openPrice(): string | undefined {
        const isLong = this.depositType === DepositType.Long
        const price = this.price.price[this.market.idx]

        return price && this.spread
            ? new BigNumber(price)
                  .plus(
                      new BigNumber(price)
                          .times(this.spread)
                          .dividedBy(100)
                          .times(isLong ? 1 : -1),
                  )
                  .decimalPlaces(8, BigNumber.ROUND_DOWN)
                  .toString()
            : undefined
    }

    get openPriceNormalized(): string | undefined {
        return this.openPrice ? normalizeAmount(this.openPrice, 8) : undefined
    }

    get slippageNormalized(): string | undefined {
        return this.state.slippage ? normalizePercent(this.state.slippage) : undefined
    }

    get isValid(): boolean | undefined {
        return true
    }

    get isSpreadValid(): boolean | undefined {
        const price = this.price.price[this.market.idx]
        return price && this.liquidationPrice
            ? this.depositType === DepositType.Long
                ? new BigNumber(price).gt(this.liquidationPrice)
                : new BigNumber(price).lt(this.liquidationPrice)
            : undefined
    }

    get isEnabled(): boolean | undefined {
        return this.isValid && this.amountIsValid && this.isSpreadValid === true
    }
}
