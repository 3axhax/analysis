import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const Logo = () => {
  const { t } = useTranslation();
  return (
      <Link to={"/"} title={t("logo")} className={"group flex items-center font-bold my-4 mx-6 relative z-2 text-xl rounded-full border-1 border-white/80 py-1 px-3"}>
          <span className={"text-white inline-flex relative overflow-hidden"}>
              C<span className={'max-w-0 transition-all duration-300 group-hover:max-w-[250px]'}>linical&nbsp;</span>
          </span>
          <span className={"text-orange-200 inline-flex relative overflow-hidden"}>
              A<span className={'max-w-0 transition-all duration-300 group-hover:max-w-[250px]'}>nalise&nbsp;</span>
          </span>
        <span className={"text-white inline-flex relative overflow-hidden"}>
            T<span className={'max-w-0 transition-all duration-300 group-hover:max-w-[250px]'}>ranscription</span>
        </span>
      </Link>
  );
};
