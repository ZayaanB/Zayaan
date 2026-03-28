'use client';

// Hero: word-by-word title reveal + cobe globe with CSS scan sweep
import { useEffect, useState } from 'react';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import { CobePulseGlobe } from '@/components/ui/cobe-globe-pulse';

// mix-blend-mode: screen makes the scan line brighten globe dots as it passes
const GlobeScanEffect = () => (
  <div className="globe-scan-container">
    <div className="globe-scan-sweep" />
  </div>
);

export const HeroFuturistic = () => {
  const titleWords = ['ZAYAAN', 'BHANWADIA ', ' · COPMUTER', 'SCIENCE'];
  const subtitle = 'CS @ UOFT · SWE · AI · Data';

  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  // Jitter set client-side only to avoid SSR/hydration mismatch
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
      {/* pointer-events-none keeps globe drag functional beneath the text */}
      <div className="h-svh uppercase items-center w-full absolute z-[60] pointer-events-none px-4 flex justify-center flex-col">
        <div className="flex flex-nowrap justify-center gap-x-4 md:gap-x-6 w-full">
          {titleWords.map((word, i) => (
            <span
              key={word}
              className={i < visibleWords ? 'hero-word-in' : ''}
              style={{
                opacity: i < visibleWords ? undefined : 0,
                animationDelay: `${delays[i] || 0}s`,
                fontSize: 'clamp(1.6rem, 3.2vw, 3rem)',
                fontWeight: 800,
                color: 'white',
                display: 'inline-block',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {word}
            </span>
          ))}
        </div>

        <div
          className="mt-3 overflow-hidden text-white font-bold text-center w-full"
          style={{ whiteSpace: 'nowrap', fontSize: 'clamp(0.7rem, 1.4vw, 1.2rem)' }}
        >
          <div
            className={subtitleVisible ? 'hero-fade-in-subtitle' : ''}
            style={{ animationDelay: `${0.2 + subtitleDelay}s`, opacity: subtitleVisible ? undefined : 0 }}
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

      {/* Globe — pointer events disabled in Lite Mode */}
      <div
        className="absolute inset-0 flex items-center justify-center z-[10]"
        style={{ pointerEvents: isLiteMode ? 'none' : 'auto' }}
      >
        <div style={{ width: 'min(52vh, 52vw)', position: 'relative' }}>
          <CobePulseGlobe speed={0.003} />
          {!isLiteMode && <GlobeScanEffect />}
        </div>
      </div>
    </div>
  );
};

export default HeroFuturistic;
