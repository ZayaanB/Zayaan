// Reversible cleanup: original assets are backed up outside Vite's public directory.
import { NodeIO, VertexLayout } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { prune, draco as compressDraco } from '@gltf-transform/functions'
import draco from 'draco3dgltf'
import * as THREE from 'three'
import fs from 'node:fs/promises'
import path from 'node:path'

const root=new URL('../',import.meta.url).pathname
const backup=path.join(root,'scripts/_asset_backup/legacy-models')
await fs.mkdir(backup,{recursive:true})
const io=new NodeIO().setVertexLayout(VertexLayout.SEPARATE).registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder':await draco.createDecoderModule(),
    'draco3d.encoder':await draco.createEncoderModule(),
})
const boxes=[
    {min:[-30.5,-11],max:[-18,-4.7]}, // Three old circular sponsor signs and their stands.
    {min:[-30.5,7],max:[-23.9,13]},
    {min:[-28.3,12.2],max:[-26.4,16.2]}, // Bench blocking the mapping table's approach.
    {min:[-28.5,-1.2],max:[-27.1,0.2]}, // Inflatable dancer bases and posts.
    {min:[-2.5,15],max:[-0.8,16.6]},
]
const inside=(x,z)=>boxes.some(b=>x>=b.min[0]&&x<=b.max[0]&&z>=b.min[1]&&z<=b.max[1])
const disposeTree=node=>{const nodes=[];node.traverse(n=>nodes.push(n));nodes.reverse().forEach(n=>n.dispose())}
const report={packed:[],archived:[]}
for(const suffix of ['', '-compressed'])
{
    const relative=`areas/areas${suffix}.glb`
    const target=path.join(root,'static',relative),saved=path.join(backup,path.basename(target))
    try{await fs.copyFile(target,saved,fs.constants.COPYFILE_EXCL)}catch(e){if(e.code!=='EEXIST')throw e}
    // Read the saved source to make cleanup reproducible and avoid accumulated quantization.
    const doc=await io.read(saved)
    const removed=[]
    for(const area of doc.getRoot().listScenes()[0].listChildren())
    {
        if(['cookie','bowling'].includes(area.getName()))
        {
            for(const node of [...area.listChildren()]){removed.push(`${area.getName()}/${node.getName()}`);disposeTree(node)}
        }
        if(area.getName()==='projects')
        {
            for(const node of [...area.listChildren()])if(/oven|blower|anvil|grinder|quench|cube\.024|cube\.065/i.test(node.getName()))
            {removed.push(`projects/${node.getName()}`);disposeTree(node)}
        }
        if(area.getName()==='circuit')
        {
            for(const node of [...area.listChildren()])
            {
                if(/^refAirDancers|^Cylinder\.(022|037|039)$|^refObjectsPhysicalDynamic\.(00[89]|01[0-7])$/.test(node.getName()))
                {removed.push(`circuit/${node.getName()}`);disposeTree(node)}
                else if(node.getName()==='physicalFixed.006')
                {
                    for(const collider of [...node.listChildren()])
                    {
                        const [x,,z]=collider.getWorldTranslation()
                        if(inside(x,z)){removed.push(`circuit/collider/${collider.getName()}`);disposeTree(collider)}
                    }
                }
                else if(node.getName()==='Cube.088')
                {
                    const matrix=new THREE.Matrix4().fromArray(node.getWorldMatrix()),v=new THREE.Vector3()
                    for(const primitive of node.getMesh().listPrimitives())
                    {
                        const positions=primitive.getAttribute('POSITION')
                        const indices=primitive.getIndices()
                        const old=indices.getArray(),kept=[]
                        for(let i=0;i<old.length;i+=3)
                        {
                            let x=0,z=0
                            for(let j=0;j<3;j++){v.fromArray(positions.getElement(old[i+j],[])).applyMatrix4(matrix);x+=v.x;z+=v.z}
                            if(!inside(x/3,z/3))kept.push(old[i],old[i+1],old[i+2])
                        }
                        const accessor=doc.createAccessor('cleanedCircuitStructure').setType('SCALAR').setArray(new old.constructor(kept)).setBuffer(indices.getBuffer())
                        primitive.setIndices(accessor)
                        removed.push(`circuit/Cube.088: ${((old.length-kept.length)/3)} obsolete support triangles`)
                    }
                }
            }
        }
    }
    await doc.transform(prune({keepLeaves:true,keepAttributes:true}))
    if(suffix)await doc.transform(compressDraco({quantizePosition:14,quantizeNormal:8,quantizeTexcoord:12}))
    await io.write(target,doc)
    report.packed.push({file:relative,before:(await fs.stat(saved)).size,after:(await fs.stat(target)).size,removed})
}
for(const relative of ['vehicle/default.glb','vehicle/default-compressed.glb','playground/playgroundVisual.glb','playground/playgroundVisual-compressed.glb','playground/playgroundPhysical.glb','playground/playgroundPhysical-compressed.glb','jukebox/jukeboxMusicNotes.png','jukebox/jukeboxMusicNotes.ktx'])
{
    const from=path.join(root,'static',relative),to=path.join(backup,relative)
    await fs.mkdir(path.dirname(to),{recursive:true})
    try{
        const bytes=(await fs.stat(from)).size
        await fs.rename(from,to)
        report.archived.push({file:relative,bytes})
    }catch(e){
        if(e.code!=='ENOENT')throw e
        try{report.archived.push({file:relative,bytes:(await fs.stat(to)).size})}catch(savedError){if(savedError.code!=='ENOENT')throw savedError}
    }
}
await fs.writeFile(path.join(root,'scripts/legacy-model-cleanup.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report.packed.map(({file,before,after})=>({file,before,after}))))
console.log('Archived unused public assets:',report.archived)
