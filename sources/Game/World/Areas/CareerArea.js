import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { color, float, Fn, luminance, max, mix, positionGeometry, step, texture, uniform, uv, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { clamp } from 'three/src/math/MathUtils.js'
import { Area } from './Area.js'
import careerData from '../../../data/career.js'

export class CareerArea extends Area
{
    constructor(references)
    {
        super(references)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '💼 Career',
                expanded: false,
            })
        }

        this.setSounds()
        this.setLines()
        this.setYears()
        this.setAchievement()
    }

    setSounds()
    {
        this.sounds = {}
        this.sounds.stoneOut = this.game.audio.register({
            path: 'sounds/stoneSlides/stoneSlideOut.mp3',
            autoplay: false,
            loop: false,
            volume: 0.3,
            antiSpam: 0.1,
            positions: new THREE.Vector3(),
            distanceFade: 14,
            onPlay: (item, line) =>
            {
                item.positions[0].copy(line.origin)
                item.rate = 1.2 + line.index * 0.1
            }
        })
        this.sounds.stoneIn = this.game.audio.register({
            path: 'sounds/stoneSlides/stoneSlideIn.mp3',
            autoplay: false,
            loop: false,
            volume: 0.2,
            rate: 0.8,
            antiSpam: 0.1,
            positions: new THREE.Vector3(),
            distanceFade: 14,
            onPlay: (item, line) =>
            {
                item.positions[0].copy(line.origin)
                // item.rate = 0.9 + Math.random() * 0.2
            }
        })
    }

    setLines()
    {
        this.lines = {}
        this.lines.items = []
        this.lines.activeElevation = 2.5
        this.lines.padding = 0.25

        this.lines.colors = {
            blue: uniform(color('#5390ff')),
            orange: uniform(color('#ff8039')),
            purple: uniform(color('#b65fff')),
            green: uniform(color('#a2ffab'))
        }

        const lineGroups = this.references.items.get('line')

        for(const group of lineGroups)
        {
            const entry = careerData[group.userData.texture]
            this.lines.items.push(this.createLine(group, entry))
        }

        this.addExtraLines()

        this.lines.items.sort((a, b) => b.origin.z - a.origin.z)

        let i = 0
        for(const line of this.lines.items)
        {
            line.index = i++
        }

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.lines.colors.blue.value, 'blue')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.lines.colors.orange.value, 'orange')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.lines.colors.purple.value, 'purple')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.lines.colors.green.value, 'green')
        }
    }

    createLine(group, entry)
    {
        const line = {}
        line.group = group
        line.size = parseFloat(group.userData.size)
        line.hasEnd = group.userData.hasEnd
        line.color = group.userData.color
        line.year = entry ? entry.year : null

        line.stone = group.children.find(child => child.name.startsWith('stone'))
        line.stone.position.y = 0

        line.origin = group.position.clone()

        line.isIn = false
        line.isUp = false
        line.elevationTarget = 0
        line.offsetTarget = 0
        line.labelReveal = uniform(0)

        line.textMesh = line.stone.children.find(child => child.name.startsWith('careerText'))
        line.texture = this.createTextTexture(entry ? entry.lines : [], line.textMesh)

        const material = new THREE.MeshLambertNodeMaterial({ transparent: true })
        const baseColor = this.lines.colors[line.color] ?? this.lines.colors.blue

        material.outputNode = Fn(() =>
        {
            const baseUv = uv().toVar()

            step(baseUv.x, line.labelReveal).lessThan(0.5).discard()

            const textureColor = texture(line.texture, baseUv)

            const alpha = step(0.1, max(textureColor.r, textureColor.g))

            const emissiveColor = baseColor.div(luminance(baseColor)).mul(1.7)

            const maskColor = color('#251f2b')
            const finalColor = mix(maskColor, emissiveColor, textureColor.r)

            return vec4(finalColor, alpha)
        })()

        line.textMesh.castShadow = false
        line.textMesh.receiveShadow = false
        line.textMesh.material = material

        return line
    }

    createTextTexture(lines, textMesh)
    {
        // Match the canvas aspect to the label plane so the text isn't distorted
        textMesh.geometry.computeBoundingBox()
        const size = textMesh.geometry.boundingBox.getSize(new THREE.Vector3())
        const dims = [ size.x, size.y, size.z ].sort((a, b) => b - a)
        const aspect = dims[1] > 0 ? dims[0] / dims[1] : 4

        const lineCount = Math.max(lines.length, 1)
        const height = lineCount * 120
        const width = Math.max(Math.round(height * aspect), 1)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')

        // Panel encoded in the green channel, glyphs in the red channel (matches the baked format)
        context.fillStyle = '#00ff00'
        context.fillRect(0, 0, width, height)

        context.fillStyle = '#ff0000'
        context.textAlign = 'center'
        context.textBaseline = 'middle'

        const maxWidth = width * 0.9
        const lineHeight = height / lineCount
        const fontSize = lineHeight * 0.62
        context.font = `800 ${fontSize}px "Arial Narrow", "Arial", sans-serif`

        let i = 0
        for(const line of lines)
        {
            const x = width / 2
            const y = lineHeight * (i + 0.5)

            const measure = context.measureText(line)

            if(measure.width > maxWidth)
            {
                const scale = maxWidth / measure.width
                context.save()
                context.translate(x, y)
                context.scale(scale, 1)
                context.fillText(line, 0, 0)
                context.restore()
            }
            else
                context.fillText(line, x, y)

            i++
        }

        const texture = new THREE.Texture(canvas)
        texture.flipY = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.generateMipmaps = false
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.needsUpdate = true

        return texture
    }

    addExtraLines()
    {
        for(const key in careerData)
        {
            const entry = careerData[key]

            if(!entry.cloneFrom)
                continue

            try
            {
                const source = this.lines.items.find(line => line.group.userData.texture === entry.cloneFrom)

                if(!source)
                    continue

                // Continue the path using the spacing between the two most-recent stones
                const sorted = [ ...this.lines.items ].sort((a, b) => b.origin.z - a.origin.z)
                const last = sorted[sorted.length - 1]
                const secondLast = sorted[sorted.length - 2] ?? last
                const spacing = last.origin.z - secondLast.origin.z

                const group = source.group.clone(true)
                group.position.copy(last.group.position)
                group.position.z = last.origin.z + spacing
                group.userData = { ...source.group.userData, color: entry.color ?? source.color, texture: key }

                source.group.parent.add(group)

                this.lines.items.push(this.createLine(group, entry))
            }
            catch(error)
            {
                console.warn('CareerArea: could not add extra line', key, error)
            }
        }
    }

    setYears()
    {
        this.year = {}
        this.year.group = this.references.items.get('year')[0]
        this.year.originZ = this.year.group.position.z
        this.year.size = 6
        this.year.offsetTarget = 0
        this.year.start = 2023
        this.year.current = this.year.start

        //    Digit indexes
        //
        //      --- 0 ---
        //    |           |
        //    5           1
        //    |           |
        //      --- 6 --- 
        //    |           |
        //    4           2
        //    |           |
        //      --- 3 ---

        const a = 255

        const digitData = new Uint8Array([
            a, a, a, a, a, a, 0, // 0
            0, a, a, 0, 0, 0, 0, // 1
            a, a, 0, a, a, 0, a, // 2
            a, a, a, a, 0, 0, a, // 3
            0, a, a, 0, 0, a, a, // 4
            a, 0, a, a, 0, a, a, // 5
            a, 0, a, a, a, a, a, // 6
            a, a, a, 0, 0, 0, 0, // 7
            a, a, a, a, a, a, a, // 8
            a, a, a, a, 0, a, a, // 9
        ])

        this.year.digitsTexture = new THREE.DataTexture(
            digitData,
            7,
            10,
            THREE.RedFormat,
            THREE.UnsignedByteType,
            THREE.UVMapping,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.NearestFilter,
            THREE.NearestFilter
        )
        this.year.digitsTexture.generateMipmaps = false
        this.year.digitsTexture.needsUpdate = true

        this.year.digits = []

        const digitMeshes = this.year.group.children.filter(child => child.name.startsWith('digit'))

        for(const mesh of digitMeshes)
        {
            const digit = {}
            digit.mesh = mesh
            digit.indexUniform = uniform(0)
            
            const material = new THREE.MeshBasicNodeMaterial()
            material.outputNode = vec4(1.7)

            material.positionNode = Fn(() =>
            {
                const barUv = uv(1).toVar()

                const uvY = digit.indexUniform.div(10).add(float(0.5).div(10))
                barUv.y.assign(uvY)

                const barActive = texture(this.year.digitsTexture, barUv).r

                const newPosition = positionGeometry.toVar()
                newPosition.y.subAssign(barActive.oneMinus())

                return newPosition
            })()

            digit.mesh.material = material

            this.year.digits.push(digit)
        }

        this.year.updateDigits = (year = 2025) =>
        {
            const yearString = `${year}`
            let i = 0
            for(const digit of this.year.digits)
            {
                digit.indexUniform.value = parseInt(yearString[i])
                i++
            }
        }

        this.year.updateDigits(this.year.current)

        // // Test mesh
        // const mesh = new THREE.Mesh(
        //     new THREE.PlaneGeometry(2, 2),
        //     new THREE.MeshBasicMaterial({ map: this.year.digitsTexture, side: THREE.DoubleSide })
        // )
        // mesh.position.y = 4
        // mesh.position.z = -30
        // mesh.position.x = -10
        // this.game.scene.add(mesh)
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'career')
        })
    }

    update()
    {
        // Lines
        for(const line of this.lines.items)
        {
            const delta = line.origin.z - this.game.player.position.z

            // Is in
            if(delta > - this.lines.padding && delta < line.size + this.lines.padding * 2)
            {
                if(!line.isIn)
                {
                    line.isIn = true
                    gsap.to(line.labelReveal, { value: 1, duration: 1, delay: 0.3, overwrite: true, ease: 'power2.inOut' })

                    if(line.year && line.year !== this.year.current)
                    {
                        this.year.current = line.year
                        this.year.updateDigits(line.year)
                    }
                }
            }

            // Is out
            else
            {
                if(line.isIn)
                {
                    line.isIn = false
                    gsap.to(line.labelReveal, { value: 0, duration: 1, overwrite: true, ease: 'power2.inOut' })
                }
            }

            // Elevation
            if(line.isIn)
            {
                if(!line.isUp)
                {
                    line.isUp = true
                    this.sounds.stoneOut.play(line)
                }
            }
            else
            {
                if(delta > line.size)
                {
                    if(line.hasEnd)
                    {
                        if(line.isUp)
                        {
                            line.isUp = false
                            gsap.delayedCall(0.3, () =>
                            {
                                this.sounds.stoneIn.play(line)
                            })
                        }
                    }
                }
                else
                {
                    if(line.isUp)
                    {
                        line.isUp = false
                        gsap.delayedCall(0.3, () =>
                        {
                            this.sounds.stoneIn.play(line)
                        })
                    }
                }
            }

            line.elevationTarget = line.isUp ? this.lines.activeElevation : 0
            line.stone.position.y += (line.elevationTarget - line.stone.position.y) * this.game.ticker.deltaScaled * 3

            // Position
            if(line.isIn)
            {
                if(line.stone.position.y > 1)
                    line.offsetTarget = - clamp(delta, 0, line.size)
            }
            else
            {
                // End
                if(delta > line.size)
                    line.offsetTarget = - line.size
                // Start
                else
                    line.offsetTarget = 0
            }

            line.stone.position.z += (line.offsetTarget - line.stone.position.z) * this.game.ticker.deltaScaled * 10
        }

        // Year
        const delta = this.year.originZ - this.game.player.position.z

        if(delta > this.year.size)
            this.year.offsetTarget = this.year.size
        else if(delta < 0)
            this.year.offsetTarget = 0
        else
            this.year.offsetTarget = delta

        const finalPositionZ = this.year.originZ - this.year.offsetTarget
        this.year.group.position.z += (finalPositionZ - this.year.group.position.z) * this.game.ticker.deltaScaled * 10
    }
}