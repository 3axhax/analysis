import { useAppSelector } from "@shared/store/hooks";
import { useTranslation } from "react-i18next";
import { GenderType } from "@shared/lib/types";
import { selectGenderListForSelect, useGenderLoad } from "@entities/gender";
import { SelectMultiUI } from "@shared/ui/SelectMultiUI.tsx";

interface GenderSelectorProps {
  gender: GenderType[];
  setGender: (value: GenderType[]) => void;
}

export const GenderMultiSelector = ({
  gender = ["m"],
  setGender,
}: GenderSelectorProps) => {
  useGenderLoad();
  const { t } = useTranslation("common");
  const { t: tEntities } = useTranslation("entities");

  const genderOptions = useAppSelector(selectGenderListForSelect);

  return (
    <SelectMultiUI<GenderType>
      label={t("gender")}
      name="gender"
      className={"w-[100px] mr-2"}
      onChange={setGender}
      options={genderOptions.map((item) => ({
        ...item,
        label: tEntities(`gender.${item.label}`),
      }))}
      value={gender}
    />
  );
};
