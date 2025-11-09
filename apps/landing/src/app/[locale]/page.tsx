import React from "react";
import type { Metadata } from "next";
import Header from "@components/Header";
import Hero from "@components/Hero";
import SocialProof from "@components/SocialProof";
import Features from "@components/Features";
import Map from "@components/Map";
import FinalCTA from "@components/FinalCTA";
import Footer from "@components/Footer";
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
    [Language.TR.toLowerCase()]: "Motorove - Motosiklet Tutkunlarıyla Bağlan",
    [Language.EN.toLowerCase()]:
      "Motorove - Connect with Motorcycle Enthusiasts",
  };

  const descriptions = {
    [Language.TR.toLowerCase()]:
      "Motorove topluluğuna katılarak diğer sürücülerle bağlantı kurun, rotalar keşfedin, etkinliklere katılın ve motosiklet yolculuğunuzu paylaşın.",
    [Language.EN.toLowerCase()]:
      "Join the Motorove community to connect with fellow riders, discover routes, attend events, and share your motorcycle journey.",
  };

  return {
    title: titles[locale] || titles[Language.TR.toLowerCase()],
    description:
      descriptions[locale] || descriptions[Language.TR.toLowerCase()],
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
      <Header />
      <Hero />
      <SocialProof />
      <Features />
      <Map />
      <FinalCTA />
      <Footer />
    </main>
  );
}
