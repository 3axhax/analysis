import RadioGroup from "@shared/ui/RadioGroup";
import { useAppSelector } from "@shared/store/hooks";
import { useTranslation } from "react-i18next";
import SelectUI from "@shared/ui/SelectUI";
import { GenderType } from "@shared/lib/types";
import { selectGenderListForSelect, useGenderLoad } from "@entities/gender";

interface GenderSelectorProps {
  type?: "radio" | "list";
  gender: GenderType;
  setGender: (value: GenderType) => void;
}

export const GenderSelector = ({
  type = "radio",
  gender = "m",
  setGender,
}: GenderSelectorProps) => {
  useGenderLoad();
  const { t } = useTranslation("common");
  const { t: tEntities } = useTranslation("entities");

  const genderOptions = useAppSelector(selectGenderListForSelect);

  return (
    <>
      {type === "radio" ? (
        <RadioGroup<GenderType>
          label={t("gender")}
          name="gender"
          options={genderOptions.map((item) => ({
            ...item,
            label: tEntities(`gender.${item.label}`),
          }))}
          value={gender}
          onChange={setGender}

        />
      ) : type === "list" ? (
        <SelectUI<GenderType>
          label={t("gender")}
          name="gender"
          className={'w-[100px] mr-2'}
          onChange={setGender}
          options={genderOptions.map((item) => ({
            ...item,
            label: tEntities(`gender.${item.label}`),
          }))}
          value={gender}
        />
      ) : null}
    </>
  );
};
