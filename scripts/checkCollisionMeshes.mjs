import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import * as THREE from 'three'
import { NodeIO, VertexLayout } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import draco from 'draco3dgltf'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { colliderVertices, colliderIndices } from '../sources/Game/Physics/colliderGeometry.js'

// Exercise the installed Rapier WASM implementation, not a mocked physics API.
const rawSource=await fs.readFile('node_modules/@dimforge/rapier3d/rapier_wasm3d_bg.js','utf8')
const raw=await import('data:text/javascript;base64,'+Buffer.from(rawSource).toString('base64'))
const {instance}=await WebAssembly.instantiate(await fs.readFile('node_modules/@dimforge/rapier3d/rapier_wasm3d_bg.wasm'),{'./rapier_wasm3d_bg.js':raw})
raw.__wbg_set_wasm(instance.exports)

const quad=new THREE.BufferGeometry()
const data=new THREE.InterleavedBuffer(new Float32Array([
 0,0,0, 0,1,0, 0,0,
 1,0,0, 0,1,0, 1,0,
 1,0,1, 0,1,0, 1,1,
 0,0,1, 0,1,0, 0,1,
]),8)
quad.setAttribute('position',new THREE.InterleavedBufferAttribute(data,3,0))
quad.setIndex([0,1,2,0,2,3])
assert.throws(()=>raw.RawShape.trimesh(quad.attributes.position.array,quad.index.array,0),WebAssembly.RuntimeError,'Reproduce the original interleaved-buffer startup crash')
assert.deepEqual([...colliderVertices(quad)],[0,0,0,1,0,0,1,0,1,0,0,1])
assert(colliderIndices(quad) instanceof Uint32Array)
raw.RawShape.trimesh(colliderVertices(quad),colliderIndices(quad),0).free()
console.log('Passed: reproduced the Rapier unreachable trap; packed extraction creates the same collider successfully.')

const loader=new GLTFLoader()
    .register(()=>({name:'TEST_TEXTURES',loadTexture(){return Promise.resolve(new THREE.Texture())}}))
    .register(()=>({name:'KHR_texture_basisu',loadTexture(){return Promise.resolve(new THREE.Texture())}}))
const io=new NodeIO().setVertexLayout(VertexLayout.SEPARATE).registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()})
let count=0
for(const entry of await fs.readdir('static',{recursive:true}))
{
 if(!entry.endsWith('.glb'))continue
 let bytes=await fs.readFile('static/'+entry)
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)))
 if(json.extensionsUsed?.includes('KHR_draco_mesh_compression'))
 {
  const doc=await io.read('static/'+entry)
  doc.getRoot().listExtensionsUsed().find(e=>e.extensionName==='KHR_draco_mesh_compression').dispose()
  bytes=await io.writeBinary(doc)
 }
 const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')
 gltf.scene.traverse(node=>{
  if(!/^(trimesh|hull)/i.test(node.name))return
  const vertices=colliderVertices(node.geometry)
  assert.equal(vertices.length,node.geometry.attributes.position.count*3)
  assert(vertices.every(Number.isFinite))
  let shape
  if(/^trimesh/i.test(node.name))
  {
   const indices=colliderIndices(node.geometry)
   assert.equal(indices.length%3,0)
   assert(indices.every(i=>i<vertices.length/3))
   shape=raw.RawShape.trimesh(vertices,indices,0)
  }
  else shape=raw.RawShape.convexHull(vertices)
  assert(shape,`${entry}/${node.name} must create a collision shape`)
  shape.free();count++
 })
}
assert(count>0)
console.log(`Passed: all ${count} loaded trimesh/hull colliders create successfully in the real Rapier WASM engine.`)
