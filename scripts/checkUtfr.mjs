import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { build } from 'esbuild'
import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { NodeIO, getBounds } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco from 'draco3dgltf'
const bundle=await build({entryPoints:['sources/Game/World/UtfrExhibit.js'],bundle:true,format:'esm',platform:'node',write:false,
 plugins:[{name:'utfr-harness',setup(b){
  b.onResolve({filter:/\/Game\.js$/},()=>({path:'game',namespace:'stub'}))
  b.onResolve({filter:/\/InteractivePoints\.js$/},()=>({path:'points',namespace:'stub'}))
  b.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:a.path==='game'?'export class Game {static getInstance(){return globalThis.__utfrGame}}':'export class InteractivePoints {static ALIGN_RIGHT=2;static STATE_CONCEALED=5}'}))
 }}]})
const {UtfrExhibit,utfrSites}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))
const labels=[],points=[],mounted=[]
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:s=>({width:s.length*20}),fillText:s=>labels.push(s)})})}
const bytes=await fs.readFile('static/vehicle/formula.glb')
const formula=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')
const template=formula.scene.clone(true)
// Reproduce VisualVehicle moving the original chassis out of the loaded scene.
formula.scene.getObjectByName('chassis').removeFromParent()
assert(!formula.scene.getObjectByName('chassis'))
const game=globalThis.__utfrGame={ticker:{elapsedScaled:0,events:{on(){}}},objects:{add:(visual,physical)=>mounted.push({visual,physical})},
 interactivePoints:{create:(position,label,align,state,callback)=>{const point={position,label,callback};points.push(point);return point}},
 inputs:{interactiveButtons:{addItems(){},removeItems(){}}},player:{position:utfrSites.pit.clone()},modals:{open:name=>game.opened=name}}
const exhibit=new UtfrExhibit(template)
assert(labels.includes('UTFR · DRIVERLESS'))
assert(exhibit.pit.car.children.some(n=>n.name==='chassis')&&exhibit.pit.car.children.filter(n=>n.name==='wheelContainer').length===4,'Display car has chassis plus four wheels')
assert(exhibit.mapping.landmarks.every(mesh=>!mesh.visible));assert(!exhibit.mapping.path.visible)
points.find(p=>p.label==='Run UTFR mapping demo').callback()
game.ticker.elapsedScaled=1.5;exhibit.update()
assert(exhibit.mapping.landmarks.some(m=>m.visible)&&exhibit.mapping.landmarks.some(m=>!m.visible))
const started=exhibit.startedAt
points.find(p=>p.label==='Run UTFR mapping demo').callback();assert.equal(exhibit.startedAt,started,'Repeated action must not restart a running demo')
game.ticker.elapsedScaled=4;exhibit.update()
assert(exhibit.mapping.path.visible);assert(exhibit.mapping.path.geometry.drawRange.count>0&&exhibit.mapping.path.geometry.drawRange.count<exhibit.mapping.path.geometry.index.count)
game.ticker.elapsedScaled=7;exhibit.update()
assert(exhibit.mapping.miniCar.position.z>1,'The miniature car follows the planned route')
game.ticker.elapsedScaled=13.1;exhibit.update()
assert.equal(exhibit.startedAt,null);assert(labels.includes('LAP COMPLETE'))
points.find(p=>p.label==='About UTFR Driverless').callback();assert.equal(game.opened,'utfr-driverless')
exhibit.reset();assert(exhibit.mapping.landmarks.every(m=>!m.visible));assert(!exhibit.mapping.path.visible)
console.log('Passed: real Formula rig reuse after vehicle setup; mapping phases, progressive route, lap, replay guard, overview and reset.')

