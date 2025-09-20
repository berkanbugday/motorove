import "../styles/globals.css";
import type { Metadata } from "next";
import { I18nProvider } from "./i18n";

export const metadata: Metadata = {
  title: "Motorove - Connect with Motorcycle Enthusiasts",
  description:
    "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  return (
    <html lang={params.locale || "tr"}>
      <body>
        <I18nProvider locale={params.locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
