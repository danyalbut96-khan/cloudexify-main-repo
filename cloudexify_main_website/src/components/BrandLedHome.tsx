'use client';

import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';
import AnnouncementPopups from '@/components/AnnouncementPopups';
import Navbar from '@/components/Navbar';
import ServicesSection from '@/components/ServicesSection';
import AboutSection from '@/components/AboutSection';
import ProcessSection from '@/components/ProcessSection';
import TechStackSection from '@/components/TechStackSection';
import PortfolioSection from '@/components/PortfolioSection';
import CampaignsSection from '@/components/CampaignsSection';
import TeamSection from '@/components/TeamSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

const capabilities = [
  { number: '01', label: 'Digital products' },
  { number: '02', label: 'Web & mobile' },
  { number: '03', label: 'AI & automation' },
];

export default function BrandLedHome() {
  const { t } = useLang();

  return (
    <main className="cx-home">
      <AnnouncementPopups />
      <Navbar />

      <section className="cx-hero" id="home">
        <div className="cx-hero-grid" aria-hidden="true" />
        <div className="cx-hero-glow cx-glow-one" aria-hidden="true" />
        <div className="cx-hero-glow cx-glow-two" aria-hidden="true" />
        <div className="cx-shell cx-hero-layout">
          <div className="cx-hero-copy">
            <div className="cx-kicker"><span className="cx-live-dot" /> {t('hero.badge')}</div>
            <p className="cx-overline">{t('hero.welcome')}</p>
            <h1>{t('hero.title')}<br /><span>{t('hero.typewriter')}</span></h1>
            <p className="cx-hero-lead">{t('hero.subtitle')}</p>
            <div className="cx-hero-actions">
              <Link href="/contact" className="cx-button cx-button-primary">{t('hero.cta.primary')} <span aria-hidden="true">↗</span></Link>
              <Link href="/portfolio" className="cx-button cx-button-quiet">{t('hero.cta.secondary')} <span aria-hidden="true">→</span></Link>
            </div>
            <div className="cx-hero-proof">
              <span className="cx-proof-line" />
              <span>Strategy</span><i /> <span>Engineering</span><i /> <span>Long-term support</span>
            </div>
          </div>

          <div className="cx-hero-visual" aria-label="Cloudexify digital product design illustration">
            <div className="cx-visual-topline"><span>PRODUCT ENGINEERING / 001</span><span>CODE YOUR FUTURE</span></div>
            <div className="cx-orbit cx-orbit-a" />
            <div className="cx-orbit cx-orbit-b" />
            <div className="cx-product-card cx-product-main">
              <div className="cx-product-bar"><span /><span /><span /><b>cloudexify.studio</b></div>
              <div className="cx-product-body">
                <div className="cx-product-sidebar"><span /><span /><span /><span /></div>
                <div className="cx-product-content">
                  <div className="cx-product-label">DIGITAL EXPERIENCE</div>
                  <div className="cx-product-title">Built for what’s next.</div>
                  <div className="cx-product-subtitle">A connected system. One clear direction.</div>
                  <div className="cx-product-metrics"><div><b>01</b><small>Discover</small></div><div><b>02</b><small>Build</small></div><div><b>03</b><small>Scale</small></div></div>
                  <div className="cx-product-chart"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
                </div>
              </div>
            </div>
            <div className="cx-float-note cx-note-blue"><span className="cx-note-icon">⌘</span><div><b>Built with intent</b><small>Thoughtful engineering</small></div></div>
            <div className="cx-float-note cx-note-green"><span className="cx-note-icon">↗</span><div><b>Ready to scale</b><small>Made for growth</small></div></div>
            <div className="cx-visual-index">CX — 2026 <span>01 / 04</span></div>
          </div>
        </div>
        <div className="cx-shell cx-capability-strip">
          <div className="cx-capability-intro">One partner, from first idea to live product.</div>
          {capabilities.map((item) => <div className="cx-capability" key={item.number}><small>{item.number}</small><span>{item.label}</span><b>↗</b></div>)}
        </div>
      </section>

      <div className="cx-section-intro cx-shell">
        <span className="cx-section-index">01 / WHAT WE DO</span>
        <p>Technology should make your next move possible — not make it harder.</p>
      </div>
      <ServicesSection />
      <AboutSection />
      <TeamSection />
      <ProcessSection />
      <TechStackSection />
      <PortfolioSection />
      <CampaignsSection />
      <BlogSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
