import type { Metadata } from 'next';
import TermsContent from '@/app/terms-and-conditions/TermsContent';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Cloudexify — Software Development Company',
  description:
    'Read the Terms and Conditions of Cloudexify, a software development company based in Islamabad, Pakistan. These terms govern the use of our website and professional services.',
  openGraph: {
    title: 'Terms and Conditions | Cloudexify',
    description: 'Legal terms governing the use of Cloudexify services and website.',
    url: 'https://cloudexify.site/terms-and-conditions',
    siteName: 'Cloudexify',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return <TermsContent />;
}
