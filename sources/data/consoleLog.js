import * as THREE from 'three/webgpu'

const text = `
███████╗ █████╗ ██╗   ██╗ █████╗  █████╗ ███╗   ██╗
╚══███╔╝██╔══██╗╚██╗ ██╔╝██╔══██╗██╔══██╗████╗  ██║
  ███╔╝ ███████║ ╚████╔╝ ███████║███████║██╔██╗ ██║
 ███╔╝  ██╔══██║  ╚██╔╝  ██╔══██║██╔══██║██║╚██╗██║
███████╗██║  ██║   ██║   ██║  ██║██║  ██║██║ ╚████║
╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝

╔═ Intro ═══════════════╗
║ Thank you for visiting my portfolio, you sneaky developer!
║ I'm Zayaan Bhanwadia — a Computer Science student at the University of Toronto.
║ Drive around to explore my projects and experience.
╚═══════════════════════╝

╔═ Socials ═══════════════╗
║ Mail     ⇒ zayaan1509@gmail.com
║ GitHub   ⇒ https://github.com/ZayaanB
║ LinkedIn ⇒ https://www.linkedin.com/in/zayaan-bhan
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ You can access the debug mode by adding #debug at the end of the URL and reloading.
║ Press [V] to toggle the free camera.
╚═══════════════════════╝

╔═ Built with ══════════╗
║ This world runs on Three.js (release: ${THREE.REVISION})
║ https://threejs.org/
║ It is adapted from the open-source folio-2025 by Bruno Simon (MIT license).
║ https://github.com/brunosimon/folio-2025
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
