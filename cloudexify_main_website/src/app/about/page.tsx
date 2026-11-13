import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AboutSection from '@/components/AboutSection';
import ProcessSection from '@/components/ProcessSection';
import TeamSection from '@/components/TeamSection';

export const metadata: Metadata = { title: 'About Cloudexify', description: 'Learn about Cloudexify, our approach to software engineering, and how we turn ideas into useful digital products.' };

export default function AboutPage() {
  return <main className="inner-page"><Navbar /><section className="page-hero"><div className="container-section"><span className="eyebrow">ABOUT CLOUDEXIFY</span><h1>Technology should move <em>your business forward.</em></h1><p>We bring product thinking, thoughtful engineering and modern technology together to create digital experiences that solve real problems.</p><div className="page-hero-meta"><span>Product-minded engineering</span><span>Built for long-term growth</span><span>Serving teams worldwide</span></div></div></section><AboutSection /><section className="content-band"><div className="container-section content-band-grid"><div><span className="eyebrow">OUR PRINCIPLES</span><h2>Good software starts with <em>clear thinking.</em></h2></div><div className="principle-list"><article><b>01</b><div><h3>Understand before building</h3><p>We start by understanding the people, workflows and outcomes behind every brief.</p></div></article><article><b>02</b><div><h3>Engineer for the real world</h3><p>We value maintainability, accessibility, performance and security — not just the first release.</p></div></article><article><b>03</b><div><h3>Keep improving</h3><p>We treat delivery as the beginning of a product’s journey, not the end of the relationship.</p></div></article></div></div></section><ProcessSection /><TeamSection /><Footer /></main>;
}
