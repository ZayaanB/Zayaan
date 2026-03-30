'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/spotlight-card';

export interface ProfileCardData {
  title: string;
  body: string;
}

interface ProfileCardStackProps {
  cards: ProfileCardData[];
}

export function ProfileCardStack({ cards }: ProfileCardStackProps) {
  // activeIndex = Top card of the face-up pile
  const [activeIndex, setActiveIndex] = useState(0);
  const [offset, setOffset] = useState(200);

  // Responsive layout calculation
  useEffect(() => {
    const handleResize = () => setOffset(window.innerWidth < 640 ? 95 : 200);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFaceUpClick = () => {
    if (activeIndex < cards.length) setActiveIndex(activeIndex + 1);
  };

  const handleFaceDownClick = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const getStackOffset = (index: number) => {
    const isFaceUp = index >= activeIndex;
    const stackPosition = isFaceUp ? index - activeIndex : activeIndex - 1 - index;
    return Math.min(stackPosition * 6, 18);
  };

  const getRotationZ = (index: number) => {
    const isFaceUp = index >= activeIndex;
    const stackPosition = isFaceUp ? index - activeIndex : activeIndex - 1 - index;
    const rot = [0, -2, 3, -1, 2][stackPosition % 5] || 0;
    return rot;
  };

  // Generate matrix bg once to avoid hydration mismatch and blinking
  const [matrixBg, setMatrixBg] = useState('');
  useEffect(() => {
    setMatrixBg(Array.from({ length: 600 }).map(() => (Math.random() > 0.5 ? '1' : '0')).join(' '));
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center pt-8 pb-10 relative">
      <div 
        className="w-full max-w-[800px] h-[460px] relative flex justify-center items-center"
        style={{ perspective: '1500px' }}
      >
        {cards.map((card, index) => {
          const isFaceUp = index >= activeIndex;
          
          let x = isFaceUp ? offset : -offset;
          let y = getStackOffset(index);
          let rotateZ = getRotationZ(index);
          let rotateY = isFaceUp ? 0 : 180;
          let zIndex = isFaceUp ? (cards.length - index) : (index + 1);

          return (
            <motion.div
              key={card.title}
              className="absolute top-1/2 left-1/2 cursor-pointer w-[280px] h-[380px] sm:w-[320px] sm:h-[420px]"
              initial={false}
              animate={{
                x: `calc(-50% + ${x}px)`,
                y: `calc(-50% + ${y}px)`,
                rotateY,
                rotateZ,
                zIndex
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              onClick={isFaceUp ? handleFaceUpClick : handleFaceDownClick}
              style={{ transformStyle: 'preserve-3d' }}
              title={isFaceUp ? "Click to flip card" : "Click to view card"}
            >
              {/* FACE UP - FRONT */}
              <div 
                className="w-full h-full absolute top-0 left-0"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <GlowCard customSize className="w-full h-full flex flex-col p-8 gap-4 shadow-xl !bg-[#0b0e17]">
                  <h3 className="text-xl font-bold font-sora mb-2 leading-tight tracking-tight text-[#00ff88]">
                    {card.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {card.body}
                  </p>
                </GlowCard>
              </div>

              {/* FACE DOWN - BACK */}
              <div 
                className="w-full h-full absolute top-0 left-0"
                style={{ 
                  backfaceVisibility: 'hidden', 
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)' 
                }}
              >
                <GlowCard customSize className="w-full h-full flex items-center justify-center overflow-hidden border-[#00ff88]/30 !bg-[#0b0e17]">
                  <div className="absolute inset-0 opacity-10 flex flex-wrap content-start text-[10px] text-[#00ff88] break-all leading-tight font-mono pointer-events-none p-4 select-none">
                    {matrixBg}
                  </div>
                  
                  {/* Hexagon/Triangle Logo Motif */}
                  <div className="z-10 bg-black/60 p-5 border border-[#00ff88]/30 rounded-xl w-20 h-20 flex items-center justify-center backdrop-blur-md shadow-lg rotate-45">
                    <div className="w-10 h-10 border-2 border-[#00ff88] rounded-sm flex items-center justify-center -rotate-45 relative">
                      <div className="absolute w-2 h-2 bg-[#00ff88] rounded-full top-1 left-1 animate-pulse" />
                    </div>
                  </div>
                </GlowCard>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm tracking-wide bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800">
          {activeIndex < cards.length 
            ? "Click the face-up pile to see the next card." 
            : "All cards flipped. Click the face-down pile to restart."}
        </p>
      </div>
    </div>
  );
}
