import type { Metadata } from "next";
import { Fraunces, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

// Display: Fraunces — serif variabel dengan optical sizing, berkarakter premium.
// UI/body: Manrope — grotesque geometris yang rapi di ukuran kecil.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
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
  // Variabel font WAJIB di <html>: globals.css memakai `html { @apply font-sans }`,
  // dan custom property yang dideklarasikan di body tidak terlihat oleh html
  // (menyebabkan font-family invalid -> fallback ke Times New Roman).
  return (
    <html lang="id" className={`${manrope.variable} ${fraunces.variable} ${geistMono.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        {/* Terapkan tema sebelum paint pertama agar tidak ada kedipan terang
            saat pengguna memilih mode gelap. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('dompetku-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
          }}
        />
        <meta name="theme-color" content="#2FA084" />
      </head>
      <body className="antialiased">
        <SmoothScroll />
        {children}
        <ThemeProvider initial="system" />
        <PwaRegister />
      </body>
    </html>
  );
}
