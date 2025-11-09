import React from "react";
import Header from "@components/Header";
import LinearHero from "@components/LinearHero";
import SocialProof from "@components/SocialProof";
import FeatureBlocks from "@components/FeatureBlocks";
import LinearMagic from "@components/LinearMagic";
import FinalCTA from "@components/FinalCTA";
import Footer from "@components/Footer";
import { I18nProvider } from "../../i18n";

// Define the params type
interface LinearPageProps {
  params: {
    locale: string;
  };
}

export default function LinearPage({ params }: LinearPageProps) {
  const { locale } = params;

  return (
    <I18nProvider locale={locale}>
      <main className="bg-background-primary">
        <Header />
        <LinearHero />
        <SocialProof />
        <FeatureBlocks />
        <LinearMagic />
        <FinalCTA />
        <Footer />
      </main>
    </I18nProvider>
  );
}
