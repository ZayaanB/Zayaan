import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { buildAtlas, atlasCities } from './AtlasModel.js'
import { mountExhibit, exhibitPoint, screenLabel } from './PersonalExhibits.js'
import { atlasSite } from '../../data/exhibits.js'

export class AtlasExhibit
{
    constructor()
    {
        this.game = Game.getInstance()
        this.origin = new THREE.Vector3(atlasSite.x, atlasSite.y, atlasSite.z)
        const earthTexture = this.game.resourcesLoader.getLoader('texture').load('atlas/earth.png')
        earthTexture.colorSpace = THREE.SRGBColorSpace
        this.model = mountExhibit(this.game, buildAtlas(earthTexture), this.origin)
        this.game.respawns.items.set('atlas', {
            name: 'atlas',
            position: this.origin.clone().add(new THREE.Vector3(0, 4, 6)),
            rotation: Math.PI,
        })
        const at = (x, y, z) => this.origin.clone().add(new THREE.Vector3(x, y, z))
        exhibitPoint(this.game, at(-2.6, 1.5, 4.2), 'Scan Atlas stories', () => {
            this.startedAt = this.game.ticker.elapsedScaled
            this.phase = -1
        })
        exhibitPoint(this.game, at(2.6, 1.5, 4.2), 'Explore Atlas', () => this.game.modals.open('atlas'))
        this.reset()
        this.game.ticker.events.on('tick', () => this.update(), 10)
    }

    reset()
    {
        this.startedAt = null
        this.phase = -1
        screenLabel(this.model.sign, ['ATLAS', 'EVERY HEADLINE HAPPENS SOMEWHERE', 'Scan stories · Explore the project'], '#ffc878', '#102c40')
    }

    update()
    {
        if(this.game.player.position.distanceTo(this.origin) > 65) return
        const time = this.game.ticker.elapsedScaled
        this.model.globe.rotation.y = time * 0.075 + 0.3
        const elapsed = this.startedAt === null ? null : time - this.startedAt
        const activeIndex = elapsed === null ? -1 : Math.floor(elapsed / 1.5)
        if(elapsed !== null && activeIndex >= atlasCities.length)
            this.reset()
        else if(activeIndex >= 0 && activeIndex !== this.phase)
        {
            this.phase = activeIndex
            screenLabel(this.model.sign, ['ATLAS', atlasCities[activeIndex].name, 'ILLUSTRATIVE STORY SCAN'], '#ffc878', '#102c40')
        }

        this.model.hotspots.forEach(({ marker, ring }, i) => {
            const selected = this.startedAt !== null && i === this.phase
            const pulse = (time * 0.55 + i / atlasCities.length) % 1
            marker.scale.setScalar(selected ? 1.8 : 0.85 + Math.sin(time * 2.5 + i) * 0.15)
            ring.scale.setScalar(1 + pulse * (selected ? 4 : 2.5))
            ring.material.opacity = (1 - pulse) * (selected ? 0.95 : 0.6)
        })
        this.model.routes.forEach(({ curve, packet }, i) => {
            packet.position.copy(curve.getPoint((time * 0.15 + i / 4) % 1))
        })
    }
}
