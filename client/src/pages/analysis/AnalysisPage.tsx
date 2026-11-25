import { ExistedAnalysisList } from "@widgets/existedAnalysisList";
import { Donwload, ListsIcon } from "@shared/ui/Icons";
import { AnalysisIntroduction } from "./AnalysisIntroduction";
import { AnalysisForm } from "./AnalysisForm";
import { AnalysisAdvantages } from "./AnalysisAdvantages";
import { AnalysisFaq } from "./AnalysisFaq";
import { AnalysisArticleList } from "./AnalysisArticleList";

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
    <AnalysisAdvantages />
    <section
      className="mb-5 w-[calc(100%+3rem)] bg-gradient-to-br from-cyan-900 via-cyan-600 to-cyan-900 bg-[length:300%_100%] px-6 py-8"
      id="list"
    >
      <div className="mx-auto lg:w-8/12 w-full">
        <h2 className="text-[24px] font-light font-sans text-white mb-4">
          <ListsIcon className={"inline size-6 mr-1 mb-1"} />
          Список расшифровываемых анализов
        </h2>
        <ExistedAnalysisList />
      </div>
    </section>
    <AnalysisFaq />
    <AnalysisArticleList />
  </div>
);
