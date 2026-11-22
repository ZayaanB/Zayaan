import assert from 'node:assert/strict'
import { build } from 'esbuild'
import sharp from 'sharp'
import { Texture } from 'three/webgpu'
import projects from '../sources/data/projects.js'

const bundle = await build({
    entryPoints: [new URL('../sources/Game/World/Areas/ProjectsArea.js', import.meta.url).pathname],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    plugins: [{ name: 'carousel-harness', setup(builder) {
        builder.onResolve({ filter: /\/Game\.js$/ }, () => ({ path: 'game', namespace: 'stub' }))
        builder.onResolve({ filter: /^gsap$/ }, () => ({ path: 'gsap', namespace: 'stub' }))
        builder.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({
            contents: path === 'game'
                ? 'export class Game { static getInstance() { return globalThis.projectImageGame } }'
                : 'export default { fromTo(target, _from, to) { target.value = to.value } }'
        }))
    } }]
})
const moduleSource = bundle.outputFiles[0].text + '\n//# sourceURL=checkProjectImages.bundle.mjs'
const { ProjectsArea } = await import('data:text/javascript;base64,' + Buffer.from(moduleSource).toString('base64'))

const pending = new Map()
globalThis.projectImageGame = { resourcesLoader: { getLoader: () => ({
    load(path, complete, _progress, fail) { pending.set(path.split('/').at(-1), { complete, fail }) }
}) } }
globalThis.document = { createElement() {
    const canvas = { getContext: () => ({
        clearRect() { canvas.drawnImage = null },
        drawImage(image, x, y, width, height) {
            assert.deepEqual([x, y, width, height], [0, 0, 960, 540])
            assert.equal(canvas.drawnImage, null)
            canvas.drawnImage = image
        }
    }) }
    return canvas
} }

const area = Object.create(ProjectsArea.prototype)
area.game = globalThis.projectImageGame
area.references = { items: new Map([['images', [{}]]]) }
area.setImages()

function select(index, direction = ProjectsArea.DIRECTION_NEXT)
{
    area.navigation = { index, current: projects[index] }
    area.images.update(direction)
}

async function finish(key)
{
    const { width, height } = await sharp(new URL(`../static/projects/images/${key}`, import.meta.url).pathname).metadata()
    const image = { width, height, key }
    pending.get(key).complete(new Texture(image))
    pending.delete(key)
    return image
}

select(0)
select(2)
const atlas = await finish(projects[0].images[0])
assert.equal(area.images.current, undefined, 'A stale load must never replace the active selection')
const contextSync = await finish(projects[2].images[0])
assert.notEqual(atlas.width, contextSync.width, 'Exercise the mixed-resolution artwork')
const current = area.images.current.texture
const previous = area.images.previous.texture
select(0, ProjectsArea.DIRECTION_PREVIOUS)
assert.equal(current.image.drawnImage, atlas)
assert.equal(previous.image.drawnImage, contextSync)
select(2)
assert.equal(current.image.drawnImage, contextSync)
assert.equal(previous.image.drawnImage, atlas)
for(const texture of [current, previous])
    assert.deepEqual([texture.image.width, texture.image.height], [960, 540])
assert.equal(area.images.current.texture, current, 'Switching projects must preserve the GPU allocation')
assert.equal(area.images.previous.texture, previous)
console.log('Passed project image swaps across native resolutions and out-of-order loading.')
