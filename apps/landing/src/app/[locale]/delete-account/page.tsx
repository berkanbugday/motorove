"use client";
import React from "react";

export const dynamic = "force-dynamic";
import Header from "@components/Header";
import Footer from "@components/Footer";
import { useTranslation } from "../../i18n";
import { I18nProvider } from "../../i18n";

// Define the params type
interface DeleteAccountPageProps {
  params: {
    locale: string;
  };
}

export default function DeleteAccountPage({ params }: DeleteAccountPageProps) {
  const { locale } = params;

  return (
    <I18nProvider locale={locale}>
      <DeleteAccountContent />
    </I18nProvider>
  );
}

function DeleteAccountContent() {
  const { t } = useTranslation();

  return (
    <main>
      <Header />
      <div className="bg-neutral-black text-white py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">
              {t("legal.deleteAccount.title")}
            </h1>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-neutral-lightGrey mb-6">
                {t("legal.deleteAccount.lastUpdated")}
              </p>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.deleteAccount.sections.introduction.title")}
                </h2>
                <p>{t("legal.deleteAccount.sections.introduction.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.deleteAccount.sections.howToDelete.title")}
                </h2>
                <p className="mb-4">
                  {t("legal.deleteAccount.sections.howToDelete.content")}
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>
                    {t(
                      "legal.deleteAccount.sections.howToDelete.byEmail.requirements.item1"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.howToDelete.byEmail.requirements.item2"
                    )}
                  </li>
                </ul>
                <p className="mt-4">
                  <strong>
                    {t(
                      "legal.deleteAccount.sections.howToDelete.byEmail.emailLabel"
                    )}
                  </strong>{" "}
                  <a
                    href="mailto:media@motorove.app"
                    className="text-primary-main hover:underline"
                  >
                    media@motorove.app
                  </a>
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.deleteAccount.sections.whatGetsDeleted.title")}
                </h2>
                <p className="mb-4">
                  {t("legal.deleteAccount.sections.whatGetsDeleted.content")}
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>
                    {t(
                      "legal.deleteAccount.sections.whatGetsDeleted.items.item1"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.whatGetsDeleted.items.item2"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.whatGetsDeleted.items.item3"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.whatGetsDeleted.items.item4"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.whatGetsDeleted.items.item5"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.whatGetsDeleted.items.item6"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.whatGetsDeleted.items.item7"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.whatGetsDeleted.items.item8"
                    )}
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.deleteAccount.sections.dataRetention.title")}
                </h2>
                <p className="mb-4">
                  {t("legal.deleteAccount.sections.dataRetention.content")}
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>
                    {t(
                      "legal.deleteAccount.sections.dataRetention.items.item1"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.dataRetention.items.item2"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.deleteAccount.sections.dataRetention.items.item3"
                    )}
                  </li>
                </ul>
                <p className="mt-4">
                  {t("legal.deleteAccount.sections.dataRetention.period")}
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.deleteAccount.sections.consequences.title")}
                </h2>
                <p className="mb-4">
                  {t("legal.deleteAccount.sections.consequences.content")}
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>
                    {t("legal.deleteAccount.sections.consequences.items.item1")}
                  </li>
                  <li>
                    {t("legal.deleteAccount.sections.consequences.items.item2")}
                  </li>
                  <li>
                    {t("legal.deleteAccount.sections.consequences.items.item3")}
                  </li>
                  <li>
                    {t("legal.deleteAccount.sections.consequences.items.item4")}
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.deleteAccount.sections.reactivation.title")}
                </h2>
                <p>{t("legal.deleteAccount.sections.reactivation.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.deleteAccount.sections.contact.title")}
                </h2>
                <p className="mb-2">
                  {t("legal.deleteAccount.sections.contact.content")}
                </p>
                <p className="mt-4">
                  <strong>
                    {t("legal.deleteAccount.sections.contact.emailLabel")}
                  </strong>{" "}
                  <a
                    href="mailto:media@motorove.app"
                    className="text-primary-main hover:underline"
                  >
                    media@motorove.app
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
