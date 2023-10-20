export type Market = {
    baseSpreadRate: bigint
    maxLeverage: bigint
    maxTotalLongs: bigint
    maxTotalShorts: bigint
    openFeeRate: bigint
    totalLongs: bigint
    totalShorts: bigint
}

export type TPosition = {
    id: bigint
    marketIdx: bigint
    posType: bigint
    initialCollateral: bigint
    openFee: bigint
    openPrice: bigint
    markPrice: bigint
    leverage: bigint
    liqPrice: bigint
    liquidationThresholdRate: bigint
    owner: bigint
    secretHash: bigint
    secret: bigint
    pnl: string
}
