"use client";

import { useEffect, useState } from "react";
import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { Language } from "@motorove/shared";
import resourcesToBackend from "i18next-resources-to-backend";

// Initialize i18next
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../../public/locales/${language}/${namespace}.json`)
    )
  )
  .init({
    fallbackLng: Language.TR.toLowerCase(),
    ns: ["common"],
    defaultNS: "common",
    supportedLngs: ["en", "tr"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["path", "cookie", "navigator"],
      lookupFromPathIndex: 0,
      caches: ["cookie"],
    },
  });

export interface I18nProviderProps {
  children: React.ReactNode;
  locale?: string;
}

export function I18nProvider({ children, locale = "tr" }: I18nProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Set language
  useEffect(() => {
    if (locale) {
      i18next.changeLanguage(locale);
    }
    setMounted(true);
  }, [locale]);

  // Prevent hydration errors by rendering only on client side
  if (!mounted) return null;

  return <>{children}</>;
}

// Re-export the useTranslation hook for easy access
export { useTranslation };
