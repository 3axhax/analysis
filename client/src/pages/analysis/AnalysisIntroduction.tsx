import { ListsIcon } from "@shared/ui/Icons";
import { ExistedAnalysisList } from "@widgets/existedAnalysisList";
import { OpportunityList } from "@widgets/opportunityList";

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
