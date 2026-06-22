import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevFlow - Real-time Collaboration",
  description: "The next generation of collaborative coding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased selection:bg-primary/30 selection:text-primary-foreground`}
      >
        <div className="fixed inset-0 -z-10 h-full w-full bg-[#030712]">
             {/* Gradient Orbs Background */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-[120px] opacity-20 w-[500px] h-[500px] rounded-full bg-primary/40 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-24 blur-[120px] opacity-20 w-[600px] h-[600px] rounded-full bg-secondary/30 pointer-events-none"></div>
        </div>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
