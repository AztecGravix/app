/* eslint-disable camelcase */
/* eslint-disable no-console */

import React, { useEffect } from 'react'

import styles from './index.module.scss'

let tvScriptLoadingPromise: Promise<void>

export const TradingView: React.FC = () => {
    useEffect(() => {
        if (!tvScriptLoadingPromise) {
            tvScriptLoadingPromise = new Promise(resolve => {
                const script = document.createElement('script')
                script.id = 'tradingview-widget-loading-script'
                script.src = 'https://s3.tradingview.com/tv.js'
                script.type = 'text/javascript'
                script.onload = () => {
                    resolve()
                }

                document.head.appendChild(script)
            })
        }

        tvScriptLoadingPromise
            .then(() => {
                new (window as any).TradingView.widget({
                    autosize: true,
                    symbol: 'NASDAQ:AAPL',
                    interval: 'D',
                    timezone: 'Etc/UTC',
                    theme: 'light',
                    style: '1',
                    locale: 'en',
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: 'tradingview_06042',
                })
            })
            .catch(console.error)
    }, [])

    return <div className={styles.container} id="tradingview_06042" />
}
