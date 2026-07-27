import { getAdminClient } from '@/lib/supabase/server';
import { Globe, MessageCircle, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = getAdminClient();
  const { data: company } = await supabase
    .from('company_settings')
    .select('company_name, company_phone, company_email, company_website, company_address')
    .eq('id', 1)
    .single();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <div className="flex-1">
        {children}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold tracking-tight text-white">
                  {company?.company_name || 'CloudExify'}<span className="text-blue-500 font-extrabold text-2xl">.</span>
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Empowering the next generation of tech talent through innovation and hands-on learning.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Contact Support</h3>
              <ul className="space-y-3">
                {company?.company_phone && (
                  <li>
                    <a href={`https://wa.me/${company.company_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-slate-400 hover:text-green-500 transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {company.company_phone} (WhatsApp)
                    </a>
                  </li>
                )}
                {company?.company_email && (
                  <li>
                    <a href={`mailto:${company.company_email}`} className="flex items-center text-sm text-slate-400 hover:text-blue-500 transition-colors">
                      <Mail className="w-4 h-4 mr-2" />
                      {company.company_email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Office & Web</h3>
              <ul className="space-y-3">
                {company?.company_website && (
                  <li>
                    <a href={company.company_website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-slate-400 hover:text-blue-500 transition-colors">
                      <Globe className="w-4 h-4 mr-2" />
                      {company.company_website.replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                )}
                {company?.company_address && (
                  <li className="flex items-start text-sm text-slate-400">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{company.company_address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} {company?.company_name || 'CloudExify'}. All rights reserved.
            </p>
            <div className="flex space-x-4 text-xs text-slate-500">
              <Link href="/portal/support" className="hover:text-blue-400 transition-colors">Support Portal</Link>
              <Link href="/login" className="hover:text-blue-400 transition-colors">Admin Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
