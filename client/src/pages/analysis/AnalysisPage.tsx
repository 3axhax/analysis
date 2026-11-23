import { ExistedAnalysisList } from "@widgets/existedAnalysisList";
import { OpportunityList } from "@widgets/opportunityList";
import { Donwload, ListsIcon } from "@shared/ui/Icons";
import { AnalysisIntroduction } from "./AnalysisIntroduction";
import { AnalysisForm } from "./AnalysisForm";

export const AnalysisPage = () => (
  <div className="app w-full">
    <AnalysisIntroduction />
    <div className="mb-5 lg:mb-8 lg:w-8/12 sm:w-full" id="analysis">
      <h2 className="text-2xl font-light lg:text-3xl font-sans text-gray-900 mb-2 dark:text-white sr-only">
        <Donwload className="inline size-5 lg:size-6 mr-2 mb-2" />
        Загрузите анализы
      </h2>
      <AnalysisForm />
    </div>
    <div className="mb-5 lg:w-8/12 sm:w-full">
      <OpportunityList />
    </div>
    <div className="mb-5 lg:w-8/12 sm:w-full" id={"list"}>
      <h2 className="text-2xl font-light lg:text-4xl font-sans text-gray-900 dark:text-white mb-4">
        <ListsIcon className={"inline size-6 lg:size-8 mr-2 mb-2"} />
        Список расшифровываемых анализов
      </h2>
      <ExistedAnalysisList />
    </div>
  </div>
);
