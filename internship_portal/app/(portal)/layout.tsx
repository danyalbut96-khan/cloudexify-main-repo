import { getAdminClient } from '@/lib/supabase/server';
import { Globe, MessageCircle, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = getAdminClient();
  const { data: company } = await supabase
    .from('company_settings')
    .select('company_name, company_phone, company_email, company_website, company_address')
    .eq('id', 1)
    .single();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <div className="flex-1 pt-20">
        {children}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
