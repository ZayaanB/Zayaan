import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const labDir = path.join(root, 'static/lab/images')
const backupDir = path.join(root, 'scripts/_asset_backup')

const target = path.join(labDir, 'utfr.png')
const backup = path.join(backupDir, 'utfr-original.png')

// Use the backed-up original as source so the script is safe to re-run
if(!fs.existsSync(backup))
    fs.copyFileSync(target, backup)

const source = backup

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Sample the accent red from the maple leaf in the logo
async function getAccentRed()
{
    const { data, info } = await sharp(source).raw().toBuffer({ resolveWithObject: true })

    let r = 0, g = 0, b = 0, count = 0
    for(let i = 0; i < data.length; i += info.channels)
    {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2]
        if(pr > 150 && pr > pg * 2 && pr > pb * 2)
        {
            r += pr; g += pg; b += pb; count++
        }
    }

    if(count === 0)
        return '#e11b2e'

    const toHex = (v) => Math.round(v / count).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Rounded-corner logo card from the source image
async function makeCard(width, height, radius)
{
    const mask = Buffer.from(
        `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#ffffff"/></svg>`
    )

    return await sharp(source)
        .resize(width, height, { fit: 'cover' })
        .ensureAlpha()
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer()
}

function textSvg({ width, height, role, subRole, dates, accent, roleSize, subRoleSize, datesSize, roleY, subRoleY, datesY })
{
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <g font-family="'Nunito','DejaVu Sans',sans-serif" text-anchor="middle">
    <text x="${width / 2}" y="${roleY}" font-size="${roleSize}" font-weight="900" fill="#101010">${escape(role)}</text>
    <text x="${width / 2}" y="${subRoleY}" font-size="${subRoleSize}" font-weight="800" fill="#101010">${escape(subRole)}</text>
    <text x="${width / 2}" y="${datesY}" font-size="${datesSize}" font-weight="800" fill="${accent}">${escape(dates)}</text>
  </g>
</svg>`
}

async function compose({ width, height, card, cardLeft, cardTop, svg, file })
{
    await sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
        .composite([
            { input: card, left: cardLeft, top: cardTop },
            { input: Buffer.from(svg), left: 0, top: 0 }
        ])
        .png()
        .toFile(path.join(labDir, file))

    console.log('wrote', file)
}

async function run()
{
    const accent = await getAccentRed()
    console.log('accent', accent)

    const role = 'Autonomy Software Developer'
    const subRole = '(Mapping & Planning)'
    const dates = 'July 2026 - Present'

    // Full banner (960x540)
    {
        const cardW = 454, cardH = 280
        const card = await makeCard(cardW, cardH, 28)
        const svg = textSvg({
            width: 960, height: 540,
            role, subRole, dates, accent,
            roleSize: 44, subRoleSize: 30, datesSize: 27,
            roleY: 407, subRoleY: 452, datesY: 500
        })
        await compose({ width: 960, height: 540, card, cardLeft: Math.round((960 - cardW) / 2), cardTop: 55, svg, file: 'utfr.png' })
    }

    // Mini (480x270)
    {
        const cardW = 227, cardH = 140
        const card = await makeCard(cardW, cardH, 14)
        const svg = textSvg({
            width: 480, height: 270,
            role, subRole, dates, accent,
            roleSize: 22, subRoleSize: 15, datesSize: 14,
            roleY: 204, subRoleY: 227, datesY: 251
        })
        await compose({ width: 480, height: 270, card, cardLeft: Math.round((480 - cardW) / 2), cardTop: 26, svg, file: 'utfr-mini.png' })
    }
}

run().catch((err) => { console.error(err); process.exit(1) })
