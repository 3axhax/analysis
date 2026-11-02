import { Donwload } from "@shared/ui/Icons";
import { AnalysisIntroduction } from "./AnalysisIntroduction";
import { AnalysisForm } from "./AnalysisForm";

export const AnalysisPage = () => (
  <div className="app w-full">
    <AnalysisIntroduction />
    <div className="mb-20 lg:w-8/12 sm:w-full" id="analysis">
      <h2 className="text-2xl font-light lg:text-4xl font-sans text-gray-900 mb-2 dark:text-white">
        <Donwload className="inline size-6 lg:size-8 mr-2 mb-2" />
        Загрузите анализы
      </h2>
      <AnalysisForm />
    </div>
  </div>
);
