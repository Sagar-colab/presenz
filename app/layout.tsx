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
  title: "Presenz — Meet in person. Or not at all. | Created by Sagar U",
  description:
    "Presenz matches you with one real person a day. No endless swiping. No ghosting. Just a real date. Created and developed by Sagar U.",
  metadataBase: new URL("https://presenz.app"),
  authors: [{ name: "Sagar U" }],
  creator: "Sagar U",
  openGraph: {
    title: "Presenz",
    description: "Meet in person. Or not at all. Created and developed by Sagar U.",
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
        <footer
          aria-label="Site credit"
          className="border-t border-surface-line bg-white py-5 text-center"
        >
          <p className="text-[12px] tracking-wide text-ink-faint">
            Created &amp; developed by{" "}
            <span className="font-medium text-ink-muted">Sagar U</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
