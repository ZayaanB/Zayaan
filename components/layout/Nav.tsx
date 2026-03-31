'use client';

// ─── Navigation Bar ────────────────────────────────────────────────────────────
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Leaf, Zap, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="p-nav">
      <div className="p-container p-nav-inner">
        {/* Brand */}
        <Link className="p-brand" href="/" style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {/* basePath prefix required for GitHub Pages */}
          <Image className="p-brand-icon" src="/ZayaanBhanwadia/favicon.svg" alt="Z logo" width={36} height={36} />
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

        {/* Nav links (Desktop) */}
        <div className="hidden md:flex p-nav-links">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={`p-nav-link${pathname === href ? ' active' : ''}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex p-nav-actions" style={{ alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleLiteMode}
            className="p-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: 'none', color: 'var(--p-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            title={isLiteMode ? 'Enable Animations' : 'Disable Animations (Lite Mode)'}
          >
            {isLiteMode ? <Leaf size={16} color="var(--p-primary)" /> : <Zap size={16} color="var(--p-accent-cyan)" />}
            <span>{isLiteMode ? 'Lite' : 'Full'}</span>
          </button>
          <a className="p-btn p-btn-secondary" href="/ZayaanBhanwadia/documents/resume.pdf" download>
            Download Resume
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden flex items-center justify-center p-2 text-[var(--p-text)] transition-transform active:scale-95"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} color="var(--p-primary)" /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full border-t border-[var(--p-border)] bg-[rgba(6,8,16,0.95)] backdrop-blur-2xl shadow-2xl flex flex-col gap-2 p-4 pb-6 z-50">
          <div className="flex flex-col gap-1 mb-4">
            {links.map(({ href, label }) => (
              <Link 
                key={href} 
                href={href} 
                className={`p-3 rounded-xl font-semibold transition-colors ${pathname === href ? 'bg-[rgba(0,255,136,0.1)] text-[var(--p-primary)]' : 'text-[var(--p-text)] hover:bg-[var(--p-surface-strong)]'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => { toggleLiteMode(); setMobileMenuOpen(false); }}
              className="flex-1 p-btn p-btn-secondary flex items-center justify-center gap-2"
            >
              {isLiteMode ? <Leaf size={16} color="var(--p-primary)" /> : <Zap size={16} color="var(--p-accent-cyan)" />}
              {isLiteMode ? 'Lite Mode' : 'Full Mode'}
            </button>
            <a 
              className="flex-1 p-btn p-btn-primary text-center" 
              href="/ZayaanBhanwadia/documents/resume.pdf" 
              download
              onClick={() => setMobileMenuOpen(false)}
            >
              Resume
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
