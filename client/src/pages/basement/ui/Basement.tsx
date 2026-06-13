import { Link } from "react-router-dom";
import { MailIcon } from "@shared/ui/Icons/MailIcon.tsx";

export const Basement = () => {
  return (
    <div className="border-t-2 border-cyan-600 py-4 px-8 mt-auto text-center">
      <ul
        className={"flex max-sm:flex-col mx-auto justify-center gap-2 lg:gap-5"}
      >
        <li>
          <Link
            to={"privacy-policy"}
            className={"bg-underline-hover text-cyan-600"}
          >
            Политика обработки персональных данных
          </Link>
        </li>
        <li>
          <Link
            to={"consent-personal-data"}
            className={"bg-underline-hover text-cyan-600"}
          >
            Согласие на обработку персональных данных
          </Link>
        </li>
        <li>
          <a href={"mailto:proanalize@yandex.ru "} className={"text-cyan-600"}>
            <MailIcon className={"inline size-5 mr-1"} />
            <span className={"bg-underline-hover"}>proanalize@yandex.ru</span>
          </a>
        </li>
      </ul>
    </div>
  );
};
