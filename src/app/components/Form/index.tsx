import React from 'react'

import styles from './index.module.scss'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore.js'
import { Tabs } from "antd"
import { FormStore, DepositType } from '../../stores/FormStore.js'

export const Form: React.FC = observer(() => {
    const formStore = useStore(FormStore)

    const items = [
        {
          key: DepositType.LONG.toString(),
          label: "Long",
        },
        {
          key: DepositType.SHORT.toString(),
          label: "Short",
        }
    ];

    return (
        <div className={styles.form}>
            <Tabs
                className="tab-op"
                defaultActiveKey={formStore.formDepositType.toString()}
                items={items.map((item) => {
                    return {
                        label: (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '4px' }}>{item?.label}</span>
                            </div>
                        ),
                        key: item.key,
                    }
                })}
                onChange={(val) => formStore.onTabChange(val)}
            />
        </div>
    )
})
