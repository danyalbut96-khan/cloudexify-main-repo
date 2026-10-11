'use client';

import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';

const services = [
  { slug: 'web-development', icon: '🌐', titleKey: 'services.web.title', descKey: 'services.web.desc', color: 'rgba(0, 212, 255, 0.15)' },
  { slug: 'mobile-app-development', icon: '📱', titleKey: 'services.mobile.title', descKey: 'services.mobile.desc', color: 'rgba(0, 255, 136, 0.12)' },
  { slug: 'ai-solutions', icon: '🤖', titleKey: 'services.ai.title', descKey: 'services.ai.desc', color: 'rgba(168, 85, 247, 0.15)' },
  { slug: 'saas-development', icon: '☁️', titleKey: 'services.saas.title', descKey: 'services.saas.desc', color: 'rgba(0, 212, 255, 0.12)' },
  { slug: 'full-stack-development', icon: '⚙️', titleKey: 'services.fullstack.title', descKey: 'services.fullstack.desc', color: 'rgba(0, 255, 136, 0.1)' },
  { slug: 'cloud-devops', icon: '🔧', titleKey: 'services.cloud.title', descKey: 'services.cloud.desc', color: 'rgba(251, 191, 36, 0.1)' },
  { slug: 'api-development', icon: '🔗', titleKey: 'services.api.title', descKey: 'services.api.desc', color: 'rgba(0, 212, 255, 0.1)' },
  { slug: 'technical-consultation', icon: '💡', titleKey: 'services.consulting.title', descKey: 'services.consulting.desc', color: 'rgba(0, 255, 136, 0.08)' },
];

export default function ServicesSection() {
  const { t } = useLang();

  return (
    <section id="services" style={{ padding: '100px 0' }}>
      <div className="container-section">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-tag">{t('services.label')}</div>
          <h2 className="section-title">{t('services.title')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
            {t('services.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {services.map((service, idx) => (
            <Link key={service.slug} href={`/services/${service.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
              <article
                className="service-card"
                style={{ animationDelay: `${idx * 0.07}s`, display: 'flex', flexDirection: 'column', flex: 1 }}
                aria-label={t(service.titleKey)}
              >
                <div style={{ flex: 1 }}>
                  <div className="service-icon" style={{ background: service.color }} aria-hidden="true">
                    {service.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
                    {t(service.titleKey)}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{t(service.descKey)}</p>
                </div>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--accent-cyan)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      letterSpacing: 0.3,
                    }}
                  >
                    {t('services.learnmore').replace(/\s*[→←]\s*$/, '')}
                  </span>
                  <span style={{ color: 'var(--accent-cyan)', fontSize: 14 }}>
                    {t('services.learnmore').includes('←') ? '←' : '→'}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
