import SelectUI from "@shared/ui/SelectUI.tsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  selectAnalysisType,
  selectAnalysisTypeListForSelect,
  useAnalysisTypeLoad,
} from "@entities/analysisType";
import { useAnalysisPointLoad } from "@entities/analysisPoint";
import { AnalysisPointSelectedList } from "@widgets/analysisPointList/ui/AnalysisPointSelectedList.tsx";
import { clearAllPointData } from "@entities/analysisResult";

export const AnalysisPointList = () => {
  const dispatch = useAppDispatch();
  useAnalysisTypeLoad();
  useAnalysisPointLoad();
  const { t } = useTranslation();
  const analysisTypeOptions = useAppSelector(selectAnalysisTypeListForSelect);

  const [analysisType, setAnalysisType] = useState<number>(0);

  useEffect(() => {
    dispatch(selectAnalysisType(analysisType));
    dispatch(clearAllPointData());
  }, [analysisType, dispatch]);

  return (
    <>
      <SelectUI<number>
        label="Тип анализов"
        name={"age"}
        options={analysisTypeOptions.map((item) => ({
          ...item,
          label: t(`analysisType.${item.label}`),
        }))}
        value={analysisType}
        onChange={(value) => setAnalysisType(value)}
        placeholder="Выберите тип анализов"
        className="max-w-xs"
      />
      <AnalysisPointSelectedList />
    </>
  );
};
