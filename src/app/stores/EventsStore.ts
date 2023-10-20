import { makeAutoObservable } from "mobx";

export enum Event {
    DepositSuccess
}

export class EventsStore {
    events: Event[] = []

    constructor() {
        makeAutoObservable(this, {}, {
            autoBind: true
        })
    }

    add(event: Event) {
        this.events.push(event)
    }

    get last(): Event {
        return this.events[this.events.length - 1]
    }
}
