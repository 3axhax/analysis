import { InitOptions } from "i18next";
export const i18nConfig: InitOptions = {
  supportedLngs: ["ru"],
  fallbackLng: "ru",
  defaultNS: "entities",
  interpolation: {
    escapeValue: false,
  },
  debug: false,
  load: "languageOnly",
};