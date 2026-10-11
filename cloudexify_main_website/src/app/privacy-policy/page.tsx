import type { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy | Cloudexify — Software Development Company',
  description:
    'Read the Privacy Policy of Cloudexify, a custom software development company based in Islamabad, Pakistan. Learn how we collect, protect, and use your personal data.',
  openGraph: {
    title: 'Privacy Policy | Cloudexify',
    description: 'Learn how Cloudexify collects, uses, and secures your personal information.',
    url: 'https://cloudexify.site/privacy-policy',
    siteName: 'Cloudexify',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
