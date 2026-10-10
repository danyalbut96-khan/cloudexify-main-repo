'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

const navItems = [
  { key: 'nav.home', href: '#home' },
  { key: 'nav.services', href: '#services' },
  { key: 'nav.about', href: '#about' },
  { key: 'nav.portfolio', href: '#portfolio' },
  { key: 'nav.contact', href: '#contact' },
];

export default function Navbar() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== '/') {
      return;
    }
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.4s ease, background-color 0.3s ease',
        background: isScrolled
          ? isLight
            ? 'rgba(255,255,255,0.85)'
            : 'rgba(13,27,42,0.85)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(0, 212, 255, 0.1)' : '1px solid transparent',
        padding: isScrolled ? '12px 0' : '20px 0',
      }}
    >
      <nav
        className={`container-section flex items-center justify-between w-full px-4 py-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'
          }`}
        aria-label="Main navigation"
      >
        {/* Logo — image hidden on mobile */}
        <a
          href={pathname === '/' ? '#home' : '/#home'}
          onClick={(e) => handleNavClick(e, '#home')}
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
          aria-label="Cloudexify Home"
        >
          <img
            src="/logo.jpg"
            alt="Cloudexify Logo"
            className="hidden sm:block"
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              objectFit: 'cover',
              objectPosition: 'center',
              transform: 'none',
            }}
          />
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Cloud<span style={{ color: '#00ff88' }}>exify</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <ul
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
            listStyle: 'none',
            margin: 0,
            padding: 0,
            flex: 1,
          }}
          className="hidden-mobile"
        >
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={pathname === '/' ? item.href : `/${item.href}`}
                className="nav-link"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {t(item.key)}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop only: theme, language, pills, CTA */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <ThemeToggle />
          <LanguageToggle />

          <a
            href="https://client.cloudexify.site"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-campaign-pill nav-campaign-pill--website"
          >
            {t('nav.freewebsite')}
          </a>
          <a
            href="https://internship.cloudexify.site"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-campaign-pill nav-campaign-pill--internship"
          >
            {t('nav.internship')}
          </a>

          <a
            href={pathname === '/' ? '#contact' : '/#contact'}
            onClick={(e) => handleNavClick(e, '#contact')}
            className="btn-primary hidden-mobile"
            style={{ padding: '10px 22px', fontSize: 14 }}
            id="nav-cta"
          >
            {t('nav.getstarted')}
          </a>
        </div>

        {/* Mobile only: hamburger */}
        <button
          className="show-mobile"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            flexShrink: 0,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: 24,
                height: 2,
                background: '#00d4ff',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transformOrigin: 'center',
                transform:
                  mobileOpen && i === 0
                    ? 'rotate(45deg) translateY(7px)'
                    : mobileOpen && i === 1
                      ? 'scaleX(0)'
                      : mobileOpen && i === 2
                        ? 'rotate(-45deg) translateY(-7px)'
                        : 'none',
              }}
            />
          ))}
        </button>
      </nav>

      {/* Mobile menu drawer / dropdown */}
      {mobileOpen && (
        <div
          className="mobile-menu show-mobile"
          style={
            isRtl
              ? {
                position: 'fixed',
                top: 0,
                right: 0,
                left: 'auto',
                height: '100%',
                width: '18rem',
                maxWidth: '85vw',
                zIndex: 1001,
                background: 'rgba(10, 20, 40, 0.97)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(0, 212, 255, 0.1)',
                padding: '80px 24px 28px',
                overflowY: 'auto',
              }
              : {
                background: 'rgba(10, 20, 40, 0.97)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(0, 212, 255, 0.1)',
                padding: '20px 24px 28px',
              }
          }
        >
          <div
            className={isRtl ? 'flex-row-reverse' : 'flex-row'}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              marginBottom: 20,
              width: '100%',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <LanguageToggle inline />
            </div>
            <ThemeToggle />
          </div>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.href} style={{ borderBottom: '1px solid rgba(0, 212, 255, 0.06)' }}>
                <a
                  href={pathname === '/' ? item.href : `/${item.href}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                  style={{
                    display: 'block',
                    padding: '14px 0',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: 16,
                    fontWeight: 500,
                    transition: 'color 0.2s',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#00d4ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid rgba(0, 212, 255, 0.1)',
            }}
          >
            <a
              href="https://client.cloudexify.site"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-campaign-pill nav-campaign-pill--website mobile-menu-pill"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.freewebsite')}
            </a>
            <a
              href="https://internship.cloudexify.site"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-campaign-pill nav-campaign-pill--internship mobile-menu-pill"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.internship')}
            </a>
          </div>

          <div style={{ paddingTop: 16 }}>
            <a
              href={pathname === '/' ? '#contact' : '/#contact'}
              onClick={(e) => handleNavClick(e, '#contact')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
            >
              {t('nav.getstarted')}
            </a>
          </div>
        </div>
      )}

      <style>{`
        .nav-campaign-pill {
          display: flex;
          align-items: center;
          margin-left: 4px;
          padding: 5px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .nav-campaign-pill--website {
          border: 1px solid #34A853;
          color: #34A853;
          background: rgba(52, 168, 83, 0.1);
        }
        .nav-campaign-pill--website:hover {
          background: rgba(52, 168, 83, 0.2);
        }
        .nav-campaign-pill--internship {
          border: 1px solid #FBBC04;
          color: #FBBC04;
          background: rgba(251, 188, 4, 0.1);
        }
        .nav-campaign-pill--internship:hover {
          background: rgba(251, 188, 4, 0.2);
        }
        .mobile-menu .mobile-menu-pill {
          display: flex !important;
          width: 100%;
          justify-content: center;
          margin-left: 0;
          padding: 10px 16px;
          font-size: 13px;
        }
        @media (max-width: 1023px) {
          .nav-campaign-pill:not(.mobile-menu-pill) {
            display: none !important;
          }
        }
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7685572503171164"
        crossOrigin="anonymous"></script>
      <meta name="google-adsense-account" content="ca-pub-7685572503171164" />
    </header>
  );
}
