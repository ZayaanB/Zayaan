'use client';

// Hero section: word-by-word title reveal + cobe globe with CSS scan sweep
import { useEffect, useState } from 'react';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import { CobePulseGlobe } from '@/components/ui/cobe-globe-pulse';

// Green scan line clipped to the globe circle; mix-blend-mode: screen brightens globe dots
const GlobeScanEffect = () => (
  <div className="globe-scan-container">
    <div className="globe-scan-sweep" />
  </div>
);

export const HeroFuturistic = () => {
  const titleWords = ['BUILDING', 'PRACTICAL', 'SOFTWARE'];
  const subtitle = 'CS @ University of Toronto Scarborough · AI · SWE · Data';

  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  // Client-only jitter to avoid SSR/hydration mismatch
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);
  const { isLiteMode } = useLiteMode();

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.06));
    setSubtitleDelay(Math.random() * 0.08);
  }, []);

  // Reveal one word every 450 ms, then show subtitle
  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const t = setTimeout(() => setVisibleWords((v) => v + 1), 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSubtitleVisible(true), 500);
    return () => clearTimeout(t);
  }, [visibleWords]);

  return (
    <div className="h-svh relative overflow-hidden bg-black">
      {/* Text overlay — pointer-events-none so globe drag still works */}
      <div className="h-svh uppercase items-center w-full absolute z-[60] pointer-events-none px-4 flex justify-center flex-col">

        {/* Word-by-word title — each word reveals independently */}
        <div className="flex flex-wrap gap-x-4 md:gap-x-7 lg:gap-x-10 w-full max-w-[1200px]">
          {titleWords.map((word, i) => (
            <span
              key={word}
              className={i < visibleWords ? 'hero-word-in' : ''}
              style={{
                opacity: i < visibleWords ? undefined : 0,
                animationDelay: `${delays[i] || 0}s`,
                fontSize: 'clamp(2.2rem, 6.5vw, 6.5rem)',
                fontWeight: 800,
                color: 'white',
                display: 'inline-block',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden text-white font-bold w-full max-w-[1200px]">
          <div
            className={subtitleVisible ? 'hero-fade-in-subtitle' : ''}
            style={{
              animationDelay: `${0.2 + subtitleDelay}s`,
              opacity: subtitleVisible ? undefined : 0,
            }}
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

      {/* Cobe globe + scan overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center z-[10]"
        style={{ pointerEvents: isLiteMode ? 'none' : 'auto' }}
      >
        <div style={{ width: 'min(52vh, 52vw)', position: 'relative' }}>
          <CobePulseGlobe speed={0.003} />
          {/* Scan sweep is hidden in Lite Mode */}
          {!isLiteMode && <GlobeScanEffect />}
        </div>
      </div>
    </div>
  );
};

export default HeroFuturistic;
