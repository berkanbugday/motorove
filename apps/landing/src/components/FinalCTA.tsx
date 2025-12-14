"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "../app/i18n";

const FinalCTA: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-neutral-offWhite dark:bg-background-secondary py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12"
        >
          {/* Heading */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-black dark:text-neutral-white leading-tight px-4">
              {t("finalCTA.heading")}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-darkGrey dark:text-neutral-grey px-4">
              {t("finalCTA.subheading")}
            </p>
          </div>

          {/* App Store Badges */}
          <div className="flex flex-row gap-4 justify-center pt-4">
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
            <motion.a
              href="https://play.google.com/store/apps/details?id=com.motorove"
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
            </motion.a>
          </div>

          {/* Subtle feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-8 sm:pt-12 border-t border-neutral-grey/20 dark:border-neutral-darkGrey/100">
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold">
                {t("finalCTA.features.free.title")}
              </div>
              <div className="text-xs sm:text-sm text-neutral-darkGrey dark:text-neutral-grey">
                {t("finalCTA.features.free.description")}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold">
                {t("finalCTA.features.platforms.title")}
              </div>
              <div className="text-xs sm:text-sm text-neutral-darkGrey dark:text-neutral-grey">
                {t("finalCTA.features.platforms.description")}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Accent line decoration */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-main/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-main/50 to-transparent" />
    </section>
  );
};

export default FinalCTA;
