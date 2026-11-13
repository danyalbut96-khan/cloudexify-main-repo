'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LanguageToggle from '@/components/LanguageToggle';
import { useLang } from '@/lib/LanguageContext';

const links = [
  { label: 'Home', key: 'nav.home', href: '/' },
  { label: 'About', key: 'nav.about', href: '/about' },
  { label: 'Services', key: 'nav.services', href: '/services' },
  { label: 'Portfolio', key: 'nav.portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', key: 'nav.contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const label = (item: typeof links[number]) => item.key ? t(item.key) : item.label;

  return (
    <header className="site-header">
      <nav className="site-nav container-section" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="Cloudexify home" onClick={() => setOpen(false)}>
          <img src="/logo.jpg" alt="" className="brand-logo" />
          <span className="brand-word">Cloud<span>exify</span><small>CODE YOUR FUTURE</small></span>
        </Link>
        <div className="desktop-nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? 'active' : ''}>
              {label(link)}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <LanguageToggle />
          <Link className="button button-primary nav-cta" href="/contact">{t('nav.getstarted')} <span aria-hidden>↗</span></Link>
        </div>
        <button className="mobile-menu-button" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? '×' : '☰'}
        </button>
      </nav>
      {open && (
        <div className="mobile-nav">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{label(link)}</Link>)}
          <Link className="button button-primary" href="/contact" onClick={() => setOpen(false)}>{t('nav.getstarted')} <span aria-hidden>↗</span></Link>
          <LanguageToggle />
        </div>
      )}
    </header>
  );
}
