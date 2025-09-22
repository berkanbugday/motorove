"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "../app/i18n";

const Routes: React.FC = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Routes from the mobile app's HomeScreen
  const recommendedRoutes = [
    {
      id: "1",
      title: "Coastal Highway Ride",
      subtitle: "80km - 2h 15m",
      image: "https://picsum.photos/id/88/800/400",
      difficulty: "Moderate",
      likes: 342,
    },
    {
      id: "2",
      title: "Mountain Trail Adventure",
      subtitle: "65km - 3h 30m",
      image: "https://picsum.photos/id/29/800/400",
      difficulty: "Hard",
      likes: 278,
    },
    {
      id: "3",
      title: "City Loop Tour",
      subtitle: "35km - 1h 45m",
      image: "https://picsum.photos/id/43/800/400",
      difficulty: "Easy",
      likes: 195,
    },
  ];

  return (
    <section
      id="routes"
      className="py-16 md:py-24 bg-gradient-to-b from-neutral-white to-secondary-light"
    >
      <div className="container-section">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="section-title text-primary-main">
            {t("routes.title")}
          </h2>
          <p className="text-neutral-grey text-lg">{t("routes.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.7 }}
            className="relative h-[500px]"
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              <Image
                src="/assets/images/map-screen.png"
                alt={t("routes.altText.mapScreen")}
                width={300}
                height={600}
                className="rounded-2xl shadow-lg"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/3 right-1/3 w-64 h-64 rounded-full bg-primary-light opacity-10 blur-3xl"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-2xl md:text-3xl font-bold">
              {t("routes.findRideTitle")}
            </h3>
            <p className="text-neutral-grey">
              {t("routes.findRideDescription")}
            </p>

            <ul className="space-y-4">
              {(t("routes.features", { returnObjects: true }) as string[]).map(
                (item: string, index: number) => (
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
                )
              )}
            </ul>
          </motion.div>
        </div>

        {/* Featured Routes */}
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
          {t("routes.featuredTitle")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendedRoutes.map((route, index) => (
            <div
              key={route.id}
              className="bg-neutral-white rounded-xl overflow-hidden shadow-md"
            >
              <div className="relative h-48">
                <Image
                  src={route.image}
                  alt={route.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/60 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-white text-xl font-bold">
                      {route.title}
                    </h3>
                    <p className="text-white/80">{route.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="bg-secondary-main text-neutral-black text-sm px-3 py-1 rounded-full">
                  {t(`routes.difficulty.${route.difficulty.toLowerCase()}`)}
                </span>
                <div className="flex items-center text-sm">
                  <svg
                    className="w-5 h-5 text-red-500 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    />
                  </svg>
                  <span>{route.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Routes;
