export class Minimap
{
    constructor(map, locations)
    {
        this.map=map
        this.game=map.game
        this.element=this.game.domElement.querySelector('.js-minimap')
        this.toggle=this.element.querySelector('.js-minimap-toggle')
        this.panel=this.element.querySelector('.js-minimap-panel')
        this.player=this.element.querySelector('.js-minimap-player')
        this.textures=[this.element.querySelector('.js-minimap-texture'),this.element.querySelector('.js-minimap-pool')]
        this.previousUrl=null
        const landmarks=this.element.querySelector('.js-minimap-landmarks')
        for(const location of locations)
        {
            const respawn=this.game.respawns.getByName(location.respawnName)
            if(!respawn)continue
            const coordinates=this.map.worldToMap(respawn.position)
            const marker=document.createElement('span')
            marker.className='minimap-landmark'
            if(location.respawnName==='sentinel')marker.classList.add('is-sentinel')
            marker.title=location.name
            marker.style.left=`${coordinates.x*100}%`
            marker.style.top=`${coordinates.y*100}%`
            landmarks.append(marker)
        }
        // Keep map interactions from starting the touch steering gesture behind it.
        this.element.addEventListener('pointerdown',event=>event.stopPropagation())
        this.toggle.addEventListener('click',()=>this.setOpen(!this.opened))
        this.element.querySelector('.js-minimap-expand').addEventListener('click',()=>this.game.modals.open('map'))
        const mobile=window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches
        this.setOpen(!mobile)
        this.game.ticker.events.on('tick',()=>this.update(),15)
    }
    setOpen(opened)
    {
        this.opened=opened
        this.panel.hidden=!opened
        this.element.classList.toggle('is-open',opened)
        this.toggle.setAttribute('aria-expanded',String(opened))
        this.toggle.setAttribute('aria-label',opened?'Close minimap':'Open minimap')
        if(opened)this.update()
    }
    update()
    {
        if(!this.opened)return
        const url=this.game.dayCycles.intervalEvents.get('night').inInterval?'ui/map/map-night.webp?v=pool-tint-2':'ui/map/map-day.webp?v=pool-tint-2'
        if(url!==this.previousUrl)
        {
            this.previousUrl=url
            for(const image of this.textures)image.src=url
        }
        const coordinates=this.map.worldToMap(this.game.player.position)
        this.player.style.left=`${coordinates.x*100}%`
        this.player.style.top=`${coordinates.y*100}%`
        this.player.style.transform=`translate(-50%, -50%) rotate(${-this.game.physicalVehicle.yRotation}rad)`
    }
}
