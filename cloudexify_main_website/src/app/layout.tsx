import type { Metadata } from 'next';
import Script from 'next/script';
import {
  Inter,
  Noto_Nastaliq_Urdu,
  Noto_Sans_Devanagari,
  Noto_Sans_Bengali,
} from 'next/font/google';
import './globals.css';
import ParticleBackground from '@/components/ParticleBackground';
import FloatingChatWidget from '@/components/FloatingChatWidget';
import TopBanner from '@/components/TopBanner';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { LanguageProvider } from '@/lib/LanguageContext';

const inter = Inter({ subsets: ['latin'] });
const urduFont = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-urdu',
});
const hindiFont = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hindi',
});
const bengaliFont = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: 'Cloudexify — Custom Software, Web & Mobile App Development | Islamabad, Pakistan',
  description:
    'Cloudexify is a software development company in Islamabad, Pakistan. We build scalable web apps, mobile apps, AI solutions, and SaaS platforms using Next.js, React Native, and modern technologies.',
  keywords: [
    'software development company',
    'web development Islamabad',
    'mobile app development Pakistan',
    'Next.js development',
    'React development',
    'AI solutions',
    'SaaS development',
    'Cloudexify',
  ],
  authors: [{ name: 'Cloudexify', url: 'https://cloudexify.site' }],
  openGraph: {
    title: 'Cloudexify — Building Scalable Digital Solutions',
    description:
      'Custom software development for web, mobile, and AI. Based in Islamabad, Pakistan. Serving clients globally.',
    url: 'https://cloudexify.site',
    siteName: 'Cloudexify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cloudexify — Building Scalable Digital Solutions',
    description: 'Custom software development for web, mobile, and AI.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
        <link rel="shortcut icon" type="image/jpeg" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} ${urduFont.variable} ${hindiFont.variable} ${bengaliFont.variable}`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18183422041"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3PR6CCF0MV"
          strategy="afterInteractive"
        />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18183422041');
            gtag('config', 'G-3PR6CCF0MV');
          `}
        </Script>
        <ThemeProvider>
          <LanguageProvider>
            <ParticleBackground />
            <TopBanner />
            {children}
            <FloatingChatWidget />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
