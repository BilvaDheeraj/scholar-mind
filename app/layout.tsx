import type { Metadata } from "next";
import { Instrument_Serif, Bricolage_Grotesque, Lora, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ScholarMind — From question to insight, in minutes",
    template: "%s | ScholarMind",
  },
  description:
    "ScholarMind orchestrates a team of AI agents to synthesize peer-reviewed literature into structured survey papers — automatically. Research that used to take weeks now takes ten minutes.",
  keywords: [
    "AI research", "literature review", "academic synthesis", "research automation",
    "survey generation", "Semantic Scholar", "AI agents", "academic research",
  ],
  authors: [{ name: "ScholarMind" }],
  creator: "ScholarMind",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://scholarmind.ai",
    title: "ScholarMind — From question to insight, in minutes",
    description:
      "AI-powered research synthesis platform. Turn any research question into a structured, peer-reviewed survey in minutes.",
    siteName: "ScholarMind",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScholarMind — From question to insight, in minutes",
    description: "AI-powered research synthesis platform.",
    creator: "@scholarmind",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${bricolage.variable} ${lora.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontFamily: "var(--font-bricolage)",
                  fontSize: "14px",
                  boxShadow: "var(--shadow-card)",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
