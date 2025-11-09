"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../app/i18n";

const SocialProof: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="bg-neutral-offWhite dark:bg-background-secondary py-4 sm:py-6 border-y border-neutral-grey/20 dark:border-neutral-darkGrey/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-neutral-darkGrey dark:text-neutral-grey text-xs sm:text-sm tracking-wide"
        >
          {t("socialProof.text")}
        </motion.p>
      </div>
    </section>
  );
};

export default SocialProof;
