import SelectUI from "@shared/ui/SelectUI.tsx";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { selectAgesListForSelect, useAgesLoad } from "@entities/ages";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { setPrepareDataAge } from "@entities/analysisResult";

export const AgeSelector = () => {
  const ageOptions = useAppSelector(selectAgesListForSelect);
  useAgesLoad();
  const { t } = useTranslation("entities");
  const dispatch = useAppDispatch();

  const [age, setAge] = useState<string>("");

  const handlerOnChange = (value: string) => {
    setAge(value);
    dispatch(setPrepareDataAge(value));
  };

  return (
    <SelectUI<string>
      label="Возрастная группа"
      name={"age"}
      options={ageOptions.map((item) => ({
        ...item,
        label: t(`ages.${item.label}`),
      }))}
      value={age}
      onChange={handlerOnChange}
      placeholder="Выберите возраст"
      className="max-w-xs"
    />
  );
};