const models=[exhibit.pit,exhibit.mapping,exhibit.gantry]
const newMeshes=[]
for(const model of models){model.root.updateMatrixWorld(true);model.root.traverse(n=>{if(n.isMesh)newMeshes.push({name:model.root.name+'/'+n.name,box:new THREE.Box3().setFromObject(n)})})}
assert(!new THREE.Box3().setFromObject(exhibit.pit.root).intersectsBox(new THREE.Box3().setFromObject(exhibit.mapping.root)))
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()})
let checked=0
for(const suffix of ['', '-compressed'])
{
 const collisions=[]
 for(const file of ['areas/areas','scenery/scenery','benches/benches','fences/fences','poleLights/poleLights','lanterns/lanterns'])
 {
  const doc=await io.read(`static/${file}${suffix}.glb`)
  if(file==='areas/areas'){
   const areas=doc.getRoot().listScenes()[0].listChildren()
   for(const name of ['cookie','bowling'])assert.equal(areas.find(n=>n.getName()===name).listChildren().length,0,'Replaced legacy area geometry must be pruned')
   const circuit=areas.find(n=>n.getName()==='circuit')
   assert(!circuit.listChildren().some(n=>/^refAirDancers|^Cylinder\.(022|037|039)$/.test(n.getName())))
   for(const name of ['refStart','refStartingLights','refTimer','refPodiumPhysicalFixed.008','refLeaderboard'])assert(circuit.listChildren().some(n=>n.getName()===name),'Preserve race reference '+name)
  }
  doc.getRoot().listScenes()[0].traverse(node=>{
   if(!node.getMesh() && /^(cuboid|tube|ball)/i.test(node.getName()))
   {
    const bounds=new THREE.Box3(new THREE.Vector3(-0.5,-0.5,-0.5),new THREE.Vector3(0.5,0.5,0.5)).applyMatrix4(new THREE.Matrix4().fromArray(node.getWorldMatrix()))
    if(bounds.max.y>0.2)for(const candidate of newMeshes){checked++;if(bounds.intersectsBox(candidate.box))collisions.push(candidate.name+' <> collider '+file+'/'+node.getName())}
   }
   if(!node.getMesh())return
   const b=getBounds(node)
   const bounds=new THREE.Box3(new THREE.Vector3(...b.min),new THREE.Vector3(...b.max))
   const candidates=newMeshes.filter(n=>bounds.intersectsBox(n.box))
   if(!candidates.length)return
   const matrix=new THREE.Matrix4().fromArray(node.getWorldMatrix())
   for(const primitive of node.getMesh().listPrimitives()){
    if(primitive.getMode()!==4)continue
    const pos=primitive.getAttribute('POSITION'),indices=primitive.getIndices()?.getArray()||Array.from({length:pos.getCount()},(_,i)=>i)
    for(let i=0;i<indices.length;i+=3){
     const vertices=[0,1,2].map(j=>new THREE.Vector3().fromArray(pos.getElement(indices[i+j],[])).applyMatrix4(matrix))
     // Ground surfaces are intentional contact beneath the two plinths.
     if(vertices.every(v=>v.y<0.2))continue
     const triangle=new THREE.Triangle(...vertices)
     for(const candidate of candidates){checked++;if(candidate.box.intersectsTriangle(triangle))collisions.push(candidate.name+' <> '+file+'/'+node.getName())}
    }
   }
  })
 }
 assert.deepEqual([...new Set(collisions)],[],`No retained model intersects the new exhibits (${suffix||'uncompressed'})`)
}
console.log(`Passed: ${checked} triangle/box clearance checks against retained scene models in both asset variants; race references preserved.`)

// Instanced foliage uses its visual prototype, so reserve a conservative canopy radius.
for(const [file,radius] of [['birchTrees/birchTreesReferences',3.5],['oakTrees/oakTreesReferences',3.5],['cherryTrees/cherryTreesReferences',3.5],['bushes/bushesReferences',1.5]]){
 const doc=await io.read(`static/${file}.glb`)
 for(const node of doc.getRoot().listScenes()[0].listChildren()){
  const [x,,z]=node.getWorldTranslation()
  for(const model of [exhibit.pit,exhibit.mapping]){
   const bounds=new THREE.Box3().setFromObject(model.root)
   const dx=Math.max(bounds.min.x-x,0,x-bounds.max.x),dz=Math.max(bounds.min.z-z,0,z-bounds.max.z)
   assert(Math.hypot(dx,dz)>radius,`${node.getName()} canopy overlaps ${model.root.name}`)
  }
 }
}
console.log('Passed: conservative foliage clearances around the pit and mapping platforms.')
