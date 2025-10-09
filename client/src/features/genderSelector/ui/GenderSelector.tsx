import RadioGroup from "@shared/ui/RadioGroup.tsx";
import { GenderType, useGenderLoad } from "@entities/gender";
import { selectGenderListForSelect } from "@entities/gender";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { setPrepareDataGender } from "@entities/analysisResult";

export const GenderSelector = () => {
  useGenderLoad();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("common");

  const { t: tEntities } = useTranslation("entities");
  const [gender, setGender] = useState<GenderType>("m");

  const genderOptions = useAppSelector(selectGenderListForSelect);

  const handlerOnChange = (value: GenderType) => {
    setGender(value);
    dispatch(setPrepareDataGender(value));
  };

  return (
    <RadioGroup<GenderType>
      label={t("gender")}
      name="gender"
      options={genderOptions.map((item) => ({
        ...item,
        label: tEntities(`gender.${item.label}`),
      }))}
      value={gender}
      onChange={(value) => handlerOnChange(value)}
    />
  );
};
