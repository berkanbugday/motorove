import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { Language } from "@motorove/shared";
import { ThemeProvider } from "@components/ThemeProvider";
import ToastProvider from "@components/ToastProvider";

export const metadata: Metadata = {
  title: {
    default: "Motorove",
    template: "%s",
  },
  description:
    "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
  keywords: [
    "motorcycle",
    "riders",
    "community",
    "routes",
    "events",
    "motorbike",
    "bikers",
  ],
  authors: [{ name: "Motorove" }],
  creator: "Motorove",
  publisher: "Motorove",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://motorove.app"
  ),
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/assets/images/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/assets/images/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      { url: "/assets/images/favicon/favicon.ico", sizes: "any" },
    ],
    shortcut: "/assets/images/favicon/favicon.ico",
    apple: [
      {
        url: "/assets/images/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["tr_TR"],
    siteName: "Motorove",
    title: "Motorove",
    description:
      "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
    images: [
      {
        url: "/assets/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Motorove Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Motorove",
    description:
      "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
    images: ["/assets/images/logo.png"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={Language.EN.toLowerCase()} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          enableColorScheme={false}
          disableTransitionOnChange={false}
        >
          <ToastProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
