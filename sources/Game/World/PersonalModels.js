import * as THREE from 'three/webgpu'

// Shared proportions and matte palette for the three original portfolio exhibits.
export function kit(name)
{
    const root = new THREE.Group()
    root.name = name
    const colors = { dark: '#302a3e', white: '#f5eadb', teal: '#397f83', mint: '#87cfb2', wood: '#b77a59', coral: '#da6559', screen: '#153c49', blue: '#667fab', floor: '#b59883', light: '#bdf7de' }
    const materials = Object.fromEntries(Object.entries(colors).map(([key, value]) => {
        const material = new THREE.MeshStandardMaterial({ color: value, roughness: 0.9, flatShading: true })
        material.name = `personal_${key}`
        return [key, material]
    }))
    // Preserve luminous accents through the world's matte material conversion.
    for(const [name, color] of [['glow', '#8fffe4'], ['amberGlow', '#ffc878']])
    {
        materials[name] = new THREE.MeshBasicMaterial({color})
        materials[name].userData.prevent = true
    }
    const colliders = []
    function mesh(name, geometry, position, material = 'dark', parent = root)
    {
        const item = new THREE.Mesh(geometry, materials[material])
        item.name = name
        item.position.set(...position)
        parent.add(item)
        return item
    }
    function box(name, size, position, material = 'dark', solid = false)
    {
        const item = mesh(name, new THREE.BoxGeometry(...size), position, material)
        if(solid) colliders.push({ shape: 'cuboid', parameters: size.map(v => v / 2), position: { x: position[0], y: position[1], z: position[2] } })
        return item
    }
    function cylinder(name, radius, height, position, material = 'dark')
    {
        return mesh(name, new THREE.CylinderGeometry(radius, radius, height, 10), position, material)
    }
    function sphere(name, radius, position, material = 'white')
    {
        return mesh(name, new THREE.IcosahedronGeometry(radius, 1), position, material)
    }
    function panel(name, size, position)
    {
        const item = mesh(name, new THREE.PlaneGeometry(...size), position, 'screen')
        return item
    }
    function display(name, size, position)
    {
        const group=new THREE.Group()
        group.position.set(...position)
        root.add(group)
        mesh(`${name}Frame`,new THREE.BoxGeometry(size[0]+0.16,size[1]+0.16,0.12),[0,0,0],'dark',group)
        return mesh(name,new THREE.PlaneGeometry(...size),[0,0,0.07],'screen',group)
    }
    return { root, materials, colliders, mesh, box, cylinder, sphere, panel, display }
}

export function buildCourt()
{
    const k = kit('refAiCourt')
    k.box('courtMat', [9,0.06,8], [0,0.025,0], 'floor')
    k.box('tableTop', [3.4,0.16,5.4], [0,1.55,0], 'teal', true)
    for(const x of [-1.55,1.55]) k.box('sideline', [0.035,0.015,5.15], [x,1.638,0], 'white')
    for(const z of [-2.55,2.55]) k.box('baseline', [3.12,0.015,0.035], [0,1.638,z], 'white')
    k.box('centerline', [0.035,0.015,5.15], [0,1.638,0], 'white')
    for(const x of [-1.25,1.25]) for(const z of [-2.0,2.0]) k.box('tableLeg', [0.16,1.42,0.16], [x,0.76,z], 'dark')
    for(const x of [-1.25,1.25]) k.box('tableBrace', [0.09,0.09,4.1], [x,0.45,0], 'dark')
    for(const x of [-1.85,1.85]) k.cylinder('netPost',0.04,0.7,[x,1.89,0],'white')
    for(let i=0;i<=12;i++) k.box('netString',[0.015,0.48,0.02],[-1.8+i*0.3,1.89,0],'white')
    for(let i=0;i<4;i++) k.box('netString',[3.65,0.015,0.02],[0,1.66+i*0.15,0],'white')
    for(const x of [-3.3,3.3])
    {
        k.box('cameraPost',[0.1,3.7,0.1],[x,1.9,-2.5],'dark',true)
        k.box('cameraArm',[1.3,0.1,0.1],[x-Math.sign(x)*0.6,3.73,-2.5],'dark')
        k.box('trackingCamera',[0.35,0.2,0.3],[x-Math.sign(x)*1.2,3.6,-2.5],'white')
        k.box('cameraLens',[0.16,0.06,0.16],[x-Math.sign(x)*1.2,3.47,-2.5],'mint')
    }
    const paddles = []
    for(const side of [-1,1])
    {
        const paddle = new THREE.Group(); paddle.position.set(0,2.1,side*2.9); k.root.add(paddle)
        const head = k.mesh('paddleFace',new THREE.CylinderGeometry(0.28,0.28,0.07,12),[0,0,0],side===1?'coral':'dark',paddle)
        head.rotation.x=Math.PI/2
        k.mesh('paddleHandle',new THREE.BoxGeometry(0.1,0.35,0.08),[0,-0.38,0],'wood',paddle)
        paddles.push(paddle)
    }
    k.box('scoreboardFrame',[3.4,1.55,0.18],[0,3.65,-3.65],'dark')
    k.box('scoreboardPost',[0.16,2.9,0.16],[0,1.5,-3.65],'dark',true)
    const score = k.panel('scoreboard',[3.1,1.28],[0,3.65,-3.55])
    const ball = k.sphere('trackedBall',0.11,[0,2.25,2.5])
    const trail = Array.from({length:8},(_,i)=>k.sphere(`ballTrail${i}`,0.04,[0,2.25,2.5],'mint'))
    return { ...k, score, ball, trail, paddles }
}

