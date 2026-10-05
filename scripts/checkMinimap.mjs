import assert from 'node:assert/strict'
import {Minimap} from '../sources/Game/Minimap.js'

function element(){return {style:{},handlers:{},attributes:{},children:[],classList:{toggle(){},add(){}},addEventListener(name,fn){this.handlers[name]=fn},setAttribute(name,value){this.attributes[name]=value},append(child){this.children.push(child)}}}
globalThis.document={createElement:element}
for(const mobile of [false,true]){
 globalThis.window={matchMedia:()=>({matches:mobile})}
 const elements=Object.fromEntries(['toggle','panel','player','texture','pool','landmarks','expand'].map(name=>[name,element()]))
 const root=element();root.querySelector=selector=>elements[selector.replace('.js-minimap-','')]
 const ticks=[],opened=[]
 const game={domElement:{querySelector:()=>root},terrain:{size:192},respawns:{getByName:name=>name==='sentinel'?{position:{x:3,z:70.9}}:null},
  player:{position:{x:0,z:0}},physicalVehicle:{yRotation:0},dayCycles:{intervalEvents:new Map([['night',{inInterval:false}]])},ticker:{events:{on:(name,fn)=>ticks.push(fn)}},modals:{open:name=>opened.push(name)}}
 const map={game,worldToMap:p=>({x:Math.max(0,Math.min(1,p.x/192+0.5)),y:Math.max(0,Math.min(1,p.z/192+0.5))})}
 const minimap=new Minimap(map,[{name:'ZB Robot',respawnName:'sentinel'},{name:'missing',respawnName:'missing'}])
 assert.equal(minimap.opened,!mobile);assert.equal(elements.panel.hidden,mobile)
 assert.equal(elements.toggle.attributes['aria-expanded'],String(!mobile))
 assert.equal(elements.landmarks.children.length,1)
 assert.equal(elements.landmarks.children[0].title,'ZB Robot')
 if(mobile)elements.toggle.handlers.click()
 assert.equal(elements.player.style.left,'50%');assert.equal(elements.player.style.top,'50%')
 game.player.position={x:48,z:-48};game.physicalVehicle.yRotation=Math.PI/2;ticks[0]()
 assert.equal(elements.player.style.left,'75%');assert.equal(elements.player.style.top,'25%')
 assert(elements.player.style.transform.includes(String(-Math.PI/2)))
 game.physicalVehicle.yRotation=0.75;ticks[0]()
 assert(elements.player.style.transform.includes('-0.75'),'Heading updates even without movement')
 game.dayCycles.intervalEvents.get('night').inInterval=true;ticks[0]()
 assert.equal(elements.texture.src,elements.pool.src);assert(elements.texture.src.includes('map-night'))
 elements.expand.handlers.click();assert.equal(opened.at(-1),'map')
 elements.toggle.handlers.click();assert.equal(elements.panel.hidden,true)
 game.player.position.x=0;ticks[0]();assert.equal(elements.player.style.left,'75%','Collapsed map stops updating')
 elements.toggle.handlers.click();assert.equal(elements.player.style.left,'50%','Reopening refreshes position immediately')
 assert.equal(ticks.length,1,'Toggling never duplicates tick listeners')
}
console.log('Passed: desktop/mobile defaults, accessible toggle, live position/heading, day/night layers, robot marker, collapse/reopen and full-map action.')
