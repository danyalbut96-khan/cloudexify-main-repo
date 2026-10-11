'use client';

import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

const footerLinkGroups = [
  {
    id: 'quicklinks',
    titleKey: 'footer.quicklinks',
    links: [
      { labelKey: 'footer.link.home', href: '#home' },
      { labelKey: 'nav.services', href: '#services' },
      { labelKey: 'footer.link.about', href: '#about' },
      { labelKey: 'footer.link.portfolio', href: '#portfolio' },
      { labelKey: 'nav.contact', href: '#contact' },
      { labelKey: 'footer.link.faq', href: '#faq' },
    ],
  },
  {
    id: 'services',
    titleKey: 'footer.services',
    links: [
      { labelKey: 'footer.link.web', href: '#services' },
      { labelKey: 'footer.link.mobile', href: '#services' },
      { labelKey: 'footer.link.ai', href: '#services' },
      { labelKey: 'footer.link.saas', href: '#services' },
      { labelKey: 'footer.link.fullstack', href: '#services' },
      { labelKey: 'footer.link.cloud', href: '#services' },
      { labelKey: 'footer.link.api', href: '#services' },
    ],
  },
];

const socialIconStyle = {
  width: 20,
  height: 20,
  display: 'block' as const,
};

const footerSocialLinks = [
  {
    ariaLabel: 'LinkedIn',
    href: 'https://www.linkedin.com/company/cloudexify/',
    hoverBg: '#0077B5',
    hoverShadow: '0 0 20px rgba(0,119,181,0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={socialIconStyle} aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    ariaLabel: 'YouTube',
    href: 'https://www.youtube.com/@CloudExify',
    hoverBg: '#FF0000',
    hoverShadow: '0 0 20px rgba(255,0,0,0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={socialIconStyle} aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    ariaLabel: 'Instagram',
    href: 'https://www.instagram.com/cloudexify_official/',
    hoverBg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    hoverShadow: '0 0 20px rgba(220,39,67,0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={socialIconStyle} aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    ariaLabel: 'Facebook',
    href: 'https://web.facebook.com/cloudexifyofficial/',
    hoverBg: '#1877F2',
    hoverShadow: '0 0 20px rgba(24,119,242,0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={socialIconStyle} aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    ariaLabel: 'WhatsApp',
    href: 'https://wa.me/923411949277',
    hoverBg: '#25D366',
    hoverShadow: '0 0 20px rgba(37,211,102,0.5)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={socialIconStyle} aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

const socialButtonBase = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
} as const;

export default function Footer() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);
  const followLabel =
    lang === 'ur'
      ? 'ہمیں فالو کریں'
      : lang === 'ps'
        ? 'موږ تعقیب کړئ'
        : lang === 'pa'
          ? 'سانوں فالو کرو'
          : lang === 'fa'
            ? 'ما را دنبال کنید'
            : lang === 'ar'
              ? 'تابعنا'
              : 'Follow Us';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(0, 212, 255, 0.1)',
        background: 'linear-gradient(180deg, rgba(10,20,40,0) 0%, rgba(6,12,28,1) 100%)',
        paddingTop: 72,
        width: '100%',
        overflowX: 'hidden',
      }}
      role="contentinfo"
    >
      <div className="container-section">
        {/* Top grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48,
            paddingBottom: 56,
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <img
                src="/logo.jpg"
                alt="Cloudexify Logo"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
              <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
                Cloud<span style={{ color: '#00ff88' }}>exify</span>
              </span>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, marginBottom: 24, maxWidth: 260 }}>
              {t('footer.tagline')}
            </p>

            {/* Contact quick */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="mailto:hello@cloudexify.site" className="footer-link">
                📧 hello@cloudexify.site
              </a>
              <a href="tel:+923411949277" className="footer-link">
                📞 +92 341 1949277
              </a>
              <span className="footer-link" style={{ cursor: 'default' }}>
                📍 Islamabad, Pakistan
              </span>
            </div>

            {/* Socials */}
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: 10,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {followLabel}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: isRtl ? 'flex-end' : 'flex-start',
                  flexDirection: isRtl ? 'row-reverse' : 'row',
                }}
              >
                {footerSocialLinks.map((s) => (
                  <a
                    key={s.ariaLabel}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.ariaLabel}
                    style={socialButtonBase}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = 'scale(1.1)';
                      el.style.background = s.hoverBg;
                      el.style.boxShadow = s.hoverShadow;
                      el.style.borderColor = 'transparent';
                      el.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.transform = 'scale(1)';
                      el.style.background = socialButtonBase.background;
                      el.style.boxShadow = 'none';
                      el.style.borderColor = 'rgba(255,255,255,0.1)';
                      el.style.color = socialButtonBase.color;
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link columns */}
          {footerLinkGroups.map((group) => (
            <div key={group.id}>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: 20,
                }}
              >
                {t(group.titleKey)}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {group.id === 'quicklinks' && (
                  <>
                    <li style={{ marginBottom: 6 }}>
                      <a
                        href="https://client.cloudexify.site"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#34A853',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: 'rgba(52,168,83,0.1)',
                          border: '1px solid rgba(52,168,83,0.3)',
                          width: 'fit-content',
                          fontSize: 13,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(52,168,83,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(52,168,83,0.1)';
                        }}
                      >
                        {t('footer.freewebsite')}
                        <span
                          style={{
                            background: '#34A853',
                            color: 'white',
                            fontSize: 9,
                            padding: '1px 5px',
                            borderRadius: 4,
                            fontWeight: 800,
                          }}
                        >
                          {t('footer.badge.free')}
                        </span>
                      </a>
                    </li>
                    <li style={{ marginBottom: 12 }}>
                      <a
                        href="https://internship.cloudexify.site"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#FBBC04',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: 'rgba(251,188,4,0.1)',
                          border: '1px solid rgba(251,188,4,0.3)',
                          width: 'fit-content',
                          fontSize: 13,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(251,188,4,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(251,188,4,0.1)';
                        }}
                      >
                        {t('footer.internship')}
                        <span
                          style={{
                            background: '#FBBC04',
                            color: '#0D1B2A',
                            fontSize: 9,
                            padding: '1px 5px',
                            borderRadius: 4,
                            fontWeight: 800,
                          }}
                        >
                          {t('footer.badge.open')}
                        </span>
                      </a>
                    </li>
                    <li
                      aria-hidden
                      style={{
                        height: 1,
                        background: 'rgba(255,255,255,0.1)',
                        marginBottom: 14,
                        listStyle: 'none',
                      }}
                    />
                  </>
                )}
                {group.links.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="footer-link"
                      onClick={(e) => handleNavClick(e, link.href)}
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA column */}
          <div>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 20,
              }}
            >
              {t('footer.startproject')}
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}>
              {t('footer.startproject.sub')}
            </p>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="btn-primary"
              style={{ display: 'inline-flex', fontSize: 14, padding: '11px 22px' }}
              id="footer-cta"
            >
              {t('footer.getquote')}
            </a>

            <div
              style={{
                marginTop: 28,
                padding: '16px',
                background: 'rgba(0, 255, 136, 0.06)',
                border: '1px solid rgba(0, 255, 136, 0.15)',
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{t('footer.workinghours')}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                {t('footer.hours.value')}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            gap: 12,
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            © {new Date().getFullYear()} Cloudexify. {t('footer.copyright')}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a
              href="/terms-and-conditions"
              style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00d4ff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              {t('footer.terms')}
            </a>
            <a
              href="/privacy-policy"
              style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00d4ff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              {t('footer.privacy')}
            </a>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{t('footer.madewith')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
