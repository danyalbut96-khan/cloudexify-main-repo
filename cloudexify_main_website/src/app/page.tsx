import AnnouncementPopups from '@/components/AnnouncementPopups';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import AboutSection from '@/components/AboutSection';
import ProcessSection from '@/components/ProcessSection';
import TechStackSection from '@/components/TechStackSection';
import PortfolioSection from '@/components/PortfolioSection';
import CampaignsSection from '@/components/CampaignsSection';
import TeamSection from '@/components/TeamSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

export default function HomePage() {
  return (
    <main>
      <AnnouncementPopups />
      <Navbar />
      <ScrollReveal><HeroSection /></ScrollReveal>
      <ScrollReveal direction="left"><ServicesSection /></ScrollReveal>
      <ScrollReveal direction="right"><AboutSection /></ScrollReveal>
      <ScrollReveal direction="left"><ProcessSection /></ScrollReveal>
      <ScrollReveal direction="right"><TechStackSection /></ScrollReveal>
      <ScrollReveal direction="left"><PortfolioSection /></ScrollReveal>
      <ScrollReveal direction="right"><CampaignsSection /></ScrollReveal>
      <ScrollReveal direction="left"><TeamSection /></ScrollReveal>
      <ScrollReveal direction="right"><BlogSection /></ScrollReveal>
      <ScrollReveal direction="left"><TestimonialsSection /></ScrollReveal>
      <ScrollReveal direction="right"><ContactSection /></ScrollReveal>
      <ScrollReveal><FAQSection /></ScrollReveal>
      <Footer />
    </main>
  );
}
