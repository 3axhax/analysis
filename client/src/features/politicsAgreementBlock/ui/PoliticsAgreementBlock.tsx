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
    <div className={"politics_agreement__container"}>
      <p>
        Мы используем файлы cookie и сервис «Яндекс.Метрика». Это помогает нам
        анализировать трафик и улучшать работу сайта.
      </p>
      <p>
        Статистические cookie и Яндекс.Метрика собирают IP‑адрес, тип браузера и
        действия на сайте. Они включаются только после вашего разрешения.
        Передача данных в ООО «ЯНДЕКС» осуществляется на основании{" "}
        <Link to={"consent-personal-data"}>Согласия на обработку ПДн</Link>.
      </p>
      <p>
        Нажимая «Принять», вы подтверждаете, что ознакомлены с{" "}
        <Link to={"privacy-policy"}>Политикой обработки ПДн</Link> (сроки
        хранения до 5 лет) и даёте согласие на передачу данных в Яндекс.Метрику.
      </p>
      <button className={"btn"} onClick={acceptHandler}>
        Принять
      </button>
      <button className={"btn-white"} onClick={refusalHandler}>
        Отказаться
      </button>
    </div>
  ) : null;
};
