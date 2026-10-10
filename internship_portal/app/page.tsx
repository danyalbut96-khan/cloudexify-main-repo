import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import WhyUs from "@/components/WhyUs";
import DomainsSection from "@/components/DomainsSection";
import WhatYouLearn from "@/components/WhatYouLearn";
import HowItWorks from "@/components/HowItWorks";
import InternshipDetails from "@/components/InternshipDetails";
import WhatYouGet from "@/components/WhatYouGet";
import Requirements from "@/components/Requirements";
import Timeline from "@/components/Timeline";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import TopWinners from "@/components/TopWinners";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const { data: batches } = await supabase.from('batches').select('*');
  
  const activeBatch = batches?.find(b => b.status === 'active') || { name: 'CloudExify Internship Program', start_date: 'TBD', end_date: 'TBD', registration_deadline: 'TBD' };
  const comingBatch = batches?.find(b => b.status === 'coming');

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero activeBatchName={activeBatch.name} />
        <StatsBar />
        <WhyUs />
        <DomainsSection />
        <WhatYouLearn />
        <HowItWorks />
        <InternshipDetails activeBatch={activeBatch} comingBatch={comingBatch} />
        <WhatYouGet />
        <Requirements />
        <Timeline />
        <FAQ />
        <Testimonials />
        <TopWinners />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
