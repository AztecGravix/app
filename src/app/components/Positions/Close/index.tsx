import * as React from 'react'
import { observer } from 'mobx-react-lite'

import styles from './index.module.scss'
import { Button, Spin } from 'antd'
import { useStore } from '../../../hooks/useStore.js'
import { PositionsListStore } from '../../../stores/PositionsListStore.js'
import { IoClose } from 'react-icons/io5/index.js'
import classNames from 'classnames'
import { GravixStore } from '../../../stores/GravixStore.js'

function PositionItemCloseInner({ index, marketIdx }: { index: string, marketIdx: string }): JSX.Element {
    const positionClose = useStore(PositionsListStore)
    const gravix = useStore(GravixStore)

    const loading = positionClose.closeLoading[index]

    const handleClose = () => {
        positionClose.closePos(index, marketIdx).catch(console.error)
    }

    return (
        <>
            <Button
                className={classNames(styles.btn, gravix.isDarkMode ? styles.darkBtn : styles.lightBtn)}
                onClick={handleClose}
                disabled={loading}
            >
                {loading && <Spin size="small" className={styles.closeWrap} />}
                {!loading && <IoClose />}
            </Button>
        </>
    )
}

export const PositionItemClose = observer(PositionItemCloseInner)
