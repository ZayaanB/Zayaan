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
      'Current GPA: 3.86 / 4.0.',
      'Scholars Scholarship recipient (CAD $10,000).',
      'Focus on software engineering, AI applications, and systems development.',
    ],
  },
  {
    school: 'Victoria Park Collegiate Institute',
    meta: '2021 - 2025',
    bullets: [
      'Student Council Secretary, DECA Trainer, NASA HUNCH Co-President, Badminton Team Captain.',
      '97.8% Top 6 Final Average.',
    ],
  },
  {
    school: 'Academic Focus Areas',
    meta: null,
    bullets: [
      'Programming and data structures with Java and Python.',
      'Applied machine learning and data-driven projects.',
      'Software development workflow with Git, Linux terminal, and modern IDE tools.',
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
