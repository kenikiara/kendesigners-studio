import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Ken Designers — Web design and ecommerce studio, Nairobi",
    template: "%s | Ken Designers",
  },
  description:
    "Award-winning Nairobi web design and development studio. We build websites that generate real customers, from brand sites to M-Pesa online stores.",
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_KE",
    images: ["/studio/award-best-developer.webp"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
