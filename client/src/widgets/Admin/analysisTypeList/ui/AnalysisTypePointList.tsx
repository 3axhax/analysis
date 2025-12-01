import {AdminAnalysisTypePointItem} from "@entities/adminAnalysisType";
import {useTranslation} from "react-i18next";

interface AnalysisTypePointListProps {
    list: AdminAnalysisTypePointItem[]
}
export const AnalysisTypePointList = ({list}: AnalysisTypePointListProps) => {

    const { t } = useTranslation("entities");
 return (
     <ul>
         {list.map(item => <li>{t(`analysisPoint.${item.name}`)}</li>)}
     </ul>
 )
}