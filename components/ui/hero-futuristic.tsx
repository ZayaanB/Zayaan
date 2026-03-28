'use client';

// ─── Hero: binary globe background + particle title overlay ───────────────────
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particles-typography';

// Renders a single character as a canvas texture (used for 0/1 sprites)
function createCharTexture(char: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 64, 64);
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(char, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

// ─── Binary Globe: sphere of 1s and 0s ───────────────────────────────────────
const BinaryGlobe = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLiteMode } = useLiteMode();
  const isLiteModeRef = useRef(isLiteMode);

  useEffect(() => { isLiteModeRef.current = isLiteMode; }, [isLiteMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 500);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Neon green sprites matching site accent colour
    const COLOR = '#00ff88';
    const tex0 = createCharTexture('0', COLOR);
    const tex1 = createCharTexture('1', COLOR);

    // Position particles uniformly on a sphere using the golden angle
    const PARTICLE_COUNT = 1500;
    const RADIUS = Math.min(container.clientWidth, container.clientHeight) * 0.28;
    const goldenAngle = Math.PI * (1 + Math.sqrt(5));

    const pos0: number[] = [];
    const pos1: number[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(1 - (2 * i) / PARTICLE_COUNT);
      const theta = goldenAngle * i;
      const x = RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = RADIUS * Math.cos(phi);
      const z = RADIUS * Math.sin(phi) * Math.sin(theta);
      (Math.random() > 0.5 ? pos1 : pos0).push(x, y, z);
    }

    const makePoints = (positions: number[], tex: THREE.CanvasTexture) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        size: 18, map: tex, transparent: true, opacity: 0.85,
        sizeAttenuation: true, depthWrite: false,
      }));
    };

    const globe = new THREE.Group();
    globe.add(makePoints(pos0, tex0));
    globe.add(makePoints(pos1, tex1));
    scene.add(globe);

    // Subtle mouse tilt
    let targetTiltX = 0;
    let targetTiltZ = 0;
    const onMouseMove = (e: MouseEvent) => {
      targetTiltX = (e.clientY / window.innerHeight - 0.5) * -0.4;
      targetTiltZ = (e.clientX / window.innerWidth - 0.5) * 0.15;
    };
    window.addEventListener('mousemove', onMouseMove);

    let hasRenderedLite = false;
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isLiteModeRef.current) {
        if (!hasRenderedLite) { renderer.render(scene, camera); hasRenderedLite = true; }
        return;
      }
      hasRenderedLite = false;

      globe.rotation.y += 0.003;
      globe.rotation.x += (targetTiltX - globe.rotation.x) * 0.03;
      globe.rotation.z += (targetTiltZ - globe.rotation.z) * 0.03;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      globe.traverse((obj) => {
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          (obj.material as THREE.PointsMaterial).map?.dispose();
          (obj.material as THREE.PointsMaterial).dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" />;
};

// ─── HeroFuturistic: particle title + binary globe ────────────────────────────
export const HeroFuturistic = () => {
  const subtitle = 'CS @ University of Toronto Scarborough · AI · SWE · Data';
  const [textVisible, setTextVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    setSubtitleDelay(Math.random() * 0.1);
    const t1 = setTimeout(() => setTextVisible(true), 400);
    const t2 = setTimeout(() => setSubtitleVisible(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="h-svh relative overflow-hidden bg-black">
      {/* Text overlay — pointer-events-none lets mouse tilt reach the globe below */}
      <div className="h-svh uppercase items-center w-full absolute z-[60] pointer-events-none px-4 flex justify-center flex-col">
        <div className="w-full max-w-[1200px] h-[7vh] md:h-[12vh] lg:h-[15vh] pointer-events-none">
          <div className={`w-full h-full transition-opacity duration-1000 ${textVisible ? 'opacity-100 hero-fade-in' : 'opacity-0'}`}>
            <CursorDrivenParticleTypography
              text="BUILDING PRACTICAL SOFTWARE"
              fontSize={110}
              particleDensity={1}
              particleSize={2.0}
              dispersionStrength={25}
              color="#ffffff"
            />
          </div>
        </div>
        <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden text-white font-bold">
          <div
            className={subtitleVisible ? 'hero-fade-in-subtitle' : ''}
            style={{ animationDelay: `${0.8 + subtitleDelay}s`, opacity: subtitleVisible ? undefined : 0 }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <button className="explore-btn z-[60] relative" style={{ animationDelay: '2.2s' }}>
        Scroll to explore
        <span className="explore-arrow">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-svg">
            <path d="M11 5V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 12L11 17L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      {/* Binary globe — standard WebGL, no WebGPU dependency */}
      <BinaryGlobe />
    </div>
  );
};

export default HeroFuturistic;
