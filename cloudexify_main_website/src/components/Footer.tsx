'use client';

import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';

const groups = [
  { titleKey: 'footer.quicklinks', links: [{ key: 'footer.link.home', href: '/' }, { key: 'footer.link.about', href: '/about' }, { key: 'nav.services', href: '/services' }, { key: 'footer.link.portfolio', href: '/portfolio' }, { label: 'Blog', href: '/blog' }] },
  { titleKey: 'footer.services', links: [{ key: 'footer.link.web', href: '/services/web-development' }, { key: 'footer.link.mobile', href: '/services/mobile-app-development' }, { key: 'footer.link.ai', href: '/services/ai-solutions' }, { key: 'footer.link.saas', href: '/services/saas-development' }, { key: 'footer.link.cloud', href: '/services/cloud-devops' }] },
  { titleKey: 'nav.contact', links: [{ key: 'nav.contact', href: '/contact' }, { label: 'Internship portal', href: 'https://internship.cloudexify.site' }, { label: 'Client website', href: 'https://client.cloudexify.site' }, { key: 'footer.privacy', href: '/privacy-policy' }, { key: 'footer.terms', href: '/terms-and-conditions' }] },
];
const socials = [
  { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/company/cloudexify/' },
  { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/cloudexify_official/' },
  { label: 'Facebook', icon: 'facebook', href: 'https://web.facebook.com/cloudexifyofficial/' },
  { label: 'YouTube', icon: 'youtube', href: 'https://www.youtube.com/@CloudExify' },
  { label: 'WhatsApp', icon: 'whatsapp', href: 'https://wa.me/923411949277' },
];

function SocialIcon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const };
  switch (name) {
    case 'linkedin': return <svg {...common}><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12M7.12 20.45H3.56V9h3.56z"/></svg>;
    case 'instagram': return <svg {...common}><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2m0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4zm4.5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6m5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5"/></svg>;
    case 'facebook': return <svg {...common}><path d="M13.4 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.2V13h2.8v8z"/></svg>;
    case 'youtube': return <svg {...common}><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8M9.6 15.6V8.4l6.2 3.6z"/></svg>;
    case 'whatsapp': return <svg {...common}><path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.5l5.9-1.5A11.8 11.8 0 0 0 20.5 3.5M12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.4A9 9 0 1 1 12 21m5-6.7c-.3-.2-1.7-.9-2-.9s-.5-.2-.7.2-.8.9-1 1.1-.4.2-.7.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.5.1-.6l.5-.6.2-.5-.1-.5c-.1-.2-.7-1.6-1-2.1-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4s-1.1 1.1-1.1 2.6 1.1 3 1.3 3.2c.1.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4"/></svg>;
    default: return null;
  }
}
export default function Footer() {
  const { lang, t } = useLang();
  return (
    <footer className="site-footer" dir={['ur','ps','pa','fa','ar'].includes(lang) ? 'rtl' : 'ltr'}>
      <div className="footer-main container-section">
        <div className="footer-brand-column">
          <Link href="/" className="brand footer-brand">
            <img src="/logo.jpg" alt="" className="brand-logo" />
            <span className="brand-word">Cloud<span>exify</span><small>CODE YOUR FUTURE</small></span>
          </Link>
          <p>{t('footer.tagline')}</p>
          <a className="footer-email" href="mailto:hello@cloudexify.site"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg> hello@cloudexify.site <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></a>
          <div className="footer-socials">
            {socials.map(({label,href,icon}) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}><SocialIcon name={icon} /></a>)}
          </div>
        </div>
        {groups.map((group) => (
          <div className="footer-link-group" key={group.titleKey}>
            <h3>{t(group.titleKey)}</h3>
            {group.links.map((link) => {
              const label = link.label || t(link.key || '');
              return link.href.startsWith('http') ? <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{label}</a> : <Link key={link.href} href={link.href}>{label}</Link>;
            })}
          </div>
        ))}
      </div>
      <div className="footer-bottom container-section">
        <span>© {new Date().getFullYear()} Cloudexify. {t('footer.copyright')}</span>
        <span className="footer-credit">Made with <span className="heart" aria-label="love">♥</span> by <strong>Cloudexify</strong></span>
        <span className="footer-location">Built for a world without borders.</span>
      </div>
    </footer>
  );
}
