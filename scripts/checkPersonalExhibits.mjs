import { build } from 'esbuild'
import assert from 'node:assert/strict'
import {experienceCard} from '../sources/Game/World/ExperienceCards.js'
import experiences from '../sources/data/lab.js'
const result = await build({
 entryPoints:[new URL('../sources/Game/World/PersonalExhibits.js', import.meta.url).pathname],bundle:true,format:'esm',platform:'node',write:false,
 plugins:[{name:'game-harness',setup(b){
  b.onResolve({filter:/\/Game\.js$/},()=>({path:'game',namespace:'stub'}))
  b.onResolve({filter:/\/InteractivePoints\.js$/},()=>({path:'points',namespace:'stub'}))
  b.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:a.path==='game'?'export class Game { static getInstance() { return globalThis.__exhibitGame } }':'export class InteractivePoints { static ALIGN_RIGHT=2; static STATE_CONCEALED=5 }'}))
 }}]
})
const api=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))
const THREE=await import('three/webgpu')
const labels=[]
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},drawImage(){},measureText(s){return {width:s.length*32}},fillText(s){labels.push(s)}})})}
const points=[],updates=[],progress=[],opened=[],mounted=[],disabled=[]
const spawns=new Map([['bowling',{position:new THREE.Vector3()}]])
const game=globalThis.__exhibitGame={
 ticker:{elapsedScaled:0,events:{on:(name,callback)=>updates.push(callback)}},
 objects:{add:(visual,physics)=>{mounted.push({visual,physics});return {}},disable:o=>disabled.push(o)},
 interactivePoints:{create:(position,label,align,state,callback)=>{const p={position,label,callback};points.push(p);return p}},
 inputs:{interactiveButtons:{addItems(){},removeItems(){}}},
 respawns:{items:spawns,getByName:name=>spawns.get(name)},
 player:{position:new THREE.Vector3(14,0,68)},
 achievements:{setProgress:(...args)=>progress.push(args),addProgress:(name)=>progress.push([name,'increment'])},
 modals:{open:name=>opened.push(name)},world:{confetti:{pop(){}}},
}
const court=new api.TableTennisArea()
assert.deepEqual(spawns.get('bowling').position.toArray(),[14,4,74])
points.find(p=>p.label==='Play Ref.AI rally').callback()
game.ticker.elapsedScaled=3;court.update()
assert(court.model.trail.every(m=>m.visible))
game.ticker.elapsedScaled=6.1;court.update()
assert.equal(court.points,1);assert.equal(court.startedAt,null)
assert(progress.some(p=>p[0]==='strike'&&p[1]===1))
assert(court.model.trail.every(m=>!m.visible))
court.update();assert.equal(court.points,1)
points.find(p=>p.label==='About Ref.AI').callback();assert.equal(opened.at(-1),'ref-ai')
const halo=new api.HealthcareExhibit({position:new THREE.Vector3(12.2511625289917,3.27,35.2508544921875)})
assert.equal(halo.origin.x,12.2511625289917)
assert.equal(halo.origin.z,32.0008544921875)
assert(spawns.has('healthcare'))
assert(spawns.has('cookie'))
assert.deepEqual(spawns.get('healthcare').position.toArray(),spawns.get('cookie').position.toArray())
assert.equal(spawns.get('healthcare').position.z,halo.origin.z+5)
points.find(p=>p.label==='Run Halo scan').callback()
assert(halo.model.scan.visible)
game.ticker.elapsedScaled=8;updates.at(-1)();assert(halo.model.scan.visible)
game.ticker.elapsedScaled=13;updates.at(-1)();assert(!halo.model.scan.visible);assert(labels.includes('Scan complete'))
points.find(p=>p.label==='About Halo Healthcare').callback();assert.equal(opened.at(-1),'halo-healthcare')
const oven={visual:{object3D:{name:'refOven'}}}, display={visual:{object3D:{name:'refImages'}}}
const area={constructor:{STATE_CLOSED:5},state:5,game,objects:{items:[oven,display],hideable:[]},model:{position:new THREE.Vector3(35.76,3.27,13.4)},navigation:{current:{title:'Embedded Key-Value Store'}}}
api.setupWorkshop(area)
assert(disabled.includes(oven));assert(!disabled.includes(display))
game.player.position.set(-60,0,-40);area.workshop.update();assert(area.workshop.model.packets.every(m=>m.visible))
area.navigation.current.title='Context Sync Extension';area.workshop.update();assert(!labels.includes('750+ DOWNLOADS'),'KV Store must stay independent of the project carousel')
game.ticker.elapsedScaled=23;area.workshop.update();assert(area.workshop.model.packets.every(m=>m.visible),'Idle data flow stays visible')
points.find(p=>p.label==='Explore the workshop').callback();assert.equal(opened.at(-1),'computing-workshop')
assert(spawns.has('workshop'))
assert(area.workshop.model.root.position.distanceTo(area.model.position)>90,'Computing props must be far from Projects')
area.workshop.model.root.updateMatrixWorld(true)
for(const rack of area.workshop.model.racks) {
 const bounds=new THREE.Box3().setFromObject(rack)
 assert(bounds.max.x < -55,'Racks belong in the race infield, not at Projects')
}
points.find(p=>p.label==='KV Store data flow').callback();area.workshop.update()
assert(!points.some(p=>p.label==='Context Sync data flow'),'No Context Sync button on KV Store')
for(const plane of [halo.model.sign,halo.model.monitor,halo.model.records]) {
 const {canvas}=plane.userData.label
 assert(Math.abs(canvas.width/canvas.height-plane.geometry.parameters.width/plane.geometry.parameters.height)<0.003,'Sign textures must preserve physical aspect ratio')
}
assert(progress.some(p=>p[0]==='cookie'&&p[1]==='increment'))
court.restart();assert.equal(court.points,0);assert.equal(court.startedAt,null)
assert(court.model.trail.every(m=>!m.visible))
points.find(p=>p.label==='Run Halo scan').callback();assert(halo.model.scan.visible)
halo.reset();assert.equal(halo.startedAt,null);assert(!halo.model.scan.visible)
for(const {physics} of mounted) assert(physics.colliders.length>0)
for(const [company,title] of [['FreshBooks','Software Developer Intern (Full Stack)'],['FlyRank AI','Software Engineer Intern (Backend AI)'],['KorraNet Creative','Software Developer Intern (Full Stack)']]) {
 const project=experiences.find(p=>p.title===company)
 assert.equal(project.subtitle,title)
 for(const size of [960,480]) {
  const source=new THREE.Texture({width:size,height:size*540/960})
  const card=experienceCard(source,project)
  assert.equal(card.image.width,960);assert.equal(card.image.height,540)
  assert(labels.includes(project.role));assert(labels.includes(`(${project.specialization})`));assert(labels.includes(project.dates))
 }
}
console.log('Passed: rally / point award / replay guard, scan completion, overview actions, factory replacement and scan achievements, map spawns, forge removal, carousel animations, unobstructed project view, idle cleanup, solid colliders.')

