import React from "react";
import Header from "@components/Header";
import Hero from "@components/Hero";
import Features from "@components/Features";
import Community from "@components/Community";
import Routes from "@components/Routes";
import Events from "@components/Events";
import DownloadCTA from "@components/DownloadCTA";
import Footer from "@components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <Community />
      <Routes />
      <Events />
      <DownloadCTA />
      <Footer />
    </main>
  );
}
