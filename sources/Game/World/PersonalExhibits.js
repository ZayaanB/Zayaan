import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InteractivePoints } from '../InteractivePoints.js'
import { buildCourt, buildHealthcare, buildWorkshop, buildContextBridge, buildSkatingRink } from './PersonalModels.js'
import { healthcareSite, workshopSite, contextSite } from '../../data/exhibits.js'

export function mountExhibit(game, model, position, physics = {})
{
    model.root.position.copy(position)
    game.objects.add({ model: model.root }, {
        type: 'fixed', position, colliders: model.colliders, ...physics,
    })
    return model
}

export function screenLabel(mesh, lines, accent = '#87cfb2', background = '#242637')
{
    if(!mesh.userData.label)
    {
        const canvas=document.createElement('canvas')
        canvas.height=384
        // Preserve the label plane's aspect so letters retain their proportions.
        const {width,height}=mesh.geometry.parameters
        canvas.width=Math.round(canvas.height*width/height)
        const map=new THREE.CanvasTexture(canvas)
        map.colorSpace=THREE.SRGBColorSpace
        const material=new THREE.MeshBasicMaterial({map})
        material.userData.prevent=true
        mesh.material=material
        mesh.userData.label={canvas,map}
    }
    const {canvas,map}=mesh.userData.label, c=canvas.getContext('2d')
    c.fillStyle=background; c.fillRect(0,0,canvas.width,canvas.height)
    c.fillStyle=accent; c.fillRect(0,0,canvas.width,10)
    c.textAlign='center'; c.textBaseline='middle'
    const lineHeight=canvas.height/lines.length
    lines.forEach((line,i)=>{
        const weight=i===0?'800':'600'
        let fontSize=lineHeight*(i===0?0.76:0.6)
        c.font=`${weight} ${fontSize}px Nunito, sans-serif`
        const maxWidth=canvas.width*0.9
        const measured=c.measureText(line).width
        if(measured>maxWidth) fontSize*=maxWidth/measured
        c.font=`${weight} ${fontSize}px Nunito, sans-serif`
        c.fillStyle=i===0?accent:'#fff3e5'
        c.fillText(line,canvas.width/2,(i+0.5)*lineHeight)
    })
    map.needsUpdate=true
}

export function exhibitPoint(game, position, label, callback)
{
    return game.interactivePoints.create(position,label,InteractivePoints.ALIGN_RIGHT,InteractivePoints.STATE_CONCEALED,callback,
        ()=>game.inputs.interactiveButtons.addItems(['interact']),
        ()=>game.inputs.interactiveButtons.removeItems(['interact']),
        ()=>game.inputs.interactiveButtons.removeItems(['interact']))
}

export class TableTennisArea
{
    constructor()
    {
        this.game=Game.getInstance()
        this.origin=new THREE.Vector3(14,0,68)
        this.model=mountExhibit(this.game,buildCourt(),this.origin)
        this.points=0; this.startedAt=null
        this.game.respawns.getByName('bowling').position.set(14,4,74)
        this.score()
        this.model.trail.forEach(m=>m.visible=false)
        const at=(x,y,z)=>this.origin.clone().add(new THREE.Vector3(x,y,z))
        exhibitPoint(this.game,at(0,1.5,3.9),'Play Ref.AI rally',()=>{
            if(this.startedAt!==null) return
            this.startedAt=this.game.ticker.elapsedScaled
            screenLabel(this.model.score,['REF.AI','Tracking rally…','Computer vision demo'])
        })
        exhibitPoint(this.game,at(4.3,1.5,0.8),'About Ref.AI',()=>this.game.modals.open('ref-ai'))
        this.game.ticker.events.on('tick',()=>this.update(),10)
    }
    score()
    {
        screenLabel(this.model.score,['REF.AI',`POINTS  ${this.points} : 0`,'Play a tracked rally'])
    }
    restart()
    {
        this.startedAt=null
        this.points=0
        this.model.ball.position.set(0,2.25,2.5)
        this.model.trail.forEach(mesh=>mesh.visible=false)
        this.model.paddles.forEach(paddle=>{paddle.position.x=0;paddle.rotation.z=0})
        this.score()
    }
    update()
    {
        if(this.game.player.position.distanceTo(this.origin)<14) this.game.achievements.setProgress('areas','bowling')
        if(this.startedAt===null) return
        const t=this.game.ticker.elapsedScaled-this.startedAt
        const position=(time)=>{
            const phase=time*2.1
            return new THREE.Vector3(Math.sin(phase*0.7)*0.75,1.78+Math.abs(Math.sin(phase))*0.85,Math.cos(phase)*2.48)
        }
        this.model.ball.position.copy(position(t))
        this.model.trail.forEach((mesh,i)=>{mesh.visible=true;mesh.position.copy(position(Math.max(0,t-i*0.035)))})
        this.model.paddles.forEach((p,i)=>{p.position.x=Math.sin(t*1.47+(i?0:Math.PI))*0.75;p.rotation.z=Math.sin(t*2.1)*0.16})
        if(t>=6)
        {
            this.startedAt=null; this.points++
            this.model.trail.forEach(m=>m.visible=false)
            screenLabel(this.model.score,['REF.AI',`POINTS  ${this.points} : 0`,'Point detected · rally complete'])
            this.game.achievements.setProgress('strike',1)
            this.game.world.confetti?.pop(this.origin.clone().add(new THREE.Vector3(0,2,0)))
        }
    }
}

