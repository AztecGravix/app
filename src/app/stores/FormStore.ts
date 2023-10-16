import { makeAutoObservable } from 'mobx'

export enum DepositType {
    LONG = "0",
    SHORT = "1"
}

export class FormStore {
    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    isDarkMode = false
    formDepositType = DepositType.LONG

    onTabChange = (key: string) => {
        const val: DepositType = key === DepositType.LONG ? DepositType.LONG : DepositType.SHORT
        this.formDepositType = val
    };

    get test() {
        return 'test'
    }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }
}
