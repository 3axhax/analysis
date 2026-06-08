import {Accordion} from "@shared/ui/Accordion";
import {accordionItems} from "../data/accordion.data.ts";

export const ExistedAnalysisList = () => {
    return <Accordion items={accordionItems}/>;
}