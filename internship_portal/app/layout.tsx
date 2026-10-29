import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import AutoLogoutWrapper from "@/components/AutoLogoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CloudExify Summer Internship 2026 — Full Stack Web Development",
    template: "%s | CloudExify",
  },
  description:
    "Join the CloudExify Internship Program. Learn Full Stack Web Development, build real client projects, earn a verified certificate and LOR. 100% Remote. Top interns win cash prizes and paid projects.",
  keywords: [
    "CloudExify internship",
    "summer internship 2026",
    "web development internship",
    "full stack internship Pakistan",
    "remote internship 2026",
    "internship certificate",
    "React internship",
    "Node.js internship",
    "free internship",
    "CloudExify",
    "internship for students",
    "paid internship Pakistan",
    "summer 2026 internship",
  ],
  authors: [{ name: "CloudExify", url: "https://internship.cloudexify.site" }],
  creator: "CloudExify",
  publisher: "CloudExify",
  alternates: {
    canonical: "https://internship.cloudexify.site",
  },
  openGraph: {
    type: "website",
    url: "https://internship.cloudexify.site",
    title: "CloudExify Internship Program — Full Stack Web Development",
    description:
      "Build real projects. Earn a certificate. Top interns win cash prizes. 100% Remote internship by CloudExify.",
    siteName: "CloudExify",
    images: [
      {
        url: "https://internship.cloudexify.site/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CloudExify Summer Internship 2026",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudExify Internship Program",
    description:
      "Real projects. Certificate. LOR. Top interns win cash prizes. 100% Remote. Apply now.",
    images: ["https://internship.cloudexify.site/og-image.jpg"],
    creator: "@cloudexify",
  },
  metadataBase: new URL("https://internship.cloudexify.site"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-brandDark text-slate-100`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOccupationalProgram",
              name: "CloudExify Internship Program",
              description:
                "Full Stack Web Development internship. Build real projects, earn certificate and LOR. Top interns win cash prizes.",
              provider: {
                "@type": "Organization",
                name: "CloudExify",
                url: "https://internship.cloudexify.site",
                logo: "https://internship.cloudexify.site/logo.png",
              },
              educationalProgramMode: "online",
              programPrerequisites: "Basic HTML/CSS knowledge",
              occupationalCategory: "Web Development",
              timeToComplete: "P2M",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "PKR",
                availability: "https://schema.org/InStock",
                validFrom: "2026-06-20",
                validThrough: "2026-06-27",
              },
            }),
          }}
        />
        <Toaster position="top-right" />
        <AutoLogoutWrapper>
          {children}
        </AutoLogoutWrapper>
      </body>
    </html>
  );
}