export class HealthcareExhibit
{
    constructor(factoryModel)
    {
        this.game=Game.getInstance()
        // The factory's original children are never mounted, so its machinery,
        // colliders and cookie interactions cannot obstruct the new pavilion.
        this.origin=new THREE.Vector3(factoryModel?.position.x ?? healthcareSite.x,0,
            (factoryModel?.position.z ?? healthcareSite.z + 3.25)-3.25)
        this.model=mountExhibit(this.game,buildHealthcare(),this.origin)
        this.startedAt=null; this.model.scan.visible=false
        screenLabel(this.model.sign,['HALO HEALTHCARE','Clinical AI project'])
        screenLabel(this.model.monitor,['HALO','Ready to scan','Fictional demonstration'])
        screenLabel(this.model.records,['CLINICAL ASSISTANT','Python · OpenCV · SQL'])
        const entry=this.origin.clone().add(new THREE.Vector3(-1,4,5))
        const respawn={name:'healthcare',position:entry,rotation:Math.PI}
        this.game.respawns.items.set('healthcare',respawn)
        this.game.respawns.items.set('cookie',{...respawn,name:'cookie'})
        const at=(x,y,z)=>this.origin.clone().add(new THREE.Vector3(x,y,z))
        exhibitPoint(this.game,at(-1,1.5,3.5),'Run Halo scan',()=>{
            if(this.startedAt!==null) return
            this.startedAt=this.game.ticker.elapsedScaled
            this.model.scan.visible=true
            screenLabel(this.model.monitor,['HALO','Scanning…','Fictional demonstration'])
        })
        exhibitPoint(this.game,at(3.7,1.5,2.1),'About Halo Healthcare',()=>this.game.modals.open('halo-healthcare'))
        this.game.ticker.events.on('tick',()=>{
            if(this.game.player.position.distanceTo(this.origin)<12) this.game.achievements.setProgress('areas','cookie')
            if(this.startedAt===null) return
            const t=this.game.ticker.elapsedScaled-this.startedAt
            this.model.scan.position.z=-1.45+((t%2)/2)*2.55
            if(t>=6)
            {
                this.startedAt=null;this.model.scan.visible=false
                screenLabel(this.model.monitor,['HALO','Scan complete','Explore the project →'])
                this.game.achievements.addProgress('cookie')
            }
        },10)
    }
    reset()
    {
        this.startedAt=null
        this.model.scan.visible=false
        this.model.scan.position.z=-1.45
        screenLabel(this.model.monitor,['HALO','Ready to scan','Fictional demonstration'])
    }
}

