import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import { PauseProvider } from "@/components/ui/pauseContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Human-AI Co-Creativity",
  description: "Collaborate with AI on tasks in real-time.",
  icons: {
    icon: "/human-ai-icon-white.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PauseProvider>
          <Header />
          {children}
          <Footer />
        </PauseProvider>
        <Analytics/>
        <SpeedInsights/>
      </body>
    </html>
  );
}
