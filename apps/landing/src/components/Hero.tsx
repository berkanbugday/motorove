"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import PhoneMockup from "./PhoneMockup";
import { useTranslation } from "../app/i18n";

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "tr";

  return (
    <section
      id="home"
      className="relative min-h-screen bg-neutral-white dark:bg-background-primary overflow-hidden flex items-center"
    >
      {/* Impressive Background */}
      <div className="absolute inset-0 z-0">
        {/* Animated road pattern background */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="road-grid"
                x="0"
                y="0"
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                {/* Road lines */}
                <path
                  d="M0 60 L120 60"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="30,15"
                  opacity="0.5"
                />
                {/* Motorcycle icons as dots */}
                <circle
                  cx="30"
                  cy="60"
                  r="4"
                  fill="currentColor"
                  opacity="0.4"
                />
                <circle
                  cx="90"
                  cy="60"
                  r="4"
                  fill="currentColor"
                  opacity="0.4"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#road-grid)" />
          </svg>
        </div>

        {/* Animated gradient orbs - optimized for mobile */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.12, 0.18, 0.12],
            x: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] bg-primary-main rounded-full blur-[100px] sm:blur-[120px] lg:blur-[150px] z-[1]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.15, 0.1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute bottom-0 left-0 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] bg-primary-light rounded-full blur-[90px] sm:blur-[110px] lg:blur-[130px] z-[1]"
        />

        {/* Diagonal light streaks - hidden on mobile for performance */}
        <motion.div
          animate={{
            opacity: [0.05, 0.1, 0.05],
            rotate: [0, 2, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-1/4 -right-1/4 w-[800px] h-[400px] bg-gradient-to-br from-primary-main/20 to-transparent rounded-full blur-3xl transform rotate-45 z-[1]"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-20 sm:pt-24 pb-12 sm:pb-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
          {/* App Mockup - First on mobile, second on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center lg:order-2"
          >
            <div className="scale-[0.75] sm:scale-[0.85] md:scale-100">
              <PhoneMockup
                screenshot={`/assets/images/${currentLanguage}/app-screen-1.png`}
                alt={t("hero.altText.screen1")}
              />
            </div>
          </motion.div>

          {/* Text Content - Second on mobile, first on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left lg:order-1"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-neutral-black dark:text-neutral-white leading-[1.1] tracking-tight">
              {t("hero.headline.line1")}
              <br />
              <span className="text-neutral-darkGrey dark:text-neutral-white">
                {t("hero.headline.line2")}
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-neutral-darkGrey dark:text-neutral-grey leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t("hero.subheadline")}
            </p>

            {/* App Store Badges */}
            <div className="flex flex-row gap-4 pt-4 justify-center lg:justify-start">
              <motion.a
                href="https://apps.apple.com/tr/app/motorove/id6755730937"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Image
                  src="/assets/images/app-store-badge.png"
                  alt="Download on the App Store"
                  width={160}
                  height={53}
                  className="h-[48px] sm:h-[53px] w-auto"
                />
              </motion.a>
              {/* <motion.a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Image
                  src="/assets/images/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={180}
                  height={53}
                  className="h-[48px] sm:h-[53px] w-auto"
                />
              </motion.a> */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-neutral-grey dark:border-neutral-grey rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-neutral-grey rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
