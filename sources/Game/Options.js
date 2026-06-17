import { Game } from './Game.js'

export class Options
{
    constructor()
    {
        this.game = Game.getInstance()
        this.element = this.game.menu.items.get('options').contentElement

        this.setSound()
        this.setQuality()
        this.setDayCycle()
        this.setStorms()
        this.setRespawn()
        this.setReset()
        this.setRenderer()
    }

    setSound()
    {
        const element = this.element.querySelector('.js-audio-toggle')

        element.addEventListener('click', this.game.audio.mute.toggle)
    }

    setQuality()
    {
        const element = this.element.querySelector('.js-quality-toggle')
        const text = element.querySelector('span')

        const labels = { 0: 'High', 1: 'Low', 2: 'Ultra Low' }
        const levelCount = 3

        const updateText = () =>
        {
            text.textContent = labels[this.game.quality.level]
        }
        updateText()

        element.addEventListener('click', () =>
        {
            this.game.quality.changeLevel((this.game.quality.level + 1) % levelCount)
        })

        this.game.quality.events.on('change', updateText)
    }

    setDayCycle()
    {
        const element = this.element.querySelector('.js-day-cycle-toggle')
        const text = element.querySelector('span')

        const update = () =>
        {
            text.textContent = this.game.dayCycles.enabled ? 'On' : 'Off'
        }
        update()

        element.addEventListener('click', () =>
        {
            this.game.dayCycles.setEnabled(!this.game.dayCycles.enabled)
            update()
        })
    }

    setStorms()
    {
        const element = this.element.querySelector('.js-storms-toggle')
        const text = element.querySelector('span')

        // Lightnings are created with the world (after Options), so reference it lazily
        const isEnabled = () => this.game.world?.lightnings
            ? this.game.world.lightnings.enabled
            : (() =>
            {
                try { return window.localStorage.getItem('stormsEnabled') === 'true' }
                catch(error) { return false }
            })()

        const update = () =>
        {
            text.textContent = isEnabled() ? 'On' : 'Off'
        }
        update()

        element.addEventListener('click', () =>
        {
            const next = !isEnabled()
            this.game.world?.lightnings?.setEnabled(next)
            update()
        })
    }

    setRespawn()
    {
        const element = this.element.querySelector('.js-respawn')

        element.addEventListener('click', () =>
        {
            this.game.player.respawn()
            this.game.menu.close()
        })
    }

    setReset()
    {
        const element = this.element.querySelector('.js-reset')

        element.addEventListener('click', () =>
        {
            this.game.reset()
            this.game.menu.close()
        })
    }

    setRenderer()
    {        
        if(this.game.rendering.renderer.backend.isWebGLBackend)
        {
            const element = this.element.querySelector('.js-renderer')
            element.classList.remove('is-success')
            element.classList.add('is-danger')

            const text = element.querySelector('span')
            text.textContent = 'WebGL'

            const tooltip = element.querySelector('.js-tooltip')
            tooltip.innerHTML = /* html */`Your browser is <strong>not compatible</strong> with WebGPU resulting in performance loss`
        }
    }

}