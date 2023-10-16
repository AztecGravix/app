import React from 'react';
import { useProvider } from '../../hooks/useStore.js';
import { GravixStore } from '../../stores/GravixStore.js';
import { Header } from '../Header/index.js';

import { Chart } from '../Chart/index.js';
import { Form } from '../Form/index.js';
import { Info } from '../Info/index.js';
import { Positions } from '../Positions/index.js';

import styles from './index.module.scss'

export const Root: React.FC = () => {
    const GravixProvider = useProvider(GravixStore)

    return (
        <GravixProvider>
            <div className={styles.layout}>
                <Header />
                <Info />
                <Chart />
                <Form />
                <Positions />
            </div>
        </GravixProvider>
    )
}
