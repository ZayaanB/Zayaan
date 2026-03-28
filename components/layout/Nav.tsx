'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Leaf, Zap } from 'lucide-react';
import { useLiteMode } from '@/components/layout/LiteModeProvider';
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particles-typography';

const links = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/experience', label: 'Experience' },
  { href: '/education', label: 'Education' },
];

export default function Nav() {
  const pathname = usePathname();
  const { isLiteMode, toggleLiteMode } = useLiteMode();

  return (
    <nav className="p-nav">
      <div className="p-container p-nav-inner">
        {/* Brand */}
        <Link className="p-brand" href="/" style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <Image className="p-brand-icon" src="/favicon.svg" alt="Z logo" width={36} height={36} />
          
          <div className="hidden sm:block w-[155px] h-[30px] ml-2 relative overflow-hidden shrink-0">
            <CursorDrivenParticleTypography 
              text="Zayaan Bhanwadia" 
              fontSize={18} 
              particleDensity={1} 
              particleSize={0.7}
              dispersionStrength={8}
              color="#ffffff" 
            />
          </div>
          <span className="sm:hidden ml-2 font-bold text-[var(--p-text)] text-sm shrink-0">Zayaan Bhanwadia</span>
        </Link>

        {/* Links */}
        <div className="p-nav-links">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`p-nav-link${pathname === href ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="p-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={toggleLiteMode} 
            className="p-btn-secondary" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              background: 'transparent', border: 'none', color: 'var(--p-muted)', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600 
            }}
            title={isLiteMode ? "Enable Animations" : "Disable Animations (Lite Mode)"}
          >
            {isLiteMode ? <Leaf size={16} color="var(--p-primary)" /> : <Zap size={16} color="var(--p-accent-cyan)" />}
            <span className="hidden sm:inline">{isLiteMode ? 'Lite' : 'Full'}</span>
          </button>
          <a className="p-btn p-btn-secondary" href="/documents/resume.pdf" download>
            Download Resume
          </a>
        </div>
      </div>
    </nav>
  );
}
