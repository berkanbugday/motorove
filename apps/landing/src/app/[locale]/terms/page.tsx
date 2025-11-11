"use client";
import React from "react";
import Header from "@components/Header";
import Footer from "@components/Footer";
import { useTranslation } from "../../i18n";
import { I18nProvider } from "../../i18n";

// Define the params type
interface TermsPageProps {
  params: {
    locale: string;
  };
}

export default function TermsPage({ params }: TermsPageProps) {
  const { locale } = params;

  return (
    <I18nProvider locale={locale}>
      <TermsContent />
    </I18nProvider>
  );
}

function TermsContent() {
  const { t } = useTranslation();

  return (
    <main>
      <Header />
      <div className="bg-neutral-black text-white py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">
              {t("legal.terms.title")}
            </h1>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-neutral-lightGrey mb-6">
                {t("legal.terms.lastUpdated")}
              </p>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.generalOverview.title")}
                </h2>
                <p>{t("legal.terms.sections.generalOverview.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.acceptance.title")}
                </h2>
                <p>{t("legal.terms.sections.acceptance.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.scopeOfServices.title")}
                </h2>
                <p>{t("legal.terms.sections.scopeOfServices.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.userRegistration.title")}
                </h2>
                <p>{t("legal.terms.sections.userRegistration.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.paidMembership.title")}
                </h2>
                <p>{t("legal.terms.sections.paidMembership.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.platformConduct.title")}
                </h2>
                <p>{t("legal.terms.sections.platformConduct.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.termination.title")}
                </h2>
                <p>{t("legal.terms.sections.termination.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.limitation.title")}
                </h2>
                <p>{t("legal.terms.sections.limitation.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.privacy.title")}
                </h2>
                <p>{t("legal.terms.sections.privacy.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.modifications.title")}
                </h2>
                <p>{t("legal.terms.sections.modifications.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.governing.title")}
                </h2>
                <p>{t("legal.terms.sections.governing.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.terms.sections.contact.title")}
                </h2>
                <p>{t("legal.terms.sections.contact.content")}</p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
