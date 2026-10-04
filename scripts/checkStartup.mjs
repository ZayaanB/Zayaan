import {build} from 'esbuild'
import assert from 'node:assert/strict'
const bundle=await build({
 stdin:{contents:"export {Audio} from './sources/Game/Audio.js'; export {Reveal} from './sources/Game/Reveal.js'; export {Map as WorldMap} from './sources/Game/Map.js'",resolveDir:new URL('..',import.meta.url).pathname},
 bundle:true,format:'esm',platform:'node',write:false,
 plugins:[{name:'startup-harness',setup(b){
  b.onResolve({filter:/\/Game\.js$/},()=>({path:'game',namespace:'stub'}))
  b.onResolve({filter:/^(gsap|howler)$/},a=>({path:a.path,namespace:'stub'}))
  b.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:a.path==='game'?'export class Game {static getInstance(){return globalThis.__startupGame}}':a.path==='gsap'?'export default {to(){},delayedCall(){}}':'export class Howl {} export const Howler={};'}))
 }}]
})
const {Audio,Reveal,WorldMap}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))
const filters=new Set(['intro']), registered=[],opened=[]
const game=globalThis.__startupGame={
 world:{areas:{cookie:{reset(){}},projects:{workshop:{}},lab:{references:{items:new Map([['fire',[{position:{x:1,y:0,z:1}}]]])}}},intro:{hideLabel(){game.labelHidden=true}}},
 dayCycles:{events:{on(){}},intervalEvents:new Map([['night',{inInterval:true}]])},
 view:{focusPoint:{position:{x:0,y:0,z:0},magnet:{active:true},isTracking:false},zoom:{}},
 inputs:{filters},modals:{open:name=>opened.push(name)},
}
const audio=Object.create(Audio.prototype)
audio.game=game;audio.groups=new Map();audio.setPlaylist=()=>{};audio.setOneOffs=()=>{}
audio.register=options=>{registered.push(options);return {...options,play(){}}}
game.audio=audio
const reveal=Object.create(Reveal.prototype)
reveal.game=game;reveal.distance={value:3.5};reveal.sound={play(){}};reveal.step=0
globalThis.location={hash:''}
assert.doesNotThrow(()=>reveal.updateStep(1),'Start must complete with Halo replacing the cookie factory')
assert(audio.initiated)
assert(filters.has('wandering'));assert(!filters.has('intro'))
assert(game.labelHidden);assert(game.view.focusPoint.isTracking);assert.equal(reveal.step,1)
assert(!registered.some(s=>s.group==='ovenFire'))
assert(registered.some(s=>s.group==='campfire'))
// Verify the original map button and M action can open the map after startup.
const handlers={},keys={}
game.domElement={querySelector:()=>({addEventListener:(event,fn)=>handlers[event]=fn})}
game.inputs.addActions=()=>{}
game.inputs.events={on:(name,fn)=>keys[name]=fn}
const map=Object.create(WorldMap.prototype);map.game=game;map.modal={isOpen:false}
map.setTrigger();map.setInputs()
handlers.click();assert.equal(opened.at(-1),'map')
keys.map({active:true});assert.equal(opened.at(-1),'map')
console.log('Passed: real Start/reveal → ambient audio → wandering transition, retained campfire audio, map button and M action.')
// Both map layers must follow day/night changes together.
const makeImage=()=>({classList:{add(){},remove(){}},addEventListener(event,callback){this[event]=callback}})
const base=makeImage(), tint=makeImage()
map.element={querySelector:selector=>selector==='.js-texture'?base:tint}
map.setTexture();map.texture.update()
assert.equal(base.src,tint.src);assert(base.src.includes('map-night'))
game.dayCycles.intervalEvents.get('night').inInterval=false
map.texture.update();assert.equal(base.src,tint.src);assert(base.src.includes('map-day'))
console.log('Passed: pool tint and original map stay synchronized in day and night.')
