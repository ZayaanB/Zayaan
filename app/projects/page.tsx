import type { Metadata } from 'next';
import { GlowCard } from '@/components/ui/spotlight-card';
import { ExternalLink } from 'lucide-react';

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
      'I developed a real-time AI referee that uses Computer Vision to track live gameplay and accurately determine match outcomes.',
      'I programmed a Solana escrow system to manage staked matches and facilitate secure on-chain payouts.',
      'I placed Top 3 overall for building the best implementation of the Solana API.',
    ],
    link: 'https://github.com/ZayaanB/Ref.AI',
  },
  {
    title: 'Halo Healthcare',
    meta: 'Python · FastAPI · OpenCV · IBM Watsonx',
    event: 'Mar 2026 @ GenAI Genesis',
    badge: 'Top 10 Project',
    bullets: [
      'I engineered an AI clinical assistant that automates patient check-ins and actively structures medical data.',
      'I built a live monitoring dashboard that utilizes Computer Vision to execute real-time fall detection.',
      'I designed a fully PIPEDA-compliant backend architecture using FastAPI and Supabase.',
    ],
    link: 'https://github.com/ZayaanB/Halo-Healthcare',
  },
  {
    title: 'Sustainability NFT Tokener',
    meta: 'Python · JavaScript · Gemini AI · Solana',
    event: 'Feb 2026 @ UTRA Hacks',
    badge: '3rd Place Overall',
    bullets: [
      'I created a proof-of-impact application that uses Gemini AI to verify environmentally sustainable actions.',
      'I integrated the Solana blockchain to tokenize verified actions into unique NFTs.',
      'I trained the classification model to achieve a 92% verification accuracy rate.',
    ],
    link: 'https://github.com/ZayaanB/UTRABot',
  },
  {
    title: 'Windows Terminal AI Assistant',
    meta: 'Python',
    event: 'Jan 2026',
    badge: null,
    bullets: [
      'I wrote an AI-powered assistant that translates natural language requests directly into executable terminal commands.',
      'I implemented a safety interception layer that proactively detects and blocks potentially destructive terminal commands.',
    ],
    link: 'https://github.com/ZayaanB/Terminal-Helper',
  },
  {
    title: 'AI-Powered YouTube Video Analyst',
    meta: 'Python · YouTube Data API · Gemini API',
    event: 'Dec 2025',
    badge: null,
    bullets: [
      'I deployed an ML pipeline utilizing the Gemini API to analyze YouTube video metadata and thumbnails for deceptive clickbait.',
      'I integrated the YouTube Data API to actively search for authentic videos that match user preferences.',
      'I trained the detection model to achieve an 80% accuracy rate in identifying clickbait.',
    ],
    link: 'https://github.com/ZayaanB/Youtube-Helper',
  },
  {
    title: 'Mock Banking Application',
    meta: 'Java',
    event: 'Sep 2024 - Jan 2025',
    badge: null,
    bullets: [
      'I programmed rigorous account and transaction management systems utilizing secure file I/O persistence.',
      'I applied strict Object-Oriented design principles and integrated core data structure fundamentals.',
    ],
    link: null,
  },
  {
    title: 'Plants vs. Zombies Parody',
    meta: 'Java',
    event: '2023 - Jan 2024',
    badge: null,
    bullets: [
      'I built a complete game project that actively demonstrates Java OOP fundamentals.',
      'I focused entirely on architecting clean class structures and designing engaging gameplay mechanics.',
    ],
    link: 'https://github.com/ZayaanB/plantsVsZombies',
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {projects.map((p) => (
            <GlowCard key={p.title} customSize className="flex flex-col gap-3 w-full">
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
