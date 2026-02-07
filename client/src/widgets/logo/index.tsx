import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {LogoIcon} from "@shared/ui/Icons/LogoIcon.tsx";

export const Logo = () => {
  const { t } = useTranslation();
  return (
    <Link to={"/"} title={t("logo")} className={"flex items-center text-orange-50 mr-8 ml-0 relative z-2"}>
        <LogoIcon className="h-10 w-10 mr-2" />
          <p className={"flex flex-col items-start text-shadow-md"}>
            <span className={"text-nowrap text-base tracking-wider"}>
              Clinical Analise
            </span>
            <span className={"uppercase text-base/3"}>Transcription</span>
          </p>
    </Link>
  );
};
