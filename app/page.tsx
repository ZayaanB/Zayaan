'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ProfileCardStack } from '@/components/ui/profile-card-stack';
import { SkillsMarquee } from '@/components/ui/skills-marquee';

import { FaPython, FaJava, FaLinux, FaDocker, FaGithub } from 'react-icons/fa';
import { SiCplusplus, SiJavascript, SiTypescript, SiHtml5, SiOpencv, SiPytorch, SiNumpy, SiTailwindcss, SiFastapi, SiSupabase, SiPostgresql, SiArduino, SiGit, SiVercel } from 'react-icons/si';
import { TbSql } from 'react-icons/tb';
import { ScanEye } from 'lucide-react';
const HeroFuturistic = dynamic(
  () => import('@/components/ui/hero-futuristic').then((m) => m.HeroFuturistic),
  { ssr: false }
);

const skills = [
  { label: 'Python', icon: <FaPython /> },
  { label: 'Java', icon: <FaJava /> },
  { label: 'C/C++', icon: <SiCplusplus /> },
  { label: 'SQL', icon: <TbSql /> },
  { label: 'JavaScript', icon: <SiJavascript /> },
  { label: 'TypeScript', icon: <SiTypescript /> },
  { label: 'HTML/CSS', icon: <SiHtml5 /> },
  { label: 'OpenCV', icon: <SiOpencv /> },
  { label: 'PyTorch', icon: <SiPytorch /> },
  { label: 'NumPy', icon: <SiNumpy /> },
  { label: 'YOLOv8', icon: <ScanEye size={18} /> },
  { label: 'Tailwind CSS', icon: <SiTailwindcss /> },
  { label: 'FastAPI', icon: <SiFastapi /> },
  { label: 'Git', icon: <SiGit /> },
  { label: 'GitHub', icon: <FaGithub /> },
  { label: 'Linux', icon: <FaLinux /> },
  { label: 'Docker', icon: <FaDocker /> },
  { label: 'Vercel', icon: <SiVercel /> },
  { label: 'Supabase', icon: <SiSupabase /> },
  { label: 'PostgreSQL', icon: <SiPostgresql /> },
  { label: 'Arduino', icon: <SiArduino /> },
];

const profileCards = [
  {
    title: 'Leadership & Communication',
    body: 'As an executive at AMACSS, I produce and distribute a departmental newsletter that reaches over 2,000 students and achieves an open rate above 50%.',
  },
  {
    title: 'Competition & Mentorship',
    body: 'I placed in the Top 20 globally for Startup Marketing Campaigns at DECA ICDC. I coached 8 students in written events and marketing strategy, successfully guiding 50% of them to qualify for the conference.',
  },
  {
    title: 'Robotics & Systems Thinking',
    body: 'I co-founded and presided over NASA HUNCH Canada, enabling the first-ever Canadian school to compete. I built an autonomous Lunar Explorer using C++ and Arduino to solve complex mission-style design challenges.',
  },
  {
    title: 'Product & Data Mindset',
    body: 'As VP of Technology at BLINK JA, I led a 5-person team to design and maintain a company website that generated over $2,300 in online sales. I increased website traffic by 30% by making data-driven marketing decisions.',
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
          <SkillsMarquee skills={skills} />
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
