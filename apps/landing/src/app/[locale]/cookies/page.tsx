"use client";
import React from "react";
import Header from "@components/Header";
import Footer from "@components/Footer";
import { useTranslation } from "../../i18n";
import { I18nProvider } from "../../i18n";

// Define the params type
interface CookiesPageProps {
  params: {
    locale: string;
  };
}

export default function CookiesPage({ params }: CookiesPageProps) {
  const { locale } = params;

  return (
    <I18nProvider locale={locale}>
      <CookiesContent />
    </I18nProvider>
  );
}

function CookiesContent() {
  const { t } = useTranslation();

  return (
    <main>
      <Header />
      <div className="bg-neutral-black text-white py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">
              {t("legal.cookies.title")}
            </h1>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-neutral-lightGrey mb-6">
                {t("legal.cookies.lastUpdated")}
              </p>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.cookies.sections.introduction.title")}
                </h2>
                <p>{t("legal.cookies.sections.introduction.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.cookies.sections.whatAreCookies.title")}
                </h2>
                <p>{t("legal.cookies.sections.whatAreCookies.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.cookies.sections.typesOfCookies.title")}
                </h2>
                <h3 className="text-xl font-bold mt-6 mb-3">
                  {t("legal.cookies.sections.typesOfCookies.essential.title")}
                </h3>
                <p>
                  {t("legal.cookies.sections.typesOfCookies.essential.content")}
                </p>

                <h3 className="text-xl font-bold mt-6 mb-3">
                  {t("legal.cookies.sections.typesOfCookies.preferences.title")}
                </h3>
                <p>
                  {t(
                    "legal.cookies.sections.typesOfCookies.preferences.content"
                  )}
                </p>

                <h3 className="text-xl font-bold mt-6 mb-3">
                  {t("legal.cookies.sections.typesOfCookies.analytics.title")}
                </h3>
                <p>
                  {t("legal.cookies.sections.typesOfCookies.analytics.content")}
                </p>

                <h3 className="text-xl font-bold mt-6 mb-3">
                  {t("legal.cookies.sections.typesOfCookies.marketing.title")}
                </h3>
                <p>
                  {t("legal.cookies.sections.typesOfCookies.marketing.content")}
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.cookies.sections.cookiesWeUse.title")}
                </h2>
                <p>{t("legal.cookies.sections.cookiesWeUse.content")}</p>
                <div className="overflow-x-auto mt-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-neutral-darkGrey">
                        <th className="p-3 text-left">
                          {t("legal.cookies.sections.cookiesWeUse.table.name")}
                        </th>
                        <th className="p-3 text-left">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.table.provider"
                          )}
                        </th>
                        <th className="p-3 text-left">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.table.purpose"
                          )}
                        </th>
                        <th className="p-3 text-left">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.table.expiry"
                          )}
                        </th>
                        <th className="p-3 text-left">
                          {t("legal.cookies.sections.cookiesWeUse.table.type")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-neutral-darkGrey">
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.session.name"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.session.provider"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.session.purpose"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.session.expiry"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.session.type"
                          )}
                        </td>
                      </tr>
                      <tr className="border-t border-neutral-darkGrey">
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.language.name"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.language.provider"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.language.purpose"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.language.expiry"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.language.type"
                          )}
                        </td>
                      </tr>
                      <tr className="border-t border-neutral-darkGrey">
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.analytics.name"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.analytics.provider"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.analytics.purpose"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.analytics.expiry"
                          )}
                        </td>
                        <td className="p-3">
                          {t(
                            "legal.cookies.sections.cookiesWeUse.cookies.analytics.type"
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.cookies.sections.cookieManagement.title")}
                </h2>
                <p>{t("legal.cookies.sections.cookieManagement.content")}</p>
                <h3 className="text-xl font-bold mt-6 mb-3">
                  {t("legal.cookies.sections.cookieManagement.browser.title")}
                </h3>
                <p>
                  {t("legal.cookies.sections.cookieManagement.browser.content")}
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>
                    <a
                      href="https://support.google.com/chrome/answer/95647"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-main hover:underline"
                    >
                      {t(
                        "legal.cookies.sections.cookieManagement.browser.chrome"
                      )}
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-main hover:underline"
                    >
                      {t(
                        "legal.cookies.sections.cookieManagement.browser.firefox"
                      )}
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.apple.com/en-us/HT201265"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-main hover:underline"
                    >
                      {t(
                        "legal.cookies.sections.cookieManagement.browser.safari"
                      )}
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-main hover:underline"
                    >
                      {t(
                        "legal.cookies.sections.cookieManagement.browser.edge"
                      )}
                    </a>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.cookies.sections.doNotTrack.title")}
                </h2>
                <p>{t("legal.cookies.sections.doNotTrack.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.cookies.sections.updates.title")}
                </h2>
                <p>{t("legal.cookies.sections.updates.content")}</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">
                  {t("legal.cookies.sections.contact.title")}
                </h2>
                <p>{t("legal.cookies.sections.contact.content")}</p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
