"use client";
import React from "react";

export const dynamic = "force-dynamic";
import Header from "@components/Header";
import Footer from "@components/Footer";
import { useTranslation } from "../../i18n";
import { I18nProvider } from "../../i18n";

// Define the params type
interface PrivacyPageProps {
  params: {
    locale: string;
  };
}

export default function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = params;

  return (
    <I18nProvider locale={locale}>
      <PrivacyContent />
    </I18nProvider>
  );
}

function PrivacyContent() {
  const { t } = useTranslation();

  return (
    <main>
      <Header />
      <div className="bg-neutral-black text-white py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">
              {t("legal.privacy.title")}
            </h1>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-neutral-lightGrey mb-6">
                {t("legal.privacy.lastUpdated")}
              </p>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.introduction.title")}
                </h2>
                <p>{t("legal.privacy.sections.introduction.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.scope.title")}
                </h2>
                <p>{t("legal.privacy.sections.scope.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.dataCollection.title")}
                </h2>
                <p>{t("legal.privacy.sections.dataCollection.content")}</p>
                <h3 className="text-xl font-bold mt-6 mb-3">
                  {t(
                    "legal.privacy.sections.dataCollection.personalData.title"
                  )}
                </h3>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>
                    {t(
                      "legal.privacy.sections.dataCollection.personalData.items.item1"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.sections.dataCollection.personalData.items.item2"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.sections.dataCollection.personalData.items.item3"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.sections.dataCollection.personalData.items.item4"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.sections.dataCollection.personalData.items.item5"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.sections.dataCollection.personalData.items.item6"
                    )}
                  </li>
                </ul>
                <h3 className="text-xl font-bold mt-6 mb-3">
                  {t("legal.privacy.sections.dataCollection.usageData.title")}
                </h3>
                <p>
                  {t("legal.privacy.sections.dataCollection.usageData.content")}
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.dataUse.title")}
                </h2>
                <p>{t("legal.privacy.sections.dataUse.content")}</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>{t("legal.privacy.sections.dataUse.items.item1")}</li>
                  <li>{t("legal.privacy.sections.dataUse.items.item2")}</li>
                  <li>{t("legal.privacy.sections.dataUse.items.item3")}</li>
                  <li>{t("legal.privacy.sections.dataUse.items.item4")}</li>
                  <li>{t("legal.privacy.sections.dataUse.items.item5")}</li>
                  <li>{t("legal.privacy.sections.dataUse.items.item6")}</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.thirdParty.title")}
                </h2>
                <p>{t("legal.privacy.sections.thirdParty.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.dataSharing.title")}
                </h2>
                <p>{t("legal.privacy.sections.dataSharing.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.userPrivacy.title")}
                </h2>
                <p>{t("legal.privacy.sections.userPrivacy.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.cookies.title")}
                </h2>
                <p>{t("legal.privacy.sections.cookies.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.children.title")}
                </h2>
                <p>{t("legal.privacy.sections.children.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.dataRetention.title")}
                </h2>
                <p>{t("legal.privacy.sections.dataRetention.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.yourRights.title")}
                </h2>
                <p>{t("legal.privacy.sections.yourRights.content")}</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>{t("legal.privacy.sections.yourRights.items.item1")}</li>
                  <li>{t("legal.privacy.sections.yourRights.items.item2")}</li>
                  <li>{t("legal.privacy.sections.yourRights.items.item3")}</li>
                  <li>{t("legal.privacy.sections.yourRights.items.item4")}</li>
                  <li>{t("legal.privacy.sections.yourRights.items.item5")}</li>
                </ul>
                <p className="mt-4">{t("legal.privacy.sections.yourRights.contact")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.changes.title")}
                </h2>
                <p>{t("legal.privacy.sections.changes.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.privacy.sections.contact.title")}
                </h2>
                <p>{t("legal.privacy.sections.contact.content")}</p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