const bridge=new api.ContextSyncExhibit()
assert.deepEqual(spawns.get('contextsync').position.toArray(),[70,4,-65])
assert(bridge.origin.distanceTo(area.workshop.model.root.position)>100)
assert.equal(area.workshop.model.terminal.geometry.parameters.height,0.75)
assert.equal(area.workshop.model.sign.geometry.parameters.height,0.65)
for(const label of [area.workshop.model.sign,area.workshop.model.terminal,...area.workshop.model.chats]) {
 assert.equal(label.parent.rotation.x,0);assert.equal(label.parent.rotation.y,0)
}
points.find(p=>p.label==='About Context Sync').callback();assert.equal(opened.at(-1),'context-sync')
const sentinel=new api.SentinelExhibit()
assert.deepEqual(spawns.get('sentinel').position.toArray(),[-7,4,70.9])
const syncPoint=points.find(p=>p.label==='Sync context')
game.ticker.elapsedScaled=30;syncPoint.callback()
game.ticker.elapsedScaled=32;bridge.update()
assert(bridge.model.cards.some(card=>!card.visible))
game.ticker.elapsedScaled=34;bridge.update()
assert(bridge.model.cards.every(card=>!card.visible))
game.ticker.elapsedScaled=37;bridge.update()
assert(bridge.model.cards.every(card=>card.visible))
game.ticker.elapsedScaled=39;bridge.update()
assert.equal(bridge.startedAt,null)
assert(labels.includes('SYNCED'))
assert(bridge.model.cards.every(card=>card.position.x===2.35))
syncPoint.callback();assert(bridge.model.cards.every(card=>card.position.x===-2.35))
bridge.reset();assert.equal(bridge.startedAt,null)
console.log('Passed: standalone northeastern Context Bridge spawn, gather/compress/share animation, replay and reset, original-size upright workshop screens.')

