"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trans } from "react-i18next";
import { useTranslation } from "../app/i18n";

const Hero: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-dark-gradient pt-24 pb-16 md:pt-32 md:pb-32 overflow-hidden relative">
      {/* Gradient overlay effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-purple opacity-5 blur-3xl"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-primary-main opacity-5 blur-3xl"></div>
      <div className="absolute -bottom-60 left-1/4 w-96 h-96 rounded-full bg-accent-blue opacity-5 blur-3xl"></div>
      <div className="container-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col space-y-8 max-w-xl"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-primary-main font-semibold tracking-wide inline-flex items-center"
            >
              <span className="w-8 h-[1px] bg-primary-main mr-3"></span>
              {t("hero.heading")}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              <Trans
                i18nKey="hero.title"
                components={[<span key="0" className="text-primary-main" />]}
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-gray-400"
            >
              {t("hero.subtitle")}
            </motion.p>

            {/* Download buttons temporarily hidden - app not ready yet */}
            {/* <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="https://apps.apple.com/app/motorove"
                  className="btn bg-gradient-to-r from-primary-main to-primary-dark text-white inline-flex items-center justify-center"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16.5 3c-2.05 0-3.7 1.24-4.5 3-0.8-1.76-2.45-3-4.5-3C4.01 3 2 5.01 2 8.5c0 3.77 3.4 6.86 8.55 11.53L12 21.35l1.45-1.32C18.6 15.36 22 12.27 22 8.5 22 5.01 19.99 3 16.5 3z" />
                  </svg>
                  {t('hero.appStore')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="https://play.google.com/store/apps/details?id=com.motorove"
                  className="btn border border-white/30 bg-white/5 hover:bg-white/10 text-white inline-flex items-center justify-center backdrop-blur-sm"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5 3v18l9-9L5 3zm11 0L7 12l9 9 3-3-6-6 6-6-3-3z" />
                  </svg>
                  {t('hero.googlePlay')}
                </Link>
              </motion.div>
            </motion.div> */}

            {/* Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-6 mt-4"
            >
              <div className="inline-flex items-center px-4 py-2 bg-primary-main/10 border border-primary-main/20 rounded-full">
                <div className="w-2 h-2 bg-primary-main rounded-full mr-2 animate-pulse"></div>
                <span className="text-primary-main font-semibold text-sm">
                  {t("hero.comingSoon.badge")}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-3">
                {t("hero.comingSoon.message")}
              </p>
            </motion.div>

            {/* Social Proof - Hidden until app is deployed */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-6 border-t border-white/10 mt-4"
            >
              <p className="text-gray-500 text-sm mb-2 mt-4">
                {t("hero.socialProof.trusted")}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {t("hero.socialProof.rating")}
                </span>
              </div>
            </motion.div> */}
          </motion.div>

          {/* App Preview Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative h-[500px] md:h-[600px] flex items-center justify-center"
          >
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
              {/* Ring light effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-main opacity-5 rounded-full blur-3xl"></div>

              <div className="relative h-full w-full">
                {/* Floating App Screens with glass effect */}
                <motion.div
                  className="absolute transform -translate-y-4 animate-float-slow"
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_25px_rgba(255,59,48,0.15)]">
                    <Image
                      src="/assets/images/app-screen-1.png"
                      alt={t("hero.altText.screen1")}
                      width={280}
                      height={560}
                      className="rounded-3xl z-10 relative"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-dark/10 to-transparent opacity-60"></div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-32 top-12 animate-float"
                  style={{ animationDelay: "1s" }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 1, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5,
                  }}
                >
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_25px_rgba(51,102,255,0.15)]">
                    <Image
                      src="/assets/images/app-screen-2.png"
                      alt={t("hero.altText.screen2")}
                      width={280}
                      height={560}
                      className="rounded-3xl z-10 relative"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-blue/10 to-transparent opacity-60"></div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Glowing circle elements */}
            <motion.div
              className="absolute -z-10 w-64 h-64 bg-accent-purple/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ top: "20%", left: "10%" }}
            />
            <motion.div
              className="absolute -z-10 w-48 h-48 bg-primary-main/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 7, delay: 1, repeat: Infinity }}
              style={{ top: "60%", right: "15%" }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
