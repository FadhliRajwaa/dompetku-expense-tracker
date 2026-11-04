import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "DompetKu";
const SITE_DESC =
  "DompetKu — catat pemasukan & pengeluaran, kelola dompet dan transfer, atur budget bulanan per kategori, dan pantau lewat dashboard. Gratis untuk personal.";

export const metadata: Metadata = {
  metadataBase: new URL("https://dompetku-expense-tracker.vercel.app"),
  title: {
    default: "DompetKu — Catat Pengeluaran, Kendalikan Budget",
    template: "%s | DompetKu",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "DompetKu — Catat Pengeluaran, Kendalikan Budget",
    description: SITE_DESC,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DompetKu — catat pengeluaran, kendalikan budget bulanan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DompetKu — Catat Pengeluaran, Kendalikan Budget",
    description: SITE_DESC,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
