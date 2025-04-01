import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './translations';

// Skip detection during SSR
const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: 'customDetector',
  lookup(options) {
    if (typeof window === 'undefined') {
      return 'en'; // Default to English on server-side
    }
    return undefined; // Use other detectors on client side
  },
  cacheUserLanguage() {}
});

i18n
  // Detect user language
  .use(languageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Set up i18next
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      en: {
        translation: translations.en,
      },
      es: {
        translation: translations.es,
      },
    },
    detection: {
      order: ['customDetector', 'localStorage', 'navigator'],
      caches: ['localStorage']
    },
    // Crucial for SSR - ensures the initial state is stable
    react: {
      useSuspense: false,
    }
  });

export default i18n; 