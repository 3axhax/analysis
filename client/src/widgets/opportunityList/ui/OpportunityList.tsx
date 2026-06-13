import { Accordion } from "@shared/ui/Accordion";
import { accordionItems } from "../data/accordion.data";

export const OpportunityList = () => {
  return (
    <Accordion
      items={accordionItems}
      itemClassName={"relative"}
      multiple={true}
      className={"grid grid-cols-1 md:grid-cols-3 gap-4 mb-5"}
      contentClassName={
        "absolute w-full bg-cyan-900 text-white rounded-b-xl z-11"
      }
      headerClassName={
        "transition-all duration-300 ease-in-out bg-gradient-to-br from-cyan-900 via-cyan-600 to-cyan-900 bg-[length:300%_100%] hover:bg-right-top hover:shadow-lg px-4 py-6 text-4xl font-light text-white"
      }
      headerOpenedClassName={"rounded-b-none"}
      headerClosedClassName={"delay-300"}
      dropdownIconClassName={"text-white/80 dark:text-white"}
    />
  );
};
