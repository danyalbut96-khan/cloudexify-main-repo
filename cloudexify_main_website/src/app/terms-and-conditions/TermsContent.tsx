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
  { id: 'introduction', title: '1. Introduction & Acceptance' },
  { id: 'eligibility', title: '2. User Eligibility & Account' },
  { id: 'services', title: '3. Services Description' },
  { id: 'ip', title: '4. Intellectual Property' },
  { id: 'payment', title: '5. Payment Terms & Billing' },
  { id: 'project', title: '6. Project Terms' },
  { id: 'confidentiality', title: '7. Confidentiality & NDA' },
  { id: 'liability', title: '8. Limitation of Liability' },
  { id: 'warranties', title: '9. Warranties & Disclaimers' },
  { id: 'indemnification', title: '10. Indemnification' },
  { id: 'termination', title: '11. Termination' },
  { id: 'data', title: '12. Data Protection & Security' },
  { id: 'thirdparty', title: '13. Third-Party Services' },
  { id: 'communication', title: '14. Communication' },
  { id: 'governinglaw', title: '15. Governing Law' },
  { id: 'disputes', title: '16. Dispute Resolution' },
  { id: 'severability', title: '17. Severability' },
  { id: 'entireagreement', title: '18. Entire Agreement' },
  { id: 'modifications', title: '19. Modifications to Terms' },
  { id: 'contact', title: '20. Contact Information' },
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
    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 20, marginBottom: 8 }}>
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

