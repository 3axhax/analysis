import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { i18nConfig } from "./config";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    ...i18nConfig,

    fallbackNS: ["common", "entities", "widgets"],

    parseMissingKeyHandler: (key: string) => {
      console.warn(`Missing translation: ${key}`);
      return key;
    },
  });

export default i18n;
