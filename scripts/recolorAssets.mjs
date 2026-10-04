import sharp from 'sharp'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const S = (p) => path.join(root, 'static', p)

async function writeBoth(buffer, width, height, baseNoExt)
{
    const img = sharp(buffer, { raw: { width, height, channels: 4 } })
    await img.clone().png().toFile(S(baseNoExt + '.png'))
    await img.clone().webp({ quality: 92 }).toFile(S(baseNoExt + '.webp'))
    console.log('wrote', baseNoExt + '.png/.webp')
}

// --- 1) Map: recolor the red Pool-of-Doom glow to blue (channel swap on red-dominant pixels in a bbox) ---
async function recolorMap(file)
{
    // Preserve the original landscape. The map UI now tints only the pool glow
    // through a soft radial mask; a broad pixel recolor also changed the land.
    const relative = file.replace('ui/', '')
    for(const extension of ['png', 'webp'])
        await fs.copyFile(path.join(root, 'scripts/_asset_backup', `${relative}.${extension}`), S(`${file}.${extension}`))
}

// --- 2) Home preview: recolor the deep-red car body to near-white ---
async function recolorHomeCar()
{
    const file = 'ui/previews/home'
    // Always start from the pristine backup so re-runs are deterministic
    const srcPath = path.join(root, 'scripts/_asset_backup/previews/home.png')
    const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width, height } = info
    // Tight box hugging the car body only
    const box = { x0: 236, x1: 384, y0: 300, y1: 416 }
    for(let y = box.y0; y < box.y1; y++)
    {
        for(let x = box.x0; x < box.x1; x++)
        {
            const i = (y * width + x) * 4
            const r = data[i], g = data[i + 1], b = data[i + 2]
            // Car-body red: catch the saturated red but exclude higher-blue pink disc and orange lights
            if(r > 110 && g < 74 && b < 66 && (r - g) > 42 && (r - b) > 46)
            {
                const v = Math.max(150, Math.min(235, Math.round(150 + (r - 110) * 0.55)))
                data[i] = v
                data[i + 1] = v
                data[i + 2] = Math.min(255, v + 5) // slightly cool -> icy white-blue
            }
        }
    }
    await writeBoth(data, width, height, file)
}

// --- 3) Options preview: regenerate from a name-free crop of the same scene (removes baked "BRUNO SIMON") ---
async function regenOptions()
{
    const file = 'ui/previews/options'
    const srcPath = path.join(root, 'scripts/_asset_backup/previews/options.png')
    const region = { left: 312, top: 0, width: 288, height: 248 }
    const out = await sharp(srcPath)
        .extract(region)
        .resize(600, 600, { fit: 'fill', kernel: 'lanczos3' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
    await writeBoth(out.data, out.info.width, out.info.height, file)
}

// --- 4) Map player marker: recolor the red car body to white ---
async function recolorPlayerMarker()
{
    const file = 'ui/map/player'
    const srcPath = path.join(root, 'scripts/_asset_backup/map/player.png')
    const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width, height } = info
    for(let i = 0; i < data.length; i += 4)
    {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        // Red car body only (spares brown frame and purple blinkers)
        if(r > 110 && (r - g) > 60 && (r - b) > 55)
        {
            const v = Math.max(160, Math.min(240, Math.round(160 + (r - 110) * 0.5)))
            data[i] = v
            data[i + 1] = v
            data[i + 2] = Math.min(255, v + 4)
        }
    }
    await writeBoth(data, width, height, file)
}

await recolorMap('ui/map/map-night')
await recolorMap('ui/map/map-day')
await recolorPlayerMarker()
await recolorHomeCar()
await regenOptions()
console.log('done')
