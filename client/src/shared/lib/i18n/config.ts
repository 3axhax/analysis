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
    loadPath: `${window.location.protocol}//${window.location.hostname}:5050/i18n/{{lng}}/{{ns}}`,
    crossDomain: true,
    withCredentials: true,
    requestOptions: {
      cache: "no-cache",
    },
  },

  partialBundledLanguages: true,
};
