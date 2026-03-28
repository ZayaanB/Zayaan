'use client';

// ─── Hero: binary globe background + particle title overlay ───────────────────
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particles-typography';

// Canvas texture for a single "0" or "1" sprite
function createCharTexture(char: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
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

// Simplified equirectangular land mask drawn with approximate continent shapes
function buildLandMask(): CanvasRenderingContext2D {
  const W = 360, H = 180;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#000'; // ocean
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; // land

  // Helper: fill lon/lat bounding box (lon: -180→180, lat: -90→90 degrees)
  const fill = (lon1: number, lat1: number, lon2: number, lat2: number) => {
    const x1 = Math.round((Math.min(lon1, lon2) + 180) / 360 * W);
    const y1 = Math.round((90 - Math.max(lat1, lat2)) / 180 * H);
    const x2 = Math.round((Math.max(lon1, lon2) + 180) / 360 * W);
    const y2 = Math.round((90 - Math.min(lat1, lat2)) / 180 * H);
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  };

  fill(-168,  10, -52,  85); // North America
  fill( -82, -56, -33,  15); // South America
  fill( -25,  35,  45,  72); // Europe
  fill( -18, -36,  52,  38); // Africa
  fill(  25,  -5,  90,  75); // Middle East + South Asia
  fill(  90, -10, 145,  76); // East Asia
  fill( 112, -44, 155, -10); // Australia
  fill( -73,  58, -12,  85); // Greenland
  fill( 150,  30, 180,  46); // Japan area
  fill(-180, -90, 180, -73); // Antarctica

  return ctx;
}

// Sample a pre-built land mask: true = land, false = water
function sampleLand(ctx: CanvasRenderingContext2D, phi: number, theta: number): boolean {
  const lat = 90 - (phi / Math.PI) * 180;
  const lon = (((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * 360 - 180;
  const x = Math.min(359, Math.max(0, Math.round((lon + 180) / 360 * 360)));
  const y = Math.min(179, Math.max(0, Math.round((90 - lat) / 180 * 180)));
  return ctx.getImageData(x, y, 1, 1).data[0] > 128;
}

// ─── Binary Globe ─────────────────────────────────────────────────────────────
const BinaryGlobe = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLiteMode } = useLiteMode();
  const isLiteModeRef = useRef(isLiteMode);

  useEffect(() => { isLiteModeRef.current = isLiteMode; }, [isLiteMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const landCtx = buildLandMask();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 500);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const COLOR = '#00ff88';
    const tex1 = createCharTexture('1', COLOR); // land
    const tex0 = createCharTexture('0', COLOR); // water

    // Scaled down from 0.28 → 0.20
    const RADIUS = Math.min(container.clientWidth, container.clientHeight) * 0.20;
    const goldenAngle = Math.PI * (1 + Math.sqrt(5));

    const posLand: number[]  = [];  // "1" — land surface
    const posWater: number[] = [];  // "0" — ocean surface
    const posInner: number[] = [];  // interior fill for solid look

    // Surface particles mapped to land/water via the land mask
    const SURFACE_COUNT = 2800;
    for (let i = 0; i < SURFACE_COUNT; i++) {
      const phi   = Math.acos(1 - (2 * i) / SURFACE_COUNT);
      const theta = goldenAngle * i;
      const x = RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = RADIUS * Math.cos(phi);
      const z = RADIUS * Math.sin(phi) * Math.sin(theta);
      (sampleLand(landCtx, phi, theta) ? posLand : posWater).push(x, y, z);
    }

    // Interior particles for volumetric fill (random points inside sphere)
    for (let i = 0; i < 700; i++) {
      let x, y, z;
      do {
        x = (Math.random() * 2 - 1) * RADIUS * 0.9;
        y = (Math.random() * 2 - 1) * RADIUS * 0.9;
        z = (Math.random() * 2 - 1) * RADIUS * 0.9;
      } while (x * x + y * y + z * z > RADIUS * RADIUS * 0.81);
      posInner.push(x, y, z);
    }

    const makePoints = (pos: number[], tex: THREE.CanvasTexture, size: number, opacity: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        size, map: tex, transparent: true, opacity, sizeAttenuation: true, depthWrite: false,
      }));
    };

    const globe = new THREE.Group();
    if (posLand.length)  globe.add(makePoints(posLand,  tex1, 18, 0.95));
    if (posWater.length) globe.add(makePoints(posWater, tex0, 13, 0.45));
    if (posInner.length) globe.add(makePoints(posInner, tex0, 10, 0.25));
    scene.add(globe);

    // ─── Laser scan effect: horizontal glowing disc that sweeps vertically ────
    const matDisc  = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const matRing  = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const matOuter = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.14, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });

    const innerDisc = new THREE.Mesh(new THREE.CircleGeometry(RADIUS * 0.97, 64), matDisc);
    innerDisc.rotation.x = Math.PI / 2;

    const ring = new THREE.Mesh(new THREE.RingGeometry(RADIUS * 0.93, RADIUS * 1.02, 64), matRing);
    ring.rotation.x = Math.PI / 2;

    const outerRing = new THREE.Mesh(new THREE.RingGeometry(RADIUS * 1.01, RADIUS * 1.18, 64), matOuter);
    outerRing.rotation.x = Math.PI / 2;

    const scanGroup = new THREE.Group();
    scanGroup.add(innerDisc, ring, outerRing);
    scene.add(scanGroup);

    // Mouse tilt
    let targetTiltX = 0, targetTiltZ = 0;
    const onMouseMove = (e: MouseEvent) => {
      targetTiltX = (e.clientY / window.innerHeight - 0.5) * -0.4;
      targetTiltZ = (e.clientX / window.innerWidth - 0.5) * 0.15;
    };
    window.addEventListener('mousemove', onMouseMove);

    let hasRenderedLite = false;
    let animId = 0;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isLiteModeRef.current) {
        if (!hasRenderedLite) { renderer.render(scene, camera); hasRenderedLite = true; }
        return;
      }
      hasRenderedLite = false;
      clock += 0.016;

      globe.rotation.y += 0.003;
      globe.rotation.x += (targetTiltX - globe.rotation.x) * 0.03;
      globe.rotation.z += (targetTiltZ - globe.rotation.z) * 0.03;

      // Laser scan sweeps vertically and pulses in brightness
      const scanY  = Math.sin(clock * 0.5) * RADIUS;
      const pulse  = 0.7 + Math.sin(clock * 4) * 0.3;
      scanGroup.position.y = scanY;
      matDisc.opacity  = 0.06 * pulse;
      matRing.opacity  = 0.55 * pulse;
      matOuter.opacity = 0.14 * pulse;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
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
      [matDisc, matRing, matOuter].forEach(m => m.dispose());
      [innerDisc, ring, outerRing].forEach(m => m.geometry.dispose());
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
