// Original low-poly Formula-style vehicle. +X is forward; Y is up.
// Keep the VisualVehicle part names and the existing 0.4 m wheel radius.
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import fs from 'node:fs/promises'
import sharp from 'sharp'

globalThis.FileReader = class {
    readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.() }) }
}

const model = new THREE.Group()
model.name = 'ZayaanFormulaCar'
const chassis = new THREE.Group()
chassis.name = 'chassis'
model.add(chassis)
const materials = {}
for(const [name, hex] of Object.entries({ body: '#d92932', shell: '#eef5ff', carbon: '#252735', white: '#eef5ff', tire: '#171923', metal: '#8496aa', lens: '#55d7ee', light: '#ff443e' }))
{
    materials[name] = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, flatShading: true })
    materials[name].name = `formula${name}`
}

function mesh(name, geometry, material, position, parent = chassis)
{
    // Paint reward shaders sample the secondary UV set.
    if(geometry.attributes.uv) geometry.setAttribute('uv1', geometry.attributes.uv.clone())
    const item = new THREE.Mesh(geometry, materials[material])
    item.name = name
    item.position.set(...position)
    parent.add(item)
    return item
}
function box(name, size, position, material = 'carbon', parent = chassis)
{
    return mesh(name, new THREE.BoxGeometry(...size), material, position, parent)
}
function rod(name, a, b, radius = 0.035, material = 'carbon', parent = chassis)
{
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b)
    const item = mesh(name, new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 8), material, start.clone().add(end).multiplyScalar(0.5).toArray(), parent)
    item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize())
    return item
}

// Merge the painted panels into one mesh so existing paint rewards cover the body.
const panels = []
function panel(size, position, rotationZ = 0)
{
    const geometry = new THREE.BoxGeometry(...size)
    geometry.rotateZ(rotationZ)
    geometry.translate(...position)
    panels.push(geometry)
}
panel([1.0, 0.24, 0.68], [-0.63, -0.12, 0])
panel([1.42, 0.23, 0.22], [0.2, -0.18, 0.37])
panel([1.42, 0.23, 0.22], [0.2, -0.18, -0.37])
panel([0.86, 0.22, 0.45], [0.67, -0.12, 0], -0.08)
// Tapered nose: four rings, stitched into flat triangular faces.
const vertices = [], indices = []
for(const [x, y, halfWidth, halfHeight] of [[0.75, -0.16, 0.24, 0.14], [1.15, -0.23, 0.16, 0.10], [1.55, -0.31, 0.11, 0.065]])
    for(const [dy, dz] of [[-1,-1],[-1,1],[1,1],[1,-1]]) vertices.push(x, y + dy * halfHeight, dz * halfWidth)
for(let ring = 0; ring < 2; ring++)
    for(let edge = 0; edge < 4; edge++)
    {
        const a = ring * 4 + edge, b = ring * 4 + (edge + 1) % 4
        indices.push(a, b, b + 4, a, b + 4, a + 4)
    }
indices.push(8, 9, 10, 8, 10, 11, 3, 2, 1, 3, 1, 0)
const nose = new THREE.BufferGeometry()
nose.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
nose.setIndex(indices)
const flatNose = nose.toNonIndexed()
flatNose.computeVertexNormals()
flatNose.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(flatNose.attributes.position.count * 2), 2))
const painted = mergeGeometries([...panels.map(g => g.toNonIndexed()), flatNose])
mesh('bodyPainted', painted, 'body', [0, 0, 0])

box('floor', [2.7, 0.08, 1.02], [0, -0.39, 0])
box('cockpitWell', [0.74, 0.06, 0.53], [-0.04, -0.28, 0])
box('seat', [0.17, 0.34, 0.42], [-0.34, -0.03, 0]).rotation.z = -0.18
rod('steeringColumn', [0.29,-0.21,0], [0.22,0.03,0], 0.027)
const steering = mesh('steeringWheel', new THREE.TorusGeometry(0.12, 0.024, 6, 10), 'carbon', [0.23,0.03,0])
steering.rotation.y = Math.PI / 2

