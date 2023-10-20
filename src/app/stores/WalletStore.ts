import { AccountWalletWithPrivateKey, AztecAddress, createPXEClient, getSandboxAccountsWallets } from '@aztec/aztec.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { VaultContract } from '../../artifacts/Vault.js'

const VAULT_ADDRESS = '0x278198e258540d9c42b8d18db220f3eac7c4a89ae47ef24cdec2c71b0abd3e4a'
const PXE_URL = 'http://167.99.212.95:8080'

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
