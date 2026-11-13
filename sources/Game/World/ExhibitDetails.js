import * as THREE from 'three/webgpu'

function ring(k, name, radius, tube, position, material, parent = k.root)
{
    return k.mesh(name, new THREE.TorusGeometry(radius, tube, 6, 48), position, material, parent)
}

function path(k, name, points, material, radius = 0.025)
{
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
    return k.mesh(name, new THREE.TubeGeometry(curve, 24, radius, 5, false), [0, 0, 0], material)
}

export function workshopDetails(k)
{
    k.box('labDeck', [5.05, 0.06, 5.45], [0, 0.055, -0.3], 'dark')
    for(const x of [-2.35, 2.35])
    {
        k.box('rackEdgeLight', [0.035, 0.025, 4.9], [x, 0.1, -0.3], 'glow')
        path(k, 'coolantLoop', [[x, 0.2, -1.9], [x, 2.85, -2.1], [x * 0.75, 3.12, -2.1], [x * 0.52, 2.8, -2.1]], 'teal', 0.065)
        for(const y of [0.5, 1.15, 1.8, 2.45])
            k.box('coolantCoupling', [0.18, 0.08, 0.18], [x, y, -2.0], 'white')
    }
    for(const x of [-1.2, 1.2])
    {
        ring(k, 'fanHousing', 0.24, 0.035, [x, 2.51, -1.51], 'teal')
        for(const side of [-1, 1])
            k.box('rackStatusStrip', [0.025, 2.15, 0.025], [x + side * 0.55, 1.45, -1.54], 'glow')
        for(let row = 0; row < 6; row++)
            for(let vent = 0; vent < 4; vent++)
                k.box('serverVent', [0.09, 0.025, 0.025], [x - 0.37 + vent * 0.12, 0.48 + row * 0.36, -1.51], 'dark')
    }
    const shards = []
    for(let i = 0; i < 16; i++)
    {
        const x = (i % 8 - 3.5) * 0.49, z = 1.65 + Math.floor(i / 8) * 0.5
        k.box('shardSocket', [0.42, 0.08, 0.4], [x, 0.14, z], 'blue')
        shards.push(k.box('shardActivity', [0.27, 0.025, 0.25], [x, 0.195, z], i < 8 ? 'glow' : 'amberGlow'))
    }
    const journal = new THREE.Group()
    journal.position.set(1.85, 0.62, 0.65)
    k.root.add(journal)
    for(let i = 0; i < 4; i++)
        k.mesh('journalPlatter', new THREE.CylinderGeometry(0.35, 0.35, 0.055, 24), [0, i * 0.15, 0], i % 2 ? 'amberGlow' : 'dark', journal)
    k.box('journalCradle', [0.85, 0.12, 0.85], [1.85, 0.23, 0.65], 'white')
    const journalLabel = k.display('journalLabel', [0.9, 0.38], [1.85, 1.44, 0.65])
    const shardLabel = k.display('shardLabel', [2.2, 0.38], [0, 0.6, 2.35])
    for(const x of [-2.05, 2.05]) k.box('headerSupport', [0.08, 3.65, 0.08], [x, 1.9, -2.75], 'teal')
    k.box('headerTruss', [4.2, 0.12, 0.12], [0, 3.66, -2.75], 'dark')
    return { shards, journal, journalLabel, shardLabel }
}

