import React, { useMemo } from 'react'

import styles from './index.module.scss'
import { useStore } from '../../hooks/useStore.js'
import { PositionsListStore } from '../../stores/PositionsListStore.js'
import { observer } from 'mobx-react-lite'
import { Typography, Table } from 'antd'
import { TPosition } from '../../types.js'
import { PositionItemType } from './PositionItemType/index.js'
import { mapIdxToTicker } from '../../utils/gravix.js'
import { decimalAmount } from '../../utils/decimal-amount.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { NetValueInfoProvider } from './NetValueInfo/index.js'
import { PositionItemClose } from './Close/index.js'

const { Title } = Typography

export const PositionsContent: React.FC = observer(() => {
    const positionsList = useStore(PositionsListStore)
    const gravix = useStore(GravixStore)

    const columns = useMemo(
        () => [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                render: (_: any, item: TPosition) => <span>{item.id.toString()}</span>,
            },
            {
                title: 'Type',
                dataIndex: 'positionType',
                key: 'positionType',
                render: (_: any, item: TPosition) => (
                    <>
                        {item.marketIdx !== undefined ? (
                            <PositionItemType
                                leverage={item.leverage.toString()}
                                symbol={mapIdxToTicker(+item.marketIdx.toString())}
                                type={item.posType.toString()}
                            />
                        ) : null}
                    </>
                ),
            },
            {
                title: 'Net value',
                dataIndex: '',
                key: 'netValue',
                render: (_: any, item: TPosition) => {
                    return <NetValueInfoProvider index={item.id.toString()} />
                },
            },
            {
                title: 'Size',
                dataIndex: 'initialCollateral',
                key: 'initialCollateral',
                render: (_: any, item: TPosition) => (
                    <span>{positionsList.countSize(item.initialCollateral.toString(), item.leverage.toString())}$</span>
                ),
            },
            {
                title: 'Collateral',
                dataIndex: 'initialCollateral',
                key: 'initialCollateral',
                render: (_: any, item: TPosition) => (
                    <span>{decimalAmount(item.initialCollateral.toString(), gravix.baseNumber)}$</span>
                ),
            },
            {
                title: 'Mark price',
                dataIndex: '',
                key: 'markPrice',
                render: (_: any, item: TPosition) => (
                    <span>{decimalAmount(item.markPrice.toString() ?? '0', gravix.priceDecimals, 0)}$</span>
                ),
            },
            {
                title: 'Open price',
                dataIndex: '',
                key: 'openPrice',
                render: (_: any, item: TPosition) => (
                    <span>{decimalAmount(item.openPrice.toString() ?? '0', gravix.priceDecimals, 0)}$</span>
                ),
            },
            {
                title: 'Liq. price',
                dataIndex: '',
                key: 'liquidation',
                render: (_: any, item: TPosition) => (
                    <span className={styles.ellipsis}>
                        {decimalAmount(item.liqPrice.toString() ?? '0', gravix.priceDecimals + 1, 0)}$
                    </span>
                ),
            },
            {
                title: '',
                dataIndex: '',
                key: 'action',
                render: (_: any, item: TPosition) => <PositionItemClose index={item.id.toString()} />,
            },
        ],
        [],
    )

    return (
        <div className={styles.positions}>
            <Title level={3}>Positions</Title>
            <Table
                dataSource={positionsList.allUserPositions}
                columns={columns}
                loading={positionsList.posLoading}
                scroll={{ x: true }}
                rowKey={record => record.markPrice.toString()}
            />
        </div>
    )
})
