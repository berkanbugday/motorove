import { redirect } from "next/navigation";
import { Language } from "@motorove/shared";

// Root page redirects to the default locale
export default function RootPage() {
  // Redirect to the default locale
  const defaultLocale = Language.EN.toLowerCase();
  redirect(`/${defaultLocale}`);

  // This is just a fallback and won't be rendered
  return null;
}
