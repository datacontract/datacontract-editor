import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import de from './locales/de.json';

/**
 * Scoped i18next instance for the Data Contract Editor.
 *
 * This is the editor's i18n "locale contract":
 *  - A standalone instance via `createInstance()` — NOT the global i18next singleton —
 *    so embedding the editor never collides with a host app that also uses i18next.
 *  - Translations are bundled inline (no http backend) so the editor works offline /
 *    fully self-contained.
 *  - Locale source depends on how the editor is mounted:
 *      • Embedded (entropy-data): the host supplies the locale through `init({ locale })`,
 *        which calls `i18n.changeLanguage(locale)` AFTER init — so the host always wins,
 *        regardless of what the detector found.
 *      • Standalone (editor.datacontract.com): `i18next-browser-languagedetector` picks
 *        the locale from, in order, the `?lang=` query param (deep links), the user's saved
 *        choice in localStorage (`dce-locale`, written by the in-app switcher), then the
 *        browser language; falling back to English.
 *  - `fallbackLng: 'en'` + `supportedLngs` + `load: 'languageOnly'` mean a regional tag
 *    like `de-DE` resolves to `de` and anything unsupported degrades to English.
 *
 * Add a new language by dropping a `locales/<lang>.json` next to en/de, importing it
 * into `resources`, and adding the tag to `supportedLngs` (and the switcher's LANGUAGES list).
 */
const i18n = i18next.createInstance();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    // No `lng`: the detector resolves it (standalone); the host overrides via
    // changeLanguage() when embedded.
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    load: 'languageOnly', // map de-DE -> de
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'dce-locale',
    },
    interpolation: {
      escapeValue: false, // React already escapes against XSS
    },
    react: {
      useSuspense: false, // resources are inline/sync; avoid a Suspense boundary requirement
    },
  });

export default i18n;