export function buildWorkshop()
{
    const k = kit('computingWorkshop')
    const fans = [], indicators = [], racks = []
    k.box('workshopPlinth',[5.1,0.65,5.5],[0,-0.3,-0.3],'floor',true)
    k.box('workshopStep',[5.1,0.25,0.8],[0,-0.475,2.65],'wood',true)
    for(const [x,z] of [[-1.2,-2],[1.2,-2]])
    {
        const firstChild=k.root.children.length
        k.box('databaseRack',[1.25,2.65,0.85],[x,1.36,z],'dark',true)
        for(let row=0;row<6;row++)
        {
            const y=0.42+row*0.36
            k.box('serverDrawer',[1.06,0.27,0.055],[x,y,z+0.45],'blue')
            k.box('drawerHandle',[0.3,0.035,0.035],[x-0.17,y,z+0.49],'white')
            indicators.push(k.box('activityLight',[0.05,0.05,0.03],[x+0.39,y,z+0.49],'glow'))
        }
        const fan = new THREE.Group(); fan.position.set(x,2.51,z+0.47); k.root.add(fan)
        for(const angle of [0,Math.PI/2])
        {
            const blade=k.mesh('fanBlade',new THREE.BoxGeometry(0.3,0.055,0.015),[0,0,0],'white',fan)
            blade.rotation.z=angle
        }
        fans.push(fan)
        const rack=new THREE.Group()
        rack.name='rackAssembly'
        for(const child of [...k.root.children].slice(firstChild)) rack.add(child)
        k.root.add(rack)
        racks.push(rack)
    }
    k.box('workbench',[2.55,0.18,1.1],[0,1.12,0.5],'wood',true)
    for(const x of [-1.1,1.1]) for(const z of [0.1,0.9]) k.box('benchLeg',[0.12,1.04,0.12],[x,0.56,z],'dark')

    k.box('terminalStand',[0.11,0.45,0.1],[0,1.42,0.2],'dark')
    const terminal=k.display('terminal',[1.28,0.75],[0,1.92,0.275])
    k.box('keyboard',[0.95,0.055,0.28],[0,1.25,0.8],'white')
    for(let i=0;i<5;i++) k.box('keyboardKey',[0.09,0.012,0.07],[-0.36+i*0.16,1.285,0.8],'dark')
    const chats=[]
    for(const [x,z] of [[-0.9,-0.5],[0.9,-0.5]])
    {
        chats.push(k.display('chatContext',[1.02,0.74],[x,2.95,z]))
    }
    const packets=Array.from({length:6},(_,i)=>k.sphere(`dataPacket${i}`,0.095,[-1.5,1.8,0.7],'glow'))
    const sign=k.display('workshopSign',[2.6,0.65],[0,3.8,-3.1])
    const links=[]
    for(const x of [-1.2,1.2])
        links.push(k.box('rackDataRail',[0.055,0.035,2.5],[x,0.075,-0.65],'glow'))
    k.box('chatDataRail',[1.8,0.035,0.035],[0,2.66,-0.43],'glow')
    return { ...k, fans, indicators, racks, terminal, chats, packets, sign, links }
}

