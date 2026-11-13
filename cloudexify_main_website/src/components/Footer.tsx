'use client';

import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';

const groups = [
  { titleKey: 'footer.quicklinks', links: [{ key: 'footer.link.home', href: '/' }, { key: 'footer.link.about', href: '/about' }, { key: 'nav.services', href: '/services' }, { key: 'footer.link.portfolio', href: '/portfolio' }, { label: 'Blog', href: '/blog' }] },
  { titleKey: 'footer.services', links: [{ key: 'footer.link.web', href: '/services/web-development' }, { key: 'footer.link.mobile', href: '/services/mobile-app-development' }, { key: 'footer.link.ai', href: '/services/ai-solutions' }, { key: 'footer.link.saas', href: '/services/saas-development' }, { key: 'footer.link.cloud', href: '/services/cloud-devops' }] },
  { titleKey: 'nav.contact', links: [{ key: 'nav.contact', href: '/contact' }, { label: 'Internship portal', href: 'https://internship.cloudexify.site' }, { label: 'Client website', href: 'https://client.cloudexify.site' }, { key: 'footer.privacy', href: '/privacy-policy' }, { key: 'footer.terms', href: '/terms-and-conditions' }] },
];
const socials = [
  { label: 'LinkedIn', short: 'in', href: 'https://www.linkedin.com/company/cloudexify/' },
  { label: 'Instagram', short: 'ig', href: 'https://www.instagram.com/cloudexify_official/' },
  { label: 'Facebook', short: 'f', href: 'https://web.facebook.com/cloudexifyofficial/' },
  { label: 'YouTube', short: '▶', href: 'https://www.youtube.com/@CloudExify' },
  { label: 'WhatsApp', short: 'wa', href: 'https://wa.me/923411949277' },
];

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
          <a className="footer-email" href="mailto:hello@cloudexify.site"><span aria-hidden>✉</span> hello@cloudexify.site <span aria-hidden>↗</span></a>
          <div className="footer-socials">
            {socials.map(({label,href,short}) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>{short}</a>)}
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