export function contextDetails(k, cards)
{
    k.box('bridgeDeck', [6.95, 0.06, 5.5], [0, 0.07, 0], 'dark')
    for(const x of [-3.22, 3.22]) k.box('bridgeEdgeLight', [0.045, 0.03, 4.9], [x, 0.12, 0], 'glow')
    const portals = []
    for(const [i, x] of [-2.35, 2.35].entries())
    {
        ring(k, 'terminalPortalFrame', 1.03, 0.085, [x, 2, -0.2], 'dark')
        const portal = ring(k, 'terminalPortal', 1.03, 0.025, [x, 2, -0.09], i ? 'amberGlow' : 'glow')
        portals.push(portal)
        for(let tick = 0; tick < 8; tick++)
        {
            const angle = tick * Math.PI / 4
            const mark = k.box('portalIndex', [0.12, 0.04, 0.055], [x + Math.cos(angle) * 1.03, 2 + Math.sin(angle) * 1.03, -0.04], 'white')
            mark.rotation.z = angle
        }
        for(let slot = 0; slot < 4; slot++)
            k.box('terminalVent', [0.65, 0.04, 0.035], [x, 0.5 + slot * 0.12, 0.62], 'teal')
    }
    const gyros = []
    for(let i = 0; i < 3; i++)
    {
        const group = new THREE.Group()
        group.position.set(0, 1.6, 0.25)
        k.root.add(group)
        const hoop = ring(k, 'contextGyroscope', 0.87 + i * 0.10, 0.022, [0, 0, 0], i === 1 ? 'amberGlow' : 'glow', group)
        hoop.rotation.x = i * Math.PI / 3
        k.mesh('orbitNode', new THREE.IcosahedronGeometry(0.075, 0), [0.87 + i * 0.1, 0, 0], 'white', group)
        gyros.push(group)
    }
    const cageMaterial = new THREE.LineBasicMaterial({ color: '#fff3e5', transparent: true, opacity: 0.65 })
    cageMaterial.userData.prevent = true
    const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.63)), cageMaterial)
    cage.position.set(0, 1.6, 0.25)
    k.root.add(cage)
    cards.forEach(card => {
        card.geometry.dispose()
        card.geometry = new THREE.BoxGeometry(0.34, 0.43, 0.035)
        card.material = k.materials.white
        for(let line = 0; line < 3; line++)
            k.mesh('documentLine', new THREE.BoxGeometry(line === 2 ? 0.12 : 0.22, 0.022, 0.008), [-0.02, 0.1 - line * 0.09, 0.022], 'teal', card)
    })
    for(const x of [-1.75, 1.75])
        path(k, 'contextConduit', [[x, 0.13, 1.1], [x, 0.13, 1.65], [0, 0.13, 1.65], [0, 0.13, 0.7]], 'teal', 0.035)
    for(const x of [-1.9, 1.9]) k.box('bridgeSignPost', [0.08, 3.3, 0.08], [x, 1.75, -1.8], 'teal')
    return { gyros, portals, cage }
}

export function healthcareDetails(k)
{
    k.box('clinicDeck', [7.5, 0.14, 6.4], [0, 0.07, 0], 'white')
    for(const x of [-3.55, 3.55]) k.box('clinicFloorLight', [0.045, 0.025, 5.9], [x, 0.145, 0], 'glow')
    for(const z of [-2.95, 2.95]) k.box('clinicFloorLight', [7.1, 0.025, 0.045], [0, 0.145, z], 'glow')
    k.root.traverse(child => {
        if(child.name === 'pavilionPost') child.material = k.materials.white
        if(child.name === 'pavilionBeam') child.material = k.materials.teal
    })
    for(const x of [-3.4, 3.4])
        k.box('pavilionLight', [0.025, 2.7, 0.025], [x, 2.2, 2.7], 'glow')
    const scannerHalo = new THREE.Group()
    scannerHalo.position.set(-0.9, 1.6, 0.2)
    k.root.add(scannerHalo)
    ring(k, 'scannerBore', 1.18, 0.13, [0, 0, 0], 'white', scannerHalo)
    ring(k, 'scannerInnerLight', 1.05, 0.025, [0, 0, 0.12], 'glow', scannerHalo)
    const rotor = new THREE.Group()
    scannerHalo.add(rotor)
    for(let i = 0; i < 8; i++)
    {
        const a = i * Math.PI / 4
        const sensor = k.mesh('scanSensor', new THREE.BoxGeometry(0.13, 0.07, 0.05), [Math.cos(a) * 1.18, Math.sin(a) * 1.18, 0.14], i % 2 ? 'teal' : 'amberGlow', rotor)
        sensor.rotation.z = a
    }
    for(const x of [-1.65, -0.15]) k.box('bedSafetyRail', [0.045, 0.045, 2.2], [x, 1.4, -0.2], 'teal')
    for(const x of [-1.65, -0.15]) for(const z of [-1.15, 0.7])
        k.box('bedRailPost', [0.04, 0.23, 0.04], [x, 1.27, z], 'white')
    k.box('medicalCrossBacking', [0.75, 0.75, 0.1], [-2.8, 3.15, -2.63], 'teal')
    k.box('medicalCrossVertical', [0.13, 0.5, 0.025], [-2.8, 3.15, -2.56], 'glow')
    k.box('medicalCrossHorizontal', [0.5, 0.13, 0.025], [-2.8, 3.15, -2.56], 'glow')
    const waveform = new THREE.Group()
    waveform.position.set(2.1, 2.63, 0.64)
    k.root.add(waveform)
    k.mesh('vitalsBacking', new THREE.BoxGeometry(1.42, 0.42, 0.08), [0, 0, -0.05], 'screen', waveform)
    const points = [[-0.6, 0], [-0.35, 0], [-0.25, 0.07], [-0.14, -0.08], [-0.05, 0.15], [0.06, -0.11], [0.16, 0], [0.6, 0]]
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, y]) => new THREE.Vector3(x, y, 0)))
    const material = new THREE.LineBasicMaterial({ color: '#8fffe4' })
    material.userData.prevent = true
    waveform.add(new THREE.Line(geometry, material))
    const sweep = k.mesh('vitalsSweep', new THREE.BoxGeometry(0.025, 0.32, 0.015), [-0.6, 0, 0.02], 'amberGlow', waveform)
    for(let i = 0; i < 3; i++)
    {
        k.box('medicalDrawer', [1.1, 0.16, 0.48], [2.1, 0.43 + i * 0.2, -1.8], 'mint')
        k.box('drawerGrip', [0.28, 0.035, 0.035], [2.1, 0.43 + i * 0.2, -1.54], 'white')
    }
    return { scannerHalo, rotor, sweep }
}

