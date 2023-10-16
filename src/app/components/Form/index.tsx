import React from 'react';

import styles from './index.module.scss'
import { observer } from 'mobx-react-lite';
import { useStore } from '../../hooks/useStore.js';
import { GravixStore } from '../../stores/GravixStore.js';

export const Form: React.FC = observer(() => {
    const gravix = useStore(GravixStore)

    return (
        <div className={styles.form}>
            Form-{gravix.test}
        </div>
    )
})
