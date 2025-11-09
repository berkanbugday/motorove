"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import PhoneMockup from "./PhoneMockup";
import { useTranslation } from "../app/i18n";

interface FeatureThumbnail {
  image: string;
  label: string;
  alt: string;
}

interface FeatureBlockProps {
  heading: string;
  body: string;
  visual: string;
  visualAlt: string;
  reverse?: boolean;
  thumbnails?: FeatureThumbnail[];
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({
  heading,
  body,
  visual,
  visualAlt,
  reverse = false,
  thumbnails,
}) => {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
        reverse ? "lg:grid-flow-dense" : ""
      } relative`}
    >
      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`${reverse ? "lg:col-start-2" : ""} text-center lg:text-left relative z-10`}
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-black dark:text-neutral-white mb-4 lg:mb-6 leading-tight">
          {heading}
        </h2>
        <p className="text-base sm:text-lg text-neutral-darkGrey dark:text-neutral-grey leading-relaxed mb-6 lg:mb-8">{body}</p>

      </motion.div>

      {/* Visual - App Screenshot in Phone Frame with floating feature thumbnails */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={`${reverse ? "lg:col-start-1 lg:row-start-1" : ""} relative`}
      >
        {/* Floating feature thumbnail images around phone */}
        {thumbnails && thumbnails.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {thumbnails.map((thumbnail, index) => {
              // Position thumbnails with varied sizes - responsive for mobile
              const configs = [
                { 
                  top: "5%", 
                  left: "-5%", 
                  rotate: -5, 
                  size: "w-20 h-24 sm:w-24 sm:h-32 lg:w-28 lg:h-36 xl:w-32 xl:h-40"
                },
                { 
                  top: "15%", 
                  right: "-5%", 
                  rotate: 5, 
                  size: "w-24 h-32 sm:w-28 sm:h-36 lg:w-36 lg:h-44 xl:w-40 xl:h-48"
                },
                { 
                  bottom: "30%", 
                  left: "-5%", 
                  rotate: -3, 
                  size: "w-20 h-28 sm:w-24 sm:h-32 lg:w-32 lg:h-40 xl:w-36 xl:h-44"
                },
                { 
                  bottom: "10%", 
                  right: "-5%", 
                  rotate: 3, 
                  size: "w-20 h-28 sm:w-24 sm:h-32 lg:w-32 lg:h-40 xl:w-36 xl:h-44"
                },
              ];
              const config = configs[index % 4];
              const { size, ...position } = config;

              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0, rotateZ: 0, z: -100 }}
                  whileInView={{ 
                    scale: 1, 
                    opacity: 1, 
                    rotateZ: position.rotate,
                    z: 0
                  }}
                  viewport={{ once: true }}
                  animate={{
                    y: [0, -15, 0],
                    rotateZ: [position.rotate, position.rotate + 3, position.rotate],
                    z: [0, 30, 0],
                  }}
                  transition={{
                    scale: { duration: 0.6, delay: index * 0.2, type: "spring", stiffness: 200 },
                    opacity: { duration: 0.6, delay: index * 0.2 },
                    rotateZ: { duration: 0.6, delay: index * 0.2 },
                    y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
                    z: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 },
                  }}
                  whileHover={{
                    scale: 1.15,
                    z: 60,
                    rotateZ: position.rotate + 10,
                    transition: { duration: 0.3 }
                  }}
                  className="absolute group cursor-pointer"
                  style={{
                    ...position,
                    transformStyle: "preserve-3d",
                    perspective: "1000px",
                  }}
                >
                  {/* Animated arrow line pointing to thumbnail - responsive */}
                  <svg 
                    className="absolute pointer-events-none opacity-60 sm:opacity-70 lg:opacity-80"
                    style={{
                      width: "60px",
                      height: "60px",
                      [position.left ? "right" : "left"]: position.left ? "100%" : "100%",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <defs>
                      <linearGradient id={`arrowGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FF3B30" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d={position.left 
                        ? "M 50 30 Q 30 30, 10 30" 
                        : "M 10 30 Q 30 30, 50 30"
                      }
                      stroke={`url(#arrowGradient-${index})`}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="4,4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 1, 
                        delay: index * 0.2 + 0.5,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.circle
                      cx={position.left ? "10" : "50"}
                      cy="30"
                      r="3"
                      fill="#FF3B30"
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.2 + 1.2 
                      }}
                    />
                  </svg>

                  {/* Multi-layer glow effect - reduced on mobile for performance */}
                  <div className="hidden sm:block absolute inset-0 bg-primary-main/30 rounded-2xl blur-2xl scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />
                  <div className="hidden lg:block absolute inset-0 bg-primary-light/20 rounded-2xl blur-3xl scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-[1.8] transition-all duration-700" />
                  
                  {/* Thumbnail card with image - Varied sizes */}
                  <div className={`relative ${size} glass-strong backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-primary-main/30 group-hover:border-primary-main/60 shadow-[0_10px_40px_rgba(0,0,0,0.2)] group-hover:shadow-[0_20px_60px_rgba(255,59,48,0.3)] transition-all duration-300`}>
                    {/* Screenshot image */}
                    <Image
                      src={thumbnail.image}
                      alt={thumbnail.alt}
                      fill
                      sizes="(max-width: 640px) 96px, (max-width: 1024px) 128px, 160px"
                      className="object-cover"
                      style={{
                        transform: "translateZ(10px)",
                      }}
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/80 via-neutral-black/20 to-transparent" />
                    
                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2.5 text-center">
                      <span className="text-[0.65rem] sm:text-xs lg:text-sm font-bold text-neutral-white drop-shadow-lg leading-tight">
                        {thumbnail.label}
                      </span>
                    </div>

                    {/* Shine effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>

                  {/* Floating sparkle particles */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-primary-main rounded-full shadow-lg shadow-primary-main/50"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.4,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="relative flex justify-center scale-[0.65] sm:scale-75 md:scale-90">
          <PhoneMockup screenshot={visual} alt={visualAlt} />
        </div>
      </motion.div>
    </div>
  );
};