// Front and rear aero, kept chunky enough to read from the game camera.
for(const [name, x, y, width] of [['front',1.44,-0.37,1.85], ['rear',-1.2,0.35,1.65]])
{
    box(`${name}Wing`, [0.34,0.07,width], [x,y,0])
    box(`${name}WingFlap`, [0.18,0.055,width - 0.12], [x - 0.13,y + 0.11,0], 'white').rotation.z = -0.15
    for(const side of [-1, 1]) box(`${name}Endplate${side}`, [0.43,0.25,0.045], [x,y + 0.055,side * width / 2], 'white')
}
for(const z of [-0.33,0.33]) rod('rearWingSupport', [-1.08,-0.3,z], [-1.2,0.33,z], 0.032)
for(const side of [-1,1])
{
    box(`sidepod${side}`, [0.78,0.24,0.19], [-0.55,-0.18,side * 0.5], 'white')
    box(`sidepodIntake${side}`, [0.025,0.14,0.14], [-0.145,-0.15,side * 0.5])
    for(const x of [-0.9,0.9])
        for(const dx of [-0.25,0.25]) rod('wishbone', [x + dx,-0.23,side * 0.35], [x,-0.5,side * 0.75], 0.023, 'metal')
}

// Roll hoop and driverless sensor package.
for(const side of [-1,1])
{
    rod('rollHoop', [-0.49,-0.1,side * 0.3], [-0.49,0.58,side * 0.23], 0.043)
    rod('rollBrace', [-1.02,-0.12,side * 0.3], [-0.49,0.51,side * 0.23], 0.03)
}
rod('rollHoopTop', [-0.49,0.58,-0.23], [-0.49,0.58,0.23], 0.043)
mesh('lidarBase', new THREE.CylinderGeometry(0.13,0.15,0.13,10), 'carbon', [-0.49,0.68,0])
mesh('lidarWindow', new THREE.CylinderGeometry(0.13,0.13,0.08,10), 'lens', [-0.49,0.77,0])
mesh('lidarCap', new THREE.CylinderGeometry(0.13,0.13,0.035,10), 'carbon', [-0.49,0.825,0])
box('cameraBar', [0.1,0.1,0.46], [0.7,0.06,0])
for(const z of [-0.17,0.17]) box('stereoCamera', [0.018,0.055,0.055], [0.76,0.06,z], 'lens')
box('stopLights', [0.025,0.075,0.22], [-1.045,0.03,0], 'light')
box('backLights', [0.02,0.04,0.13], [-1.06,-0.1,0], 'shell')

// Tiny geometric lettering survives the same palette / shadow pipeline as the body.
const glyphs = { Z:['111','001','010','100','111'], B:['110','101','110','101','110'], '0':['111','101','101','101','111'], '7':['111','001','010','010','010'] }
function lettering(text, centerX, y, z, pixel, side)
{
    const width = (text.length * 4 - 1) * pixel
    for(let letter = 0; letter < text.length; letter++)
        glyphs[text[letter]].forEach((row, r) => [...row].forEach((value,c) => {
            if(value === '1') box('personalMark', [pixel * 0.88,pixel * 0.88,0.006], [centerX + side * (width / 2 - (letter * 4 + c + 0.5) * pixel),y + (2-r)*pixel,z], 'carbon')
        }))
}
for(const side of [-1,1])
{
    lettering('ZB', -0.55,-0.16,side * 0.599,0.036,side)
    lettering('07', -1.2,0.41,side * 0.85,0.037,side)
}
box('noseStripe', [0.7,0.012,0.075], [1.08,-0.145,0], 'white').rotation.z = -0.18

// Single wheel template: VisualVehicle clones and positions four copies.
const wheel = new THREE.Group()
wheel.name = 'wheelContainer'
model.add(wheel)
const cylinder = new THREE.Group()
cylinder.name = 'wheelCylinder'
wheel.add(cylinder)
const tire = mesh('tire', new THREE.CylinderGeometry(0.4,0.4,0.28,12), 'tire', [0,0,0], cylinder)
tire.rotation.x = Math.PI / 2
const rim = mesh('wheelPainted', new THREE.CylinderGeometry(0.22,0.22,0.295,10), 'shell', [0,0,0], cylinder)
rim.rotation.x = Math.PI / 2
// White rims belong to the fixed livery, rather than the unlockable body paint.
rim.userData.fixedPaint = true
for(const side of [-1,1])
{
    const hub = mesh('wheelHub', new THREE.CylinderGeometry(0.09,0.09,0.015,8), 'carbon', [0,0,side * 0.156], cylinder)
    hub.rotation.x = Math.PI / 2
    for(let i = 0; i < 5; i++)
    {
        const angle = i * Math.PI * 2 / 5
        rod('rimSpoke', [0.075*Math.cos(angle),0.075*Math.sin(angle),side*0.155], [0.19*Math.cos(angle),0.19*Math.sin(angle),side*0.155],0.022,'metal',cylinder)
    }
}

