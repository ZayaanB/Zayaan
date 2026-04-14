import type { Metadata } from 'next';
import { GlowCard } from '@/components/ui/spotlight-card';

export const metadata: Metadata = {
  title: 'Education',
  description: 'Academic journey, scholarships, and academic focus.',
};

const education = [
  {
    school: 'University of Toronto Scarborough',
    meta: 'BSc Computer Science (Co-op) | 2025 - Present',
    bullets: [
      'Maintained a current GPA of 3.7 / 4.0.',
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
        {/* page intro mirrors metadata copy for ui and seo consistency */}
        <div className="p-section-head">
          <h1 className="p-h1">Education</h1>
          <p>Academic journey, scholarships, and academic focus.</p>
        </div>

        {/* responsive card grid keeps readability stable across breakpoints */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: '1.25rem',
        }}>
          {education.map((e) => (
            <GlowCard key={e.school} customSize className="w-full flex flex-col gap-2">
              <h3 className="p-card-title">
                {e.school}
              </h3>
              {e.meta && (
                <p className="p-card-meta">
                  {e.meta}
                </p>
              )}
              <ul className="p-bullet-list">
                {e.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </GlowCard>
          ))}
        </div>
      </section>
    </main>
  );
}
