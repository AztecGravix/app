import React from 'react';
import { useProvider } from '../../hooks/useStore';
import { GravixStore } from '../../stores/GravixStore';
import { Header } from '../Header/index';

import { Chart } from '../Chart/index';
import { Form } from '../Form/index';
import { Info } from '../Info/index';
import { Positions } from '../Positions/index';

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
