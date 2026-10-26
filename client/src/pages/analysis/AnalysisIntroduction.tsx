import { Link } from "react-router-dom";
import { ListsIcon } from "@shared/ui/Icons";
import { ExistedAnalysisList } from "@widgets/existedAnalysisList";
import { OpportunityList } from "@widgets/opportunityList";
import metadata from "@shared/config/page-metadata.json" with { type: "json" };

export const AnalysisIntroduction = () => (
  <>
    <div className="mb-8 lg:w-8/12 sm:w-full" id={"main"}>
      <h1 className="text-4xl lg:text-6xl font-sans mb-8">
        <span className={"text-cyan-600 dark:text-cyan-200 text-shadow-sm"}>
          Мгновенная расшифровка анализов
        </span>
        <br />
        <span className={"outlined-heading font-light"}>
          бесплатно и без регистрации
        </span>
      </h1>
      <p className="text-lg mb-5">{metadata.pages["/"].description}</p>
      <p className="mb-5"><Link className="underline text-cyan-700 dark:text-cyan-200" to="/about">Как работает сравнение и какие у него ограничения</Link></p>
      <OpportunityList />
    </div>
    <div className="mb-8 lg:w-8/12 sm:w-full" id={"list"}>
      <h2 className="text-2xl font-light lg:text-4xl font-sans text-gray-900 dark:text-white mb-4">
        <ListsIcon className={"inline size-6 lg:size-8 mr-2 mb-2"} />
        Список расшифровываемых анализов
      </h2>
      <ExistedAnalysisList />
    </div>
  </>
);
