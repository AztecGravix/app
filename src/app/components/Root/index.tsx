import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { routes } from '../../routes/index.js'
import { RootContent } from './content.js'
import { Observer } from 'mobx-react-lite'
import { GravixStore } from '../../stores/GravixStore.js'
import { useProvider } from '../../hooks/useStore.js'

export const Root: React.FC = () => {
    const GravixProvider = useProvider(GravixStore)

    return (
        <GravixProvider>
            <Router>
                <Observer>
                    {() => (
                        <Switch>
                            <Route path={routes.main}>
                                <RootContent />
                            </Route>
                        </Switch>
                    )}
                </Observer>
            </Router>
        </GravixProvider>
    )
}
