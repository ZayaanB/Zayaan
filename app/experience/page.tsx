import type { Metadata } from 'next';
import { Timeline } from '@/components/ui/timeline';

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Work experience and leadership roles.',
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
      <p className="p-card-title" style={{ marginBottom: '0.35rem' }}>
        {title}
      </p>
      <p className="p-card-meta" style={{ marginBottom: '1rem' }}>
        {org}
      </p>
      <ul className="p-bullet-list">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

const timelineData = [
  // timeline entries reuse one card component to keep typography and spacing consistent
  {
    title: '2025 - Present',
    content: (
      <ExperienceCard
        title="Executive, Association of Mathematics and Computer Science Students (AMACSS)"
        org="University of Toronto Scarborough"
        bullets={[
          'Produced and distributed a departmental newsletter for the Computer and Mathematical Sciences Department.',
          'Reached over 2000 students using Mailchimp and achieved an open rate over 50%.',
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
          'Placed Top 20 internationally in Startup Marketing Campaigns.',
          'Trained a group of 8 students in written events and marketing strategy, with around 50% qualifying for ICDC.',
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
          'Led team to 3rd place, becoming the first ever Canadian school to compete in NASA HUNCH.',
          'Developed an autonomous Lunar Explorer and CAD simulation using Arduino, capable of traversing lunar terrain.',
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
          'Led a team of 5 to design and maintain a company website, generating over $2,300 in online sales.',
          'Tracked and analyzed website sales metrics to support executive marketing decisions, increasing website traffic by 30%.',
        ]}
      />
    ),
  },
];

export default function ExperiencePage() {
  return (
    <main>
      {/* timeline component owns scroll animation while this page provides content */}
      <Timeline
        data={timelineData}
        heading="Experience"
        description="Leadership, mentorship, and technical roles."
      />
    </main>
  );
}