export function buildHealthcare()
{
    const k=kit('haloHealthcare')
    k.box('clinicFloor',[7.5,0.06,6.4],[0,0.025,0],'floor')
    // Open pavilion: frame and narrow awning leave the exhibits visible from above.
    for(const x of [-3.4,3.4]) for(const z of [-2.8,2.8]) k.box('pavilionPost',[0.16,3.9,0.16],[x,1.95,z],'wood',true)
    for(const z of [-2.8,2.8]) k.box('pavilionBeam',[7,0.18,0.18],[0,3.88,z],'wood')
    k.box('rearAwning',[7.2,0.14,0.9],[0,4,-2.7],'mint')
    k.box('examinationBed',[1.7,0.3,3.05],[-0.9,1.0,-0.2],'white',true)
    k.box('bedBase',[0.8,0.65,1.75],[-0.9,0.52,-0.2],'dark')
    k.box('bedPillow',[1.25,0.16,0.55],[-0.9,1.23,-1.35],'mint')
    for(const x of [-2.15,0.35]) k.box('scannerColumn',[0.22,2.75,0.22],[x,1.5,0.2],'white',true)
    k.box('scannerArch',[2.72,0.32,0.36],[-0.9,2.88,0.2],'white')
    k.box('scannerEmitter',[2.14,0.07,0.22],[-0.9,2.69,0.2],'mint')
    const scan=k.box('scanBar',[1.6,0.025,0.09],[-0.9,1.19,-1.45],'light')
    k.box('monitorCart',[1.45,0.13,0.85],[2.1,1.05,0.7],'white',true)
    k.box('cartStand',[0.13,0.9,0.13],[2.1,0.54,0.7],'dark')
    k.box('cartBase',[1.15,0.09,0.6],[2.1,0.12,0.7],'dark')
    for(const x of [1.65,2.55]) for(const z of [0.48,0.92])
    {
        const caster=k.cylinder('cartWheel',0.1,0.08,[x,0.11,z],'dark'); caster.rotation.x=Math.PI/2
    }
    k.box('clinicalMonitor',[1.42,1.05,0.12],[2.1,1.8,0.55],'dark')
    const monitor=k.panel('clinicalScreen',[1.23,0.86],[2.1,1.8,0.625])
    k.box('workstation',[1.55,0.16,0.65],[2.1,1.05,-1.8],'wood',true)
    k.box('workstationBase',[0.55,0.95,0.4],[2.1,0.53,-1.8],'white')
    k.box('recordMonitor',[1.2,0.75,0.1],[2.1,1.6,-2],'dark')
    const records=k.panel('records',[1.04,0.6],[2.1,1.6,-1.94])
    const sign=k.panel('clinicSign',[4.5,1.05],[0,3.9,-2.19])
    return { ...k, scan, monitor, records, sign }
}


export function buildContextBridge()
{
    const k=kit('contextBridge')
    k.box('bridgePlinth',[7,1,5.6],[0,-0.475,0],'floor',true)
    k.box('entryStep',[4,0.5,0.8],[0,-0.725,3.1],'wood',true)
    const terminals=[]
    for(const x of [-2.35,2.35])
    {
        k.box('terminalPedestal',[1.4,1.25,1.2],[x,0.65,0],'white',true)
        terminals.push(k.display('contextTerminal',[1.35,1.18],[x,2,0]))
        k.box('terminalKeyboard',[1,0.06,0.35],[x,1.31,0.55],'dark')
    }
    k.box('linkBase',[4.6,0.18,0.3],[0,0.85,0.25],'dark')
    k.box('illuminatedLink',[4.6,0.07,0.13],[0,0.98,0.25],'glow')
    k.cylinder('memoryPedestal',0.65,0.8,[0,0.45,0.25],'dark')
    for(const y of [0.95,2.3]) k.cylinder('capsuleRing',0.7,0.16,[0,y,0.25],'white')
    for(const x of [-0.55,0.55]) k.box('capsuleStrut',[0.12,1.25,0.12],[x,1.6,0.25],'teal')
    const memory=k.box('compressedMemory',[0.55,0.55,0.55],[0,1.6,0.25],'glow')
    const cards=Array.from({length:6},(_,i)=>k.box(`contextCard${i}`,[0.18,0.18,0.18],[-2.35,1.6+i*0.08,0.4],'glow'))
    const sign=k.display('contextBridgeSign',[3.6,1.15],[0,3.65,-1.8])
    const pulses=Array.from({length:10},(_,i)=>k.sphere(`linkPulse${i}`,0.065,[0,1.05,0.25],'glow'))
    const orbit=k.mesh('memoryOrbit',new THREE.TorusGeometry(0.46,0.025,6,32),[0,1.6,0.25],'glow')
    orbit.rotation.x=Math.PI/3
    return {...k,terminals,memory,cards,sign,pulses,orbit}
}


