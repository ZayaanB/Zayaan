import * as THREE from 'three/webgpu'

export function pitDetails(k, car)
{
    const lidar = new THREE.Group()
    lidar.position.set(-0.5, 0.78, 0)
    car.add(lidar)
    k.mesh('lidarMount', new THREE.CylinderGeometry(0.19, 0.24, 0.12, 12), [0, -0.12, 0], 'dark', lidar)
    k.mesh('lidarHousing', new THREE.CylinderGeometry(0.15, 0.15, 0.18, 16), [0, 0, 0], 'white', lidar)
    k.mesh('lidarOptics', new THREE.CylinderGeometry(0.155, 0.155, 0.035, 16), [0, 0.025, 0], 'glow', lidar)
    k.mesh('lidarIndex', new THREE.BoxGeometry(0.04, 0.07, 0.04), [0.14, 0.08, 0], 'coral', lidar)
    for(const z of [-0.22, 0.22])
    {
        k.mesh('stereoCamera', new THREE.BoxGeometry(0.18, 0.12, 0.13), [0.85, 0.12, z], 'dark', car)
        const lens = k.mesh('stereoLens', new THREE.CylinderGeometry(0.045, 0.045, 0.045, 12), [0.96, 0.12, z], 'glow', car)
        lens.rotation.z = Math.PI / 2
    }
    k.mesh('sensorCrossbar', new THREE.BoxGeometry(0.07, 0.06, 0.65), [0.85, 0.03, 0], 'white', car)
    k.mesh('gpsAntenna', new THREE.CylinderGeometry(0.11, 0.11, 0.035, 12), [-0.9, 0.58, 0], 'coral', car)
    const fan = new THREE.Group()
    fan.position.set(-0.61, 2.55, 0)
    k.root.add(fan)
    const material = new THREE.MeshBasicMaterial({ color: '#8fffe4', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide })
    material.userData.prevent = true
    const sector = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24, 0, Math.PI / 3), material)
    sector.rotation.x = -Math.PI / 2
    fan.add(sector)
    for(const x of [-1.15, 1.15]) for(const z of [-1.02, 1.02])
    {
        const chock = k.box('wheelChock', [0.22, 0.16, 0.35], [x + Math.sign(x) * 0.38, 0.39, z], 'coral')
        chock.rotation.z = -Math.sign(x) * 0.25
    }
    const telemetry = k.display('pitTelemetry', [1.25, 0.8], [1.65, 2.35, -2.1])
    k.box('telemetryStand', [0.08, 1.65, 0.08], [1.65, 1.15, -2.15], 'white')
    for(const z of [-1.95, 1.95])
        k.box('pitFloorLight', [5.6, 0.025, 0.025], [0, 0.32, z], 'glow')
    for(let i = 0; i < 5; i++)
    {
        const stripe = k.box('pitSafetyMark', [0.3, 0.012, 0.07], [-2.2 + i * 0.4, 0.32, 1.95], 'white')
        stripe.rotation.y = Math.PI / 4
    }
    k.box('pitOverheadLight', [5.9, 0.05, 0.12], [0, 3.35, -2.26], 'glow')
    return { lidar, fan, telemetry }
}

export function mappingDetails(k)
{
    const corridorEdges = [-1, 1].map(side => {
        const curve = new THREE.CatmullRomCurve3(Array.from({ length: 64 }, (_, i) => {
            const angle = i / 64 * Math.PI * 2
            return new THREE.Vector3(Math.cos(angle) * (2.15 + side * 0.14), 1.52, Math.sin(angle) * (1.25 + side * 0.14))
        }), true)
        return k.mesh('corridorBoundary', new THREE.TubeGeometry(curve, 96, 0.012, 4, true), [0, 0, 0], side < 0 ? 'blue' : 'amberGlow')
    })
    for(const x of [-2.62, 2.62]) k.box('mappingTableLight', [0.025, 0.035, 3.35], [x, 1.45, 0], 'glow')
    for(const z of [-1.62, 1.62]) k.box('mappingTableLight', [5.2, 0.035, 0.025], [0, 1.45, z], 'glow')
    for(let i = -4; i <= 4; i++) k.box('mappingGrid', [0.012, 0.005, 3.15], [i * 0.55, 1.485, 0], 'teal')
    for(let i = -2; i <= 2; i++) k.box('mappingGrid', [5.05, 0.005, 0.012], [0, 1.485, i * 0.55], 'teal')
    const raysGeometry = new THREE.BufferGeometry()
    raysGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24), 3))
    const material = new THREE.LineBasicMaterial({ color: '#8fffe4', transparent: true, opacity: 0.55, depthWrite: false })
    material.userData.prevent = true
    const sensorRays = new THREE.LineSegments(raysGeometry, material)
    sensorRays.frustumCulled = false
    k.root.add(sensorRays)
    const phaseLights = []
    for(let i = 0; i < 3; i++)
    {
        k.box('mappingPhaseSocket', [0.75, 0.16, 0.3], [-1.1 + i * 1.1, 0.52, 1.98], 'dark')
        phaseLights.push(k.box('mappingPhaseLight', [0.58, 0.035, 0.14], [-1.1 + i * 1.1, 0.625, 1.98], 'glow'))
    }
    for(const x of [-2.55, 2.55]) k.box('mappingSignPost', [0.07, 2.4, 0.07], [x, 1.55, -1.93], 'teal')
    const legend = k.display('mappingLegend', [2.6, 0.4], [0, 2.2, -1.86])
    return { corridorEdges, sensorRays, phaseLights, legend }
}

export function gantryDetails(k)
{
    for(const [name, color] of [['lampOff', '#3c303c'], ['lampRed', '#ff6759']])
    {
        k.materials[name] = new THREE.MeshBasicMaterial({ color })
        k.materials[name].userData.prevent = true
    }
    const lights = []
    for(let i = 0; i < 5; i++)
    {
        k.box('gantryLightHousing', [0.3, 0.34, 0.12], [(i - 2) * 0.55, -0.88, 0], 'dark')
        const light = k.mesh('gantryLamp', new THREE.CylinderGeometry(0.09, 0.09, 0.025, 12), [(i - 2) * 0.55, -0.88, 0.08], 'lampOff')
        light.rotation.x = Math.PI / 2
        lights.push(light)
    }
    for(const side of [-1, 1])
        for(let i = 0; i < 4; i++)
            k.box('gantryChecker', [0.14, 0.14, 0.025], [side * (3.7 + i % 2 * 0.14), 0.28 - Math.floor(i / 2) * 0.14, 0.145], i % 3 ? 'white' : 'dark')
    return { lights }
}
