'use client';

import React from 'react';

interface SkillItem {
  label: string;
  icon: React.ReactNode;
}

interface SkillsMarqueeProps {
  skills: SkillItem[];
  reverse?: boolean;
  speed?: string;
  category?: string;
}

export function SkillsMarquee({ skills, reverse = false, speed = '40s', category }: SkillsMarqueeProps) {
  return (
    <div className="flex flex-col w-full gap-2 mt-4 first:mt-0">
      {category && (
        <h3 className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--p-muted)] font-semibold px-4 md:px-8 mb-1">
          {category}
        </h3>
      )}
      <div className="relative w-full overflow-hidden flex items-center marquee-container">
      {/* 
        Left and right gradient masks 
        Fades out the edges so chips smoothly disappear rather than hard clipping.
      */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[--p-bg] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[--p-bg] to-transparent z-10 pointer-events-none" />
      
      <div 
        className={`flex w-max p-marquee-track hover:[animation-play-state:paused] ${reverse ? 'p-marquee-track-reverse' : ''}`}
        style={{ animationDuration: speed }}
      >
        {/* We use two identical blocks that each contain the gap internally.
            This ensures translating exactly -50% perfectly loops back to the start. */}
        <div className="flex shrink-0 gap-4 items-center pr-4">
          {skills.map((skill, index) => (
            <span 
              key={`${skill.label}-${index}`} 
              className="p-chip shrink-0 select-none cursor-default flex items-center gap-2"
            >
              <span className="text-[1.1em] opacity-80">{skill.icon}</span>
              {skill.label}
            </span>
          ))}
        </div>
        
        <div className="flex shrink-0 gap-4 items-center pr-4" aria-hidden="true">
          {skills.map((skill, index) => (
            <span 
              key={`${skill.label}-dup-${index}`} 
              className="p-chip shrink-0 select-none cursor-default flex items-center gap-2"
            >
              <span className="text-[1.1em] opacity-80">{skill.icon}</span>
              {skill.label}
            </span>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
