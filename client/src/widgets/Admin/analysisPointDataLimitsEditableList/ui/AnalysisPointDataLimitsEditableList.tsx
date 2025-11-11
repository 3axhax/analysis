import {useTranslation} from "react-i18next";

export const AnalysisPointDataLimitsEditableList = () => {
    const {t} = useTranslation('entities');
    return <>
        <button className={"btn"}>{t('analysisPointData.addNewLimit')}</button>
    </>
}