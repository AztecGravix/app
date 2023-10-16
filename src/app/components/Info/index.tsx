import React from 'react'
import { Select, Flex, Typography } from 'antd'

import styles from './index.module.scss'

export const Info: React.FC = () => {
    return (
        <div className={styles.info}>
            <Flex
                align="center"
                gap="large"
            >
                <Select
                    size="large"
                    value="BTC"
                    options={[{
                        label: 'BTC/USD',
                        value: 'BTC'
                    }, {
                        label: 'ETH/USD',
                        value: 'ETH'
                    }, {
                        label: 'BNB/USD',
                        value: 'BNB'
                    }]}
                />

                <Flex vertical>
                    <Typography.Text>
                        Price
                    </Typography.Text>
                    <Typography.Text>
                        27 123$
                    </Typography.Text>
                </Flex>

                <Flex vertical>
                    <Typography.Text>
                        Open Interest, l
                    </Typography.Text>
                    <Typography.Text>
                        12/100k$
                    </Typography.Text>
                </Flex>

                <Flex vertical>
                    <Typography.Text>
                        Open Interest, 2
                    </Typography.Text>
                    <Typography.Text>
                        23.3K/100k$
                    </Typography.Text>
                </Flex>
            </Flex>
        </div>
    )
}
