import { makeAutoObservable } from 'mobx'

export class GravixStore {
    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    isDarkMode = true

    get test() {
        return 'test'
    }

    toggleTheme(isDark?: boolean) {
        if (isDark) {
            this.isDarkMode = true
            return
        }
        this.isDarkMode = !this.isDarkMode
        console.log(this.isDarkMode, 'THEME')

        this.isDarkMode ? localStorage.setItem('theme-type', 'dark') : localStorage.setItem('theme-type', 'light')
    }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }
}