assert.equal(bridge.model.terminals[0].parent.rotation.x,0)
assert.equal(bridge.model.terminals[0].parent.rotation.y,0)
assert.equal(bridge.model.terminals[0].geometry.parameters.width,1.35)
const {contextFoliageReferences}=await import('../sources/data/exhibits.js')
const refs=[{name:'Icosphere.115'},{name:'Icosphere.116'},{name:'treeBody.028'},{name:'treeBody.027'}]
assert.deepEqual(contextFoliageReferences(refs,'bush'),[refs[2],refs[3]])
assert.deepEqual(contextFoliageReferences(refs,'birch'),[refs[0],refs[1],refs[3]])
assert.deepEqual(contextFoliageReferences(refs,'oak'),refs)
console.log('Passed: smaller upright Context Sync screens; exactly two bushes and one birch excluded, all other foliage retained.')

// Exercise the exact node-name conversion performed by GLTFLoader.
const {PropertyBinding}=await import('three')
const fs=await import('node:fs')
for(const [type,kind] of [['bushes','bush'],['birchTrees','birch']]) for(const suffix of ['', '-compressed']) {
 const bytes=fs.readFileSync(new URL(`../static/${type}/${type}References${suffix}.glb`,import.meta.url))
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString())
 const loadedRefs=gltf.nodes.map(n=>({name:PropertyBinding.sanitizeNodeName(n.name||'')}))
 assert.equal(loadedRefs.length-contextFoliageReferences(loadedRefs,kind).length,kind==='bush'?2:1)
}
console.log('Passed: exactly two bushes and one birch removed using actual GLTFLoader names, in both asset variants.')

assert(bridge.model.cards.every(card=>!card.visible),'No parked stack obscures the terminal')

const rink=new api.SkatingRink()
assert.deepEqual(rink.origin.toArray(),[11,-0.04,-1])
assert.equal(rink.model.colliders[0].shape,'hull')
assert.equal(rink.model.colliders[0].friction,0.02)
assert.equal(rink.model.ice.scale.x,8)
assert.equal(rink.model.ice.scale.z,6.5)
assert(rink.model.root.children.filter(n=>n.name==='rinkBoard').length===38)
console.log('Passed: Career pond rink location, oval ice collider, low friction and open entrance.')

assert.equal(mounted.at(-1).physics.frictionRule,'min')

const walls=rink.model.root.children.filter(n=>n.name==='rinkBoard')
assert(walls.every(w=>w.geometry.parameters.height===1.15))
assert.equal(rink.model.colliders.filter(c=>c.shape==='cuboid').length,38)
for(const wall of walls) {
 const collider=rink.model.colliders.find(c=>c.position?.x===wall.position.x&&c.position?.z===wall.position.z)
 assert(collider)
 assert(Math.abs(collider.quaternion.y-new THREE.Quaternion().setFromEuler(wall.rotation).y)<1e-8)
}
const {rinkFoliageReferences}=await import('../sources/data/exhibits.js')
assert.deepEqual(rinkFoliageReferences([{name:'Icosphere069'},{name:'Icosphere070'}]),[{name:'Icosphere069'}])
console.log('Passed: every raised rink board has a matching rotated collider; only the sign-side bush is excluded.')

for(const [type,kind,count] of [['bushes','bush',3],['cherryTrees','cherry',1]]) for(const suffix of ['', '-compressed']) {
 const bytes=fs.readFileSync(new URL(`../static/${type}/${type}References${suffix}.glb`,import.meta.url))
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString())
 const refs=gltf.nodes.map(n=>({name:PropertyBinding.sanitizeNodeName(n.name||'')}))
 assert.equal(refs.length-rinkFoliageReferences(refs,kind).length,count)
}
console.log('Passed: exactly two additional rink bushes and one cherry tree excluded in both asset variants.')

assert(!walls.some(w=>w.position.x>7.6&&Math.abs(w.position.z)<2),'Career-side entrance must have no wall or matching collider')
