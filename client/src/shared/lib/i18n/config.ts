import { InitOptions } from "i18next";

export const i18nConfig: InitOptions = {
  supportedLngs: ["ru"],
  fallbackLng: "ru",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
  debug: false,
  load: "languageOnly",

  backend: {
    loadPath: `${import.meta.env.VITE_BASE_API_URL}/i18n/{{lng}}/{{ns}}`,
    crossDomain: true,
    withCredentials: true,
    requestOptions: {
      cache: "no-cache",
    },
  },

  partialBundledLanguages: true,
};
