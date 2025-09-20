import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Motorove - Connect with Motorcycle Enthusiasts",
  description:
    "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
