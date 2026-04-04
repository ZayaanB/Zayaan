'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ProfileCardStack } from '@/components/ui/profile-card-stack';
import { SkillsMarquee } from '@/components/ui/skills-marquee';

import { FaPython, FaJava, FaLinux, FaDocker, FaGithub } from 'react-icons/fa';
import { SiCplusplus, SiJavascript, SiTypescript, SiHtml5, SiOpencv, SiPytorch, SiNumpy, SiPandas, SiTailwindcss, SiNextdotjs, SiFastapi, SiSupabase, SiPostgresql, SiArduino, SiGnubash, SiGit, SiVercel, SiVultr, SiRailway, SiJetbrains } from 'react-icons/si';
import { TbSql, TbBrandVscode } from 'react-icons/tb';
import { ScanEye } from 'lucide-react';

const HeroFuturistic = dynamic(
  () => import('@/components/ui/hero-futuristic').then((m) => m.HeroFuturistic),
  { ssr: false }
);

const languages = [
  { label: 'Java', icon: <FaJava /> },
  { label: 'Python', icon: <FaPython /> },
  { label: 'C/C++', icon: <SiCplusplus /> },
  { label: 'SQL', icon: <TbSql /> },
  { label: 'JavaScript', icon: <SiJavascript /> },
  { label: 'TypeScript', icon: <SiTypescript /> },
  { label: 'HTML/CSS', icon: <SiHtml5 /> },
  { label: 'Bash', icon: <SiGnubash /> },
];

const libraries = [
  { label: 'OpenCV', icon: <SiOpencv /> },
  { label: 'PyTorch', icon: <SiPytorch /> },
  { label: 'NumPy', icon: <SiNumpy /> },
  { label: 'Pandas', icon: <SiPandas /> },
  { label: 'Tailwind CSS', icon: <SiTailwindcss /> },
  { label: 'Next.js', icon: <SiNextdotjs /> },
  { label: 'FastAPI', icon: <SiFastapi /> },
];

const devTools = [
  { label: 'Git', icon: <SiGit /> },
  { label: 'GitHub', icon: <FaGithub /> },
  { label: 'VS Code', icon: <TbBrandVscode /> },
  { label: 'JetBrains', icon: <SiJetbrains /> },
  { label: 'Linux', icon: <FaLinux /> },
  { label: 'Docker', icon: <FaDocker /> },
  { label: 'Arduino', icon: <SiArduino /> },
];

const databasesCloud = [
  { label: 'Vercel', icon: <SiVercel /> },
  { label: 'Vultr', icon: <SiVultr /> },
  { label: 'Railway', icon: <SiRailway /> },
  { label: 'PostgreSQL', icon: <SiPostgresql /> },
  { label: 'IBM Cloud', icon: <span className="font-bold text-[0.8em]">IBM</span> },
  { label: 'Supabase', icon: <SiSupabase /> },
];

const profileCards = [
  {
    title: 'Leadership & Communication',
    body: 'Produced and distributed a departmental newsletter that reached over 2,000 students and achieved an open rate above 50%.',
  },
  {
    title: 'Competition & Mentorship',
    body: 'Placed in the Top 20 globally for Startup Marketing Campaigns at DECA ICDC. Coached 8 students in written events and marketing strategy, successfully guiding 50% of them to qualify for the conference.',
  },
  {
    title: 'Robotics & Systems Thinking',
    body: 'Co-founded and presided over NASA HUNCH Canada, enabling the first-ever Canadian school to compete. Built an autonomous Lunar Explorer using C++ and Arduino to solve complex mission-style design challenges.',
  },
  {
    title: 'Product & Data Mindset',
    body: 'Led a 5-person team as VP of Technology at BLINK JA to design and maintain a company website that generated over $2,300 in online sales. Increased website traffic by 30% by making data-driven marketing decisions.',
  },
];

export default function HomePage() {
  return (
    <>
      <HeroFuturistic />

      <main className="relative" style={{ paddingTop: '1rem', paddingBottom: '4rem', overflow: 'hidden' }}>
        <section className="p-section p-container">
          <div className="p-section-head mb-8">
            <h2 className="p-h2">Technical Skills</h2>
            <p>Languages and tools from my coursework and project work.</p>
          </div>
          <div className="flex flex-col gap-4 w-full" style={{ paddingBottom: '1rem' }}>
            <SkillsMarquee skills={languages} category="Languages" speed="90s" />
            <SkillsMarquee skills={libraries} category="Libraries" speed="110s" reverse />
            <SkillsMarquee skills={devTools} category="Developer Tools" speed="100s" />
            <SkillsMarquee skills={databasesCloud} category="Cloud / Databases" speed="120s" reverse />
          </div>
        </section>

        <section className="p-section p-container">
          <div className="p-section-head">
            <h2 className="p-h2">Quick Profile</h2>
            <p>Highlights from leadership, engineering, and team-based problem solving.</p>
          </div>
          <ProfileCardStack cards={profileCards} />
        </section>

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
