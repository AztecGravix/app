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

        const themeType = localStorage.getItem("theme-type");
        if (themeType === "dark") this.toggleTheme(true);
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

        this.isDarkMode ? localStorage.setItem('theme-type', 'dark') : localStorage.setItem('theme-type', 'light')
    }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }
}
