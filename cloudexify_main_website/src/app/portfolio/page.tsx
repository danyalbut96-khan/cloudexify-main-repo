import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PortfolioSection from '@/components/PortfolioSection';

export const metadata: Metadata = { title: 'Portfolio', description: 'Explore selected digital work and product experiences by Cloudexify.' };

export default function PortfolioPage() {
  return <main className="inner-page"><Navbar /><section className="page-hero compact"><div className="container-section"><span className="eyebrow">SELECTED WORK</span><h1>Ideas made <em>useful.</em></h1><p>A closer look at the digital experiences, platforms and solutions we have worked on.</p></div></section><PortfolioSection /><section className="page-cta"><div className="container-section"><span className="eyebrow">HAVE A PROJECT IN MIND?</span><h2>Let’s build something <em>meaningful.</em></h2><a className="button button-primary" href="/contact">Discuss your project <span>↗</span></a></div></section><Footer /></main>;
}