export function buildSkatingRink()
{
    const k=kit('skatingRink')
    k.materials.ice=new THREE.MeshStandardMaterial({color:'#bdeaf1',roughness:0.32,metalness:0.05,flatShading:true})
    const ice=k.mesh('iceSurface',new THREE.CylinderGeometry(1,1,0.22,48),[0,0,0],'ice')
    ice.scale.set(8,1,6.5)
    // An exact oval collider keeps the neighboring shore and paths unchanged.
    const vertices=ice.geometry.attributes.position.array
    const hull=new Float32Array(vertices.length)
    for(let i=0;i<vertices.length;i+=3){hull[i]=vertices[i]*8;hull[i+1]=vertices[i+1];hull[i+2]=vertices[i+2]*6.5}
    k.colliders.push({shape:'hull',parameters:[hull],friction:0.02,frictionRule:'min'})
    for(let i=0;i<48;i++)
    {
        const a=i/48*Math.PI*2,b=(i+1)/48*Math.PI*2
        // Open entrances on the southern edge and the eastern Career path.
        if((i>=10&&i<=14)||i<=2||i>=46) continue
        const x1=Math.cos(a)*8,z1=Math.sin(a)*6.5,x2=Math.cos(b)*8,z2=Math.sin(b)*6.5
        const board=k.box('rinkBoard',[Math.hypot(x2-x1,z2-z1)+0.05,1.15,0.22],[(x1+x2)/2,0.66,(z1+z2)/2],'white')
        board.rotation.y=-Math.atan2(z2-z1,x2-x1)
        k.colliders.push({shape:'cuboid',parameters:[board.geometry.parameters.width/2,0.575,0.11],position:{x:board.position.x,y:board.position.y,z:board.position.z},quaternion:new THREE.Quaternion().setFromEuler(board.rotation)})
        const trim=k.box('rinkRail',[board.geometry.parameters.width,0.08,0.26],[(x1+x2)/2,1.27,(z1+z2)/2],i%6<3?'teal':'coral')
        trim.rotation.y=board.rotation.y
    }
    const circle=k.mesh('iceCenterRing',new THREE.RingGeometry(1.5,1.55,40),[0,0.115,0],'white')
    circle.rotation.x=-Math.PI/2
    for(const x of [-4,4]) k.box('iceStripe',[0.06,0.012,8],[x,0.115,0],'white')
    for(const x of [2.25,3.75]) k.box('rinkSignPost',[0.15,1.55,0.15],[x,0.73,7],'wood')
    k.box('rinkSignFrame',[2.1,0.9,0.18],[3,1.55,7],'wood')
    const sign=k.panel('rinkSign',[1.88,0.68],[3,1.55,7.1])
    return {...k,ice,sign}
}


