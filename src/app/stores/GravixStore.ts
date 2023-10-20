import { makeAutoObservable } from 'mobx'
import { Market } from '../types.js'

enum ETheme {
    DARK = 'dark-theme',
    LIGHT = 'light-theme',
}

type State = {
    isDarkMode: boolean
    market?: Market
}

const initialState: State = {
    isDarkMode: false,
}

export class GravixStore {
    protected state = initialState

    readonly priceDecimals = 8
    readonly baseNumber = 6

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
        const themeType = localStorage.getItem('theme-type')
        if (themeType === ETheme.DARK) this.toggleTheme(true)
        document.body.className = this.state.isDarkMode ? ETheme.DARK : ETheme.LIGHT
    }

    toggleTheme(isDark?: boolean) {
        if (isDark) {
            this.state.isDarkMode = true
            document.body.className = ETheme.DARK
            return
        }
        this.state.isDarkMode = !this.isDarkMode

        this.isDarkMode
            ? localStorage.setItem('theme-type', ETheme.DARK)
            : localStorage.setItem('theme-type', ETheme.LIGHT)

        document.body.className = this.isDarkMode ? ETheme.DARK : ETheme.LIGHT
    }

    get isDarkMode(): boolean {
        return !!this.state.isDarkMode
    }

    get maxPnlRate(): string | undefined {
        return '30000000000'
    }
}
