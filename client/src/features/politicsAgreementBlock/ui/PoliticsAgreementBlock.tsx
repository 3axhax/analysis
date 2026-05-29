import { useState } from "react";
import { Link } from "react-router-dom";

export const PoliticsAgreementBlock = () => {
  const [showBlock, setShowBlock] = useState<boolean>(
    !localStorage.getItem("accept_ym"),
  );

  const acceptHandler = () => {
    if (typeof initYM === "function") {
      initYM();
    }
    localStorage.setItem("accept_ym", "1");
    setShowBlock(false);
  };

  const refusalHandler = () => {
    localStorage.setItem("accept_ym", "0");
    setShowBlock(false);
  };

  return showBlock ? (
    <div
      className={
        "w-full lg:w-9/12 mx-auto mt-auto sticky z-100 bottom-0 bg-cyan-600 text-white bg-gradient-to-r from-cyan-800 via-cyan-500 to-cyan-800 bg-[length:300%_100%]dark:shadow-white/20 rounded-t-3xl shadow-xl py-4 px-8"
      }
    >
      <p className={"pb-2"}>
        Мы используем файлы cookie и сервис «Яндекс.Метрика». Это помогает нам
        анализировать трафик и улучшать работу сайта.
      </p>
      <p className={"pb-2"}>
        Статистические cookie и Яндекс.Метрика собирают IP‑адрес, тип браузера и
        действия на сайте. Они включаются только после вашего разрешения.
        Передача данных в ООО «ЯНДЕКС» осуществляется на основании{" "}
        <Link
          to={"consent-personal-data"}
          className={"bg-underline-hover text-cyan-100"}
        >
          Согласия на обработку ПДн
        </Link>
        .
      </p>
      <p className={"pb-2"}>
        Нажимая «Принять», вы подтверждаете, что ознакомлены с{" "}
        <Link
          to={"privacy-policy"}
          className={"bg-underline-hover text-cyan-100"}
        >
          Политикой обработки ПДн
        </Link>{" "}
        (сроки хранения до 5 лет) и даёте согласие на передачу данных в
        Яндекс.Метрику.
      </p>
      <div className={"flex justify-center gap-5 mt-3"}>
        <button
          className={"btn btn-light h-10 leading-10 py-0.5"}
          onClick={acceptHandler}
        >
          Принять
        </button>
        <button
          className={"btn  h-10 leading-10 py-0.5"}
          onClick={refusalHandler}
        >
          Отказаться
        </button>
      </div>
    </div>
  ) : null;
};
