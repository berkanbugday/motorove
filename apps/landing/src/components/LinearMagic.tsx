"use client";

import React from "react";
import { motion } from "framer-motion";

const LinearMagic: React.FC = () => {
  return (
    <section className="bg-neutral-offWhite dark:bg-background-secondary py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-black dark:text-neutral-white leading-tight">
            Find. Warn. Protect.
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-neutral-darkGrey dark:text-neutral-grey leading-relaxed max-w-3xl mx-auto px-4">
            More than just navigation. Find services when you need them, warn fellow riders about hazards, and get help in emergencies.
          </p>

          {/* Feature Grid - Larger Rounded Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8">
            {/* Find Nearby Businesses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary-main/10 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-300" />
              <div className="relative glass-strong glass-hover rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">🔧</div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-black dark:text-neutral-white mb-3 sm:mb-4">
                  Find Nearby Businesses
                </h3>
                <p className="text-sm sm:text-base text-neutral-darkGrey dark:text-neutral-grey leading-relaxed">
                  Discover repair shops, gas stations, and motorcycle services nearby with smart filters for your needs.
                </p>
              </div>
            </motion.div>

            {/* Shared Warnings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary-main/10 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-300" />
              <div className="relative glass-strong glass-hover rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">⚠️</div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-black dark:text-neutral-white mb-3 sm:mb-4">
                  Shared Warnings
                </h3>
                <p className="text-sm sm:text-base text-neutral-darkGrey dark:text-neutral-grey leading-relaxed">
                  Alert other riders about road hazards, accidents, or dangerous conditions in real-time on the map.
                </p>
              </div>
            </motion.div>

            {/* Emergency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary-main/10 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-300" />
              <div className="relative glass-strong glass-hover rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">🆘</div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-black dark:text-neutral-white mb-3 sm:mb-4">
                  Emergency
                </h3>
                <p className="text-sm sm:text-base text-neutral-darkGrey dark:text-neutral-grey leading-relaxed">
                  One-tap emergency alerts to your riding group and emergency contacts when you need help.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Accent line decoration */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-main/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-main/50 to-transparent" />
    </section>
  );
};

export default LinearMagic;
