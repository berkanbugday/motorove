"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "../app/i18n";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="bg-neutral-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Motorove Branding */}
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/assets/images/logo.png"
              alt="Motorove Logo"
              width={50}
              height={50}
              className="mr-2"
            />
          </div>
          <p className="text-neutral-lightGrey mb-6">
            {t("footer.description")}
          </p>
          <div className="flex justify-center space-x-4">
            <SocialIcon
              icon="instagram"
              href="https://www.instagram.com/motorove.app/"
            />
          </div>
        </div>

        <div className="border-t border-neutral-darkGrey mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-lightGrey text-sm mb-4 md:mb-0">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </div>
            <div className="flex space-x-6">
              <Link
                href="/terms"
                className="text-neutral-lightGrey hover:text-white text-sm"
              >
                {t("footer.legal.terms")}
              </Link>
              <Link
                href="/privacy"
                className="text-neutral-lightGrey hover:text-white text-sm"
              >
                {t("footer.legal.privacy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  icon: string;
  href: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon, href }) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="glass-card glass-hover w-10 h-10 rounded-full flex items-center justify-center"
    >
      <span className="sr-only">{icon}</span>
      {/* Simple icon placeholder */}
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        f
        {icon === "instagram" && (
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.67-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.7.07 4.95.07 3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.7.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16 0 3.4 2.76 6.16 6.16 6.16 3.4 0 6.16-2.76 6.16-6.16 0-3.4-2.76-6.16-6.16-6.16zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.4-11.85c-.8 0-1.44.65-1.44 1.44s.65 1.44 1.44 1.44c.8 0 1.44-.65 1.44-1.44s-.65-1.44-1.44-1.44z" />
        )}
      </svg>
    </Link>
  );
};

export default Footer;
