import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Outfit } from "next/font/google";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-title",
  weight: ["600", "700"],
});

const siteUrl = "https://code-reviewer-ai-9306.onrender.com";
const ogImageUrl = `${siteUrl}/og-image.png?v=2`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CodeReview AI – Review Your Code",
  description: "AI-powered code review and analysis. Paste code, get feedback.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "CodeReview AI – Review Your Code",
    description: "AI-powered code review and analysis. Paste code, get feedback.",
    url: siteUrl,
    siteName: "CodeReview AI",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "CodeReview AI – Review Your Code",
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeReview AI – Review Your Code",
    description: "AI-powered code review and analysis. Paste code, get feedback.",
    images: [ogImageUrl],
  },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-sans), sans-serif" }} suppressHydrationWarning>
        <div className="app-root">
          <ToasterProvider />
          <svg width={0} height={0} aria-hidden>
            <defs>
              <linearGradient id="g-good">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="g-ok">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id="g-bad">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
          {children}
        </div>
      </body>
    </html>
  );
}
