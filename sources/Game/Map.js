import { clamp } from 'three/src/math/MathUtils.js'
import { Game } from './Game.js'

export class Map
{
    constructor()
    {
        this.game = Game.getInstance()

        this.initiated = false
        this.modal = this.game.modals.items.get('map')
        this.element = this.modal.element.querySelector('.js-map-container')

        this.setTrigger()
        this.setInputs()

        this.modal.events.on('open', () =>
        {
            if(!this.initiated)
                this.init()

            this.texture.update()
        })
    }

    init()
    {
        this.initiated = true
        
        this.setLocations()
        this.setPlayer()
        this.setTexture()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 14)
    }

    setLocations()
    {
        this.locations = {}
        this.locations.items = [
            { name: 'Achievements', respawnName: 'achievements', offset: { x: 0, y: -0.01 } },
            { name: 'Pool of Doom', respawnName: 'altar', offset: { x: 0, y: -0.05 } },
            { name: 'Credits', respawnName: 'behindTheScene', offset: { x: 0.01, y: 0 } },
            { name: 'Ref.AI Table Tennis', respawnName: 'bowling', offset: { x: -0.08, y: 0.03 } },
            { name: 'Career', respawnName: 'career', offset: { x: 0, y: -0.06 } },
            { name: 'Circuit', respawnName: 'circuit', offset: { x: -0.08, y: -0.05 } },
            { name: 'Halo Healthcare', respawnName: 'healthcare', offset: { x: -0.02, y: -0.01 } },
            { name: 'Experiences', respawnName: 'lab', offset: { x: -0.03, y: 0 } },
            { name: 'Landing', respawnName: 'landing', offset: { x: 0.02, y: 0 } },
            { name: 'Projects', respawnName: 'projects', offset: { x: 0, y: -0.02 } },
            { name: 'Context Sync', respawnName: 'contextsync', offset: { x: 0, y: 0 } },
            { name: 'Computing Workshop', respawnName: 'workshop', offset: { x: 0, y: 0.01 } },
            { name: 'Social', respawnName: 'social', offset: { x: -0.01, y: -0.04 } },
            { name: 'Time Machine', respawnName: 'timeMachine', offset: { x: 0, y: 0 } },
        ]

        for(const item of this.locations.items)
        {
            const respawn = this.game.respawns.getByName(item.respawnName)
            const mapPosition = this.worldToMap(respawn.position)

            // HTML
            const html = /* html */`
                <div class="pin"></div>
                <div class="name-container">
                    <div class="name">${item.name}</div>
                </div>
            `

            const element = document.createElement('div')
            element.classList.add('location')
            element.innerHTML = html
            element.style.left = `${(mapPosition.x + item.offset.x)* 100}%`
            element.style.top = `${(mapPosition.y + item.offset.y)* 100}%`
            element.style.zIndex = Math.round(mapPosition.y * 1000)
            
            this.element.append(element)

            element.addEventListener('click', () =>
            {
                this.game.player.respawn(item.respawnName, () =>
                {
                    this.game.view.focusPoint.isTracking = true
                })
                this.game.modals.close()
            })
        }
    }
    
    setPlayer()
    {
        this.player = {}
        this.player.element = this.element.querySelector('.js-player')
        this.player.roundedPosition = { x: 0, y: 0 }
    }
    
    setTexture()
    {
        this.texture = {}
        this.texture.element = this.element.querySelector('.js-texture')
        this.texture.poolTint = this.element.querySelector('.js-pool-tint')
        this.texture.previousUrl = null

        for(const element of [this.texture.element,this.texture.poolTint])
            element.addEventListener('load', () => element.classList.add('is-visible'))
        
        this.texture.update = () =>
        {
            const url = this.game.dayCycles.intervalEvents.get('night').inInterval ? 'ui/map/map-night.webp?v=pool-tint-2' : 'ui/map/map-day.webp?v=pool-tint-2'

            if(url !== this.texture.previousUrl)
            {
                this.texture.previousUrl = url
                for(const element of [this.texture.element,this.texture.poolTint])
                {
                    element.classList.remove('is-visible')
                    element.src = url
                }
            }
        }
    }

    setTrigger()
    {
        const element = this.game.domElement.querySelector('.js-map-trigger')
        
        element.addEventListener('click', (event) =>
        {
            this.game.modals.open('map')
        })
        element.addEventListener('keydown', (event) =>
        {
            event.preventDefault()
        })
    }

    setInputs()
    {
        // Inputs keyboard
        this.game.inputs.addActions([
            { name: 'map', categories: [ 'modal', 'menu', 'wandering' ], keys: [ 'Keyboard.m', 'Keyboard.KeyM' ] },
        ])
        this.game.inputs.events.on('map', (action) =>
        {
            if(action.active)
            {
                if(!this.modal.isOpen)
                    this.game.modals.open('map')
                else
                    this.game.modals.close()
            }
        })
    }

    worldToMap(coordinates)
    {
        let x = coordinates.x
        let y = typeof coordinates.z !== 'undefined' ? coordinates.z : coordinates.y

        x /= this.game.terrain.size
        y /= this.game.terrain.size

        x += 0.5
        y += 0.5

        x = clamp(x, 0, 1)
        y = clamp(y, 0, 1)

        return { x, y }
    }

    update()
    {
        if(!this.modal.isOpen)
            return

        const playerRoundedX = Math.round(this.game.player.position.x)
        const playerRoundedY = Math.round(this.game.player.position.z)

        if(playerRoundedX !== this.player.roundedPosition.x || playerRoundedY !== this.player.roundedPosition.y)
        {
            this.player.roundedPosition.x = playerRoundedX
            this.player.roundedPosition.y = playerRoundedY

            const playerCoordinates = this.worldToMap(this.player.roundedPosition)
            const x = Math.round(playerCoordinates.x * 1000) / 10
            const y = Math.round(playerCoordinates.y * 1000) / 10

            this.player.element.style.left = `${x}%`
            this.player.element.style.top = `${y}%`
            this.player.element.style.transform = `rotate(${-this.game.physicalVehicle.yRotation}rad)`
        }
    }
}