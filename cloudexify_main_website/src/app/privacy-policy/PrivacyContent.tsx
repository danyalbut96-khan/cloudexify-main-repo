'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { en } from '@/locales/en';
import { t } from '@/locales/t';

const LAST_UPDATED = 'May 9, 2025';
const EFFECTIVE_DATE = 'May 9, 2025';

const sections = [
  { id: 'introduction', title: '1. Introduction & Scope' },
  { id: 'collection', title: '2. Information We Collect' },
  { id: 'usage', title: '3. How We Use Information' },
  { id: 'legalbasis', title: '4. Legal Basis for Processing' },
  { id: 'sharing', title: '5. Data Sharing & Disclosure' },
  { id: 'retention', title: '6. Data Retention' },
  { id: 'security', title: '7. Data Security' },
  { id: 'rights', title: '8. Your Rights & Choices' },
  { id: 'children', title: '9. Children’s Privacy' },
  { id: 'transfers', title: '10. International Transfers' },
  { id: 'thirdlinks', title: '11. Third-Party Links' },
  { id: 'analytics', title: '12. Google Analytics' },
  { id: 'cookies', title: '13. Cookies Details' },
  { id: 'marketing', title: '14. Marketing Choices' },
  { id: 'contactprivacy', title: '15. Privacy Contact Info' },
  { id: 'complaints', title: '16. Complaints & Disputes' },
  { id: 'changes', title: '17. Policy Modifications' },
  { id: 'pakistan', title: '18. Pakistan Provisions' },
  { id: 'regions', title: '19. Regional Information' },
  { id: 'definitions', title: '20. Definitions' },
  { id: 'acknowledgment', title: '21. Acknowledgment' },
];

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      style={{
        fontSize: 'clamp(20px, 3vw, 26px)',
        fontWeight: 800,
        color: 'var(--text-primary)',
        marginBottom: 16,
        marginTop: 56,
        paddingTop: 16,
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 12,
      }}
    >
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 24, marginBottom: 8 }}>
      {children}
    </h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, fontSize: 15, marginBottom: 14 }}>
      {children}
    </p>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 24, marginBottom: 14 }}>
      {items.map((item, i) => (
        <li key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.85, fontSize: 15, marginBottom: 6 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyContent() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main>
      <Navbar />

      {/* Hero Banner */}
      <section className="hero-gradient" style={{ padding: '140px 0 60px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container-section">
          <div style={{ fontSize: 14, marginBottom: 16 }}>
            <Link href="/" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>{t('common.home')}</Link>
            <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>{t('privacy.title')}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16 }}>
            {t('privacy.title')}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            <span>📅 {t('common.lastUpdated')}{' '}<strong style={{ color: 'var(--text-secondary)' }}>{LAST_UPDATED}</strong></span>
            <span>✅ {t('common.effective')}{' '}<strong style={{ color: 'var(--text-secondary)' }}>{EFFECTIVE_DATE}</strong></span>
            <span>📄 {t('common.version')}{' '}<strong style={{ color: 'var(--text-secondary)' }}>1.0</strong></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 20, maxWidth: 700, fontSize: 16, lineHeight: 1.8 }}>
            {t('privacy.subtitle')}
          </p>
          <button
            onClick={() => window.print()}
            style={{
              marginTop: 24,
              padding: '10px 24px',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          >
            {t('common.print')}
          </button>
        </div>
      </section>

      <div className="container-section grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 py-16 px-6 items-start max-w-7xl mx-auto">

        {/* Table of Contents — desktop sidebar */}
        <nav
          aria-label="Table of Contents"
          className="hidden lg:block sticky"
          style={{
            top: 100,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-cyan)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('common.tableOfContents')}
          </p>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 0',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {t(`privacy.sections.${s.id}.title`)}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <article style={{ minWidth: 0 }}>

          <SectionTitle id="introduction">{t('privacy.sections.introduction.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.introduction.para1')}
          </Para>
          <Para>
            {t('privacy.sections.introduction.para2_1')}{' '}
            <Link href="/terms-and-conditions" style={{ color: 'var(--accent-cyan)' }}>
              {t('privacy.sections.introduction.para2_link')}
            </Link>
            {t('privacy.sections.introduction.para2_2')}
          </Para>

          <SectionTitle id="collection">{t('privacy.sections.collection.title')}</SectionTitle>
          <Sub>{t('privacy.sections.collection.sub1')}</Sub>
          <Para>
            {t('privacy.sections.collection.para1')}
          </Para>
          <List items={en.privacy.sections.collection.list1} />

          <Sub>{t('privacy.sections.collection.sub2')}</Sub>
          <Para>
            {t('privacy.sections.collection.para2')}
          </Para>
          <List items={en.privacy.sections.collection.list2} />

          <Sub>{t('privacy.sections.collection.sub3')}</Sub>
          <Para>
            {t('privacy.sections.collection.para3')}
          </Para>

          <Sub>{t('privacy.sections.collection.sub4')}</Sub>
          <Para>
            {t('privacy.sections.collection.para4')}
          </Para>

          <SectionTitle id="usage">{t('privacy.sections.usage.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.usage.para1')}
          </Para>
          <List items={en.privacy.sections.usage.list1} />

          <SectionTitle id="legalbasis">{t('privacy.sections.legalbasis.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.legalbasis.para1')}
          </Para>
          <List items={en.privacy.sections.legalbasis.list1} />

          <SectionTitle id="sharing">{t('privacy.sections.sharing.title')}</SectionTitle>
          <Sub>{t('privacy.sections.sharing.sub1')}</Sub>
          <Para>
            {t('privacy.sections.sharing.para1')}
          </Para>
          <List items={en.privacy.sections.sharing.list1} />

          <Sub>{t('privacy.sections.sharing.sub2')}</Sub>
          <Para>
            {t('privacy.sections.sharing.para2')}
          </Para>

          <SectionTitle id="retention">{t('privacy.sections.retention.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.retention.para1')}
          </Para>
          <List items={en.privacy.sections.retention.list1} />

          <SectionTitle id="security">{t('privacy.sections.security.title')}</SectionTitle>
          <Sub>{t('privacy.sections.security.sub1')}</Sub>
          <Para>
            {t('privacy.sections.security.para1')}
          </Para>
          <List items={en.privacy.sections.security.list1} />
          <Sub>{t('privacy.sections.security.sub2')}</Sub>
          <Para>
            {t('privacy.sections.security.para2')}
          </Para>
          <Sub>{t('privacy.sections.security.sub3')}</Sub>
          <Para>
            {t('privacy.sections.security.para3')}
          </Para>

          <SectionTitle id="rights">{t('privacy.sections.rights.title')}</SectionTitle>
          <Para>{t('privacy.sections.rights.para1')}</Para>
          <List items={en.privacy.sections.rights.list1} />
          <Para>
            {t('privacy.sections.rights.exerciseText')}{' '}
            <a href="mailto:hello@cloudexify.site" style={{ color: 'var(--accent-cyan)' }}>hello@cloudexify.site</a>.{' '}
            {t('privacy.sections.rights.weHandle')}
          </Para>

          <SectionTitle id="children">{t('privacy.sections.children.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.children.para1')}
          </Para>

          <SectionTitle id="transfers">{t('privacy.sections.transfers.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.transfers.para1')}
          </Para>

          <SectionTitle id="thirdlinks">{t('privacy.sections.thirdlinks.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.thirdlinks.para1')}
          </Para>

          <SectionTitle id="analytics">{t('privacy.sections.analytics.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.analytics.para1')}
          </Para>

          <SectionTitle id="cookies">{t('privacy.sections.cookies.title')}</SectionTitle>
          <Sub>{t('privacy.sections.cookies.sub1')}</Sub>
          <Para>
            {t('privacy.sections.cookies.para1')}
          </Para>
          <Sub>{t('privacy.sections.cookies.sub2')}</Sub>
          <Para>
            {t('privacy.sections.cookies.para2')}
          </Para>
          <Sub>{t('privacy.sections.cookies.sub3')}</Sub>
          <Para>
            {t('privacy.sections.cookies.para3')}
          </Para>

          <SectionTitle id="marketing">{t('privacy.sections.marketing.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.marketing.para1')}
          </Para>

          <SectionTitle id="contactprivacy">{t('privacy.sections.contactprivacy.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.contactprivacy.para1')}
          </Para>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              padding: '28px 32px',
              marginTop: 16,
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 16 }}>{t('privacy.sections.contactprivacy.teamName')}</p>
            {[
              ['📧 Email', 'hello@cloudexify.site', 'mailto:hello@cloudexify.site'],
              ['📞 Phone', '+92 341 1949277', 'tel:+923411949277'],
              ['📍 Address', 'Islamabad, Pakistan', null],
            ].map(([label, value, href]) => (
              <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 14, minWidth: 100 }}>{label}</span>
                {href ? (
                  <a href={href} style={{ color: 'var(--accent-cyan)', fontSize: 14, textDecoration: 'none' }}>{value}</a>
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{value}</span>
                )}
              </div>
            ))}
          </div>

          <SectionTitle id="complaints">{t('privacy.sections.complaints.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.complaints.para1')}
          </Para>

          <SectionTitle id="changes">{t('privacy.sections.changes.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.changes.para1')}
          </Para>

          <SectionTitle id="pakistan">{t('privacy.sections.pakistan.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.pakistan.para1')}
          </Para>

          <SectionTitle id="regions">{t('privacy.sections.regions.title')}</SectionTitle>
          <Sub>{t('privacy.sections.regions.sub1')}</Sub>
          <Para>
            {t('privacy.sections.regions.para1')}
          </Para>
          <Sub>{t('privacy.sections.regions.sub2')}</Sub>
          <Para>
            {t('privacy.sections.regions.para2')}
          </Para>

          <SectionTitle id="definitions">{t('privacy.sections.definitions.title')}</SectionTitle>
          <List items={en.privacy.sections.definitions.list1} />

          <SectionTitle id="acknowledgment">{t('privacy.sections.acknowledgment.title')}</SectionTitle>
          <Para>
            {t('privacy.sections.acknowledgment.para1')}
          </Para>

          <div style={{ marginTop: 48, padding: '24px', background: 'rgba(0,212,255,0.05)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', lineHeight: 1.8 }}>
              {t('privacy.lastUpdatedNote')}{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>{LAST_UPDATED}</strong>{' '}
              {t('privacy.andIsEffective')}{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>{EFFECTIVE_DATE}</strong>.
            </p>
          </div>
        </article>
      </div>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            zIndex: 999,
            boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
          }}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

      <Footer />
    </main>
  );
}
