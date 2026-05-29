import { Link } from "react-router-dom";

export const Basement = () => {
  return (
    <div className="border-t-2 border-cyan-600 py-4 px-8 mt-auto text-center">
      <ul className={"flex mx-auto justify-center gap-5"}>
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
      </ul>
    </div>
  );
};