export function courtDetails(k)
{
    k.box('courtDeck', [9, 0.1, 8], [0, 0.05, 0], 'dark')
    for(const x of [-4.2, 4.2]) k.box('courtBoundaryLight', [0.04, 0.025, 7.4], [x, 0.11, 0], 'glow')
    for(const z of [-3.7, 3.7]) k.box('courtBoundaryLight', [8.4, 0.025, 0.04], [0, 0.11, z], 'glow')
    for(const x of [-1.68, 1.68])
    {
        k.box('tableEdgeLight', [0.025, 0.035, 5.35], [x, 1.55, 0], 'glow')
        for(const z of [-1.9, 1.9])
        {
            const brace = k.box('tableDiagonalBrace', [0.08, 1.25, 0.08], [x * 0.72, 0.7, z], 'teal')
            brace.rotation.z = Math.sign(x) * 0.4
        }
    }
    const cameraLabels = [], cameraLights = []
    for(const x of [-3.3, 3.3])
    {
        const lensX = x - Math.sign(x) * 1.2
        const lens = ring(k, 'trackingLensRing', 0.14, 0.022, [lensX, 3.44, -2.5], 'glow')
        lens.rotation.x = Math.PI / 2
        cameraLights.push(k.box('cameraStatus', [0.065, 0.045, 0.045], [lensX + 0.12, 3.62, -2.33], 'amberGlow'))
        cameraLabels.push(k.display('trackingStation', [1.32, 0.64], [x, 2.7, -2.35]))
        k.box('sensorPostStripe', [0.035, 2.5, 0.035], [x, 1.9, -2.43], 'teal')
    }
    const target = new THREE.Group()
    k.root.add(target)
    for(let i = 0; i < 4; i++)
    {
        const angle = i * Math.PI / 2
        const corner = new THREE.Group()
        corner.rotation.z = angle
        target.add(corner)
        k.mesh('trackingBracket', new THREE.BoxGeometry(0.15, 0.02, 0.02), [0.17, 0.24, 0], 'amberGlow', corner)
        k.mesh('trackingBracket', new THREE.BoxGeometry(0.02, 0.15, 0.02), [0.24, 0.17, 0], 'amberGlow', corner)
    }
    const landingRing = ring(k, 'ballProjection', 0.28, 0.016, [0, 1.65, 0], 'amberGlow')
    landingRing.rotation.x = -Math.PI / 2
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3))
    const material = new THREE.LineBasicMaterial({ color: '#8fffe4', transparent: true, opacity: 0.4, depthWrite: false })
    material.userData.prevent = true
    const trackingRays = new THREE.LineSegments(geometry, material)
    trackingRays.frustumCulled = false
    k.root.add(trackingRays)
    for(const x of [-1.55, 1.55]) k.box('scoreboardSupport', [0.1, 3.15, 0.1], [x, 1.65, -3.65], 'teal')
    k.box('scoreboardAccent', [3.2, 0.035, 0.025], [0, 4.35, -3.53], 'glow')
    return { cameraLabels, cameraLights, target, landingRing, trackingRays }
}

