import {Accordion} from "@shared/ui/Accordion";
import {accordionItems} from "../data/accordion.data";

export const ExistedAnalysisList = () => {
    return <Accordion items={accordionItems} itemClassName={'relative'} className={'grid grid-cols-1 md:grid-cols-3 gap-4 mb-5'} contentClassName={'absolute w-full bg-cyan-50 dark:bg-gray-900 ring-1 ring-cyan-600 ring-inset rounded-b-xl'} openedContentClassName={'z-10 ring-t-0'}/>;
}