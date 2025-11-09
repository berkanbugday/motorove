import { Language } from "@motorove/shared";
import { I18nProvider } from "../i18n";

export function generateStaticParams() {
  return Object.values(Language).map(lang => ({
    locale: lang.toLowerCase(),
  }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <I18nProvider locale={params.locale}>{children}</I18nProvider>;
}
