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

export default function HomePage() {
  return (
    <main>
      <AnnouncementPopups />
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <ProcessSection />
      <TechStackSection />
      <PortfolioSection />
      <CampaignsSection />
      <TeamSection />
      <BlogSection />
      <TestimonialsSection />
      <ContactSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
