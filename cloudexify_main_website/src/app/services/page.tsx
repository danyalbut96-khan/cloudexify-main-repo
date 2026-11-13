import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { servicesData } from './data';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore Cloudexify software engineering services across web, mobile, AI, SaaS, cloud and API development.',
};

const serviceIntros: Record<string,string> = {
  'web-development': 'Fast, accessible websites and web applications built around your users and business goals.',
  'mobile-app-development': 'Cross-platform mobile experiences for iOS and Android, designed for real-world use.',
  'ai-solutions': 'Practical AI integrations, assistants and workflow automation with measurable purpose.',
  'saas-development': 'Secure SaaS products with thoughtful architecture, subscriptions and tenant-aware data.',
  'full-stack-development': 'End-to-end product engineering across interfaces, APIs, data and deployment.',
  'cloud-devops': 'Cloud foundations, delivery automation, observability and operational resilience.',
  'api-development': 'Well-designed APIs and integrations that connect your products and services.',
  'technical-consultation': 'Independent technical guidance for architecture, product direction and engineering decisions.',
};

export default function ServicesPage() {
  return (
    <main className="inner-page">
      <Navbar />
      <section className="page-hero compact">
        <div className="container-section">
          <span className="eyebrow">OUR CAPABILITIES</span>
          <h1>Services designed around <em>your next move.</em></h1>
          <p>From the first product idea to a platform that is ready to scale, we bring the right engineering disciplines together around your goals.</p>
        </div>
      </section>
      <section className="services-directory">
        <div className="container-section">
          <div className="services-directory-head"><div><span className="eyebrow">WHAT WE DO</span><h2>Explore our services</h2></div><p>Choose a capability to explore its scope, delivery approach, technology options and engagement details.</p></div>
          <div className="services-directory-grid">
            {Object.entries(servicesData).map(([slug, service], index) => (
              <Link href={`/services/${slug}`} className="service-directory-card" key={slug}>
                <span className="service-number">{String(index + 1).padStart(2,'0')}</span>
                <h3>{service.title}</h3>
                <p>{serviceIntros[slug] || service.heroSubtitle}</p>
                <span className="service-card-link">Explore service <span>↗</span></span>
              </Link>
            ))}
          </div>
          <div className="services-note"><strong>Every project is different.</strong><span>We scope engagements around your requirements, integrations, delivery expectations and operating environment. Request a tailored proposal for accurate pricing.</span></div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
