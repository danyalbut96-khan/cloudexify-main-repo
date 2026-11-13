import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Noto_Nastaliq_Urdu, Noto_Sans_Devanagari, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import './brand-led.css';
import FloatingChatWidget from '@/components/FloatingChatWidget';
import ParticleBackground from '@/components/ParticleBackground';
import ScrollRevealController from '@/components/ScrollRevealController';
import TopBanner from '@/components/TopBanner';
import { LanguageProvider } from '@/lib/LanguageContext';
import { ThemeProvider } from '@/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const urduFont = Noto_Nastaliq_Urdu({ subsets: ['arabic'], weight: ['400','700'], variable: '--font-urdu' });
const hindiFont = Noto_Sans_Devanagari({ subsets: ['devanagari'], weight: ['400','500','600','700'], variable: '--font-hindi' });
const bengaliFont = Noto_Sans_Bengali({ subsets: ['bengali'], weight: ['400','500','600','700'], variable: '--font-bengali' });

export const metadata: Metadata = {
  metadataBase: new URL('https://cloudexify.site'),
  title: { default: 'Cloudexify | Code Your Future', template: '%s | Cloudexify' },
  description: 'Cloudexify builds custom software, web and mobile applications, AI solutions and SaaS platforms for ambitious teams worldwide.',
  keywords: ['software development', 'web development', 'mobile app development', 'AI solutions', 'SaaS development', 'Cloudexify'],
  openGraph: { title: 'Cloudexify | Code Your Future', description: 'Digital products engineered for what comes next.', url: 'https://cloudexify.site', siteName: 'Cloudexify', type: 'website' },
  robots: { index: true, follow: true },
  icons: { icon: '/logo.jpg', shortcut: '/logo.jpg', apple: '/logo.jpg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
        <link rel="shortcut icon" type="image/jpeg" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${urduFont.variable} ${hindiFont.variable} ${bengaliFont.variable}`}>
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
            <ScrollRevealController />
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
