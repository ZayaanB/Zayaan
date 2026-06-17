import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const portfolio = path.resolve(root, '..')
const previews = path.join(root, 'static', 'ui', 'previews')

const SIZE = 600

async function writeBoth(pipeline, baseNoExt)
{
    const buffer = await pipeline.png().toBuffer()
    await sharp(buffer).png().toFile(path.join(previews, baseNoExt + '.png'))
    await sharp(buffer).webp({ quality: 92 }).toFile(path.join(previews, baseNoExt + '.webp'))
    console.log('wrote', baseNoExt + '.png/.webp')
}

// 1) Professional photo -> square, keep the face (bias toward top)
async function makeProfile()
{
    const src = path.join(root, 'static', 'Profile_Profesional.png')
    const pipeline = sharp(src).resize(SIZE, SIZE, { fit: 'cover', position: 'top' })
    await writeBoth(pipeline, 'profile')
}

// 2) screenshot -> square crop framed like the old home preview
//    (full neon circle centered, tree canopy filling the top, small bottom margin)
async function makeSettings()
{
    const src = path.join(portfolio, 'screenshot.png')
    const meta = await sharp(src).metadata()
    const { width: W, height: H } = meta
    console.log('screenshot dims', W, H)

    // a) Paint over the "CLICK TO START" text / arrow / speaker icon, which sit in the
    //    empty floor area that is blank in the old home shot. Sample a clean dark patch
    //    from the dark corner just above the text (same magenta hue), blur it and feather
    //    its edges so it blends seamlessly into the surrounding background.
    const pw = 305, ph = 220
    const patch = { left: 660, top: 0, width: pw, height: ph }
    const patchDest = { left: 608, top: 178 }
    const feather = Buffer.from(
        `<svg width="${pw}" height="${ph}"><defs><filter id="b"><feGaussianBlur stdDeviation="9"/></filter></defs>` +
        `<rect x="10" y="10" width="${pw - 20}" height="${ph - 20}" rx="24" fill="white" filter="url(#b)"/></svg>`
    )
    const cleanPatch = await sharp(src)
        .extract(patch)
        .blur(6)
        .ensureAlpha()
        .composite([{ input: feather, blend: 'dest-in' }])
        .png()
        .toBuffer()
    const cleaned = await sharp(src)
        .composite([{ input: cleanPatch, left: patchDest.left, top: patchDest.top }])
        .png()
        .toBuffer()

    // b) Square crop matching the old home framing: circle ~79% of width, centered,
    //    canopy on top, ~12% floor margin under the circle.
    const side = 785
    let left = 98
    let top = 11
    left = Math.max(0, Math.min(left, W - side))
    top = Math.max(0, Math.min(top, H - side))

    const pipeline = sharp(cleaned)
        .extract({ left, top, width: side, height: side })
        .resize(SIZE, SIZE, { fit: 'cover' })
    await writeBoth(pipeline, 'settings')
}

await makeProfile()
await makeSettings()
