import { AccountWalletWithPrivateKey, AztecAddress, createPXEClient, getSandboxAccountsWallets } from '@aztec/aztec.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { VaultContract } from '../../artifacts/Vault.js'

const VAULT_ADDRESS = process.env.VAULT ?? '0x1d656627c8226047f31be7329c1e872c1b570a83f3a3b7f5306511bc2e6621f0'
console.log('VAULT_ADDRESS', VAULT_ADDRESS)
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
