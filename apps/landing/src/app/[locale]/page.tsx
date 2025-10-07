import React from "react";
import Header from "@components/Header";
import Hero from "@components/Hero";
import Features from "@components/Features";
import Community from "@components/Community";
import Routes from "@components/Routes";
import Events from "@components/Events";
// import DownloadCTA from "@components/DownloadCTA"; // Hidden - app not ready yet
import Footer from "@components/Footer";
import { I18nProvider } from "../i18n";

// Define the params type
interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function Home({ params }: HomePageProps) {
  const { locale } = params;

  return (
    <I18nProvider locale={locale}>
      <main>
        <Header />
        <Hero />
        <Features />
        <Community />
        <Routes />
        <Events />
        {/* <DownloadCTA /> */}
        <Footer />
      </main>
    </I18nProvider>
  );
}
