'use client';

import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';

const services = [
  { slug: 'web-development', icon: 'web', titleKey: 'services.web.title', descKey: 'services.web.desc' },
  { slug: 'mobile-app-development', icon: 'mobile', titleKey: 'services.mobile.title', descKey: 'services.mobile.desc' },
  { slug: 'ai-solutions', icon: 'ai', titleKey: 'services.ai.title', descKey: 'services.ai.desc' },
  { slug: 'saas-development', icon: 'saas', titleKey: 'services.saas.title', descKey: 'services.saas.desc' },
  { slug: 'full-stack-development', icon: 'stack', titleKey: 'services.fullstack.title', descKey: 'services.fullstack.desc' },
  { slug: 'cloud-devops', icon: 'cloud', titleKey: 'services.cloud.title', descKey: 'services.cloud.desc' },
  { slug: 'api-development', icon: 'api', titleKey: 'services.api.title', descKey: 'services.api.desc' },
  { slug: 'technical-consultation', icon: 'consult', titleKey: 'services.consulting.title', descKey: 'services.consulting.desc' },
] as const;

function ServiceGlyph({ name }: { name: (typeof services)[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<(typeof services)[number]['icon'], React.ReactNode> = {
    web: <><rect x="3" y="4" width="18" height="15" rx="2.5" /><path d="M3 8h18M8 22h8M12 19v3M8 12l-2 2 2 2M16 12l2 2-2 2M13.5 11.5l-3 5" /></>,
    mobile: <><rect x="7" y="2.5" width="10" height="19" rx="2.2" /><path d="M10 5.5h4M11 18.5h2" /><circle cx="12" cy="15" r=".6" fill="currentColor" stroke="none" /></>,
    ai: <><path d="M12 3a4 4 0 0 0-7.2 2.4A4.5 4.5 0 0 0 4 14a4 4 0 0 0 4 6h4z" /><path d="M12 3a4 4 0 0 1 7.2 2.4A4.5 4.5 0 0 1 20 14a4 4 0 0 1-4 6h-4zM8 9h.01M16 9h.01M8 15h.01M16 15h.01M12 7v10" /><path d="M3 3 2 2M21 3l1-1M3 21l-1 1M21 21l1 1" /></>,
    saas: <><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.8 4.8 0 0 0 7 18Z" /><path d="m10 14 2-2 2 2M12 12v5" /></>,
    stack: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    cloud: <><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.8 4.8 0 0 0 7 18Z" /><path d="M12 11v7m-3-3 3 3 3-3" /></>,
    api: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6" /></>,
    consult: <><path d="M9 18h6M10 22h4M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.3 1.5-1.5 2.5h-4c-.2-1-.6-1.8-1.5-2.5Z" /><path d="M12 6v4m-2-2h4" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" width="29" height="29" aria-hidden="true" {...common}>
      {paths[name]}
    </svg>
  );
}

export default function ServicesSection() {
  const { t } = useLang();

  return (
    <section id="services" className="cx-services-section">
      <div className="container-section">
        <header className="cx-section-heading">
          <span className="section-tag">{t('services.label')}</span>
          <h2 className="section-title">{t('services.title')}</h2>
          <p className="section-subtitle">{t('services.subtitle')}</p>
        </header>

        <div className="cx-services-grid">
          {services.map((service, index) => (
            <Link key={service.slug} href={`/services/${service.slug}`} className="cx-service-link">
              <article className="service-card cx-service-card">
                <div className="cx-service-card-top">
                  <span className="cx-service-icon"><ServiceGlyph name={service.icon} /></span>
                  <span className="cx-service-number">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3>{t(service.titleKey)}</h3>
                <p>{t(service.descKey)}</p>
                <span className="cx-service-more">{t('services.learnmore').replace(/\s*[→←]\s*$/, '')}<span aria-hidden="true">↗</span></span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
