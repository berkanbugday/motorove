import { Language } from "@motorove/shared";

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
  return <>{children}</>;
}