export default function TermsContent() {
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
            <span style={{ color: 'var(--text-secondary)' }}>{t('terms.title')}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16 }}>
            {t('terms.title')}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            <span>📅 {t('common.lastUpdated')}{' '}<strong style={{ color: 'var(--text-secondary)' }}>{LAST_UPDATED}</strong></span>
            <span>✅ {t('common.effective')}{' '}<strong style={{ color: 'var(--text-secondary)' }}>{EFFECTIVE_DATE}</strong></span>
            <span>📄 {t('common.version')}{' '}<strong style={{ color: 'var(--text-secondary)' }}>1.0</strong></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 20, maxWidth: 700, fontSize: 16, lineHeight: 1.8 }}>
            {t('terms.subtitle')}
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
                padding: '5px 0',
                fontSize: 13,
                color: 'var(--text-muted)',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-cyan)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              {t(`terms.sections.${s.id}.title`)}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <article style={{ minWidth: 0 }}>

          <SectionTitle id="introduction">{t('terms.sections.introduction.title')}</SectionTitle>
          <Para>
            {t('terms.sections.introduction.para1')}
          </Para>
          <Para>
            {t('terms.sections.introduction.para2_1')}{' '}
            <Link href="/privacy-policy" style={{ color: 'var(--accent-cyan)' }}>
              {t('terms.sections.introduction.para2_link')}
            </Link>
            {t('terms.sections.introduction.para2_2')}
          </Para>
          <Para>
            {t('terms.sections.introduction.para3')}
          </Para>
          <Sub>{t('terms.sections.introduction.sub1')}</Sub>
          <Para>
            {t('terms.sections.introduction.para4')}
          </Para>

          <SectionTitle id="eligibility">{t('terms.sections.eligibility.title')}</SectionTitle>
          <Sub>{t('terms.sections.eligibility.sub1')}</Sub>
          <Para>
            {t('terms.sections.eligibility.para1')}
          </Para>
          <Sub>{t('terms.sections.eligibility.sub2')}</Sub>
          <List items={en.terms.sections.eligibility.list1} />
          <Sub>{t('terms.sections.eligibility.sub3')}</Sub>
          <Para>{t('terms.sections.eligibility.para2')}</Para>
          <List items={en.terms.sections.eligibility.list2} />

          <SectionTitle id="services">{t('terms.sections.services.title')}</SectionTitle>
          <Para>{t('terms.sections.services.para1')}</Para>
          <Sub>{t('terms.sections.services.sub1')}</Sub>
          <List items={en.terms.sections.services.list1} />
          <Sub>{t('terms.sections.services.sub2')}</Sub>
          <Para>
            {t('terms.sections.services.para2')}
          </Para>

          <SectionTitle id="ip">{t('terms.sections.ip.title')}</SectionTitle>
          <Sub>{t('terms.sections.ip.sub1')}</Sub>
          <Para>
            {t('terms.sections.ip.para1')}
          </Para>
          <Sub>{t('terms.sections.ip.sub2')}</Sub>
          <Para>
            {t('terms.sections.ip.para2_1')}
            &quot;Work Product&quot;
            {t('terms.sections.ip.para2_2')}
          </Para>
          <Sub>{t('terms.sections.ip.sub3')}</Sub>
          <Para>
            {t('terms.sections.ip.para3_1')}
            &quot;Background IP&quot;
            {t('terms.sections.ip.para3_2')}
          </Para>
          <Sub>{t('terms.sections.ip.sub4')}</Sub>
          <Para>
            {t('terms.sections.ip.para4')}
          </Para>
          <Sub>{t('terms.sections.ip.sub5')}</Sub>
          <Para>
            {t('terms.sections.ip.para5')}
          </Para>

          <SectionTitle id="payment">{t('terms.sections.payment.title')}</SectionTitle>
          <Sub>{t('terms.sections.payment.sub1')}</Sub>
          <Para>
            {t('terms.sections.payment.para1')}
          </Para>
          <Sub>{t('terms.sections.payment.sub2')}</Sub>
          <List items={en.terms.sections.payment.list1} />
          <Sub>{t('terms.sections.payment.sub3')}</Sub>
          <Para>
            {t('terms.sections.payment.para2')}
          </Para>
          <Sub>{t('terms.sections.payment.sub4')}</Sub>
          <Para>
            {t('terms.sections.payment.para3')}
          </Para>
          <Sub>{t('terms.sections.payment.sub5')}</Sub>
          <Para>
            {t('terms.sections.payment.para4')}
          </Para>
          <Sub>{t('terms.sections.payment.sub6')}</Sub>
          <Para>
            {t('terms.sections.payment.para5')}
          </Para>

          <SectionTitle id="project">{t('terms.sections.project.title')}</SectionTitle>
          <Sub>{t('terms.sections.project.sub1')}</Sub>
          <Para>
            {t('terms.sections.project.para1')}
          </Para>
          <Sub>{t('terms.sections.project.sub2')}</Sub>
          <Para>
            {t('terms.sections.project.para2')}
          </Para>
          <Sub>{t('terms.sections.project.sub3')}</Sub>
          <List items={en.terms.sections.project.list1} />
          <Sub>{t('terms.sections.project.sub4')}</Sub>
          <Para>
            {t('terms.sections.project.para3')}
          </Para>

          <SectionTitle id="confidentiality">{t('terms.sections.confidentiality.title')}</SectionTitle>
          <Sub>{t('terms.sections.confidentiality.sub1')}</Sub>
          <Para>
            {t('terms.sections.confidentiality.para1')}
          </Para>
          <Sub>{t('terms.sections.confidentiality.sub2')}</Sub>
          <Para>
            {t('terms.sections.confidentiality.para2_1')}
          </Para>
          <Sub>{t('terms.sections.confidentiality.sub3')}</Sub>
          <Para>
            {t('terms.sections.confidentiality.para3')}
          </Para>

          <SectionTitle id="liability">{t('terms.sections.liability.title')}</SectionTitle>
          <Para>
            {t('terms.sections.liability.para1')}
          </Para>
          <Para>
            {t('terms.sections.liability.para2_1')}
          </Para>
          <Para>
            {t('terms.sections.liability.para3_1')}
          </Para>

          <SectionTitle id="warranties">{t('terms.sections.warranties.title')}</SectionTitle>
          <Para>
            {t('terms.sections.warranties.para1_1')}
            &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;
            {t('terms.sections.warranties.para1_2')}
          </Para>
          <Para>
            {t('terms.sections.warranties.para2')}
          </Para>
          <Para>
            {t('terms.sections.warranties.para3')}
          </Para>

          <SectionTitle id="indemnification">{t('terms.sections.indemnification.title')}</SectionTitle>
          <Sub>{t('terms.sections.indemnification.sub1')}</Sub>
          <Para>
            {t('terms.sections.indemnification.para1_1')}
          </Para>
          <Sub>{t('terms.sections.indemnification.sub2')}</Sub>
          <Para>
            {t('terms.sections.indemnification.para2')}
          </Para>

          <SectionTitle id="termination">{t('terms.sections.termination.title')}</SectionTitle>
          <Sub>{t('terms.sections.termination.sub1')}</Sub>
          <Para>
            {t('terms.sections.termination.para1')}
          </Para>
          <Sub>{t('terms.sections.termination.sub2')}</Sub>
          <Para>
            {t('terms.sections.termination.para2')}
          </Para>

          <SectionTitle id="data">{t('terms.sections.data.title')}</SectionTitle>
          <Para>
            {t('terms.sections.data.para1')}
          </Para>
          <Para>
            {t('terms.sections.data.para2')}
          </Para>
          <Para>
            {t('terms.sections.data.para3')}
          </Para>

          <SectionTitle id="thirdparty">{t('terms.sections.thirdparty.title')}</SectionTitle>
          <Para>
            {t('terms.sections.thirdparty.para1')}
          </Para>
          <Para>
            {t('terms.sections.thirdparty.para2')}
          </Para>

          <SectionTitle id="communication">{t('terms.sections.communication.title')}</SectionTitle>
          <Para>
            {t('terms.sections.communication.para1')}
          </Para>
          <Para>
            {t('terms.sections.communication.para2_1')}{' '}
            <a href="mailto:hello@cloudexify.site" style={{ color: 'var(--accent-cyan)' }}>{t('terms.sections.communication.para2_link')}</a>
            {t('terms.sections.communication.para2_2')}
          </Para>

          <SectionTitle id="governinglaw">{t('terms.sections.governinglaw.title')}</SectionTitle>
          <Para>
            {t('terms.sections.governinglaw.para1')}
          </Para>
          <Para>
            {t('terms.sections.governinglaw.para2')}
          </Para>

          <SectionTitle id="disputes">{t('terms.sections.disputes.title')}</SectionTitle>
          <Sub>{t('terms.sections.disputes.sub1')}</Sub>
          <Para>
            {t('terms.sections.disputes.para1')}
          </Para>
          <Sub>{t('terms.sections.disputes.sub2')}</Sub>
          <Para>
            {t('terms.sections.disputes.para2')}
          </Para>
          <Sub>{t('terms.sections.disputes.sub3')}</Sub>
          <Para>
            {t('terms.sections.disputes.para3')}
          </Para>

          <SectionTitle id="severability">{t('terms.sections.severability.title')}</SectionTitle>
          <Para>
            {t('terms.sections.severability.para1')}
          </Para>

          <SectionTitle id="entireagreement">{t('terms.sections.entireagreement.title')}</SectionTitle>
          <Para>
            {t('terms.sections.entireagreement.para1')}
          </Para>

          <SectionTitle id="modifications">{t('terms.sections.modifications.title')}</SectionTitle>
          <Para>
            {t('terms.sections.modifications.para1')}
          </Para>

          <SectionTitle id="contact">{t('terms.sections.contact.title')}</SectionTitle>
          <Para>
            {t('terms.sections.contact.para1')}
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
            <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 16 }}>{t('terms.sections.contact.companyName')}</p>
            {[
              ['📧 Email', 'hello@cloudexify.site', 'mailto:hello@cloudexify.site'],
              ['📞 Phone', '+92 341 1949277', 'tel:+923411949277'],
              ['🌐 Website', 'https://cloudexify.site', 'https://cloudexify.site'],
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

          <div style={{ marginTop: 48, padding: '24px', background: 'rgba(0,212,255,0.05)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', lineHeight: 1.8 }}>
              {t('terms.weUpdate')}{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>{LAST_UPDATED}</strong>{' '}
              {t('terms.andAreEffective')}{' '}
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
