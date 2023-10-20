import React from "react";
import { useStore } from "../../hooks/useStore.js";
import { WalletStore } from "../../stores/WalletStore.js";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { sliceAddress } from "../../utils/slice-address.js";

export const Wallet: React.FC = observer(() => {
    const wallet = useStore(WalletStore)

    return (
        <Select
            value={wallet.selectedAccount}
            onChange={wallet.setSelectedAccount}
            options={wallet.accounts.map(account => ({
                label: sliceAddress(account),
                value: account,
            }))}
            style={{
                minWidth: '140px'
            }}
        />
    )
})
