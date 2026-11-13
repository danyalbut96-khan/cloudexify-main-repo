import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogSection from '@/components/BlogSection';

export const metadata: Metadata = { title: 'Insights & Blog', description: 'Perspectives, practical guides and updates from the Cloudexify team.' };

export default function BlogPage() {
  return <main className="inner-page"><Navbar /><section className="page-hero compact"><div className="container-section"><span className="eyebrow">INSIGHTS & IDEAS</span><h1>Thoughts on building <em>what’s next.</em></h1><p>Explore practical perspectives on software, product development, technology and the digital world.</p></div></section><BlogSection /><Footer /></main>;
}
