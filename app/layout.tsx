import type { Metadata } from "next";
import { Inter, Spectral, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-spectral" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Forward — Job Search Roadmap",
  description: "A personalized roadmap for your next role.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spectral.variable} ${mono.variable} font-sans bg-bg text-text`}>
        {children}
      </body>
    </html>
  );
}