import { useTranslation } from "react-i18next";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export const Logo = () => {
  const { t } = useTranslation();
  return (
    <Link to={"/"} title={t("logo")} className={"flex items-center text-green-800 mr-8 ml-0 dark:text-green-200"}>
      <ClipboardDocumentListIcon className="h-10 w-10 text-green-800 dark:text-green-200 mr-2" />
      <p className={"logo__text dark:text-green-200"}>
        <span className={"text-nowrap text-base tracking-wider"}>
          Clinical Analise
        </span>
        <span className={"uppercase text-lg/4"}>Transcription</span>
      </p>
    </Link>
  );
};
