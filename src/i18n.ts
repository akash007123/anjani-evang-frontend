import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enBooking from './locales/en/booking.json';
import enAdmin from './locales/en/admin.json';
import enChatbot from './locales/en/chatbot.json';
import enContact from './locales/en/contact.json';

// Hindi translations
import hiCommon from './locales/hi/common.json';
import hiHome from './locales/hi/home.json';
import hiBooking from './locales/hi/booking.json';
import hiAdmin from './locales/hi/admin.json';
import hiChatbot from './locales/hi/chatbot.json';
import hiContact from './locales/hi/contact.json';

const savedLanguage = (localStorage.getItem('app_language') || 'EN').toLowerCase();
const initialLng = savedLanguage === 'hi' ? 'hi' : 'en';

export const resources = {
  en: {
    common: enCommon,
    home: enHome,
    booking: enBooking,
    admin: enAdmin,
    chatbot: enChatbot,
    contact: enContact,
  },
  hi: {
    common: hiCommon,
    home: hiHome,
    booking: hiBooking,
    admin: hiAdmin,
    chatbot: hiChatbot,
    contact: hiContact,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home', 'booking', 'admin', 'chatbot', 'contact'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
