'use client';

// ─── Hero: cobe globe background + particle title overlay ─────────────────────
import { useEffect, useState } from 'react';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particles-typography';
import { CobePulseGlobe } from '@/components/ui/cobe-globe-pulse';

// ─── HeroFuturistic: particle title + interactive cobe globe ─────────────────
export const HeroFuturistic = () => {
  const subtitle = 'CS @ University of Toronto Scarborough · AI · SWE · Data';
  const [textVisible, setTextVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [subtitleDelay, setSubtitleDelay] = useState(0);
  const { isLiteMode } = useLiteMode();

  useEffect(() => {
    setSubtitleDelay(Math.random() * 0.1);
    const t1 = setTimeout(() => setTextVisible(true), 400);
    const t2 = setTimeout(() => setSubtitleVisible(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="h-svh relative overflow-hidden bg-black">
      {/* Text overlay — pointer-events-none lets mouse drag reach the globe below */}
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

      {/* Cobe globe — draggable, LiteMode-aware, centred in hero */}
      <div className="absolute inset-0 flex items-center justify-center z-[10]"
           style={{ pointerEvents: isLiteMode ? 'none' : 'auto' }}>
        <div style={{ width: 'min(52vh, 52vw)' }}>
          <CobePulseGlobe speed={0.003} />
        </div>
      </div>
    </div>
  );
};

export default HeroFuturistic;
