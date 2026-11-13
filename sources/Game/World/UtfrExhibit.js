import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { mountExhibit, screenLabel, exhibitPoint } from './PersonalExhibits.js'
import { buildUtfrPit, buildUtfrMapping, buildUtfrGantry, mappingPoint } from './UtfrModels.js'
import { utfrPitSite, utfrMappingSite } from '../../data/exhibits.js'

export const utfrSites={pit:new THREE.Vector3(utfrPitSite.x,utfrPitSite.y,utfrPitSite.z),mapping:new THREE.Vector3(utfrMappingSite.x,utfrMappingSite.y,utfrMappingSite.z),gantry:new THREE.Vector3(-8.58,5.65,-1.58)}

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
        // Keep the circuit's countdown state as the driver, but render only
        // the replacement gantry lamps, not the old light sprite as well.
        this.game.world.areas.circuit.startingLights.mesh.layers.disableAll()
        for(const livery of this.pit.liveries)screenLabel(livery,['UTFR'],'#8e2836','#fff3e5')
        screenLabel(this.pit.sign,['U OF T FORMULA RACING','DRIVERLESS · ENGINEERING PIT'],'#fff3e5','#8e2836')
        screenLabel(this.pit.plaque,['UTFR · FORMULA STYLE','SENSOR EQUIPPED DEMONSTRATOR'])
        screenLabel(this.pit.telemetry,['SENSOR TELEMETRY','EKF-SLAM','15 m planning horizon'])
        screenLabel(this.mapping.sign,['MAPPING & PLANNING','EKF-SLAM · SPLINE CORRIDORS'])
        screenLabel(this.mapping.legend,['SENSE → PLAN → DRIVE'])
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
        this.mapping.corridorEdges.forEach(mesh=>mesh.visible=false)
        this.mapping.sensorRays.visible=false
        this.mapping.phaseLights.forEach(mesh=>mesh.scale.y=0.35)
        this.mapping.miniCar.position.copy(mappingPoint(0))
        this.mapping.miniCar.rotation.y=-Math.PI/2
        screenLabel(this.mapping.status,['AUTONOMY DEMO','RUN MAPPING →'])
    }
    update()
    {
        const time=this.game.ticker.elapsedScaled
        const startingLights=this.game.world.areas.circuit.startingLights
        for(const light of this.gantry.lights)
            light.material=!startingLights.mesh.visible?this.gantry.materials.lampOff:startingLights.mesh.material===startingLights.greenMaterial?this.gantry.materials.glow:this.gantry.materials.lampRed
        if(this.game.player.position.distanceTo(utfrSites.pit)<40)
        {
            const angle=time*0.8
            this.pit.sensorPulse.position.set(-0.61+Math.cos(angle)*1.6,2.55,Math.sin(angle)*1.6)
            this.pit.scanner.scale.setScalar(1+Math.sin(time*1.3)*0.025)
            this.pit.lidar.rotation.y=-time*0.8
            this.pit.fan.rotation.y=-angle
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
        this.mapping.corridorEdges.forEach(mesh=>{
            mesh.visible=t>=3
            mesh.geometry.setDrawRange(0,Math.floor(Math.min(Math.max((t-3)/2,0),1)*mesh.geometry.index.count/24)*24)
        })
        this.mapping.phaseLights.forEach((mesh,i)=>mesh.scale.y=i===phase?1:0.3)
        const progress=t<5?0:Math.min((t-5)/8,1)
        this.mapping.miniCar.position.copy(mappingPoint(progress))
        const angle=progress*Math.PI*2
        this.mapping.miniCar.rotation.y=-Math.atan2(Math.cos(angle)*1.25,-Math.sin(angle)*2.15)
        this.mapping.scan.scale.setScalar(1+(time*0.8%1)*2)
        this.mapping.uncertainty.scale.set(1+Math.sin(time*2)*0.12,0.65,1)
        this.mapping.sensorRays.visible=true
        const rays=this.mapping.sensorRays.geometry.attributes.position
        for(let i=0;i<4;i++)
        {
            const cone=this.mapping.cones[(Math.floor(progress*32)+i*7)%32]
            rays.setXYZ(i*2,this.mapping.miniCar.position.x,1.63,this.mapping.miniCar.position.z)
            rays.setXYZ(i*2+1,cone.position.x,1.63,cone.position.z)
        }
        rays.needsUpdate=true
        if(t>=13)
        {
            this.startedAt=null
            this.mapping.sensorRays.visible=false
            screenLabel(this.mapping.status,['LAP COMPLETE','RUN MAPPING AGAIN →'])
        }
    }
}