export function sentinelDetails(k, torso, head, arms)
{
    const reactorRing = ring(k, 'reactorContainment', 0.35, 0.035, [0, -0.35, 0.84], 'amberGlow', torso)
    for(const side of [-1, 1])
    {
        for(let i = 0; i < 3; i++)
        {
            k.mesh('ribVent', new THREE.BoxGeometry(0.38, 0.04, 0.065), [side * 0.81, -0.1 - i * 0.13, 0.7], 'white', torso)
            k.mesh('helmetVent', new THREE.BoxGeometry(0.14, 0.035, 0.04), [side * 0.35, -0.17 - i * 0.08, 0.59], 'dark', head)
        }
        for(const z of [-0.25, 0.25])
        {
            const piston = k.mesh('legHydraulic', new THREE.CylinderGeometry(0.045, 0.045, 0.9, 8), [side * 1.32, 2.1, z], 'white')
            piston.rotation.z = side * 0.14
        }
        for(let i = 0; i < 4; i++)
            k.box('bootTread', [1.02, 0.04, 0.06], [side * 0.95, 0.43, 0.85 - i * 0.25], 'white')
    }
    arms.forEach((arm, i) => {
        const side = i ? 1 : -1
        k.mesh('shoulderStripe', new THREE.BoxGeometry(0.08, 0.65, 0.035), [side * 0.3, 0, 0.65], 'glow', arm)
        for(const z of [-0.22, 0.22])
            k.mesh('armHydraulic', new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8), [side * 0.33, -0.9, z], 'white', arm)
    })
    const shield = new THREE.Group()
    shield.position.set(0, -0.5, 0.65)
    arms[0].userData.forearm.add(shield)
    ring(k, 'wristShieldOuter', 0.65, 0.022, [0, 0, 0], 'glow', shield)
    ring(k, 'wristShieldInner', 0.48, 0.015, [0, 0, 0], 'amberGlow', shield)
    for(let i = 0; i < 6; i++)
    {
        const a = i * Math.PI / 3
        const segment = k.mesh('shieldIndex', new THREE.BoxGeometry(0.14, 0.045, 0.025), [Math.cos(a) * 0.56, Math.sin(a) * 0.56, 0], 'white', shield)
        segment.rotation.z = a
    }
    const thrusters = []
    for(const side of [-1, 1])
    {
        const jet = k.mesh('turbineExhaust', new THREE.ConeGeometry(0.25, 0.8, 10), [side * 0.6, 0.5, -1.5], 'glow', torso)
        jet.rotation.x = -Math.PI / 2
        thrusters.push(jet)
    }
    const pylons = []
    for(const x of [-2.7, 2.7])
    {
        k.box('chargingPylon', [0.3, 1.35, 0.4], [x, 1.04, -1.9], 'teal', true)
        k.box('pylonCap', [0.42, 0.12, 0.5], [x, 1.75, -1.9], 'white')
        pylons.push(k.box('pylonCharge', [0.09, 0.95, 0.03], [x, 1.04, -1.68], 'glow'))
    }
    const chargingRing = ring(k, 'chargingSweep', 2.2, 0.022, [0, 0.5, 0], 'amberGlow')
    chargingRing.rotation.x = Math.PI / 2
    return { reactorRing, shield, thrusters, pylons, chargingRing }
}
