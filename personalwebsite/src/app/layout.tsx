import "@/app/globals.css";
import { Host_Grotesk, Source_Serif_4 } from "next/font/google";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import ConditionalChrome from "@/app/components/ConditionalChrome";

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-host-grotesk",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s · Keshav Sreekantham",
    default: "Keshav Sreekantham",
  },
  description:
    "Keshav Sreekantham — [[Builder, Researcher, Engineer. Ask the site anything about his work, projects, and involvement.]]",
  keywords: [
    "Keshav Sreekantham",
    "[[Machine Learning]]",
    "[[Robotics]]",
    "Portfolio",
    "Purdue",
    "[[Engineer]]",
  ],
  authors: [{ name: "Keshav Sreekantham" }],
  creator: "Keshav Sreekantham",
  metadataBase: new URL("https://keshavsreekantham.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.keshavsreekantham.com",
    title: "Keshav Sreekantham",
    description:
      "Keshav Sreekantham — [[Builder, Researcher, Engineer. Ask the site anything.]]",
    siteName: "Keshav Sreekantham",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${sourceSerif.variable} h-full`}
    >
      <body className="h-full m-0 p-0 bg-surface text-ink antialiased">
        <ConditionalChrome>{children}</ConditionalChrome>
        <Analytics />
      </body>
    </html>
  );
}
