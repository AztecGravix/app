import { makeAutoObservable } from 'mobx'

enum ETheme {
    DARK = 'dark',
    LIGHT = 'light'
}

export class GravixStore {
    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        const themeType = localStorage.getItem("theme-type");
        if (themeType === ETheme.DARK) this.toggleTheme(true);
    }

    isDarkMode = false

    get test() {
        return 'test'
    }

    toggleTheme(isDark?: boolean) {
        if (isDark) {
            this.isDarkMode = true
            return
        }
        this.isDarkMode = !this.isDarkMode

        this.isDarkMode ? localStorage.setItem('theme-type', ETheme.DARK) : localStorage.setItem('theme-type', ETheme.LIGHT)
    }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }
}
