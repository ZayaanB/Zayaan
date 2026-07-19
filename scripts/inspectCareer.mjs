import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const document = await io.read(path.join(root, 'static/areas/areas.glb'))

const scene = document.getRoot().getDefaultScene()

const fmt = (arr) => arr ? `[${arr.map(v => v.toFixed(2)).join(', ')}]` : '-'

function bounds(node)
{
    const mesh = node.getMesh()
    if(!mesh)
        return ''

    let min = [Infinity, Infinity, Infinity]
    let max = [-Infinity, -Infinity, -Infinity]

    for(const prim of mesh.listPrimitives())
    {
        const pos = prim.getAttribute('POSITION')
        if(!pos)
            continue
        const pMin = pos.getMin([])
        const pMax = pos.getMax([])
        min = min.map((v, i) => Math.min(v, pMin[i]))
        max = max.map((v, i) => Math.max(v, pMax[i]))
    }

    if(min[0] === Infinity)
        return ''

    return ` bboxMin=${fmt(min)} bboxMax=${fmt(max)}`
}

function dump(node, depth, filter)
{
    const name = node.getName()

    if(depth === 0 && !name.startsWith(filter))
        return

    const extras = node.getExtras()
    const extrasStr = extras && Object.keys(extras).length ? ` extras=${JSON.stringify(extras)}` : ''
    console.log(`${'  '.repeat(depth)}${name} t=${fmt(node.getTranslation())} s=${fmt(node.getScale())}${extrasStr}${bounds(node)}`)

    if(depth < 3)
        for(const child of node.listChildren())
            dump(child, depth + 1, filter)
}

for(const node of scene.listChildren())
    dump(node, 0, 'career')

// Dump groove strips: cluster triangles of the groove planes by x, report contiguous z ranges
console.log('\n=== groove strips (local to career group) ===')

const career = scene.listChildren().find(n => n.getName() === 'career')

for(const node of career.listChildren())
{
    const name = node.getName()
    if(!name.startsWith('Plane'))
        continue

    const mesh = node.getMesh()
    if(!mesh)
        continue

    const t = node.getTranslation()

    for(const prim of mesh.listPrimitives())
    {
        const pos = prim.getAttribute('POSITION')
        const indices = prim.getIndices()
        if(!pos || !indices)
            continue

        // Collect triangles, group into islands by proximity (shared vertices)
        const triCount = indices.getCount() / 3
        const parent = new Array(pos.getCount()).fill(0).map((_, i) => i)
        const find = (a) => { while(parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a] } return a }
        const union = (a, b) => { parent[find(a)] = find(b) }

        // Merge by identical position (weld) first
        const keyMap = new Map()
        for(let i = 0; i < pos.getCount(); i++)
        {
            const v = pos.getElement(i, [])
            const key = v.map(c => c.toFixed(3)).join(',')
            if(keyMap.has(key))
                union(i, keyMap.get(key))
            else
                keyMap.set(key, i)
        }

        for(let i = 0; i < triCount; i++)
        {
            const a = indices.getScalar(i * 3)
            const b = indices.getScalar(i * 3 + 1)
            const c = indices.getScalar(i * 3 + 2)
            union(a, b)
            union(b, c)
        }

        // Islands bounds
        const islands = new Map()
        for(let i = 0; i < pos.getCount(); i++)
        {
            const rootId = find(i)
            const v = pos.getElement(i, [])
            let isl = islands.get(rootId)
            if(!isl)
            {
                isl = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
                islands.set(rootId, isl)
            }
            isl.minX = Math.min(isl.minX, v[0])
            isl.maxX = Math.max(isl.maxX, v[0])
            isl.minZ = Math.min(isl.minZ, v[2])
            isl.maxZ = Math.max(isl.maxZ, v[2])
        }

        console.log(`${name} t=[${t.map(v => v.toFixed(2)).join(', ')}] -> ${islands.size} island(s)`)
        for(const isl of islands.values())
        {
            console.log(`  x ${(t[0] + isl.minX).toFixed(2)}..${(t[0] + isl.maxX).toFixed(2)}  z ${(t[2] + isl.minZ).toFixed(2)}..${(t[2] + isl.maxZ).toFixed(2)}`)
        }
    }
}