const Features: React.FC = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      heading: t("features.discoverRoads.heading"),
      body: t("features.discoverRoads.body"),
      visual: "/assets/images/app-screen-1.png",
      visualAlt: t("features.discoverRoads.visualAlt"),
      reverse: false,
      thumbnails: [
        { image: "/assets/images/app-screen-1.png", label: t("features.discoverRoads.thumbnails.twistyRoads.label"), alt: t("features.discoverRoads.thumbnails.twistyRoads.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.discoverRoads.thumbnails.waypoints.label"), alt: t("features.discoverRoads.thumbnails.waypoints.alt") },
        { image: "/assets/images/app-screen-1.png", label: t("features.discoverRoads.thumbnails.offlineMaps.label"), alt: t("features.discoverRoads.thumbnails.offlineMaps.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.discoverRoads.thumbnails.shareRoutes.label"), alt: t("features.discoverRoads.thumbnails.shareRoutes.alt") },
      ],
    },
    {
      heading: t("features.rideTogether.heading"),
      body: t("features.rideTogether.body"),
      visual: "/assets/images/app-screen-2.png",
      visualAlt: t("features.rideTogether.visualAlt"),
      reverse: true,
      thumbnails: [
        { image: "/assets/images/app-screen-1.png", label: t("features.rideTogether.thumbnails.liveTracking.label"), alt: t("features.rideTogether.thumbnails.liveTracking.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.rideTogether.thumbnails.groupRides.label"), alt: t("features.rideTogether.thumbnails.groupRides.alt") },
        { image: "/assets/images/app-screen-1.png", label: t("features.rideTogether.thumbnails.statistics.label"), alt: t("features.rideTogether.thumbnails.statistics.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.rideTogether.thumbnails.logbook.label"), alt: t("features.rideTogether.thumbnails.logbook.alt") },
      ],
    },
    {
      heading: t("features.focusOnRoad.heading"),
      body: t("features.focusOnRoad.body"),
      visual: "/assets/images/app-screen-1.png",
      visualAlt: t("features.focusOnRoad.visualAlt"),
      reverse: false,
      thumbnails: [
        { image: "/assets/images/app-screen-1.png", label: t("features.focusOnRoad.thumbnails.rideMode.label"), alt: t("features.focusOnRoad.thumbnails.rideMode.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.focusOnRoad.thumbnails.gloveFriendly.label"), alt: t("features.focusOnRoad.thumbnails.gloveFriendly.alt") },
        { image: "/assets/images/app-screen-1.png", label: t("features.focusOnRoad.thumbnails.voiceNav.label"), alt: t("features.focusOnRoad.thumbnails.voiceNav.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.focusOnRoad.thumbnails.batterySaver.label"), alt: t("features.focusOnRoad.thumbnails.batterySaver.alt") },
      ],
    },
    {
      heading: t("features.findWhatYouNeed.heading"),
      body: t("features.findWhatYouNeed.body"),
      visual: "/assets/images/app-screen-2.png",
      visualAlt: t("features.findWhatYouNeed.visualAlt"),
      reverse: true,
      thumbnails: [
        { image: "/assets/images/app-screen-1.png", label: t("features.findWhatYouNeed.thumbnails.gasStations.label"), alt: t("features.findWhatYouNeed.thumbnails.gasStations.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.findWhatYouNeed.thumbnails.repairShops.label"), alt: t("features.findWhatYouNeed.thumbnails.repairShops.alt") },
        { image: "/assets/images/app-screen-1.png", label: t("features.findWhatYouNeed.thumbnails.motoShops.label"), alt: t("features.findWhatYouNeed.thumbnails.motoShops.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.findWhatYouNeed.thumbnails.smartSearch.label"), alt: t("features.findWhatYouNeed.thumbnails.smartSearch.alt") },
      ],
    },
    {
      heading: t("features.staySafe.heading"),
      body: t("features.staySafe.body"),
      visual: "/assets/images/app-screen-1.png",
      visualAlt: t("features.staySafe.visualAlt"),
      reverse: false,
      thumbnails: [
        { image: "/assets/images/app-screen-1.png", label: t("features.staySafe.thumbnails.hazardAlerts.label"), alt: t("features.staySafe.thumbnails.hazardAlerts.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.staySafe.thumbnails.emergencySOS.label"), alt: t("features.staySafe.thumbnails.emergencySOS.alt") },
        { image: "/assets/images/app-screen-1.png", label: t("features.staySafe.thumbnails.contactAlerts.label"), alt: t("features.staySafe.thumbnails.contactAlerts.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.staySafe.thumbnails.mapMarkers.label"), alt: t("features.staySafe.thumbnails.mapMarkers.alt") },
      ],
    },
    {
      heading: t("features.yourMemories.heading"),
      body: t("features.yourMemories.body"),
      visual: "/assets/images/app-screen-2.png",
      visualAlt: t("features.yourMemories.visualAlt"),
      reverse: true,
      thumbnails: [
        { image: "/assets/images/app-screen-1.png", label: t("features.yourMemories.thumbnails.photoSharing.label"), alt: t("features.yourMemories.thumbnails.photoSharing.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.yourMemories.thumbnails.socialFeed.label"), alt: t("features.yourMemories.thumbnails.socialFeed.alt") },
        { image: "/assets/images/app-screen-1.png", label: t("features.yourMemories.thumbnails.discover.label"), alt: t("features.yourMemories.thumbnails.discover.alt") },
        { image: "/assets/images/app-screen-2.png", label: t("features.yourMemories.thumbnails.followRiders.label"), alt: t("features.yourMemories.thumbnails.followRiders.alt") },
      ],
    },
  ];

  return (
    <section className="bg-neutral-white dark:bg-background-primary py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">

        <div className="space-y-16 sm:space-y-24 lg:space-y-32 relative z-10">
          {features.map((feature, index) => (
            <FeatureBlock key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
