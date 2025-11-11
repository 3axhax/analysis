import { useTranslation } from "react-i18next";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export const Logo = () => {
  const { t } = useTranslation();
  return (
    <Link to={"/"} title={t("logo")} className={"logo"}>
      <ClipboardDocumentListIcon className="h-10 w-10 text-green-800 mr-2" />
      <p className={"logo__text"}>
        <span className={"text-nowrap text-base tracking-wider"}>
          Clinical Analise
        </span>
        <span className={"uppercase text-lg/4"}>Transcription</span>
      </p>
    </Link>
  );
};
