import React from 'react'
import { Select, Flex, Typography } from 'antd'

import styles from './index.module.scss'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore.js'
import { Market, MarketStore } from '../../stores/MarketStore.js'

export const Info: React.FC = observer(() => {
    const market = useStore(MarketStore)

    return (
        <div className={styles.info}>
            <Flex align="center" gap="large">
                <Select
                    className={styles.select}
                    size="large"
                    value={market.market}
                    onChange={market.setMarket}
                    options={[
                        {
                            label: 'BTC/USD',
                            value: Market.BTC,
                        },
                        {
                            label: 'ETH/USD',
                            value: Market.ETH,
                        },
                        {
                            label: 'BNB/USD',
                            value: Market.BNB,
                        },
                    ]}
                />

                <Flex vertical>
                    <Typography.Text className={styles.label}>Price</Typography.Text>
                    <Typography.Text className={styles.value} strong>
                        27 123$
                    </Typography.Text>
                </Flex>

                <Flex vertical>
                    <Typography.Text className={styles.label}>Open Interest, l</Typography.Text>
                    <Typography.Text className={styles.value} strong>
                        12/100k$
                    </Typography.Text>
                </Flex>

                <Flex vertical>
                    <Typography.Text className={styles.label}>Open Interest, 2</Typography.Text>
                    <Typography.Text className={styles.value} strong>
                        23.3K/100k$
                    </Typography.Text>
                </Flex>
            </Flex>
        </div>
    )
})
