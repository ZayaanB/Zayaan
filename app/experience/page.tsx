import type { Metadata } from 'next';
import { Timeline } from '@/components/ui/timeline';

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Work experience and leadership roles of Zayaan Bhanwadia.',
};

function ExperienceCard({
  title,
  org,
  bullets,
}: {
  title: string;
  org: string;
  bullets: string[];
}) {
  return (
    <div>
      <p style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--p-text)',
        margin: '0 0 0.3rem',
        lineHeight: 1.3,
      }}>
        {title}
      </p>
      <p style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--p-accent-cyan)',
        margin: '0 0 1rem',
      }}>
        {org}
      </p>
      <ul style={{
        color: 'var(--p-muted)',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.95rem',
        lineHeight: 1.75,
        margin: 0,
        paddingLeft: '1.2rem',
      }}>
        {bullets.map((b) => (
          <li key={b} style={{ marginBottom: '0.35rem' }}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

const timelineData = [
  {
    title: '2025 - Present',
    content: (
      <ExperienceCard
        title="Executive, Association of Mathematics and Computer Science Students (AMACSS)"
        org="University of Toronto Scarborough"
        bullets={[
          'I produced and distributed a departmental newsletter for the Computer and Mathematical Sciences Department.',
          'I reached an audience of over 2,000 students and consistently achieved an open rate above 50%.',
        ]}
      />
    ),
  },
  {
    title: 'Sep 2024 - Jun 2025',
    content: (
      <ExperienceCard
        title="International Career Development Conference Qualifier, DECA"
        org="DECA Inc. - International"
        bullets={[
          'I placed in the Top 20 internationally for Startup Marketing Campaigns.',
          'I trained a group of 8 students in written events and marketing strategy, successfully guiding 50% of them to qualify for ICDC.',
        ]}
      />
    ),
  },
  {
    title: 'Sep 2023 - Jun 2025',
    content: (
      <ExperienceCard
        title="Co-President, NASA HUNCH"
        org="NASA HUNCH Program - Canada"
        bullets={[
          'I led our team to a 3rd place finish, establishing us as the first-ever Canadian school to compete in NASA HUNCH.',
          'I developed an autonomous Lunar Explorer and CAD simulation using Arduino that dynamically traverses lunar terrain.',
        ]}
      />
    ),
  },
  {
    title: 'Sep 2022 - Jun 2023',
    content: (
      <ExperienceCard
        title="Vice President of Technology, BLINK JA"
        org="Junior Achievement Company Program - Canada"
        bullets={[
          'I led a 5-person team to design and maintain a company website that generated over $2,300 in online sales.',
          'I tracked and analyzed website sales metrics to support executive marketing decisions, directly increasing website traffic by 30%.',
        ]}
      />
    ),
  },
];

export default function ExperiencePage() {
  return (
    <main>
      <Timeline
        data={timelineData}
        heading="Experience"
        description="Leadership, mentorship, and technical roles that shaped my approach to software and teamwork."
      />
    </main>
  );
}
