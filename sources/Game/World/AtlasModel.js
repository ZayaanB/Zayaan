import * as THREE from 'three/webgpu'
import { kit } from './PersonalModels.js'

// Matches SphereGeometry's UVs and the equirectangular Natural Earth texture.
export function globePosition(latitude, longitude, radius)
{
    const lat = THREE.MathUtils.degToRad(latitude)
    const lon = THREE.MathUtils.degToRad(longitude)
    return new THREE.Vector3(
        radius * Math.cos(lat) * Math.cos(lon),
        radius * Math.sin(lat),
        -radius * Math.cos(lat) * Math.sin(lon)
    )
}

export const atlasCities = [
    { name: 'TORONTO', latitude: 43.65, longitude: -79.38 },
    { name: 'ASHEVILLE', latitude: 35.60, longitude: -82.55 },
    { name: 'LONDON', latitude: 51.51, longitude: -0.13 },
    { name: 'NAIROBI', latitude: -1.29, longitude: 36.82 },
    { name: 'MUMBAI', latitude: 19.08, longitude: 72.88 },
    { name: 'TOKYO', latitude: 35.68, longitude: 139.69 },
    { name: 'SYDNEY', latitude: -33.87, longitude: 151.21 },
    { name: 'SÃO PAULO', latitude: -23.55, longitude: -46.63 },
]

export function buildAtlas(earthTexture)
{
    const k = kit('atlasObservatory')
    const brass = new THREE.MeshStandardMaterial({ color: '#c58f52', roughness: 0.82, flatShading: true })
    brass.name = 'personal_atlasBrass'
    k.materials.brass = brass
    k.mesh('observatoryBase', new THREE.CylinderGeometry(4.5, 4.5, 0.28, 32), [0, 0.14, 0], 'steel')
    k.colliders.push({ shape: 'cylinder', parameters: [0.14, 4.5], position: { x: 0, y: 0.14, z: 0 } })
    k.mesh('observatoryInlay', new THREE.CylinderGeometry(4.28, 4.4, 0.08, 32), [0, 0.30, 0], 'dark')
    const compass = k.mesh('compassRim', new THREE.TorusGeometry(4.2, 0.035, 6, 80), [0, 0.35, 0], 'brass')
    compass.rotation.x = Math.PI / 2
    k.mesh('pedestalFoot', new THREE.CylinderGeometry(1.05, 1.3, 0.28, 12), [0, 0.46, 0], 'brass')
    k.mesh('globePedestal', new THREE.CylinderGeometry(0.58, 0.92, 1.6, 10), [0, 1.25, 0], 'steel')
    k.colliders.push({ shape: 'cylinder', parameters: [1.1, 1.3], position: { x: 0, y: 1.1, z: 0 } })
    k.cylinder('pedestalCollar', 0.82, 0.10, [0, 1.93, 0], 'glow')

    const tilted = new THREE.Group()
    tilted.position.y = 4.65
    tilted.rotation.z = THREE.MathUtils.degToRad(23.4)
    k.root.add(tilted)
    const meridian = k.mesh('meridianFrame', new THREE.TorusGeometry(2.92, 0.105, 8, 80), [0, 0, 0], 'brass', tilted)
    meridian.rotation.y = Math.PI / 2
    const cradle = k.mesh('meridianCradle', new THREE.TorusGeometry(3.09, 0.17, 8, 40, Math.PI), [0, 0, 0], 'steel', tilted)
    cradle.rotation.z = Math.PI
    const ringTrim = k.mesh('cradleInlay', new THREE.TorusGeometry(3.1, 0.026, 6, 40, Math.PI), [0, 0, 0.15], 'amberGlow', tilted)
    ringTrim.rotation.z = Math.PI
    for(const side of [-1, 1])
    {
        const hinge = k.mesh('gimbalHinge', new THREE.CylinderGeometry(0.26, 0.26, 0.48, 12), [side * 2.99, 0, 0], 'brass', tilted)
        hinge.rotation.z = Math.PI / 2
        k.mesh('axisCap', new THREE.SphereGeometry(0.14, 10, 8), [0, side * 2.88, 0], 'amberGlow', tilted)
    }
    const latitudeBand = k.mesh('latitudeBand', new THREE.TorusGeometry(2.67, 0.028, 6, 80), [0, 0, 0], 'iceBlue', tilted)
    latitudeBand.rotation.x = Math.PI / 2
    const globe = new THREE.Group()
    tilted.add(globe)

    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture, color: '#ffffff' })
    earthMaterial.userData.prevent = true
    const earth = new THREE.Mesh(new THREE.SphereGeometry(2.4, 64, 40), earthMaterial)
    earth.name = 'atlasEarth'
    globe.add(earth)

    const hotspots = atlasCities.map(city => {
        const position = globePosition(city.latitude, city.longitude, 2.43)
        const marker = k.mesh('storyMarker', new THREE.SphereGeometry(0.065, 8, 6), position.toArray(), 'amberGlow', globe)
        const material = new THREE.MeshBasicMaterial({ color: '#ffc878', transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide })
        material.userData.prevent = true
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.115, 24), material)
        ring.name = 'storyPulse'
        ring.position.copy(position)
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize())
        globe.add(ring)
        return { marker, ring }
    })

    const routes = [[0, 2], [2, 4], [4, 5], [3, 7]].map(([from, to]) => {
        const a = globePosition(atlasCities[from].latitude, atlasCities[from].longitude, 1)
        const b = globePosition(atlasCities[to].latitude, atlasCities[to].longitude, 1)
        const points = Array.from({ length: 41 }, (_, i) => {
            const t = i / 40
            return a.clone().lerp(b, t).normalize().multiplyScalar(2.44 + Math.sin(t * Math.PI) * 0.40)
        })
        const curve = new THREE.CatmullRomCurve3(points)
        k.mesh('storyConnection', new THREE.TubeGeometry(curve, 40, 0.018, 5, false), [0, 0, 0], 'glow', globe)
        const packet = k.mesh('sourceSignal', new THREE.SphereGeometry(0.045, 6, 4), [0, 0, 0], 'amberGlow', globe)
        return { curve, packet }
    })

    // Radial marks make the globe read as an instrument in the miniature world.
    for(let i = 0; i < 24; i++)
    {
        const angle = i / 24 * Math.PI * 2
        const mark = k.box('compassTick', [0.035, 0.025, i % 6 === 0 ? 0.4 : 0.18], [Math.sin(angle) * 3.9, 0.335, Math.cos(angle) * 3.9], i % 6 === 0 ? 'glow' : 'white')
        mark.rotation.y = angle
    }
    k.box('atlasConsole', [3.8, 0.95, 0.5], [0, 0.85, 3.35], 'steel', true)
    k.profile('atlasConsoleTrim', [[-1.98,-0.06],[-1.78,0.16],[1.78,0.16],[1.98,-0.06]], 0.48, [0, 1.54, 3.36], 'brass')
    for(const x of [-1.65, 1.65])
        k.box('consoleInlay', [0.28, 0.042, 0.03], [x, 0.65, 3.63], 'amberGlow')
    const sign = k.display('atlasSign', [3.5, 0.8], [0, 1.13, 3.62])
    return { ...k, tilted, globe, hotspots, routes, sign }
}
