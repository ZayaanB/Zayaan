import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { mountExhibit, screenLabel, exhibitPoint } from './PersonalExhibits.js'
import { buildUtfrPit, buildUtfrMapping, buildUtfrGantry, mappingPoint } from './UtfrModels.js'

export const utfrSites={pit:new THREE.Vector3(-26,0,-1),mapping:new THREE.Vector3(-27,0,10),gantry:new THREE.Vector3(-8.58,5.65,-1.58)}

export class UtfrExhibit
{
    constructor(formulaTemplate)
    {
        this.game=Game.getInstance()
        this.pit=mountExhibit(this.game,buildUtfrPit(formulaTemplate),utfrSites.pit)
        this.mapping=mountExhibit(this.game,buildUtfrMapping(),utfrSites.mapping)
        this.gantry=buildUtfrGantry()
        this.gantry.root.position.copy(utfrSites.gantry)
        this.game.objects.add({model:this.gantry.root})
        for(const livery of this.pit.liveries)screenLabel(livery,['UTFR'],'#8e2836','#fff3e5')
        screenLabel(this.pit.sign,['U OF T FORMULA RACING','DRIVERLESS · ENGINEERING PIT'],'#fff3e5','#8e2836')
        screenLabel(this.pit.plaque,['UTFR · FORMULA STYLE','SENSOR EQUIPPED DEMONSTRATOR'])
        screenLabel(this.mapping.sign,['MAPPING & PLANNING','EKF-SLAM · SPLINE CORRIDORS'])
        screenLabel(this.gantry.sign,['UTFR · DRIVERLESS','U OF T FORMULA RACING'],'#fff3e5','#8e2836')
        this.reset()
        exhibitPoint(this.game,utfrSites.mapping.clone().add(new THREE.Vector3(0,1.5,3.15)),'Run UTFR mapping demo',()=>{
            if(this.startedAt!==null) return
            this.startedAt=this.game.ticker.elapsedScaled
            this.phase=null
        })
        exhibitPoint(this.game,utfrSites.pit.clone().add(new THREE.Vector3(0,1.5,3.7)),'About UTFR Driverless',()=>this.game.modals.open('utfr-driverless'))
        this.game.ticker.events.on('tick',()=>this.update(),10)
    }
    reset()
    {
        this.startedAt=null;this.phase=null
        this.mapping.landmarks.forEach(mesh=>mesh.visible=false)
        this.mapping.path.visible=false
        this.mapping.miniCar.position.copy(mappingPoint(0))
        this.mapping.miniCar.rotation.y=-Math.PI/2
        screenLabel(this.mapping.status,['AUTONOMY DEMO','RUN MAPPING →'])
    }
    update()
    {
        const time=this.game.ticker.elapsedScaled
        if(this.game.player.position.distanceTo(utfrSites.pit)<40)
        {
            const angle=time*0.8
            this.pit.sensorPulse.position.set(-0.61+Math.cos(angle)*1.6,2.55,Math.sin(angle)*1.6)
            this.pit.scanner.scale.setScalar(1+Math.sin(time*1.3)*0.025)
        }
        if(this.startedAt===null) return
        const t=time-this.startedAt
        const phase=t<3?0:t<5?1:2
        if(phase!==this.phase)
        {
            this.phase=phase
            screenLabel(this.mapping.status,[['SENSE','MAPPING CONE LANDMARKS'],['PLAN','BUILDING SPLINE CORRIDOR'],['DRIVE','FOLLOWING PLANNED ROUTE']][phase])
        }
        this.mapping.landmarks.forEach((mesh,i)=>mesh.visible=t>i/32*3)
        this.mapping.path.visible=t>=3
        // Reveal the planned route progressively rather than popping in a full loop.
        const count=this.mapping.path.geometry.index.count
        this.mapping.path.geometry.setDrawRange(0,Math.floor(Math.min(Math.max((t-3)/2,0),1)*count/24)*24)
        const progress=t<5?0:Math.min((t-5)/8,1)
        this.mapping.miniCar.position.copy(mappingPoint(progress))
        const angle=progress*Math.PI*2
        this.mapping.miniCar.rotation.y=-Math.atan2(Math.cos(angle)*1.25,-Math.sin(angle)*2.15)
        this.mapping.scan.scale.setScalar(1+(time*0.8%1)*2)
        this.mapping.uncertainty.scale.set(1+Math.sin(time*2)*0.12,0.65,1)
        if(t>=13)
        {
            this.startedAt=null
            screenLabel(this.mapping.status,['LAP COMPLETE','RUN MAPPING AGAIN →'])
        }
    }
}
