"use client";

import React from "react";
import { motion } from "framer-motion";
import PhoneMockup from "./PhoneMockup";
import { useTranslation } from "../app/i18n";

interface FeatureThumbnail {
  label: string;
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
        <p className="text-base sm:text-lg text-neutral-darkGrey dark:text-neutral-grey leading-relaxed mb-6 lg:mb-8">
          {body}
        </p>
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
          <div className="absolute inset-0 pointer-events-none z-20">
            {thumbnails.map((thumbnail, index) => {
              // Position text labels around phone
              const configs = [
                {
                  top: "5%",
                  left: "-5%",
                  rotate: -5,
                },
                {
                  top: "15%",
                  right: "-5%",
                  rotate: 5,
                },
                {
                  bottom: "30%",
                  left: "-5%",
                  rotate: -3,
                },
                {
                  bottom: "10%",
                  right: "-5%",
                  rotate: 3,
                },
              ];
              const position = configs[index % 4];

              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0, rotateZ: 0, z: -100 }}
                  whileInView={{
                    scale: 1,
                    opacity: 1,
                    rotateZ: position.rotate,
                    z: 0,
                  }}
                  viewport={{ once: true }}
                  animate={{
                    y: [0, -15, 0],
                    rotateZ: [
                      position.rotate,
                      position.rotate + 3,
                      position.rotate,
                    ],
                    z: [0, 30, 0],
                  }}
                  transition={{
                    scale: {
                      duration: 0.6,
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 200,
                    },
                    opacity: { duration: 0.6, delay: index * 0.2 },
                    rotateZ: { duration: 0.6, delay: index * 0.2 },
                    y: {
                      duration: 3 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3,
                    },
                    z: {
                      duration: 3 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3,
                    },
                  }}
                  whileHover={{
                    scale: 1.15,
                    z: 60,
                    rotateZ: position.rotate + 10,
                    transition: { duration: 0.3 },
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
                      [position.left ? "right" : "left"]: position.left
                        ? "100%"
                        : "100%",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <defs>
                      <linearGradient
                        id={`arrowGradient-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#FF3B30"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#FF3B30"
                          stopOpacity="0.8"
                        />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d={
                        position.left
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
                        ease: "easeInOut",
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
                        delay: index * 0.2 + 1.2,
                      }}
                    />
                  </svg>

                  {/* Text label card - no image */}
                  <div className="relative px-4 py-3 glass-strong backdrop-blur-xl rounded-2xl border-2 border-primary-main/30 group-hover:border-primary-main/60 shadow-[0_10px_40px_rgba(0,0,0,0.2)] group-hover:shadow-[0_20px_60px_rgba(255,59,48,0.3)] transition-all duration-300">
                    {/* Label text */}
                    <span className="text-xs sm:text-sm lg:text-base font-bold text-neutral-white drop-shadow-lg leading-tight whitespace-nowrap">
                      {thumbnail.label}
                    </span>
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

        <div className="relative flex justify-center scale-[0.65] sm:scale-75 md:scale-90 z-10">
          <PhoneMockup screenshot={visual} alt={visualAlt} />
        </div>
      </motion.div>
    </div>
  );
};

const Features: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "tr";

  const features = [
    {
      heading: t("features.business.heading"),
      body: t("features.business.body"),
      visual: `/assets/images/${currentLanguage}/app-screen-2.png`,
      visualAlt: t("features.business.visualAlt"),
      reverse: false,
      thumbnails: [
        {
          label: t("features.business.thumbnails.everyWhere.label"),
        },
        {
          label: t("features.business.thumbnails.autoCall.label"),
        },
        {
          label: t("features.business.thumbnails.filter.label"),
        },
        {
          label: t("features.business.thumbnails.comment.label"),
        },
      ],
    },
    {
      heading: t("features.warning.heading"),
      body: t("features.warning.body"),
      visual: `/assets/images/${currentLanguage}/app-screen-3.png`,
      visualAlt: t("features.warning.visualAlt"),
      reverse: true,
      thumbnails: [
        {
          label: t("features.warning.thumbnails.planning.label"),
        },
      ],
    },
    {
      heading: t("features.emergency.heading"),
      body: t("features.emergency.body"),
      visual: `/assets/images/${currentLanguage}/app-screen-4.png`,
      visualAlt: t("features.emergency.visualAlt"),
      reverse: false,
      thumbnails: [
        {
          label: t("features.emergency.thumbnails.notification.label"),
        },
        {
          label: t("features.emergency.thumbnails.communication.label"),
        },
      ],
    },
    {
      heading: t("features.event.heading"),
      body: t("features.event.body"),
      visual: `/assets/images/${currentLanguage}/app-screen-5.png`,
      visualAlt: t("features.event.visualAlt"),
      reverse: true,
      thumbnails: [
        {
          label: t("features.event.thumbnails.reminder.label"),
        },
        {
          label: t("features.event.thumbnails.invitation.label"),
        },
        {
          label: t("features.event.thumbnails.notification.label"),
        },
      ],
    },
    {
      heading: t("features.staySafe.heading"),
      body: t("features.staySafe.body"),
      visual: `/assets/images/${currentLanguage}/app-screen-6.png`,
      visualAlt: t("features.staySafe.visualAlt"),
      reverse: false,
      thumbnails: [
        {
          image: `/assets/images/${currentLanguage}/app-screen-1.png`,
          label: t("features.staySafe.thumbnails.hazardAlerts.label"),
          alt: t("features.staySafe.thumbnails.hazardAlerts.alt"),
        },
        {
          image: `/assets/images/${currentLanguage}/app-screen-2.png`,
          label: t("features.staySafe.thumbnails.emergencySOS.label"),
          alt: t("features.staySafe.thumbnails.emergencySOS.alt"),
        },
        {
          image: `/assets/images/${currentLanguage}/app-screen-1.png`,
          label: t("features.staySafe.thumbnails.contactAlerts.label"),
          alt: t("features.staySafe.thumbnails.contactAlerts.alt"),
        },
        {
          image: `/assets/images/${currentLanguage}/app-screen-2.png`,
          label: t("features.staySafe.thumbnails.mapMarkers.label"),
          alt: t("features.staySafe.thumbnails.mapMarkers.alt"),
        },
      ],
    },
    {
      heading: t("features.yourMemories.heading"),
      body: t("features.yourMemories.body"),
      visual: `/assets/images/${currentLanguage}/app-screen-7.png`,
      visualAlt: t("features.yourMemories.visualAlt"),
      reverse: true,
      thumbnails: [
        {
          image: `/assets/images/${currentLanguage}/app-screen-1.png`,
          label: t("features.yourMemories.thumbnails.photoSharing.label"),
          alt: t("features.yourMemories.thumbnails.photoSharing.alt"),
        },
        {
          image: `/assets/images/${currentLanguage}/app-screen-2.png`,
          label: t("features.yourMemories.thumbnails.socialFeed.label"),
          alt: t("features.yourMemories.thumbnails.socialFeed.alt"),
        },
        {
          image: `/assets/images/${currentLanguage}/app-screen-1.png`,
          label: t("features.yourMemories.thumbnails.discover.label"),
          alt: t("features.yourMemories.thumbnails.discover.alt"),
        },
        {
          image: `/assets/images/${currentLanguage}/app-screen-2.png`,
          label: t("features.yourMemories.thumbnails.followRiders.label"),
          alt: t("features.yourMemories.thumbnails.followRiders.alt"),
        },
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
