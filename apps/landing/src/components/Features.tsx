"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { useTranslation } from "../app/i18n";

interface FeatureProps {
  title: string;
  description: string;
  icon: string;
  delay?: number;
}

const Feature: React.FC<FeatureProps> = ({
  title,
  description,
  icon,
  delay = 0,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center p-8 bg-dark-200/50 backdrop-blur-sm rounded-xl border border-dark-100 hover:border-primary-main/30 transition-all duration-300 group"
      whileHover={{ y: -5, scale: 1.01 }}
    >
      <motion.div 
        className="p-4 rounded-full mb-5 bg-gradient-to-br from-dark-100 to-dark-300 border border-dark-100 group-hover:border-primary-main/30"
        whileHover={{ rotate: [0, 5, -5, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={`/assets/images/icons/${icon}.svg`}
          alt={title}
          width={32}
          height={32}
          className="filter brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300"
        />
      </motion.div>
      <h3 className="text-xl font-bold mb-3 text-center text-white">{title}</h3>
      <p className="text-gray-400 text-center">{description}</p>
    </motion.div>
  );
};

const Features: React.FC = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      title: t('features.connectRiders.title'),
      description: t('features.connectRiders.description'),
      icon: "users",
    },
    {
      title: t('features.discoverRoutes.title'),
      description: t('features.discoverRoutes.description'),
      icon: "map",
    },
    {
      title: t('features.joinEvents.title'),
      description: t('features.joinEvents.description'),
      icon: "calendar",
    },
    {
      title: t('features.shareJourney.title'),
      description: t('features.shareJourney.description'),
      icon: "camera",
    },
    {
      title: t('features.findRepairShops.title'),
      description: t('features.findRepairShops.description'),
      icon: "tools",
    },
    {
      title: t('features.weatherAlerts.title'),
      description: t('features.weatherAlerts.description'),
      icon: "weather",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-dark-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-hero-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-blue/5 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary-main/5 blur-3xl"></div>

      <div className="container-section relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary-main font-semibold tracking-wide inline-flex items-center justify-center mb-4"
          >
            <span className="w-8 h-[1px] bg-primary-main mr-3"></span>
            {t('features.heading')}
            <span className="w-8 h-[1px] bg-primary-main ml-3"></span>
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white"
          >
            {t('features.title')}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-400 text-lg"
          >
            {t('features.subtitle')}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <Feature
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={0.3 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
