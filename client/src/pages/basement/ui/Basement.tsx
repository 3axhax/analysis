import { Link } from "react-router-dom";

export const Basement = () => {
  return (
    <div className="basement">
      <Link to={"privacy-policy"}>Политика обработки персональных данных</Link>
      <Link to={"consent-personal-data"}>
        Согласие на обработку персональных данных
      </Link>
    </div>
  );
};
