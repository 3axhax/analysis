import { Accordion } from "@shared/ui/Accordion";
import { accordionItems } from "../data/accordion.data";

export const ExistedAnalysisList = () => {
  return (
    <Accordion
      items={accordionItems}
      itemClassName={"relative"}
      className={"grid grid-cols-1 md:grid-cols-3 gap-4 mb-5"}
      contentClassName={
        "z-10 absolute w-full bg-cyan-50 dark:bg-gray-900 ring-1 ring-cyan-600 ring-inset rounded-b-xl text-gray-800 dark:text-white"
      }
      headerClassName={
        "border-1 border-cyan-600 dark:border-cyan-800 hover:shadow-md px-4 py-3 text-left transition-colors transition-border duration-300 ease-in-out hover:bg-cyan-50 dark:hover:bg-gray-700"
      }
      headerOpenedClassName={
        "bg-cyan-50 dark:bg-gray-900 border-b-cyan-50 rounded-b-none"
      }
      headerClosedClassName={"bg-white dark:bg-gray-900"}
      dropdownIconClassName={"text-gray-400 dark:text-white"}
    />
  );
};