export function setupWorkshop(area)
{
    const game=area.game
    // Disable the complete old props (including colliders), not just their meshes.
    for(const object of area.objects.items)
    {
        const name=object.visual?.object3D.name??''
        if(/oven|blower|anvil|grinder|quench|cube\.024|cube\.065/i.test(name)) game.objects.disable(object)
    }
    const origin=new THREE.Vector3(workshopSite.x,workshopSite.y,workshopSite.z)
    const model=mountExhibit(game,buildWorkshop(),origin)
    screenLabel(model.sign,['COMPUTING','WORKSHOP'])
    screenLabel(model.terminal,['KV STORE','16 SHARDS'])
    screenLabel(model.chats[0],['SOURCE','CHAT'])
    screenLabel(model.chats[1],['SHARED','CHAT'])
    let startedAt=null, previousTitle=null, selectedTitle=null, previousProjectTitle=null
    const start=()=>{startedAt=game.ticker.elapsedScaled}
    game.respawns.items.set('workshop',{name:'workshop',position:new THREE.Vector3(workshopSite.x,4,workshopSite.z+4.8),rotation:Math.PI})
    exhibitPoint(game,origin.clone().add(new THREE.Vector3(0,1.5,3.3)),'Explore the workshop',()=>{start();game.modals.open('computing-workshop')})
    exhibitPoint(game,origin.clone().add(new THREE.Vector3(-3.2,1.5,0.8)),'KV Store data flow',()=>{selectedTitle='Embedded Key-Value Store';start()})
    exhibitPoint(game,origin.clone().add(new THREE.Vector3(3.2,1.5,0.8)),'Context Sync data flow',()=>{selectedTitle='Context Sync Extension';start()})
    area.workshop={model,update:()=>{
        const projectTitle=area.navigation?.current?.title
        if(projectTitle!==previousProjectTitle)
        {
            previousProjectTitle=projectTitle
            selectedTitle=projectTitle
        }
        const title=selectedTitle
        if(title!==previousTitle)
        {
            previousTitle=title; start()
            screenLabel(model.terminal,title==='Context Sync Extension'?['CONTEXT SYNC','750+ DOWNLOADS']:['KV STORE','16 SHARDS','DURABLE WRITES'])
        }
        const nearby=game.player.position.distanceTo(origin)<22
        if(!nearby) return
        const time=game.ticker.elapsedScaled
        model.fans.forEach(f=>f.rotation.z=time*2)
        const active=startedAt!==null&&time-startedAt<8
        model.indicators.forEach((m,i)=>m.visible=!active||Math.sin(time*4+i)>-0.4)
        const sync=title==='Context Sync Extension'
        model.packets.forEach((m,i)=>{
            m.visible=active
            const t=((time-startedAt)*0.3+i/6)%1
            if(sync) m.position.set(-0.9+t*1.8,2.95+Math.sin(t*Math.PI)*0.35,-0.4)
            else m.position.set(-t*1.2,1.8+Math.sin(t*Math.PI)*0.6,0.5-t*2.05)
        })
    }}
    game.ticker.events.on('tick',()=>area.workshop.update(),10)
}


export class ContextSyncExhibit
{
    constructor()
    {
        this.game=Game.getInstance()
        this.origin=new THREE.Vector3(contextSite.x,contextSite.y,contextSite.z)
        this.model=mountExhibit(this.game,buildContextBridge(),this.origin)
        this.startedAt=null
        screenLabel(this.model.sign,['CONTEXT SYNC','CONTEXT BRIDGE'])
        this.game.respawns.items.set('contextsync',{name:'contextsync',position:new THREE.Vector3(contextSite.x,4,contextSite.z+5),rotation:Math.PI})
        exhibitPoint(this.game,this.origin.clone().add(new THREE.Vector3(0,1.5,3.4)),'Sync context',()=>{
            if(this.startedAt!==null) return
            this.reset()
            this.startedAt=this.game.ticker.elapsedScaled
        })
        this.reset()
        this.game.ticker.events.on('tick',()=>this.update(),10)
    }
    reset()
    {
        this.startedAt=null
        screenLabel(this.model.terminals[0],['SOURCE','VS CODE'])
        screenLabel(this.model.terminals[1],['TARGET','READY'])
        this.model.memory.scale.setScalar(1)
        this.model.cards.forEach((card,i)=>{card.position.set(-2.35,1.5+i*0.09,0.4);card.scale.setScalar(1);card.visible=false})
    }
    update()
    {
        if(this.startedAt===null) return
        const t=this.game.ticker.elapsedScaled-this.startedAt
        this.model.memory.rotation.y=t*0.8
        if(t<3)
        {
            this.model.cards.forEach((card,i)=>{
                const progress=THREE.MathUtils.clamp((t-i*0.22)/1.7,0,1)
                card.position.set(-2.35*(1-progress),1.5+Math.sin(progress*Math.PI)*0.5,0.4)
                card.visible=progress<1
            })
            this.model.memory.scale.setScalar(1+Math.min(t,2)*0.3)
        }
        else if(t<5)
        {
            this.model.cards.forEach(card=>card.visible=false)
            this.model.memory.scale.setScalar(1.6-(t-3)*0.5)
        }
        else if(t<8)
        {
            this.model.cards.forEach((card,i)=>{
                const progress=THREE.MathUtils.clamp((t-5-i*0.2)/1.6,0,1)
                card.visible=true
                card.position.set(2.35*progress,1.5+i*0.09*progress+Math.sin(progress*Math.PI)*0.4,0.4)
                card.scale.setScalar(0.5+progress*0.5)
            })
        }
        else
        {
            this.startedAt=null
            this.model.cards.forEach((card,i)=>{card.visible=false;card.scale.setScalar(1);card.position.set(2.35,1.5+i*0.09,0.4)})
            screenLabel(this.model.terminals[1],['TARGET','SYNCED'])
        }
    }
}


export class SkatingRink
{
    constructor()
    {
        this.game=Game.getInstance()
        this.origin=new THREE.Vector3(11,-0.04,-1)
        this.model=mountExhibit(this.game,buildSkatingRink(),this.origin,{friction:0.02,frictionRule:'min'})
        screenLabel(this.model.sign,['SKATING','RINK'],'#fff3df','#87543b')
    }
}
