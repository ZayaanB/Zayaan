import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const escape = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Banner SVG (full project / experience image)
function bannerSvg({ width, height, kind, title, subtitle, footer })
{
    const isProject = kind === 'PROJECT'
    const a = isProject ? '#2b2233' : '#1f2b2b'
    const b = isProject ? '#4a3461' : '#27514f'
    const accent = isProject ? '#D66FFF' : '#37e0c4'
    const margin = 56
    const titleSize = Math.min(96, Math.floor((width - margin * 2) / (title.length * 0.60)))
    const badgeW = Math.round(kind.length * 15.5 + 40)

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <rect x="0" y="0" width="${width}" height="10" fill="${accent}"/>
  <g font-family="'Nunito','DejaVu Sans',sans-serif">
    <rect x="${margin}" y="56" rx="8" ry="8" width="${badgeW}" height="44" fill="${accent}"/>
    <text x="${margin + badgeW / 2}" y="86" text-anchor="middle" font-size="22" font-weight="900" fill="#1a141f" letter-spacing="3">${kind}</text>
    <text x="${margin}" y="${height * 0.56}" font-size="${titleSize}" font-weight="900" fill="#ffffff">${escape(title)}</text>
    <text x="${margin + 2}" y="${height * 0.56 + titleSize * 0.62}" font-size="${Math.round(width * 0.030)}" font-weight="700" fill="${accent}">${escape(subtitle)}</text>
    <text x="${margin}" y="${height - 46}" font-size="${Math.round(width * 0.024)}" font-weight="700" fill="#ffffff" fill-opacity="0.65">${escape(footer)}</text>
  </g>
</svg>`
}

// Mini SVG (thumbnail for experience list)
function miniSvg({ width, height, title, accent, a, b })
{
    const titleSize = Math.round(width * 0.10)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${width}" height="8" fill="${accent}"/>
  <text x="${width / 2}" y="${height / 2 + titleSize * 0.35}" text-anchor="middle" font-family="'Nunito','DejaVu Sans',sans-serif" font-size="${titleSize}" font-weight="900" fill="#ffffff">${escape(title)}</text>
</svg>`
}

const W = 960, H = 540

const projects = [
    { file: 'kvstore.png',          title: 'Embedded Key-Value Store', subtitle: 'C++ · POSIX Threads · Linux',     footer: 'Sharded in-memory store with crash-safe write-ahead log' },
    { file: 'context-sync.png',     title: 'Context Sync Extension',   subtitle: 'TypeScript · VS Code API · Node',  footer: '500+ downloads · syncs AI chat context across editors' },
    { file: 'halo-healthcare.png',  title: 'Clinical AI Assistant',    subtitle: 'Python · OpenCV · SQL · Watsonx',  footer: 'Top 10 @ GenAI Genesis · 98%+ fall-detection accuracy' },
    { file: 'refai.png',            title: 'Table Tennis Referee',     subtitle: 'Python · YOLOv8 · OpenCV · C',     footer: 'Finalist @ Hack Canada · 90%+ ball-tracking accuracy' },
]

const experiences = [
    { file: 'korranet',   title: 'KorraNet Creative Inc.', subtitle: 'Full-Stack Developer Intern', footer: 'May 2026 – Present · Remote · OAuth, secrets, reliability' },
    { file: 'nasa-hunch', title: 'NASA HUNCH Program',     subtitle: 'Co-President',                footer: '2023 – 2025 · 3rd place international · autonomous Lunar Bot' },
]

async function run()
{
    const projectsDir = path.join(root, 'static/projects/images')
    const labDir = path.join(root, 'static/lab/images')
    fs.mkdirSync(projectsDir, { recursive: true })
    fs.mkdirSync(labDir, { recursive: true })

    for(const p of projects)
    {
        const svg = bannerSvg({ width: W, height: H, kind: 'PROJECT', ...p })
        await sharp(Buffer.from(svg)).png().toFile(path.join(projectsDir, p.file))
        console.log('wrote', p.file)
    }

    for(const e of experiences)
    {
        const svg = bannerSvg({ width: W, height: H, kind: 'EXPERIENCE', ...e })
        await sharp(Buffer.from(svg)).png().toFile(path.join(labDir, `${e.file}.png`))
        console.log('wrote', `${e.file}.png`)

        const mini = miniSvg({ width: 480, height: 270, title: e.title.split(' ')[0], accent: '#37e0c4', a: '#1f2b2b', b: '#27514f' })
        await sharp(Buffer.from(mini)).png().toFile(path.join(labDir, `${e.file}-mini.png`))
        console.log('wrote', `${e.file}-mini.png`)
    }
}

run().catch((err) => { console.error(err); process.exit(1) })
