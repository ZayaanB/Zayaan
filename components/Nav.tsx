'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/experience', label: 'Experience' },
  { href: '/education', label: 'Education' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="p-nav">
      <div className="p-container p-nav-inner">
        {/* Brand */}
        <Link className="p-brand" href="/">
          <Image className="p-brand-icon" src="/favicon.svg" alt="Z logo" width={36} height={36} />
          <span>Zayaan Bhanwadia</span>
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
        <div className="p-nav-actions">
          <a className="p-btn p-btn-secondary" href="/resume.pdf" download>
            Download Resume
          </a>
        </div>
      </div>
    </nav>
  );
}