// Batch fixed decorations by material; keep animated and paintable parts separate.
function batchDecorations(parent, keep)
{
    parent.updateMatrixWorld(true)
    const batches = new Map()
    for(const child of [...parent.children])
    {
        if(!child.isMesh || keep.includes(child.name)) continue
        const geometry = (child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone()).applyMatrix4(child.matrix)
        const batch = batches.get(child.material) ?? []
        batch.push(geometry)
        batches.set(child.material, batch)
        parent.remove(child)
    }
    for(const [material, geometries] of batches)
    {
        const item = new THREE.Mesh(mergeGeometries(geometries), material)
        // VisualVehicle matches animated part names by prefix. Decorative batches
        // must not start with chassis or wheelCylinder, or they replace the rig.
        item.name = `decoration_${parent.name}_${material.name}`
        parent.add(item)
    }
}
batchDecorations(chassis, ['bodyPainted','stopLights','backLights'])
batchDecorations(cylinder, ['wheelPainted'])
model.updateMatrixWorld(true)
// Check the same prefix lookup used by VisualVehicle, not just name presence.
for(const name of ['chassis','bodyPainted','wheelContainer','wheelCylinder','wheelPainted','stopLights','backLights'])
{
    const matches = []
    model.traverse(item => { if(item.name.match(new RegExp(`^${name}`, 'i'))) matches.push(item) })
    if(matches.length !== 1 || matches[0].name !== name)
        throw new Error(`Ambiguous vehicle part ${name}: ${matches.map(item => item.name).join(', ')}`)
}
const bytes = await new GLTFExporter().parseAsync(model, { binary: true, onlyVisible: false })
await fs.writeFile(new URL('../static/vehicle/formula.glb', import.meta.url), Buffer.from(bytes))

// Software-render an isometric contact sheet for geometry QA without a browser.
model.remove(wheel)
for(const x of [-0.9,0.9]) for(const z of [-0.75,0.75])
{
    const copy = wheel.clone(true); copy.position.set(x,-0.6,z); chassis.add(copy)
}
model.updateMatrixWorld(true)
const camera = new THREE.PerspectiveCamera(35, 1.4, 0.1, 100)
camera.position.set(4.7,3.6,5.3); camera.lookAt(0,-0.1,0); camera.updateMatrixWorld()
const faces = []
model.traverse(item => {
    if(!item.isMesh) return
    const geometry = item.geometry.index ? item.geometry.toNonIndexed() : item.geometry
    const positions = geometry.attributes.position
    for(let i=0;i<positions.count;i+=3)
    {
        const points = [0,1,2].map(j => new THREE.Vector3().fromBufferAttribute(positions,i+j).applyMatrix4(item.matrixWorld))
        const normal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).normalize()
        if(normal.dot(camera.position.clone().sub(points[0])) <= 0) continue
        const shade = 0.55 + 0.45 * Math.max(0,normal.dot(new THREE.Vector3(0.4,0.8,0.5).normalize()))
        const fill = item.material.color.clone().multiplyScalar(shade).getStyle()
        const projected = points.map(p=>p.clone().project(camera))
        faces.push({ depth: projected.reduce((s,p)=>s+p.z,0)/3, svg:`<polygon points="${projected.map(p=>`${(p.x+1)*600},${(1-p.y)*430}`).join(' ')}" fill="${fill}" stroke="${fill}" stroke-width="0.5"/>` })
    }
})
faces.sort((a,b)=>b.depth-a.depth)
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="860"><rect width="1200" height="860" fill="#d9dce7"/><ellipse cx="600" cy="620" rx="300" ry="70" fill="#b7bbc9"/>${faces.map(f=>f.svg).join('')}<text x="48" y="64" font-family="sans-serif" font-size="30" fill="#252735">ZB / 07 — Formula Driverless</text></svg>`)).png().toFile('/tmp/formula-car-preview.png')
console.log(`Generated formula.glb (${bytes.byteLength} bytes) and /tmp/formula-car-preview.png`)
