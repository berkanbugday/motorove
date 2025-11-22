"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../app/i18n";
import { Language } from "@motorove/shared";

const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Get current locale from URL path
  const currentLocale = pathname?.split("/")[1] || Language.EN.toLowerCase();

  // Available locales (lowercase)
  const locales = Object.values(Language).map((lang) => lang.toLowerCase());

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown
  const closeDropdown = () => setIsOpen(false);

  // Get path without locale
  const getPathWithoutLocale = (path: string): string => {
    const segments = path.split("/");
    segments.splice(1, 1);
    return segments.join("/") || "/";
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 bg-dark-500/50 hover:bg-dark-400/70 border border-dark-300/30 rounded-lg px-3 py-2 text-sm text-white transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>{currentLocale.toUpperCase()}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-dark-500/90 backdrop-blur-lg border border-dark-300/50 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="py-1">
              {locales.map((locale) => (
                <Link
                  href={`/${locale}${getPathWithoutLocale(pathname)}`}
                  key={locale}
                  onClick={closeDropdown}
                  className={`block px-4 py-2 text-sm ${
                    currentLocale === locale
                      ? "bg-primary-main/20 text-white"
                      : "text-gray-300 hover:bg-dark-400/50"
                  } transition-colors duration-200`}
                >
                  {t(`language.${locale}`)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
