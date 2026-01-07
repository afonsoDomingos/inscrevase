import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale: 'pt',

    // Don't use a prefix for the default locale
    localePrefix: 'as-needed'
});

export const config = {
    // Match all pathnames except for
    // - API routes
    // - Static files (e.g. /_next, /favicon.ico)
    // - Files in the public folder (e.g. /favicon.ico)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
