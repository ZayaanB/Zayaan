import type { Metadata } from 'next';
import { GlowCard } from '@/components/ui/spotlight-card';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

import refaiImg from '@/project_images/refai.png';
import haloImg from '@/project_images/halo.png';
import trustokenImg from '@/project_images/trustoken.png';
import terminalAiImg from '@/project_images/terminal_ai.png';
import youtubeImg from '@/project_images/youtube.png';
import bankImg from '@/project_images/bank.png';
import pvzImg from '@/project_images/pvz.png';
export const metadata: Metadata = {
  title: 'Projects',
  description: 'Hackathon wins and personal projects by Zayaan Bhanwadia.',
};

const projects = [
  {
    title: 'Ref.AI',
    meta: 'Next.js · Python · OpenCV · Solana · FastAPI',
    event: 'Mar 2026 @ Hack Canada',
    badge: 'Top 3 Finalist',
    bullets: [
      'Engineered an automated referee system using computer vision to track live game play and determine outcomes.',
      'Integrated a Solana-based prediction market to enable secure wagering.',
      'Created game logic and points system based on the coordinate system provided by YOLO.',
    ],
    link: 'https://github.com/ZayaanB/Ref.AI',
    image: refaiImg,
  },
  {
    title: 'Halo Healthcare',
    meta: 'Python · FastAPI · OpenCV · IBM Watsonx',
    event: 'Mar 2026 @ GenAI Genesis',
    badge: 'Top 10 Project',
    bullets: [
      'Developed an AI clinical assistant using IBM Watsonx APIs to automate patient check-ins and structure data.',
      'Engineered a live monitoring dashboard with a computer vision module for real-time fall detection.',
      'Built a PIPEDA and HIPAA-compliant backend using FastAPI and Supabase to process healthcare information securely.',
    ],
    link: 'https://github.com/ZayaanB/Halo-Healthcare',
    image: haloImg,
  },
  {
    title: 'Sustainability NFT Tokener',
    meta: 'Python · JavaScript · Gemini AI · Solana',
    event: 'Feb 2026 @ UTRA Hacks',
    badge: '3rd Place Overall',
    bullets: [
      'Developed a proof-of-impact sustainability application using Openrouter API and a confidence system to verify inputs.',
      'Integrated Solana blockchain to tokenize NFTs for verified actions.',
    ],
    link: 'https://github.com/ZayaanB/UTRABot',
    image: trustokenImg,
  },
  {
    title: 'Windows Terminal AI Assistant',
    meta: 'Python',
    event: 'Jan 2026',
    badge: null,
    bullets: [
      'Engineered an AI-powered assistant using GPT-OSS that translates natural language into terminal commands.',
      'Implemented a safety interception layer to detect and block potentially destructive commands.',
    ],
    link: 'https://github.com/ZayaanB/Terminal-Helper',
    image: terminalAiImg,
  },
  {
    title: 'AI-Powered YouTube Video Analyst',
    meta: 'Python · YouTube Data API · Gemini API',
    event: 'Dec 2025',
    badge: null,
    bullets: [
      'Deployed an ML pipeline utilizing the Gemini API to analyze YouTube video metadata and thumbnails for deceptive clickbait.',
      'Integrated the YouTube Data API to actively search for authentic videos that match user preferences.',
      'Trained the detection model to achieve an 80% accuracy rate in identifying clickbait.',
    ],
    link: 'https://github.com/ZayaanB/Youtube-Helper',
    image: youtubeImg,
  },
  {
    title: 'Mock Banking Application',
    meta: 'Java',
    event: 'Sep 2024 - Jan 2025',
    badge: null,
    bullets: [
      'Programmed rigorous account and transaction management systems utilizing secure file I/O persistence.',
      'Applied strict Object-Oriented design principles and integrated core data structure fundamentals.',
    ],
    link: null,
    image: bankImg,
  },
  {
    title: 'Plants vs. Zombies Parody',
    meta: 'Java',
    event: '2023 - Jan 2024',
    badge: null,
    bullets: [
      'Built a complete game project that actively demonstrates Java OOP fundamentals.',
      'Focused entirely on architecting clean class structures and designing engaging gameplay mechanics.',
    ],
    link: 'https://github.com/ZayaanB/plantsVsZombies',
    image: pvzImg,
  },
];

export default function ProjectsPage() {
  return (
    <main className="p-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <section className="p-section">
        <div className="p-section-head">
          <h1 className="p-h1">Projects</h1>
          <p>Hackathon builds, personal tools, and coursework. Focused on practical impact.</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {projects.map((p) => (
            <GlowCard key={p.title} customSize className="flex flex-col gap-3 w-full p-5 sm:p-5">
              {p.image && (
                <div className="-mx-5 -mt-5 mb-2 relative h-48 overflow-hidden rounded-t-[10px] sm:rounded-t-[12px]">
                  <Image
                    src={p.image}
                    alt={`${p.title} cover`}
                    fill
                    unoptimized
                    className="object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  {/* Subtle bottom gradient to blend the image border gently into the card */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,18,35,0.9)] to-transparent pointer-events-none" />
                </div>
              )}

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <h3 style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--p-text)',
                  margin: 0,
                }}>
                  {p.title}
                </h3>
                {p.badge && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'var(--p-primary)',
                    background: 'rgba(0,255,136,0.1)',
                    border: '1px solid rgba(0,255,136,0.25)',
                    borderRadius: '9999px',
                    padding: '0.2rem 0.55rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {p.badge}
                  </span>
                )}
              </div>

              {/* Meta */}
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--p-accent-cyan)', margin: 0, fontWeight: 600 }}>
                  {p.meta}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--p-muted)', margin: '0.15rem 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
                  {p.event}
                </p>
              </div>

              {/* Bullets */}
              <ul style={{
                color: 'var(--p-muted)',
                fontSize: '0.875rem',
                margin: 0,
                paddingLeft: '1.1rem',
                lineHeight: 1.65,
                flexGrow: 1,
              }}>
                {p.bullets.map((b) => <li key={b} style={{ marginBottom: '0.25rem' }}>{b}</li>)}
              </ul>

              {/* Link */}
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'var(--p-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginTop: 'auto',
                    transition: 'color 0.2s',
                  }}
                >
                  View on GitHub <ExternalLink size={13} />
                </a>
              )}
            </GlowCard>
          ))}
        </div>
      </section>
    </main>
  );
}
