import { Events } from './Events.js'

export class Server
{
    constructor()
    {
        // Multiplayer has been removed; the game always runs offline.
        this.connected = false
        this.initData = null
        this.events = new Events()

        document.documentElement.classList.add('is-server-offline')
    }

    start() {}

    send()
    {
        return false
    }
}
