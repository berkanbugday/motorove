"use client";

import Link from "next/link";
import { useTranslation } from "../i18n";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-white mb-4">
          {t("notFound.title")}
        </h1>
        <h2 className="text-2xl font-semibold text-neutral-white mb-4">
          {t("notFound.heading")}
        </h2>
        <p className="text-neutral-grey mb-8">{t("notFound.description")}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-main text-neutral-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t("notFound.button")}
        </Link>
      </div>
    </div>
  );
}
