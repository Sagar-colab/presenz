import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Présenz — Meet in person. Or not at all.",
  description:
    "Présenz matches you with one real person a day. No endless swiping. No ghosting. Just a real date.",
  metadataBase: new URL("https://presenz.app"),
  openGraph: {
    title: "Présenz",
    description: "Meet in person. Or not at all.",
    type: "website",
  },
  robots: { index: true, follow: true },
  // Discourage casual screenshotting on supported clients
  other: {
    "x-screenshot-protection": "deny",
    "screenshot-protect": "true",
  },
};

export const viewport: Viewport = {
  themeColor: "#534AB7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-ink bg-surface">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
