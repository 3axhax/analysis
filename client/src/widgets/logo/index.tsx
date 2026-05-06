import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {Laboratory} from "@shared/ui/Icons";

export const Logo = () => {
  const { t } = useTranslation();
  return (
    <Link
      to={"/"}
      title={t("logo")}
      className={
        "group flex items-center font-light my-4 mx-6 relative z-2 text-xl rounded-full border-1 border-white/80 py-1 px-3"
      }
    >
      <Laboratory className={"inline text-white size-4 lg:size-5 mr-1"} />
      <span className={"text-white mt-0.5 inline-flex relative overflow-hidden"}>
        Р
        <span
          className={
            "max-w-0 transition-all duration-400 ease-in-out-cubic group-hover:max-w-[250px]"
          }
        >
          асшифровка&nbsp;
        </span>
      </span>
      <span className={"text-orange-200 mt-0.5 inline-flex relative overflow-hidden"}>
        А
        <span
          className={
            "max-w-0 transition-all duration-400 ease-in-out-cubic group-hover:max-w-[250px]"
          }
        >
          нализов&nbsp;
        </span>
      </span>
    </Link>
  );
};
