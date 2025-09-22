"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../app/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 backdrop-blur-lg transition-all duration-300 ${
        scrolled
          ? "bg-dark-500/80 shadow-lg shadow-dark-900/30"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/images/logo.png"
                alt="Motorove Logo"
                width={50}
                height={50}
                className="mr-2"
              />
              <span className="text-xl font-heading font-bold text-white">
                Motorove
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <NavLink href="#features">{t("header.features")}</NavLink>
            <NavLink href="#community">{t("header.community")}</NavLink>
            <NavLink href="#routes">{t("header.routes")}</NavLink>
            <NavLink href="#events">{t("header.events")}</NavLink>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* CTA Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://app.motorove.com"
                className="btn btn-primary bg-gradient-to-r from-primary-main to-primary-dark hover:from-primary-dark hover:to-primary-main transition-all duration-300"
              >
                {t("header.download")}
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-dark-400/90 backdrop-blur-lg border-t border-dark-300"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <MobileNavLink
                href="#features"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.features")}
              </MobileNavLink>
              <MobileNavLink
                href="#community"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.community")}
              </MobileNavLink>
              <MobileNavLink
                href="#routes"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.routes")}
              </MobileNavLink>
              <MobileNavLink
                href="#events"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.events")}
              </MobileNavLink>
              {/* Language Switcher - Mobile */}
              <div className="pt-2 pb-2">
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Download Button - Mobile */}
              <div className="pt-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="https://app.motorove.com"
                    className="block w-full text-center bg-gradient-to-r from-primary-main to-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("header.download")}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-block"
    >
      <Link
        href={href}
        className="text-gray-300 hover:text-white font-medium transition-colors relative group"
      >
        <span>{children}</span>
        <motion.span
          className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-main group-hover:w-full transition-all duration-300"
          whileHover={{ width: "100%" }}
        />
      </Link>
    </motion.div>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  return (
    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.97 }}>
      <Link
        href={href}
        className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-dark-300/50 rounded-md transition-all duration-200"
        onClick={onClick}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export default Header;
