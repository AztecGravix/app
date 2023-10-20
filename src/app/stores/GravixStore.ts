import { makeAutoObservable } from 'mobx'
import { Market } from '../types.js'

enum ETheme {
    DARK = 'dark',
    LIGHT = 'light',
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

    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    initTheme() {
        const themeType = localStorage.getItem('theme-type')
        if (themeType === ETheme.DARK) this.toggleTheme(true)
    }

    toggleTheme(isDark?: boolean) {
        if (isDark) {
            this.state.isDarkMode = true
            return
        }

        this.state.isDarkMode = !this.isDarkMode
        localStorage.setItem('theme-type', this.isDarkMode ? ETheme.DARK : ETheme.LIGHT)
    }

    get isDarkMode(): boolean {
        return !!this.state.isDarkMode
    }
}
