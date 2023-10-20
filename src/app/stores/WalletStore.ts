import { AccountWalletWithPrivateKey, AztecAddress, createPXEClient, getSandboxAccountsWallets } from '@aztec/aztec.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { VaultContract } from '../../artifacts/Vault.js'

const VAULT_ADDRESS = '0x05902e925b5850369c572366ddc1569a21120e0c3ddb95cd9baa89251743b530'
const PXE_URL = 'https://aztec.deltex.io'

type State = {
    accounts: string[]
    selectedAccount?: string
}

const initialState: State = {
    accounts: [],
}

export class WalletStore {
    protected state = initialState

    protected wallets: AccountWalletWithPrivateKey[] = []

    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    init() {
        this.connect().catch(console.error)
    }

    async connect(): Promise<void> {
        let accounts: string[] = []

        try {
            const pxe = createPXEClient(PXE_URL)
            this.wallets = await getSandboxAccountsWallets(pxe)
            accounts = this.wallets.map(i => i.getAddress().toString())
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.accounts = accounts
            this.state.selectedAccount = accounts[0]
        })
    }

    setSelectedAccount(val: string): void {
        this.state.selectedAccount = val
    }

    getWallet(account: string): AccountWalletWithPrivateKey | undefined {
        return this.wallets.find(item => item.getAddress().toString() === account)
    }

    async getVault(account: string): Promise<VaultContract | undefined> {
        const wallet = this.getWallet(account)
        return wallet ? await VaultContract.at(AztecAddress.fromString(VAULT_ADDRESS), wallet) : undefined
    }

    get accounts(): string[] {
        return this.state.accounts
    }

    get selectedAccount(): string | undefined {
        return this.state.selectedAccount
    }
}
