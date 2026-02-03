import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {LogoIcon} from "@shared/ui/Icons/LogoIcon.tsx";

export const Logo = () => {
  const { t } = useTranslation();
  return (
    <Link to={"/"} title={t("logo")} className={"flex items-center text-orange-300 mr-8 ml-0"}>
        <LogoIcon className="h-10 w-10 mr-2" />
          <p className={"flex flex-col items-start"}>
            <span className={"text-nowrap text-base tracking-wider"}>
              Clinical Analise
            </span>
            <span className={"uppercase text-base/3"}>Transcription</span>
          </p>
    </Link>
  );
};
