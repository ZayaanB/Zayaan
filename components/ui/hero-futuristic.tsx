'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particles-typography';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';

import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
  mix,
  add
} from 'three/tsl';

const TEXTUREMAP = { src: '/ZayaanBhanwadia/images/texture-map.png' };
const DEPTHMAP = { src: '/ZayaanBhanwadia/images/depth-map.webp' };

// Extend React Three Fiber globally. 
// 'THREE as any' bypasses temporary TS mismatches since bleeding-edge three/tsl nodes are partially untyped in R183.
extend(THREE as any);

// Post Processing Component
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const { isLiteMode } = useLiteMode();
  const progressRef = useRef({ value: 0 });
  const renderOnce = useRef(false);

  const render = useMemo(() => {
    const postProcessing = new (THREE as any).PostProcessing(gl as any);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    // Create the scanning effect uniform
    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    // Create a green/cyan overlay that follows the scan line to match the site's branding.
    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const redOverlay = vec3(0, 1, 0.533).mul(oneMinus(scanLine)).mul(0.4);

    // Mix the original scene with the green overlay
    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, redOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0
    );

    // Add bloom effect after scan effect
    const final = withScanEffect.add(bloomPass);

    postProcessing.outputNode = final;

    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    if (isLiteMode) {
      if (!renderOnce.current) {
        render.render();
        renderOnce.current = true;
      }
      return;
    }
    renderOnce.current = false;
    // Animate the scan line from top to bottom
    progressRef.current.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    render.render();
  }, 1);

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.01;

    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
    );

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    const depth = tDepthMap.r; // Extract red channel to fix typescript

    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    const mask = dot.mul(flow).mul(vec3(0, 10, 5.33));

    const final = blendScreen(tMap, mask);

    const material = new (THREE as any).MeshBasicNodeMaterial({
      colorNode: final,
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  const { isLiteMode } = useLiteMode();

  useFrame(({ clock }) => {
    if (isLiteMode) return;
    uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
  });

  useFrame(({ pointer }) => {
    if (isLiteMode) return;
    uniforms.uPointer.value = pointer;
  });

  const scaleFactor = 0.3;
  return (
    <mesh scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export const HeroFuturistic = () => {
  const subtitle = 'CS @ University of Toronto Scarborough · AI · SWE · Data';
  const [textVisible, setTextVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    // Client-side execution tracking standard cascade delays securely post load.
    setSubtitleDelay(Math.random() * 0.1);
    
    const textTimeout = setTimeout(() => setTextVisible(true), 400); // Sharp entry timing
    const subTimeout = setTimeout(() => setSubtitleVisible(true), 1200); // Standard staggered trailer

    return () => {
      clearTimeout(textTimeout);
      clearTimeout(subTimeout);
    };
  }, []);

  return (
    <div className="h-svh relative overflow-hidden bg-black">
      <div className="h-svh uppercase items-center w-full absolute z-[60] pointer-events-none px-4 flex justify-center flex-col">
        {/* Massive responsive interactive boundary container strictly bridging mouse events directly to the HTML Canvas underneath bypassing R3F nullification locally */}
        <div className="w-full max-w-[1200px] h-[7vh] md:h-[12vh] lg:h-[15vh] pointer-events-none">
          <div
            className={`w-full h-full transition-opacity duration-1000 ${textVisible ? 'opacity-100 hero-fade-in' : 'opacity-0'}`}
          >
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

      <button
        className="explore-btn z-[60] relative"
        style={{ animationDelay: '2.2s' }}
      >
        Scroll to explore
        <span className="explore-arrow">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-svg">
            <path d="M11 5V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 12L11 17L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      <Canvas
        flat
        gl={async (props) => {
          // IMPORTANT: forceWebGL bypasses a native swap-chain conflict between R3F's requestAnimationFrame and three/webgpu hooks,
          // ensuring the 3D element morphs correctly on all devices without freezing.
          const renderer = new (THREE as any).WebGPURenderer({ ...(props as any), forceWebGL: true });
          await renderer.init();
          return renderer;
        }}
        className="absolute inset-0"
      >
        <PostProcessing fullScreenEffect={true} />
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroFuturistic;