// An original vehicle-armored sentinel: broad shoulders, wheel assemblies,
// articulated forearms, turbine backpack and a visible chest monogram.
export function buildSentinel()
{
    const k=kit('zbSentinel')
    k.box('sentinelStage',[7,0.35,5.4],[0,0.175,0],'dark',true)
    for(const x of [-3.1,3.1]) k.box('stageLight',[0.08,0.025,4.8],[x,0.365,0],'glow')
    const torso=new THREE.Group();torso.position.set(0,4.65,0);k.root.add(torso)
    const part=(name,size,pos,mat='teal',parent=torso)=>k.mesh(name,new THREE.BoxGeometry(...size),pos,mat,parent)
    for(const side of [-1,1])
    {
        const x=side*0.95
        k.box('armoredFoot',[1.25,0.55,1.9],[x,0.65,0.35],'teal',true)
        k.box('toeArmor',[1.1,0.22,0.7],[x,0.96,0.9],'white')
        k.box('shin',[0.9,1.5,0.9],[x,1.65,0],'teal',true)
        k.box('shinInset',[0.55,0.8,0.12],[x,1.7,0.51],'dark')
        k.box('shinLight',[0.09,0.65,0.03],[x,1.7,0.59],'glow')
        k.sphere('kneeJoint',0.4,[x,2.55,0],'dark')
        k.box('kneeShield',[0.85,0.5,0.22],[x,2.6,0.48],'white')
        k.box('thigh',[0.8,1.2,0.8],[x,3.2,0],'dark',true)
        k.box('thighArmor',[0.85,0.85,0.25],[x,3.2,0.47],'white')
        part('hipPlate',[1.05,0.6,0.9],[side*0.8,-0.85,0],'teal')
    }
    part('waist',[1.3,0.5,0.8],[0,-0.6,0],'dark')
    part('torsoCore',[2.1,1.55,1.25],[0,0.35,0],'dark')
    for(const side of [-1,1])
    {
        const plate=part('chestArmor',[1.2,0.75,0.3],[side*0.63,0.8,0.76],'teal')
        plate.rotation.z=-side*0.16
        part('chestVent',[0.5,0.23,0.08],[side*0.78,0.88,0.96],'glow')
        part('collarFin',[0.32,0.9,0.75],[side*1.03,1.33,-0.12],'white').rotation.z=-side*0.25
    }
    const badge=k.mesh('zbChestBadge',new THREE.PlaneGeometry(1.1,0.64),[0,0.25,1.01],'screen',torso)
    const reactor=k.mesh('chestReactor',new THREE.IcosahedronGeometry(0.23,0),[0,-0.35,0.8],'glow',torso)
    const head=new THREE.Group();head.position.set(0,1.75,0);torso.add(head)
    part('helmet',[1.12,0.96,0.95],[0,0,0],'teal',head)
    part('helmetCrest',[0.22,0.4,0.7],[0,0.57,-0.05],'white',head)
    part('faceMask',[0.64,0.4,0.12],[0,-0.21,0.52],'white',head)
    part('visor',[0.88,0.16,0.08],[0,0.12,0.52],'glow',head)
    for(const side of [-1,1]) part('earFin',[0.18,1.1,0.25],[side*0.66,0.2,0],'coral',head)
    const arms=[],wheels=[],wings=[], turbines=[]
    for(const side of [-1,1])
    {
        const arm=new THREE.Group();arm.position.set(side*1.65,1,0);torso.add(arm);arms.push(arm)
        part('shoulderArmor',[1.25,0.85,1.25],[side*0.1,0,0],'coral',arm)
        part('shoulderCap',[1.35,0.18,1.35],[side*0.1,0.52,0],'white',arm)
        part('upperArm',[0.58,1.05,0.65],[0,-0.8,0],'dark',arm)
        k.mesh('elbow',new THREE.IcosahedronGeometry(0.34,1),[0,-1.4,0],'white',arm)
        const forearm=new THREE.Group();forearm.position.set(0,-1.4,0);arm.add(forearm);arm.userData.forearm=forearm
        part('forearmArmor',[0.85,0.95,0.85],[0,-0.5,0.05],'teal',forearm)
        part('forearmLight',[0.14,0.55,0.06],[0,-0.5,0.51],'glow',forearm)
        part('fist',[0.65,0.5,0.7],[0,-1.2,0.05],'dark',forearm)
        for(let i=0;i<3;i++) part('knuckle',[0.14,0.25,0.1],[-0.2+i*0.2,-1.2,0.44],'white',forearm)
        const wheel=k.mesh('shoulderWheel',new THREE.CylinderGeometry(0.48,0.48,0.24,12),[side*0.74,0,-0.1],'dark',arm)
        wheel.rotation.z=Math.PI/2;wheels.push(wheel)
        k.mesh('wheelHub',new THREE.CylinderGeometry(0.24,0.24,0.255,8),[0,0,0],'white',wheel)
        const wing=new THREE.Group();wing.position.set(side*0.95,0.6,-0.7);torso.add(wing);wings.push(wing)
        part('vehicleWing',[0.9,1.85,0.2],[side*0.4,0.35,0],'teal',wing)
        part('wingStripe',[0.1,1.5,0.04],[side*0.48,0.35,-0.13],'glow',wing)
        wing.rotation.z=-side*0.35
        const turbine=k.mesh('backpackTurbine',new THREE.TorusGeometry(0.38,0.12,6,12),[side*0.6,0.5,-1],'white',torso)
        const rotor=new THREE.Group();rotor.position.copy(turbine.position);torso.add(rotor);turbines.push(rotor)
        for(let i=0;i<3;i++) part('turbineBlade',[0.58,0.07,0.05],[0,0,0],'glow',rotor).rotation.z=i*Math.PI/3
    }
    const halo=k.mesh('powerHalo',new THREE.TorusGeometry(2.6,0.035,6,64),[0,0.4,0],'glow');halo.rotation.x=Math.PI/2
    const sparks=Array.from({length:8},(_,i)=>k.sphere(`energySpark${i}`,0.09,[0,0.5,0],'glow'))
    k.colliders.push({shape:'cuboid',parameters:[1.65,2.5,0.85],position:{x:0,y:3.6,z:0}})
    const sign=k.display('sentinelSign',[2.5,0.65],[0,0.85,2.5])
    return {...k,torso,head,arms,wheels,wings,turbines,badge,reactor,halo,sparks,sign}
}
