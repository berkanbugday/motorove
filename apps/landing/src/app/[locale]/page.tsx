import React, { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@components/Header";
import Hero from "@components/Hero";
import SocialProof from "@components/SocialProof";
import Features from "@components/Features";
import FinalCTA from "@components/FinalCTA";
import Footer from "@components/Footer";
import EmailVerificationHandler from "@components/EmailVerificationHandler";
import { Language } from "@motorove/shared";

// Define the params type
interface HomePageProps {
  params: {
    locale: string;
  };
}

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = params;

  const titles = {
    [Language.TR.toLowerCase()]: "Motorove",
    [Language.EN.toLowerCase()]: "Motorove",
  };

  const descriptions = {
    [Language.TR.toLowerCase()]:
      "Motorove topluluğuna katılarak diğer sürücülerle bağlantı kurun, rotalar keşfedin, etkinliklere katılın ve motosiklet yolculuğunuzu paylaşın.",
    [Language.EN.toLowerCase()]:
      "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
  };

  return {
    title: titles[locale] || titles[Language.EN.toLowerCase()],
    description:
      descriptions[locale] || descriptions[Language.EN.toLowerCase()],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        [Language.TR.toLowerCase()]: `/${Language.TR.toLowerCase()}`,
        [Language.EN.toLowerCase()]: `/${Language.EN.toLowerCase()}`,
      },
    },
  };
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return [
    { locale: Language.TR.toLowerCase() },
    { locale: Language.EN.toLowerCase() },
  ];
}

export default function Home({ params }: HomePageProps) {
  return (
    <main className="bg-neutral-white dark:bg-background-primary">
      <Suspense fallback={null}>
        <EmailVerificationHandler />
      </Suspense>
      <Header />
      <Hero />
      <SocialProof />
      <Features />
      <FinalCTA />
      <Footer />
    </main>
  );
}
