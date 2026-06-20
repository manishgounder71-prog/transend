import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit CTO X - Autonomous Software Company Command Center",
  description: "The Autonomous Operating System for Software Companies. Predict risks, secure deployments, orchestrate AI agents, and simulate boardroom decisions in real-time.",
  metadataBase: new URL("https://orbitcto-x.dev"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Orbit CTO X - Autonomous Software Company Command Center",
    description: "Manage projects, predict risks, orchestrate AI agents, secure deployments, and run your entire engineering organization from one command center.",
    url: "https://orbitcto-x.dev",
    siteName: "Orbit CTO X",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Orbit CTO X Command Center",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit CTO X - Autonomous Software Company Command Center",
    description: "Manage projects, predict risks, orchestrate AI agents, secure deployments, and run your entire engineering organization from one command center.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
