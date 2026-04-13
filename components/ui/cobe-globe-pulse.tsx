"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"
import { useLiteMode } from "@/components/layout/LiteModeProvider"

// Pulse markers - 1s on land, 0s on ocean (visual theme)
interface PulseMarker {
  id: string
  location: [number, number]
  delay: number
}

interface CobePulseGlobeProps {
  markers?: PulseMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: PulseMarker[] = [
  { id: "pulse-mumbai",  location: [19.0760, 72.8777],  delay: 0 },   // Mumbai
  { id: "pulse-toronto", location: [43.6532, -79.3832], delay: 0.5 }, // Toronto
]

export function CobePulseGlobe({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: CobePulseGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isDraggingRef = useRef(false)

  const { isLiteMode } = useLiteMode()
  const isLiteModeRef = useRef(isLiteMode)
  useEffect(() => { isLiteModeRef.current = isLiteMode }, [isLiteMode])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isDraggingRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isDraggingRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi:   (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup",   handlePointerUp,   { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup",   handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      // neon green (#00ff88) colour scheme on near-black base
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width, height: width,
        phi: 0, theta: 0.2,
        dark: 1, diffuse: 4.0,
        mapSamples: 20000,
        mapBrightness: 30,
        baseColor:   [0.05, 0.2,  0.1],
        markerColor: [0.0,  1.0,  0.533],
        glowColor:   [0.0,  0.35, 0.18],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.04, id: m.id })),
        arcs: [], arcColor: [0, 1, 0.533],
        arcWidth: 0.5, arcHeight: 0.25, opacity: 0.7,
      })

      function animate() {
        // Pause rotation in Lite Mode or while dragging
        if (!isLiteModeRef.current && !isDraggingRef.current) phi += speed
        globe!.update({
          phi:   phi + phiOffsetRef.current   + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) { ro.disconnect(); init() }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes pulse-expand {
          0%   { transform: scaleX(0.3) scaleY(0.3); opacity: 0.8; }
          100% { transform: scaleX(1.5) scaleY(1.5); opacity: 0; }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%",
          cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />

      {/* Pulse markers - each shows a '1' or '0' with pulsing rings */}
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(center)",
            left:   "anchor(center)",
            translate: "-50% 50%",
            width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none" as const,
            opacity:    `var(--cobe-visible-${m.id}, 0)`,
            filter:     `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
        >
          {/* Two offset rings create the pulsing glow effect */}
          <span style={{
            position: "absolute", inset: 0,
            border: "2px solid #00ff88", borderRadius: "50%", opacity: 0,
            animation: `pulse-expand 2s ease-out infinite ${m.delay}s`,
          }} />
          <span style={{
            position: "absolute", inset: 0,
            border: "2px solid #00ff88", borderRadius: "50%", opacity: 0,
            animation: `pulse-expand 2s ease-out infinite ${m.delay + 0.5}s`,
          }} />

        </div>
      ))}
    </div>
  )
}
