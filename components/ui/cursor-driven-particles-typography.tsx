"use client";

import React, { useEffect, useRef } from "react";
import { useLiteMode } from "@/components/layout/LiteModeProvider";
import { cn } from "@/lib/utils";

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
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  dispersion: number;
  returnSpd: number;

  constructor(
    x: number,
    y: number,
    size: number,
    color: string,
    dispersion: number,
    returnSpd: number
  ) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x;
    this.originY = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.size = size;
    this.color = color;
    this.dispersion = dispersion;
    this.returnSpd = returnSpd;
  }

  update(mouseX: number, mouseY: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const interactionRadius = 120;

    if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (interactionRadius - distance) / interactionRadius;

      const repulsionX = forceDirectionX * force * this.dispersion;
      const repulsionY = forceDirectionY * force * this.dispersion;

      this.vx -= repulsionX;
      this.vy -= repulsionY;
    }

    this.vx += (this.originX - this.x) * this.returnSpd;
    this.vy += (this.originY - this.y) * this.returnSpd;

    this.vx *= 0.85;
    this.vy *= 0.85;

    const distToOrigin = Math.sqrt(
      Math.pow(this.x - this.originX, 2) +
        Math.pow(this.y - this.originY, 2)
    );

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
  fontFamily = "Inter, sans-serif",
  particleSize = 1.5,
  particleDensity = 6,
  dispersionStrength = 15,
  returnSpeed = 0.08,
  color,
}: CursorDrivenParticleTypographyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Tie the animation loop into global Lite Mode architecture
  const { isLiteMode } = useLiteMode();
  const isLiteModeRef = useRef(isLiteMode);

  useEffect(() => {
    isLiteModeRef.current = isLiteMode;
  }, [isLiteMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    let mouseX = -1000;
    let mouseY = -1000;

    let containerWidth = 0;
    let containerHeight = 0;

    const init = () => {
      const container = containerRef.current;
      if (!container) return;

      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const computedStyle = window.getComputedStyle(container);
      const textColor = color || computedStyle.color || "#000000";

      ctx.clearRect(0, 0, containerWidth, containerHeight);

      // Dynamically auto-scale the font to fit perfectly within the container horizontally
      let effectiveFontSize = fontSize;
      ctx.font = `bold ${effectiveFontSize}px ${fontFamily}`;
      let textWidth = ctx.measureText(text).width;
      
      if (textWidth > containerWidth * 0.95) {
        effectiveFontSize = effectiveFontSize * ((containerWidth * 0.95) / textWidth);
      }

      ctx.fillStyle = textColor;
      ctx.font = `bold ${effectiveFontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Align perfectly center mathematically
      ctx.fillText(text, containerWidth / 2, containerHeight / 2 + 2);

      const textCoordinates = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      particles = [];

      const step = Math.max(1, Math.floor(particleDensity * dpr));

      for (let y = 0; y < textCoordinates.height; y += step) {
        for (let x = 0; x < textCoordinates.width; x += step) {
          const index = (y * textCoordinates.width + x) * 4;
          const alpha = textCoordinates.data[index + 3] || 0;

          if (alpha > 128) {
            particles.push(
              new Particle(
                x / dpr,
                y / dpr,
                particleSize,
                textColor,
                dispersionStrength,
                returnSpeed
              )
            );
          }
        }
      }
    };

    let staticRendered = false;

    const animate = () => {
      // Short limit bypassing animation cycles entirely if Lite Mode is active
      if (isLiteModeRef.current) {
        if (!staticRendered) {
          ctx.clearRect(0, 0, containerWidth, containerHeight);
          // Snap particles immediately to origin coordinate to form precise readable text
          particles.forEach((particle) => {
            particle.x = particle.originX;
            particle.y = particle.originY;
            particle.draw(ctx);
          });
          staticRendered = true;
        }
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      staticRendered = false;

      ctx.clearRect(0, 0, containerWidth, containerHeight);

      particles.forEach((particle) => {
        particle.update(mouseX, mouseY);
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Don't register mouse drag interactions if Lite Mode is frozen
      if (isLiteModeRef.current) return;
      
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      
      // We pass global mouse movements through to the canvas relatively to avoid pointer-event blocking underneath
      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      init();
    };

    const timeoutId = setTimeout(() => {
      init();
      animate();
    }, 100);

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Attach to Window instead of Canvas so we don't need pointer-events-auto blocking the 3D layer
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    text,
    fontSize,
    fontFamily,
    particleSize,
    particleDensity,
    dispersionStrength,
    returnSpeed,
    color,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full flex items-center justify-start relative touch-none pointer-events-none",
        className
      )}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
