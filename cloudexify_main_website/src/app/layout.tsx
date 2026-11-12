import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Nastaliq_Urdu, Noto_Sans_Devanagari, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import FloatingChatWidget from '@/components/FloatingChatWidget';
import { LanguageProvider } from '@/lib/LanguageContext';

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
      <body className={`${inter.variable} ${urduFont.variable} ${hindiFont.variable} ${bengaliFont.variable}`}>
        <LanguageProvider>
          {children}
          <FloatingChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
