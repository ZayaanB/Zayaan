import * as THREE from 'three/webgpu'
import { kit } from './PersonalModels.js'

// Reuse the current Formula car's chassis and wheel geometry; no extra car download.
export function buildUtfrPit(formula)
{
    const k=kit('utfrPit')
    k.box('pitPlatform',[7.2,0.3,5.8],[0,0.15,0],'dark',true)
    for(const x of [-3.25,3.25]) k.box('pitBoundary',[0.06,0.015,5.1],[x,0.31,0],'coral')
    for(const z of [-2.5,2.5]) k.box('pitBoundary',[6.5,0.015,0.06],[0,0.31,z],'white')
    const car=new THREE.Group();car.name='utfrDisplayCar';car.position.set(0,1.425,0);car.scale.setScalar(1.25);k.root.add(car)
    const chassis=formula.getObjectByName('chassis')
    const wheel=formula.getObjectByName('wheelContainer')
    if(!chassis || !wheel) throw new Error('UTFR pit requires the Formula car chassis and wheel rig')
    car.add(chassis.clone(true))
    for(const x of [-0.9,0.9]) for(const z of [-0.82,0.82])
    {
        const copy=wheel.clone(true);copy.position.set(x,-0.5,z);car.add(copy)
    }
    const liveries=[]
    for(const side of [-1,1])
    {
        const label=k.mesh('utfrSidepodLivery',new THREE.PlaneGeometry(0.82,0.22),[-0.55,-0.16,side*0.61],'screen',car)
        if(side<0)label.rotation.y=Math.PI
        liveries.push(label)
    }
    k.colliders.push({shape:'cuboid',parameters:[2.05,0.8,1.36],position:{x:0,y:1.12,z:0}})
    k.box('pitToolCabinet',[0.9,1.3,1.1],[-2.8,0.96,-1.55],'coral',true)
    for(let i=0;i<4;i++) k.box('toolDrawer',[0.73,0.035,0.04],[-2.8,0.5+i*0.28,-0.98],'white')
    const spare=wheel.clone(true);spare.name='pitSpareWheel';spare.position.set(2.8,0.7,-1.8);k.root.add(spare)
    k.box('wheelStand',[0.85,0.12,0.7],[2.8,0.36,-1.8],'teal')
    for(const x of [-2.85,2.85]) k.box('pitSignPost',[0.1,3.3,0.1],[x,1.95,-2.35],'white',true)
    const sign=k.display('utfrPitSign',[6.2,0.85],[0,3.85,-2.35])
    const plaque=k.display('utfrCarPlaque',[2.8,0.65],[0,0.91,2.45])
    const scanner=k.mesh('pitSensorSweep',new THREE.TorusGeometry(1.6,0.025,6,48),[-0.61,2.55,0],'glow')
    scanner.rotation.x=-Math.PI/2
    const sensorPulse=k.sphere('pitSensorPulse',0.07,[0,2.55,0],'glow')
    return {...k,car,sign,plaque,scanner,sensorPulse,liveries}
}

export function mappingPoint(t)
{
    const angle=t*Math.PI*2
    return new THREE.Vector3(Math.cos(angle)*2.15,1.55,Math.sin(angle)*1.25)
}

export function buildUtfrMapping()
{
    const k=kit('utfrMappingTable')
    k.box('mappingPlatform',[6,0.16,4.4],[0,0.08,0],'floor',true)
    k.box('mappingTable',[5.4,0.2,3.5],[0,1.36,0],'dark',true)
    for(const x of [-2.3,2.3]) for(const z of [-1.35,1.35]) k.box('mappingTableLeg',[0.12,1.15,0.12],[x,0.73,z],'white')
    k.box('mappingSurface',[5.2,0.015,3.3],[0,1.47,0],'screen')
    const cones=[],landmarks=[]
    for(let i=0;i<16;i++)
    {
        const point=mappingPoint(i/16)
        for(const side of [-1,1])
        {
            const p=point.clone();const a=i/16*Math.PI*2
            p.x+=Math.cos(a)*side*0.25;p.z+=Math.sin(a)*side*0.25
            const cone=k.mesh('trackCone',new THREE.ConeGeometry(0.07,0.17,6),[p.x,1.56,p.z],side<0?'blue':'amberGlow')
            const landmark=k.mesh('mappedLandmark',new THREE.TorusGeometry(0.1,0.012,4,12),[p.x,1.49,p.z],'glow')
            landmark.rotation.x=-Math.PI/2
            cones.push(cone);landmarks.push(landmark)
        }
    }
    const curve=new THREE.CatmullRomCurve3(Array.from({length:64},(_,i)=>mappingPoint(i/64)),true)
    const path=k.mesh('plannedCorridor',new THREE.TubeGeometry(curve,96,0.022,4,true),[0,0,0],'glow')
    const miniCar=new THREE.Group();miniCar.position.copy(mappingPoint(0));k.root.add(miniCar)
    k.mesh('demoCarBody',new THREE.BoxGeometry(0.28,0.12,0.16),[0,0.06,0],'coral',miniCar)
    k.mesh('demoCarNose',new THREE.BoxGeometry(0.16,0.045,0.12),[0.2,0.02,0],'white',miniCar)
    for(const x of [-0.09,0.09]) for(const z of [-0.11,0.11])
    {
        const tire=k.mesh('demoCarWheel',new THREE.CylinderGeometry(0.06,0.06,0.04,8),[x,0.025,z],'dark',miniCar);tire.rotation.x=Math.PI/2
    }
    const scan=k.mesh('mappingSweep',new THREE.TorusGeometry(0.32,0.012,4,24),[0,0,0],'glow',miniCar);scan.rotation.x=-Math.PI/2
    const uncertainty=k.mesh('localizationEllipse',new THREE.TorusGeometry(0.24,0.012,4,24),[0,0,0],'amberGlow',miniCar);uncertainty.rotation.x=-Math.PI/2
    const sign=k.display('utfrMappingSign',[5.4,0.8],[0,2.95,-1.93])
    const status=k.display('mappingStatus',[3.5,0.5],[0,0.65,2.02])
    return {...k,cones,landmarks,path,miniCar,scan,uncertainty,sign,status}
}

// A fascia on the existing cantilever start structure preserves race clearance.
export function buildUtfrGantry()
{
    const k=kit('utfrGantryFascia')
    for(const x of [-3.4,3.4]) k.box('gantryFasciaBracket',[0.1,0.63,0.1],[x,-0.415,0],'white')
    const sign=k.display('utfrStartGantry',[8.5,1.05],[0,0,0])
    const lightBar=k.box('gantryAccent',[8.5,0.04,0.025],[0,-0.63,0.08],'glow')
    return {...k,sign,lightBar}
}
