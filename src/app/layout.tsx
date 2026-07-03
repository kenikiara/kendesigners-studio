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
    "Award-winning Nairobi studio. We design, build and run ecommerce that generates real customers: WooCommerce, Next.js, M-Pesa and AI tooling for the East African market.",
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
