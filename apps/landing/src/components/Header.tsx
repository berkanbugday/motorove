"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "../app/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    onClick?.();
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="text-neutral-white hover:text-primary-main transition-colors duration-200 font-medium"
    >
      {children}
    </a>
  );
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "glass-card shadow-lg shadow-black/30" : "glass"
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
              {/* <span className="text-xl font-heading font-bold text-white">
                Motorove
              </span> */}
            </Link>
          </motion.div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            <nav className="flex items-center space-x-6">
              <NavLink href="#home">{t("header.home")}</NavLink>
              <NavLink href="#features">{t("header.features")}</NavLink>
              <NavLink href="#contact">{t("header.contact")}</NavLink>
            </nav>
          </div>

          {/* Language Switcher - Right Side */}
          <div className="hidden md:flex items-center">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <nav className="flex flex-col space-y-4">
              <NavLink href="#home" onClick={() => setMobileMenuOpen(false)}>
                {t("header.home")}
              </NavLink>
              <NavLink href="#features" onClick={() => setMobileMenuOpen(false)}>
                {t("header.features")}
              </NavLink>
              <NavLink href="#contact" onClick={() => setMobileMenuOpen(false)}>
                {t("header.contact")}
              </NavLink>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
