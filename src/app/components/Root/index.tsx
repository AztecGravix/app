import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { routes } from '../../routes/index.js'
import { RootContent } from './content.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { useProvider } from '../../hooks/useStore.js'
import { FormStore } from '../../stores/FormStore.js'

export const Root: React.FC = () => {
    const GravixProvider = useProvider(GravixStore)
    const FormProvider = useProvider(FormStore)

    return (
        <GravixProvider>
            <FormProvider>
                <Router>
                    <Switch>
                        <Route path={routes.main}>
                            <RootContent />
                        </Route>
                    </Switch>
                </Router>
            </FormProvider>
        </GravixProvider>
    )
}
