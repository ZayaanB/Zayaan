import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import socialData from '../../../data/social.js'
import { Area } from './Area.js'

export class SocialArea extends Area
{
    constructor(model)
    {
        super(model)

        this.center = this.references.items.get('center')[0].position

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '👨‍🦲 Social',
                expanded: false,
            })
        }

        this.setStatues()
        this.removeOnlyFansPedestal()
        this.setLinks()
        this.setStatue()
        this.setAchievement()
    }

    setStatues()
    {
        const socialStatueNames = [ 'x', 'bluesky', 'youtube', 'mail', 'twitch', 'github', 'linkedin', 'discord', 'onlyfans' ]

        const keptNames = socialData.map(link => link.name.toLowerCase())

        const keptObjects = new Map()

        for(const object of this.objects.items)
        {
            if(!object.visual)
                continue

            const name = object.visual.object3D.name.toLowerCase().replace(/\.?\d+$/, '')

            if(name === 'reffan')
            {
                this.removeObject(object)
                continue
            }

            if(!socialStatueNames.includes(name))
                continue

            if(keptNames.includes(name))
                keptObjects.set(name, object)
            else
                this.removeObject(object)
        }

        this.statuePositions = new Map()

        const pedestalCount = 8
        const count = socialData.length

        for(let i = 0; i < count; i++)
        {
            const name = socialData[i].name.toLowerCase()
            const object = keptObjects.get(name)

            if(!object)
                continue

            const object3D = object.visual.object3D
            const origin = object3D.position

            if(!object3D.geometry.boundingBox)
                object3D.geometry.computeBoundingBox()
            const boundingBox = object3D.geometry.boundingBox

            const visualOffset = boundingBox
                ? boundingBox.getCenter(new THREE.Vector3()).multiply(object3D.scale).applyQuaternion(object3D.quaternion)
                : new THREE.Vector3()

            const radialTweak = { mail: 0.1 }
            const forwardTweak = { mail: 0.75 }
            const pedestalRadius = 7.85 + (radialTweak[name] || 0)
            const slot = count > 1 ? Math.round(i * (pedestalCount - 1) / (count - 1)) : Math.floor((pedestalCount - 1) / 2)
            const angle = slot * Math.PI / (pedestalCount - 1)

            const pedestalX = this.center.x + Math.cos(angle) * pedestalRadius
            const pedestalZ = this.center.z - Math.sin(angle) * pedestalRadius + (forwardTweak[name] || 0)

            const newPosition = new THREE.Vector3(
                pedestalX - visualOffset.x,
                origin.y,
                pedestalZ - visualOffset.z
            )

            const statueTop = boundingBox ? boundingBox.max.y * object3D.scale.y : 1.5
            const labelY = newPosition.y + statueTop + 0.6

            object3D.position.copy(newPosition)

            if(object.physical)
            {
                object.physical.body.setTranslation(newPosition, false)
                object.physical.initialState.position = { x: newPosition.x, y: newPosition.y, z: newPosition.z }
            }

            object.needsUpdate = true

            this.statuePositions.set(name, new THREE.Vector3(pedestalX, labelY, pedestalZ))
        }
    }

    removeObject(object)
    {
        // Visual
        if(object.visual)
        {
            object.visual.object3D.removeFromParent()
            object.visual.parent = null
        }

        // Physical
        if(object.physical)
        {
            const index = this.game.physics.physicals.indexOf(object.physical)
            if(index !== -1)
                this.game.physics.physicals.splice(index, 1)

            this.game.physics.world.removeRigidBody(object.physical.body)
            object.physical = null
        }

        this.game.objects.list.forEach((value, key) =>
        {
            if(value === object)
                this.game.objects.list.delete(key)
        })
    }

    removeOnlyFansPedestal()
    {
        const podium = this.objects.items.find(object =>
            object.visual && object.visual.object3D.name.startsWith('Cube')
        )

        if(podium)
        {
            const geometry = podium.visual.object3D.geometry
            const position = geometry.attributes.position
            const index = geometry.index

            if(position && index)
            {
                const isFar = (i) => position.getX(i) > 10
                const kept = []

                for(let i = 0; i < index.count; i += 3)
                {
                    const a = index.getX(i)
                    const b = index.getX(i + 1)
                    const c = index.getX(i + 2)

                    if(!(isFar(a) || isFar(b) || isFar(c)))
                        kept.push(a, b, c)
                }

                geometry.setIndex(kept)
                geometry.computeBoundingSphere()
                geometry.computeBoundingBox()
            }
        }

        const podiumBody = this.objects.items.find(object =>
            object.physical && object.physical.type === 'fixed' && object.physical.colliders.length >= 9
        )

        if(podiumBody)
        {
            for(const collider of [ ...podiumBody.physical.colliders ])
            {
                if(collider.translation().x > 36)
                {
                    this.game.physics.world.removeCollider(collider, false)

                    const colliderIndex = podiumBody.physical.colliders.indexOf(collider)
                    if(colliderIndex !== -1)
                        podiumBody.physical.colliders.splice(colliderIndex, 1)
                }
            }
        }
    }

    setLinks()
    {
        const radius = 6

        for(let i = 0; i < socialData.length; i++)
        {
            const link = socialData[i]

            const statuePosition = this.statuePositions.get(link.name.toLowerCase())
            const position = statuePosition ? statuePosition.clone() : this.center.clone()

            if(!statuePosition)
            {
                const angle = i * Math.PI / (socialData.length - 1)
                position.x += Math.cos(angle) * radius
                position.z -= Math.sin(angle) * radius
                position.y = 1
            }

            this.interactivePoint = this.game.interactivePoints.create(
                position,
                link.name,
                link.align === 'left' ? InteractivePoints.ALIGN_LEFT : InteractivePoints.ALIGN_RIGHT,
                InteractivePoints.STATE_CONCEALED,
                () =>
                {
                    if(link.url)
                        window.open(link.url, '_blank')
                    else(link.modal)
                        this.game.modals.open(link.modal)
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.addItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                }
            )
        }
    }

    setStatue()
    {
        this.statue = {}
        this.statue.body = this.references.items.get('statue')[0].userData.object.physical.body
        this.statue.down = false
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'social')
        })
    }

    update()
    {
        if(this.statue && !this.statue.down && !this.statue.body.isSleeping())
        {
            const statueUp = new THREE.Vector3(0, 1, 0)
            statueUp.applyQuaternion(this.statue.body.rotation())
            if(statueUp.y < 0.25)
            {
                this.statue.down = true
                this.game.achievements.setProgress('statueDown', 1)
            }
        }
    }
}