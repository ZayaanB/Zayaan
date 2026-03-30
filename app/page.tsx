'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ProfileCardStack } from '@/components/ui/profile-card-stack';
const HeroFuturistic = dynamic(
  () => import('@/components/ui/hero-futuristic').then((m) => m.HeroFuturistic),
  { ssr: false }
);

const skills = [
  'Python', 'Java', 'C/C++', 'SQL', 'JavaScript', 'TypeScript',
  'HTML/CSS', 'OpenCV', 'PyTorch', 'NumPy', 'Tailwind CSS', 'Next.js',
  'FastAPI', 'Git', 'Linux', 'Docker', 'AWS', 'Supabase', 'PostgreSQL', 'Arduino',
];

const profileCards = [
  {
    title: 'Leadership & Communication',
    body: 'As an executive at AMACSS, I produce and distribute a departmental newsletter for the CMS Department, reaching over 2,000 students with an open rate above 50%.',
  },
  {
    title: 'Competition & Mentorship',
    body: 'Placed Top 20 globally in Startup Marketing Campaigns at DECA ICDC. Coached 8 students in written events and marketing strategy, around 50% qualified for the conference.',
  },
  {
    title: 'Robotics & Systems Thinking',
    body: 'Co-president and founder of NASA HUNCH Canada, the first-ever Canadian school to compete. Built an autonomous Lunar Explorer using C++ and Arduino for complex mission-style design challenges.',
  },
  {
    title: 'Product & Data Mindset',
    body: 'As VP of Technology at BLINK JA, led a team of 5 to design and maintain a company website generating over $2,300 in online sales, increasing website traffic by 30% through data-driven decisions.',
  },
];

export default function HomePage() {
  return (
    <>
      <HeroFuturistic />

      <main className="relative" style={{ paddingTop: '1rem', paddingBottom: '4rem', overflow: 'hidden' }}>
        {/* Technical Skills */}
        <section className="p-section p-container">
          <div className="p-section-head">
            <h2 className="p-h2">Technical Skills</h2>
            <p>Languages and tools from my coursework and project work.</p>
          </div>
          <div className="p-chip-row">
            {skills.map((s) => (
              <span key={s} className="p-chip">{s}</span>
            ))}
          </div>
        </section>

        {/* Quick Profile */}
        <section className="p-section p-container">
          <div className="p-section-head">
            <h2 className="p-h2">Quick Profile</h2>
            <p>Highlights from leadership, engineering, and team-based problem solving.</p>
          </div>
          <ProfileCardStack cards={profileCards} />
        </section>

        {/* CTA row */}
        <section className="p-section p-container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link className="p-btn p-btn-primary" href="/projects">View Projects</Link>
            <Link className="p-btn p-btn-secondary" href="/experience">See Experience</Link>
          </div>
        </section>
      </main>
    </>
  );
}
