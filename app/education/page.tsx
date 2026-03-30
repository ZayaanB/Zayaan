import type { Metadata } from 'next';
import { GlowCard } from '@/components/ui/spotlight-card';

export const metadata: Metadata = {
  title: 'Education',
  description: 'Academic background and achievements of Zayaan Bhanwadia.',
};

const education = [
  {
    school: 'University of Toronto Scarborough',
    meta: 'BSc Computer Science (Co-op) | 2025 - Present',
    bullets: [
      'Maintained a current GPA of 3.86 / 4.0.',
      'Earned the Scholars Scholarship, receiving an award of CAD $10,000.',
      'Focused studies on software engineering, AI applications, and systems development.',
    ],
  },
  {
    school: 'Victoria Park Collegiate Institute',
    meta: '2021 - 2025',
    bullets: [
      'Served as Student Council Secretary, DECA Trainer, NASA HUNCH Co-President, and Badminton Team Captain.',
      'Graduated with a 97.8% Top 6 Final Average.',
    ],
  },
  {
    school: 'Academic Focus Areas',
    meta: null,
    bullets: [
      'Studied programming and data structures utilizing Java and Python.',
      'Developed applied machine learning models and executed data-driven projects.',
      'Employed modern software development workflows using Git, the Linux terminal, and professional IDE tools.',
    ],
  },
];

export default function EducationPage() {
  return (
    <main className="p-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <section className="p-section">
        <div className="p-section-head">
          <h1 className="p-h1">Education</h1>
          <p>Academic journey, scholarships, and areas of study.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {education.map((e) => (
            <GlowCard key={e.school} customSize className="w-full flex flex-col gap-2">
              <h3 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--p-text)',
                margin: 0,
              }}>
                {e.school}
              </h3>
              {e.meta && (
                <p style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--p-accent-cyan)',
                  margin: 0,
                }}>
                  {e.meta}
                </p>
              )}
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
