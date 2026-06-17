import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const careerDir = path.join(root, 'static/career')

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Each entry keeps the ORIGINAL filename + dimensions (so it maps onto the same stone),
// ordered here roughly by the timeline position (earliest -> latest).
// Image format expected by the shader: green (#00ff00) = dark plate, red (#ff0000) = accent text.
const entries = [
    { file: 'careerHetic.png',           w: 316, h: 60, lines: [ 'NASA HUNCH', 'CO-PRESIDENT' ] },
    { file: 'careerFreelancer.png',      w: 240, h: 60, lines: [ 'UNIV. OF TORONTO', 'B.SC. CS' ] },
    { file: 'careerUzik.png',            w: 168, h: 60, lines: [ 'GENAI GENESIS', 'TOP 10' ] },
    { file: 'careerIRLTeacher.png',      w: 268, h: 92, lines: [ 'HACK CANADA', 'TABLE TENNIS REF', 'FINALIST' ] },
    { file: 'careerImmersiveGarden.png', w: 340, h: 60, lines: [ 'KORRANET CREATIVE', 'FULL-STACK INTERN' ] },
    { file: 'careerOnlineTeacher.png',   w: 332, h: 92, lines: [ 'OPEN-SOURCE', 'PROJECTS', 'C++ · TS · PYTHON' ] },
]

function buildSvg({ w, h, lines })
{
    const padX = 8
    const padY = 6
    const n = lines.length
    const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '')

    // Fit by width and height
    const sizeByWidth = (w - padX * 2) / (longest.length * 0.58)
    const sizeByHeight = (h - padY * 2) / (n * 1.15)
    const fontSize = Math.floor(Math.min(sizeByWidth, sizeByHeight))

    const lineHeight = (h - padY * 2) / n
    let texts = ''
    lines.forEach((line, i) =>
    {
        const y = padY + lineHeight * (i + 0.5)
        texts += `<text x="${padX}" y="${y}" font-family="'Nunito','DejaVu Sans',sans-serif" font-weight="900" font-size="${fontSize}" fill="#ff0000" dominant-baseline="middle">${escape(line)}</text>`
    })

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#00ff00"/>
  ${texts}
</svg>`
}

async function run()
{
    for(const entry of entries)
    {
        const svg = buildSvg(entry)
        await sharp(Buffer.from(svg)).png().toFile(path.join(careerDir, entry.file))
        console.log('wrote', entry.file, `${entry.w}x${entry.h}`)
    }
}

run().catch((err) => { console.error(err); process.exit(1) })
