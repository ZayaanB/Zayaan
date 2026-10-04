import * as THREE from 'three/webgpu'

// Keep the existing company logo, but render role text from the resume-backed
// data rather than the stale captions baked into the supplied images.
export function experienceCard(source, project)
{
    if(!project?.role) return source
    const image=source.image
    const canvas=document.createElement('canvas')
    canvas.width=960;canvas.height=540
    const context=canvas.getContext('2d')
    context.fillStyle='#ffffff'
    context.fillRect(0,0,960,540)
    const width=image.naturalWidth||image.width, height=image.naturalHeight||image.height
    context.drawImage(image,0,0,width,height*355/540,0,0,960,355)
    context.textAlign='center';context.textBaseline='middle'
    for(const [text,y,size,color] of [
        [project.role,401,44,'#151515'],
        [`(${project.specialization})`,451,34,'#151515'],
        [project.dates,500,30,'#315878'],
    ])
    {
        context.font=`800 ${size}px Nunito, Arial, sans-serif`
        context.fillStyle=color
        context.fillText(text,480,y)
    }
    const result=new THREE.CanvasTexture(canvas)
    result.colorSpace=THREE.SRGBColorSpace
    result.flipY=false
    result.magFilter=THREE.LinearFilter
    result.minFilter=THREE.LinearFilter
    result.generateMipmaps=false
    source.dispose()
    return result
}
