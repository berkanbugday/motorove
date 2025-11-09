import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { I18nProvider } from "./i18n";
import { Language } from "@motorove/shared";
import { ThemeProvider } from "@components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Motorove - Connect with Motorcycle Enthusiasts",
    template: "%s | Motorove",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://motorove.com"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    siteName: "Motorove",
    title: "Motorove - Connect with Motorcycle Enthusiasts",
    description:
      "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motorove - Connect with Motorcycle Enthusiasts",
    description:
      "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
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
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  return (
    <html lang={params.locale || Language.TR.toLowerCase()} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          enableColorScheme={false}
          disableTransitionOnChange={false}
        >
          <I18nProvider locale={params.locale}>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
