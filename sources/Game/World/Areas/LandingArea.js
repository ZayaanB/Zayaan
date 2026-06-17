import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'
import { Font } from 'three/addons/loaders/FontLoader.js'
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

export class LandingArea extends Area
{
    constructor(model)
    {
        super(model)

        this.localTime = uniform(0)

        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }

    setLetters()
    {
        const references = this.references.items.get('letters')

        if(!references || references.length === 0)
            return

        // Gather the original letters: world transform, bounding box, material and palette UV
        const letters = []
        let sharedMaterial = null
        let sharedUv = null

        for(const reference of references)
        {
            const object = reference.userData?.object
            if(!object)
                continue

            const object3D = object.visual?.object3D ?? reference
            object3D.updateWorldMatrix(true, true)

            if(!sharedMaterial || !sharedUv)
            {
                object3D.traverse((child) =>
                {
                    if(!child.isMesh)
                        return

                    if(!sharedMaterial && child.material)
                        sharedMaterial = child.material

                    const uvAttribute = child.geometry?.attributes?.uv
                    if(!sharedUv && uvAttribute && uvAttribute.count > 0)
                        sharedUv = new THREE.Vector2(uvAttribute.getX(0), uvAttribute.getY(0))
                })
            }

            const box = new THREE.Box3().setFromObject(object3D)
            letters.push({
                object,
                center: box.getCenter(new THREE.Vector3()),
                size: box.getSize(new THREE.Vector3())
            })
        }

        if(letters.length === 0)
            return

        // Hide the original letters and freeze their physics
        for(const letter of letters)
            this.game.objects.disable(letter.object)

        // Split the original letters (in authored order) into two rows / words
        const splitIndex = Math.ceil(letters.length / 2)
        const rows = [ letters.slice(0, splitIndex), letters.slice(splitIndex) ]
        const words = [ 'BHANWADIA', 'ZAYAAN' ]

        // Generate the new 3D text once Bruno's font is ready
        const ttfLoader = new TTFLoader()
        ttfLoader.load('fonts/Pally-Bold.ttf', (json) =>
        {
            const font = new Font(json)

            rows.forEach((row, index) =>
            {
                if(row.length > 0)
                    this.createWord(words[index] ?? '', row, font, sharedMaterial, sharedUv)
            })
        })
    }

    createWord(word, row, font, material, sharedUv)
    {
        if(!word)
            return

        // Row footprint derived from the original letters
        const first = row[0].center
        const last = row[row.length - 1].center

        const direction = new THREE.Vector3().subVectors(first, last)
        direction.y = 0
        if(direction.lengthSq() < 0.0001)
            direction.set(1, 0, 0)
        direction.normalize()

        let averageWidth = 0
        let letterHeight = 0
        let groundY = Infinity
        const midpoint = new THREE.Vector3()
        for(const letter of row)
        {
            averageWidth += Math.max(letter.size.x, letter.size.z)
            letterHeight = Math.max(letterHeight, letter.size.y)
            groundY = Math.min(groundY, letter.center.y - letter.size.y * 0.5)
            midpoint.add(letter.center)
        }
        averageWidth /= row.length
        midpoint.divideScalar(row.length)

        const rowWidth = first.distanceTo(last) + averageWidth

        // Build the extruded text geometry
        const geometry = new TextGeometry(word, {
            font,
            size: 1,
            height: 0.35,
            depth: 0.35,
            curveSegments: 8,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.03,
            bevelSegments: 2
        })
        geometry.computeBoundingBox()
        const geometrySize = geometry.boundingBox.getSize(new THREE.Vector3())
        geometry.center()

        // Reuse Bruno's exact palette color by pinning every vertex to the original letter UV
        if(sharedUv && geometry.attributes.uv)
        {
            const uvAttribute = geometry.attributes.uv
            for(let i = 0; i < uvAttribute.count; i++)
                uvAttribute.setXY(i, sharedUv.x, sharedUv.y)
            uvAttribute.needsUpdate = true
        }

        // Scale to match the original row height, but shrink if too wide
        const scaleByHeight = letterHeight / geometrySize.y
        const scale = geometrySize.x * scaleByHeight > rowWidth
            ? rowWidth / geometrySize.x
            : scaleByHeight

        const scaledSize = geometrySize.clone().multiplyScalar(scale)

        // Orientation: X along the row, Y up
        const up = new THREE.Vector3(0, 1, 0)
        const zAxis = new THREE.Vector3().crossVectors(direction, up).normalize()
        const rotationMatrix = new THREE.Matrix4().makeBasis(direction, up, zAxis)
        const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix)

        // Sit the word on the ground at the row's midpoint
        const position = {
            x: midpoint.x,
            y: groundY + scaledSize.y * 0.5,
            z: midpoint.z
        }

        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.setScalar(scale)

        this.game.objects.add(
            {
                model: mesh,
                castShadow: true,
                receiveShadow: true,
                updateMaterials: false,
                parent: this.game.scene
            },
            {
                type: 'dynamic',
                position,
                rotation: quaternion,
                sleeping: true,
                mass: 3,
                colliders: [
                    {
                        shape: 'cuboid',
                        parameters: [ scaledSize.x * 0.5, scaledSize.y * 0.5, scaledSize.z * 0.5 ]
                    }
                ],
                onCollision: (force, collisionPosition) =>
                {
                    this.game.audio.groups.get('hitBrick').playRandomNext(force, collisionPosition)
                }
            }
        )
    }

    setKiosk()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            'Map',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
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

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            'Controls',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
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

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () =>
        {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire()
    {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    
            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)
    
    
            for(let i = 0; i < count; i++)
            {
                const i3 = i * 3
    
                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius
    
                scales[i] = 0.02 + Math.random() * 0.06
            }
            
            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()
    
            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode
    
            const progress = float(0).toVar()
    
            material.positionNode = Fn(() =>
            {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())
    
                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))
    
                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)
                
                return newPosition
            })()
            material.scaleNode = Fn(() =>
            {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()
    
            const geometry = new THREE.CircleGeometry(0.5, 8)
    
            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()
    
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
    
                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))
    
                return voronoi
            })()
    
            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })
    
            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            'Res(e)t',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.reset()

                gsap.delayedCall(2, () =>
                {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () =>
                    {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
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

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () =>
        {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}