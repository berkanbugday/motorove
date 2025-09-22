"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "../app/i18n";

const Community: React.FC = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      name: "Alex Johnson",
      location: "California",
      quote:
        "Motorove has completely changed how I connect with other riders. I've found incredible routes and made lifelong friends through the app.",
      avatar: "/assets/images/testimonials/rider-1.png",
      bike: "Ducati Panigale V4",
    },
    {
      name: "Sarah Chen",
      location: "New York",
      quote:
        "The events feature is fantastic! I've attended group rides I never would have found otherwise. The weather alerts have saved me from getting caught in the rain multiple times.",
      avatar: "/assets/images/testimonials/rider-2.png",
      bike: "Triumph Street Triple",
    },
    {
      name: "Michael Rodriguez",
      location: "Texas",
      quote:
        "As a new rider, the community has been incredibly welcoming. I've learned so much from more experienced riders and found repair shops I can trust.",
      avatar: "/assets/images/testimonials/rider-3.png",
      bike: "Honda CB650R",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="community" className="py-16 md:py-24">
      <div className="container-section">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="section-title">{t("community.title")}</h2>
          <p className="text-neutral-grey text-lg">{t("community.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <h3 className="text-2xl md:text-3xl font-bold">
                {t("community.networkTitle")}
              </h3>
              <p className="text-neutral-grey">
                {t("community.networkDescription")}
              </p>

              <ul className="space-y-3">
                {(
                  t("community.features", { returnObjects: true }) as string[]
                ).map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-primary-main rounded-full p-1 mr-3 mt-1">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="4"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center space-x-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                    >
                      <Image
                        src={`/assets/images/avatars/avatar-${i}.png`}
                        alt={`${t("community.altText.memberPrefix")} ${i}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white text-xs border-2 border-white">
                    +2k
                  </div>
                </div>
                <span className="text-sm text-neutral-grey">
                  {t("community.activeRiders")}
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="order-1 md:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative h-[400px] md:h-[500px]">
              <Image
                src="/assets/images/community-screen.png"
                alt={t("community.altText.communityScreen")}
                fill
                className="object-contain rounded-2xl shadow-lg"
              />

              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/4 right-1/4 w-48 h-48 rounded-full bg-primary-light opacity-10 blur-3xl"></div>
              <div className="absolute -z-10 bottom-1/4 left-1/4 w-32 h-32 rounded-full bg-status-info opacity-10 blur-3xl"></div>
            </div>
          </motion.div>
        </div>

        {/* Testimonials */}
        <motion.h3
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {t("community.testimonials.title")}
        </motion.h3>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-neutral-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-grey">
                    {testimonial.location}
                  </p>
                </div>
              </div>
              <p className="text-neutral-grey italic mb-4">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center text-sm">
                <span className="text-primary-main font-semibold">
                  {t("community.testimonials.riderInfo.rides")}{" "}
                </span>
                <span className="ml-1 text-neutral-grey">
                  {testimonial.bike}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Community;
