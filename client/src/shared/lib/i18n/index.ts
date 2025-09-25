import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { i18nConfig } from "./config";
import { resources } from "./resources";

i18n.use(initReactI18next).init({
  ...i18nConfig,
  resources,
});

export default i18n;
