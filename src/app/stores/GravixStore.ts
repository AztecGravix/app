import { makeAutoObservable } from "mobx";

export class GravixStore {
    constructor() {
        makeAutoObservable(this, {}, {
            autoBind: true
        })
    }

    get test() {
        return 'test'
    }
}
