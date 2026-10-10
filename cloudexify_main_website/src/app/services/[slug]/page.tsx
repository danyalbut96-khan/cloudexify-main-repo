import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';
import { servicesData } from '../data';
import { t } from '@/locales/t';

// Helper to safely retrieve service data from slug to prevent bracket notation/prototype pollution vulnerabilities
const getSafeService = (slug: string) => {
  if (slug && Object.prototype.hasOwnProperty.call(servicesData, slug)) {
    return servicesData[slug as keyof typeof servicesData];
  }
  return undefined;
};

// Generate static params for all services so they can be pre-rendered
export function generateStaticParams() {
  return Object.keys(servicesData).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const service = getSafeService(resolvedParams.slug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: `${service.title} | Cloudexify Services`,
    description: service.heroSubtitle,
    openGraph: {
      title: `${service.title} | Cloudexify`,
      description: service.heroSubtitle,
    }
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;
  const service = getSafeService(currentSlug);

  if (!service) {
    notFound();
  }

  // Get related services data
  const relatedServices = service.relatedServiceIds.map(id => {
    const data = getSafeService(id);
    return {
      slug: id,
      data
    };
  }).filter((s): s is { slug: string; data: NonNullable<ReturnType<typeof getSafeService>> } => !!s.data);

  return (
    <main>
      <Navbar />

      {/* 1. Hero Section */}
      <section
        className="hero-gradient"
        style={{
          padding: '160px 0 80px',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container-section">
          {/* Breadcrumb */}
          <div style={{ marginBottom: 24, fontSize: 14 }}>
            <Link href="/" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>{t('services.home')}</Link>
            <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>/</span>
            <Link href="/#services" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>{t('services.services')}</Link>
            <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>{service.title}</span>
          </div>

          <h1 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 56px)', marginBottom: 24, color: 'var(--text-primary)' }}>
            {service.title}
          </h1>
          <p className="section-subtitle" style={{ fontSize: 20, maxWidth: 800, color: 'var(--text-secondary)' }}>
            {service.heroSubtitle}
          </p>
          
          <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="#contact" className="btn-primary" style={{ textDecoration: 'none' }}>
              {t('services.startProject')}
            </Link>
            <Link href="#pricing" className="btn-secondary" style={{ textDecoration: 'none' }}>
              {t('services.viewPricing')}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Overview Section */}
      <section style={{ padding: '80px 0', background: 'transparent' }}>
        <div className="container-section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="section-tag">{t('services.overview')}</div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>
                {t('services.whatWeOffer')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8 }}>
                {service.overview}
              </p>
            </div>
            {/* Visual Placeholder for Image Right */}
            <div className="glass-card" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.1))' }}>
              <span style={{ fontSize: 64 }}>💻</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Features Section */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(180deg, rgba(26,58,82,0.12) 0%, transparent 100%)' }}>
        <div className="container-section">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
             <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{t('services.keyFeatures')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {service.features.map(feature => (
              <div key={feature} className="glass-card service-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ color: 'var(--accent-green)', fontSize: 24, marginTop: -2 }}>✓</span>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 16 }}>{feature}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Tech Stack Section */}
      <section style={{ padding: '80px 0', background: 'transparent' }}>
        <div className="container-section text-center">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{t('services.technologiesWeUse')}</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 800, margin: '0 auto' }}>
            {service.techStack.map(tech => (
              <span key={tech} className="tech-badge" style={{ padding: '12px 24px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Process Section */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(180deg, transparent 0%, rgba(26,58,82,0.12) 100%)' }}>
         <div className="container-section">
           <div style={{ textAlign: 'center', marginBottom: 48 }}>
             <div className="section-tag">{t('services.howWeBuildIt')}</div>
             <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{t('services.ourProcess')}</h2>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto' }}>
             {service.process.map((step, idx) => (
               <div key={step.title} className="glass-card" style={{ padding: '24px 32px', display: 'flex', gap: 24, alignItems: 'center', flexDirection: 'row' }}>
                 <div style={{ 
                   width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                   background: 'rgba(0, 212, 255, 0.1)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20
                 }}>
                   {idx + 1}
                 </div>
                 <div>
                   <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 8, fontSize: 18 }}>{step.title}</h4>
                   <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* 6. Real-World Examples */}
      <section style={{ padding: '80px 0', background: 'transparent' }}>
        <div className="container-section">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{t('services.realWorldExamples')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {service.examples.map(ex => (
              <div key={ex.name} className="project-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{ex.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{ex.desc}</p>
                <div style={{ color: 'var(--accent-green)', fontSize: 13, fontWeight: 600 }}>{t('services.technologiesLabel')}{ex.tech}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Use Cases / Industries */}
      <section style={{ padding: '80px 0', background: 'rgba(26,58,82,0.2)' }}>
         <div className="container-section">
           <div style={{ textAlign: 'center', marginBottom: 48 }}>
             <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{t('services.useCasesAndIndustries')}</h2>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
             {service.useCases.map(useCase => (
               <div key={useCase.title} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                 <div style={{ fontSize: 40, marginBottom: 16 }}>{useCase.icon}</div>
                 <h4 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{useCase.title}</h4>
                 <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{useCase.desc}</p>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* 8. FAQ Section */}
      <section style={{ padding: '80px 0', background: 'transparent' }}>
        <div className="container-section" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{t('services.faq')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {service.faqs.map((faq, i) => (
              <details key={i} className="faq-item glass-card" style={{ border: '1px solid var(--border-subtle)', padding: '20px 24px', cursor: 'pointer' }}>
                <summary style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, outline: 'none', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  {faq.q} <span style={{ color: 'var(--accent-cyan)' }}>+</span>
                </summary>
                <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: 15, lineHeight: 1.6 }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Pricing Mention */}
      <section id="pricing" style={{ padding: '60px 0', background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, transparent 100%)' }}>
        <div className="container-section" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{t('services.transparentPricing')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 24 }}>
             {t('services.pricingNote')} {service.title} {t('services.projectsGenerally')}
          </p>
          <div style={{ display: 'inline-block', background: 'var(--bg-card)', padding: '16px 32px', borderRadius: 50, border: '1px solid var(--accent-green)', color: 'var(--accent-green)', fontSize: 20, fontWeight: 700 }}>
             {service.pricing}
          </div>
        </div>
      </section>

      {/* 11. Related Services */}
      <section style={{ padding: '80px 0', background: 'transparent' }}>
        <div className="container-section">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{t('services.relatedServices')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {relatedServices.map(related => (
              <Link key={related.slug} href={`/services/${related.slug}`} style={{ textDecoration: 'none' }}>
                <div className="glass-card service-card" style={{ padding: '32px', height: '100%' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{related.data.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{related.data.heroSubtitle}</p>
                  <div style={{ marginTop: 20, color: 'var(--accent-cyan)', fontWeight: 600, fontSize: 14 }}>{t('services.learnMore')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA Section at the bottom */}
      <ContactSection />
      
      {/* 12. Footer */}
      <Footer />
    </main>
  );
}
