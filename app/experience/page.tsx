import type { Metadata } from 'next';
import { GlowCard } from '@/components/ui/spotlight-card';

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Work experience and leadership roles of Zayaan Bhanwadia.',
};

const experience = [
  {
    title: 'Executive — Association of Mathematics and Computer Science Students (AMACSS)',
    org: 'University of Toronto Scarborough',
    date: '2025 – Present',
    bullets: [
      'Produced and distributed a departmental newsletter for the Computer and Mathematical Sciences Department.',
      'Reached over 2,000 students and achieved an open rate over 50%.',
    ],
  },
  {
    title: 'DECA International Career Development Conference Qualifier',
    org: 'DECA Inc. — International',
    date: 'Sep 2024 – Jun 2025',
    bullets: [
      'Placed Top 20 internationally in Startup Marketing Campaigns.',
      'Trained a group of 8 students in written events and marketing strategy, with around 50% qualifying for ICDC.',
    ],
  },
  {
    title: 'Co-President — NASA HUNCH',
    org: 'NASA HUNCH Program — Canada',
    date: 'Sep 2023 – Jun 2025',
    bullets: [
      'Led team to 3rd place, becoming the first ever Canadian school to compete in NASA HUNCH.',
      'Developed an autonomous Lunar Explorer and CAD simulation using Arduino, capable of traversing lunar terrain.',
    ],
  },
  {
    title: 'Vice President of Technology — BLINK JA',
    org: 'Junior Achievement Company Program — Canada',
    date: 'Sep 2022 – Jun 2023',
    bullets: [
      'Led a team of 5 to design and maintain a company website, generating over $2,300 in online sales.',
      'Tracked and analyzed website sales metrics to support executive marketing decisions, increasing website traffic by 30%.',
    ],
  },
];

export default function ExperiencePage() {
  return (
    <main className="p-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <section className="p-section">
        <div className="p-section-head">
          <h1 className="p-h1">Experience</h1>
          <p>Leadership, mentorship, and technical roles that shaped my approach to software and teamwork.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {experience.map((e) => (
            <GlowCard key={e.title} customSize className="w-full flex flex-col gap-2">
              {/* Header row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <h2 style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--p-text)',
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {e.title}
                </h2>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.78rem',
                  color: 'var(--p-primary)',
                  background: 'rgba(0,255,136,0.08)',
                  border: '1px solid rgba(0,255,136,0.2)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.6rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {e.date}
                </span>
              </div>

              {/* Org */}
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--p-accent-cyan)',
                margin: 0,
                fontWeight: 500,
              }}>
                {e.org}
              </p>

              {/* Bullets */}
              <ul style={{
                color: 'var(--p-muted)',
                fontSize: '0.9rem',
                margin: 0,
                paddingLeft: '1.2rem',
                lineHeight: 1.7,
              }}>
                {e.bullets.map((b) => <li key={b} style={{ marginBottom: '0.25rem' }}>{b}</li>)}
              </ul>
            </GlowCard>
          ))}
        </div>
      </section>
    </main>
  );
}
