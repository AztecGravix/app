import { makeAutoObservable, runInAction } from 'mobx'

enum ETheme {
    DARK = 'dark',
    LIGHT = 'light',
}

type tokenSymbols = "BTC";

export class GravixStore {
    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        const themeType = localStorage.getItem('theme-type')
        if (themeType === ETheme.DARK) this.toggleTheme(true)

        this.initPrices().catch(() => console.log("initPrices error"))

        setInterval(() => {
            this.initPrices().catch(() => console.log("initPrices error"))
        }, 5000)
    }

    isDarkMode = false
    tokenPrices: Record<tokenSymbols, "string" | null> = {
        BTC: null,
      };

    get test() {
        return 'test'
    }

    async initPrices() {
        try {
            const fetchBTCFeed = await fetch(
                "https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT"
            );

            const priceFeed = await fetchBTCFeed.json()
    
            runInAction(() => {
                this.tokenPrices.BTC = priceFeed?.price;
            })
        } catch {
            console.log("err")
        }
    }

    toggleTheme(isDark?: boolean) {
        if (isDark) {
            this.isDarkMode = true
            return
        }
        this.isDarkMode = !this.isDarkMode

        this.isDarkMode
            ? localStorage.setItem('theme-type', ETheme.DARK)
            : localStorage.setItem('theme-type', ETheme.LIGHT)
    }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }
}
