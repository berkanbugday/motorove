"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../app/i18n";

const FinalCTA: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-neutral-white dark:bg-background-primary py-16 sm:py-24 lg:py-32">
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

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-5 bg-primary-main text-neutral-white font-semibold rounded-4xl text-lg transition-all duration-200 hover:bg-primary-light inline-flex items-center justify-center gap-3"
            >
              <span>{t("finalCTA.button")}</span>
              <span className="px-2.5 py-1 bg-neutral-white/20 rounded text-sm font-bold">
                {t("finalCTA.badge")}
              </span>
            </motion.button>
          </div>

          {/* Subtle feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-8 sm:pt-12 border-t border-neutral-grey/20 dark:border-neutral-darkGrey/30">
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
            {/* <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold">{t("finalCTA.features.offlineMaps.title")}</div>
              <div className="text-xs sm:text-sm text-neutral-darkGrey dark:text-neutral-grey">
                {t("finalCTA.features.offlineMaps.description")}
              </div>
            </div> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
