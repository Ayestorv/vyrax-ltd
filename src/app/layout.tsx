import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/lib/i18n/I18nProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { LiveChat } from "@/components/ui/LiveChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vyrax - Fullstack Application & Web Design Agency",
  description: "Vyrax is a full-service digital agency specializing in web design, development, and branding solutions for businesses of all sizes.",
  keywords: "web design, web development, fullstack, agency, branding, digital solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
          <LiveChat />
        </I18nProvider>
      </body>
    </html>
  );
}
