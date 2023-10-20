import React from 'react'

import { useProvider, useStore } from '../../hooks/useStore.js'
import { PositionsListStore } from '../../stores/PositionsListStore.js'
import { PositionsContent } from './content.js'
import { observer } from 'mobx-react-lite'
import { GravixStore } from '../../stores/GravixStore.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { WalletStore } from '../../stores/WalletStore.js'
import { PriceStore } from '../../stores/PriceStore.js'
import { EventsStore } from '../../stores/EventsStore.js'

export const Positions: React.FC = observer(() => {
    const gravix = useStore(GravixStore)
    const market = useStore(MarketStore)
    const wallet = useStore(WalletStore)
    const price = useStore(PriceStore)
    const events = useStore(EventsStore)
    const PositionsProvider = useProvider(PositionsListStore, wallet, gravix, market, price, events)

    return (
        <PositionsProvider>
            <PositionsContent />
        </PositionsProvider>
    )
})
