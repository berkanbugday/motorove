import { NextRequest, NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';
import { Language } from '@motorove/shared';

// Set up supported languages
const LANGUAGES = Object.values(Language).map(lang => lang.toLowerCase());
const DEFAULT_LOCALE = Language.TR.toLowerCase();

acceptLanguage.languages(LANGUAGES);

// Define cookie name for language preference
export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api)
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};

export function middleware(request: NextRequest) {
  // Check if there is a language defined in the path
  const { pathname } = request.nextUrl;
  
  // Check if pathname has a locale
  const pathnameHasLocale = LANGUAGES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // If no locale is found in the path, use cookie or accept-language
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value;
  const acceptLang = acceptLanguage.get(request.headers.get('Accept-Language') || DEFAULT_LOCALE);
  
  // Determine the preferred language
  const locale = cookieLang || acceptLang || DEFAULT_LOCALE;

  // Redirect to the same page but with language prefix
  return NextResponse.redirect(
    new URL(
      `/${locale}${pathname === '/' ? '' : pathname}${
        request.nextUrl.search
      }`,
      request.url
    )
  );
}
