# My Portfolio Website

This is my personal portfolio website — an interactive 3D world built to showcase my projects and experience.

## Inspiration & credits

This project is heavily inspired by and built on the open-source [folio-2025](https://github.com/brunosimon/folio-2025) by **Bruno Simon** ([website](https://bruno-simon.com)), released under the [MIT license](https://choosealicense.com/licenses/mit/). The 3D engine, world, models and game design are his work — I adapted and customized it to present my own portfolio.

Additional credits:

- **Rendering** — [Three.js](https://threejs.org) (mr.doob & contributors, including Sunag / TSL)
- **Physics** — [Rapier](https://rapier.rs)
- **Audio** — [Howler.js](https://howlerjs.com)
- **Animation** — [GSAP](https://gsap.com)
- **Build tool** — [Vite](https://vite.dev)
- **Music** — Original soundtrack by **Kounine** ([Linktree](https://linktr.ee/Kounine)), released under the [CC0 license](https://choosealicense.com/licenses/cc0-1.0/)
- **Fonts** — [Amatic SC](https://fonts.google.com/specimen/Amatic+SC), [Nunito](https://fonts.google.com/specimen/Nunito) and [Pally](https://www.fontshare.com/fonts/pally)

Want to build something like this? Check out [Three.js Journey](https://threejs-journey.com).

## Setup

Create `.env` file based on `.env.example`

Download and install [Node.js](https://nodejs.org/en/download/) then run this followed commands:

``` bash
# Install dependencies
npm install --force

# Serve at localhost:1234
npm run dev

# Build for production in the dist/ directory
npm run build
```

### Export

- Mute the palette texture node (loaded and set in Three.js `Material` directly)
- Use corresponding export presets
- Don't use compression (will be done later)

### Compress

Run `npm run compress`

Will do the following

#### GLB

- Traverses the `static/` folder looking for glb files (ignoring already compressed files)
- Compresses embeded texture with `etc1s --quality 255` (lossy, GPU friendly)
- Generates new files to preserve originals

#### Texture files

- Traverses the `static/` folder looking for `png|jpg` files (ignoring non-model related folders)
- Compresses with default preset to `--encode etc1s --qlevel 255` (lossy, GPU friendly) or specific preset according to path
- Generates new files to preserve originals

#### UI files

- Traverses the `static/ui.` folder looking for `png|jpg` files
- Compresses to WebP

#### Resources

- https://gltf-transform.dev/cli
- https://github.com/KhronosGroup/KTX-Software?tab=readme-ov-file
- https://github.khronos.org/KTX-Software/ktxtools/toktx.html
