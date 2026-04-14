"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  heading?: string;
  description?: string;
}

export const Timeline = ({ data, heading, description }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 90%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={containerRef} className="w-full">
      {/* header matches p-container and p-section-head patterns */}
      <div className="p-container" style={{ paddingTop: '2.5rem' }}>
        <div className="p-section-head">
          <h1 className="p-h1">{heading ?? "Timeline"}</h1>
          {description && (
            <p style={{ margin: '0.4rem 0 0', color: 'var(--p-muted)' }}>{description}</p>
          )}
        </div>
      </div>

      {/* timeline entries */}
      <div ref={ref} className="relative p-container pb-20 md:px-10">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div
                className="h-10 absolute left-3 md:left-3 w-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--p-bg)' }}
              >
                <div
                  className="h-4 w-4 rounded-full p-2"
                  style={{
                    background: 'var(--p-surface-strong)',
                    border: '1px solid var(--p-border)',
                  }}
                />
              </div>
              <h3
                className="hidden md:block md:pl-20 font-bold"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(0.9rem, 1.8vw, 1.25rem)',
                  color: 'var(--p-muted)',
                }}
              >
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3
                className="md:hidden block text-2xl mb-4 text-left font-bold"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--p-muted)',
                }}
              >
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        {/* scroll-fill line */}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-blue-500 via-green-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
