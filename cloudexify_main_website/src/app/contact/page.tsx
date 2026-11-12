import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';

export const metadata: Metadata = { title: 'Contact', description: 'Tell Cloudexify about your next software, web, mobile or AI project.' };

export default function ContactPage() {
  return <main className="inner-page"><Navbar /><section className="page-hero compact"><div className="container-section"><span className="eyebrow">LET’S TALK</span><h1>Have a challenge? <em>Let’s solve it.</em></h1><p>Share a little about your goals. We’ll review your brief and discuss a practical next step.</p></div></section><ContactSection /><Footer /></main>;
}
