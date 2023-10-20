import { BigNumber } from 'bignumber.js'
import { memoizeKey } from '../../utils/memoize-key.js'
import memoize from 'just-memoize'

export const calcNetValue = memoize(
    (initialCollateral: string, openFee: string, limitedPnl: string): string =>
        BigNumber.max(0, new BigNumber(initialCollateral).minus(openFee).plus(limitedPnl)).toFixed(),
    memoizeKey,
)

export const calcNetValueChange = memoize(
    (limitedPnl: string): string => new BigNumber(limitedPnl).toFixed(),
    memoizeKey,
)

export const calcNetValueChangePercent = memoize(
    (collateral: string, netValueChange: string): string =>
        new BigNumber(netValueChange).times(100).dividedBy(collateral).decimalPlaces(2).toFixed(),
    memoizeKey,
)

export const decimalLeverage = memoize((value: string | number): string =>
    new BigNumber(value).dividedBy(1000000).toFixed(),
)

export const calcCollateral = memoize(
    (initialCollateral: string, openFee: string): string => new BigNumber(initialCollateral).minus(openFee).toFixed(),
    memoizeKey,
)

export const calcPnlAfterFees = memoize(
    (limitedPnl: string, openFee: string, initialCollateral: string, closeFee = '0'): string => {
        const result = new BigNumber(limitedPnl).minus(openFee).minus(closeFee)

        if (result.lt(0)) {
            return BigNumber.min(initialCollateral, result.abs()).times(-1).toFixed()
        }

        return result.toFixed()
    },
    memoizeKey,
)

export const calcPnlAfterFeesPercent = memoize(
    (pnlAfterFees: string, initialCollateral: string): string =>
        new BigNumber(pnlAfterFees).times(100).dividedBy(initialCollateral).decimalPlaces(2).toFixed(),
    memoizeKey,
)

export const calcLimitedPnl = memoize(
    (initialCollateral: string, openFee: string, pnl: string, maxPnlRate?: string | null): string => {
        const collateral = calcCollateral(initialCollateral, openFee)
        return maxPnlRate
            ? BigNumber.min(pnl, new BigNumber(collateral).times(maxPnlRate).dividedBy(10 ** 12)).toFixed()
            : pnl
    },
    memoizeKey,
)
