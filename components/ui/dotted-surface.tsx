'use client';

// three.js wave background uses a 50x50 grid of animated 0/1 sprites
// used as a fixed full-screen backdrop across pages
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

// creates a canvas texture containing a single monospace character
function createTextTexture(char: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 64, 64);
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(char, 32, 32);
  }
  return new THREE.CanvasTexture(canvas);
}

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const { isLiteMode } = useLiteMode();
  const isLiteModeRef = useRef(isLiteMode);

  useEffect(() => { isLiteModeRef.current = isLiteMode; }, [isLiteMode]);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles1: THREE.Points;
    particles0: THREE.Points;
    animationId: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const SEPARATION = 100;
    const AMOUNTX = 50;
    const AMOUNTY = 50;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050508, 1000, 3000);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      1,
      10000,
    );
    camera.position.set(0, 200, 1200);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(scene.fog.color, 0);
    containerRef.current.appendChild(renderer.domElement);

    // build interleaved 1 and 0 grid positions
    const positions1: number[] = [];
    const colors1: number[] = [];
    const positions0: number[] = [];
    const colors0: number[] = [];
    const originalIndices1: { ix: number; iy: number; index: number }[] = [];
    const originalIndices0: { ix: number; iy: number; index: number }[] = [];

    let p1Index = 0;
    let p0Index = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        if (Math.random() > 0.5) {
          positions1.push(x, 0, z);
          colors1.push(0.0, 1.0, 0.533); // #00ff88
          originalIndices1.push({ ix, iy, index: p1Index * 3 });
          p1Index++;
        } else {
          positions0.push(x, 0, z);
          colors0.push(0.0, 1.0, 0.533);
          originalIndices0.push({ ix, iy, index: p0Index * 3 });
          p0Index++;
        }
      }
    }

    const geometry1 = new THREE.BufferGeometry();
    geometry1.setAttribute('position', new THREE.Float32BufferAttribute(positions1, 3));
    geometry1.setAttribute('color', new THREE.Float32BufferAttribute(colors1, 3));

    const geometry0 = new THREE.BufferGeometry();
    geometry0.setAttribute('position', new THREE.Float32BufferAttribute(positions0, 3));
    geometry0.setAttribute('color', new THREE.Float32BufferAttribute(colors0, 3));

    const sharedMaterialOpts = {
      size: 20, vertexColors: true, transparent: true,
      opacity: 0.6, sizeAttenuation: true, depthWrite: false,
    };
    const material1 = new THREE.PointsMaterial({ ...sharedMaterialOpts, map: createTextTexture('1') });
    const material0 = new THREE.PointsMaterial({ ...sharedMaterialOpts, map: createTextTexture('0') });

    const points1 = new THREE.Points(geometry1, material1);
    const points0 = new THREE.Points(geometry0, material0);
    scene.add(points1, points0);

    let count = 0;
    let animationId = 0;
    let hasRenderedLite = false;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (isLiteModeRef.current) {
        if (!hasRenderedLite) { renderer.render(scene, camera); hasRenderedLite = true; }
        return;
      }
      hasRenderedLite = false;

      // wave animation updates y positions each frame
      const posArray1 = geometry1.attributes.position.array as Float32Array;
      for (let i = 0; i < originalIndices1.length; i++) {
        const pt = originalIndices1[i];
        posArray1[pt.index + 1] = Math.sin((pt.ix + count) * 0.3) * 50 + Math.sin((pt.iy + count) * 0.5) * 50;
      }
      geometry1.attributes.position.needsUpdate = true;

      const posArray0 = geometry0.attributes.position.array as Float32Array;
      for (let i = 0; i < originalIndices0.length; i++) {
        const pt = originalIndices0[i];
        posArray0[pt.index + 1] = Math.sin((pt.ix + count) * 0.3) * 50 + Math.sin((pt.iy + count) * 0.5) * 50;
      }
      geometry0.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.05;
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      if (isLiteModeRef.current) renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);
    animate();

    sceneRef.current = { scene, camera, renderer, particles1: points1, particles0: points0, animationId, count };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.scene.traverse((object) => {
          if (object instanceof THREE.Points) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        sceneRef.current.renderer.dispose();
        if (containerRef.current && sceneRef.current.renderer.domElement) {
          containerRef.current.removeChild(sceneRef.current.renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('fixed inset-0 pointer-events-none -z-10', className)}
      {...props}
    />
  );
}
