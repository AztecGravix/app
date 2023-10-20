/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { routes } from '../../routes/index.js'
import { RootContent } from './content.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { useProvider } from '../../hooks/useStore.js'
import { FormStore } from '../../stores/FormStore.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { PriceStore } from '../../stores/PriceStore.js'
import { WalletStore } from '../../stores/WalletStore.js'
import { DepositStore } from '../../stores/DepositStore.js'

export const Root: React.FC = () => {
    const FormProvider = useProvider(FormStore)
    const WalletProvider = useProvider(WalletStore)

    return (
        <WalletProvider>
            {wallet => {
                const GravixProvider = useProvider(GravixStore)
                const MarketProvider = useProvider(MarketStore, wallet)
                return (
                    <GravixProvider>
                        <MarketProvider>
                            {market => {
                                const PriceProvider = useProvider(PriceStore, market)
                                return (
                                    <PriceProvider>
                                        {price => {
                                            const DepositProvider = useProvider(DepositStore, wallet, price, market)
                                            return (
                                                <DepositProvider>
                                                    <FormProvider>
                                                        <Router>
                                                            <Switch>
                                                                <Route path={routes.main}>
                                                                    <RootContent />
                                                                </Route>
                                                            </Switch>
                                                        </Router>
                                                    </FormProvider>
                                                </DepositProvider>
                                            )
                                        }}
                                    </PriceProvider>
                                )
                            }}
                        </MarketProvider>
                    </GravixProvider>
                )
            }}
        </WalletProvider>
    )
}
