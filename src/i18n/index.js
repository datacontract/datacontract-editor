import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
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
 *  - No language detector: the locale is supplied by the host through
 *    `init({ locale })` (embedded) which calls `i18n.changeLanguage(locale)`. Standalone
 *    dev defaults to English.
 *  - `fallbackLng: 'en'` + `supportedLngs` mean an unknown/unsupported tag degrades to
 *    English rather than showing raw keys.
 *
 * Add a new language by dropping a `locales/<lang>.json` next to en/de, importing it
 * into `resources`, and adding the tag to `supportedLngs`.
 */
const i18n = i18next.createInstance();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    interpolation: {
      escapeValue: false, // React already escapes against XSS
    },
    react: {
      useSuspense: false, // resources are inline/sync; avoid a Suspense boundary requirement
    },
  });

export default i18n;
