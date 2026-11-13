// Handle taps directly instead of depending on the render loop to observe
// both the pressed and released pointer states between frames.
export function bindIntroStart(element, onStart, isSoundTarget)
{
    let press = null
    const down = event =>
    {
        if(press)
        {
            press.cancelled = true
            return
        }
        if(event.button !== 0 || event.isPrimary === false) return
        press = { id: event.pointerId, x: event.clientX, y: event.clientY, cancelled: isSoundTarget(event) }
    }
    const move = event =>
    {
        if(!press || event.pointerId !== press.id) return
        if(Math.hypot(event.clientX - press.x, event.clientY - press.y) > 12)
            press.cancelled = true
    }
    const up = event =>
    {
        if(!press || event.pointerId !== press.id) return
        move(event)
        const shouldStart = !press.cancelled && !isSoundTarget(event)
        press = null
        if(shouldStart) onStart()
    }
    const cancel = () => { press = null }
    const handlers = { pointerdown: down, pointermove: move, pointerup: up, pointercancel: cancel, pointerleave: cancel }
    for(const [name, handler] of Object.entries(handlers)) element.addEventListener(name, handler)
    return () =>
    {
        press = null
        for(const [name, handler] of Object.entries(handlers)) element.removeEventListener(name, handler)
    }
}
