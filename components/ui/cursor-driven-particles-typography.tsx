'use client';

// ─── Cursor-Driven Particle Typography ────────────────────────────────────────
// Renders text as interactive particles that scatter on mouse proximity.
// Mouse events attach to window (not canvas) so pointer-events-none can pass
// interactions through to layers underneath (e.g. the 3D hero blob).
import React, { useEffect, useRef } from 'react';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import { cn } from '@/lib/utils';

export interface CursorDrivenParticleTypographyProps {
  className?: string;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  particleSize?: number;
  particleDensity?: number;
  dispersionStrength?: number;
  returnSpeed?: number;
  color?: string;
}

class Particle {
  x: number; y: number;
  originX: number; originY: number;
  vx: number; vy: number;
  size: number; color: string;
  dispersion: number; returnSpd: number;

  constructor(x: number, y: number, size: number, color: string, dispersion: number, returnSpd: number) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x; this.originY = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.size = size; this.color = color;
    this.dispersion = dispersion; this.returnSpd = returnSpd;
  }

  update(mouseX: number, mouseY: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const interactionRadius = 120;

    if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
      const force = (interactionRadius - distance) / interactionRadius;
      this.vx -= (dx / distance) * force * this.dispersion;
      this.vy -= (dy / distance) * force * this.dispersion;
    }

    this.vx += (this.originX - this.x) * this.returnSpd;
    this.vy += (this.originY - this.y) * this.returnSpd;
    this.vx *= 0.85;
    this.vy *= 0.85;

    // Subtle idle jitter when at rest
    const distToOrigin = Math.sqrt(Math.pow(this.x - this.originX, 2) + Math.pow(this.y - this.originY, 2));
    if (distToOrigin < 1 && Math.random() > 0.95) {
      this.vx += (Math.random() - 0.5) * 0.2;
      this.vy += (Math.random() - 0.5) * 0.2;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function CursorDrivenParticleTypography({
  className,
  text,
  fontSize = 120,
  fontFamily = 'Inter, sans-serif',
  particleSize = 1.5,
  particleDensity = 6,
  dispersionStrength = 15,
  returnSpeed = 0.08,
  color,
}: CursorDrivenParticleTypographyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLiteMode } = useLiteMode();
  const isLiteModeRef = useRef(isLiteMode);

  useEffect(() => { isLiteModeRef.current = isLiteMode; }, [isLiteMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouseX = -1000, mouseY = -1000;
    let containerWidth = 0, containerHeight = 0;

    const init = () => {
      const container = containerRef.current;
      if (!container) return;

      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;

      // Guard against zero-sized containers (e.g., hidden or initial mount) 
      // to prevent IndexSizeError in getImageData.
      if (containerWidth === 0 || containerHeight === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const textColor = color || window.getComputedStyle(container).color || '#000000';
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      // Auto-scale font to fit container width
      let effectiveFontSize = fontSize;
      ctx.font = `bold ${effectiveFontSize}px ${fontFamily}`;
      const textWidth = ctx.measureText(text).width;
      if (textWidth > containerWidth * 0.95) {
        effectiveFontSize *= (containerWidth * 0.95) / textWidth;
      }

      ctx.fillStyle = textColor;
      ctx.font = `bold ${effectiveFontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, containerWidth / 2, containerHeight / 2 + 2);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      particles = [];
      const step = Math.max(1, Math.floor(particleDensity * dpr));

      for (let y = 0; y < imageData.height; y += step) {
        for (let x = 0; x < imageData.width; x += step) {
          if ((imageData.data[(y * imageData.width + x) * 4 + 3] || 0) > 128) {
            particles.push(new Particle(x / dpr, y / dpr, particleSize, textColor, dispersionStrength, returnSpeed));
          }
        }
      }
    };

    let staticRendered = false;

    const animate = () => {
      // Lite Mode: snap to origin and freeze
      if (isLiteModeRef.current) {
        if (!staticRendered) {
          ctx.clearRect(0, 0, containerWidth, containerHeight);
          particles.forEach((p) => { p.x = p.originX; p.y = p.originY; p.draw(ctx); });
          staticRendered = true;
        }
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      staticRendered = false;
      ctx.clearRect(0, 0, containerWidth, containerHeight);
      particles.forEach((p) => { p.update(mouseX, mouseY); p.draw(ctx); });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isLiteModeRef.current) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => { mouseX = -1000; mouseY = -1000; };

    const timeoutId = setTimeout(() => { init(); animate(); }, 100);
    const resizeObserver = new ResizeObserver(() => init());
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Attach to window so canvas can stay pointer-events-none
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text, fontSize, fontFamily, particleSize, particleDensity, dispersionStrength, returnSpeed, color]);

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full flex items-center justify-start relative touch-none pointer-events-none', className)}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
