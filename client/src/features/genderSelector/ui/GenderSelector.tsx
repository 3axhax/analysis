import { RadioGroup, SelectUI } from "@shared/ui";
import { useAppSelector } from "@shared/store/hooks";
import { useTranslation } from "react-i18next";
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
  const { t: tEntities } = useTranslation("entities", { useSuspense: false });

  const genderOptions = useAppSelector(selectGenderListForSelect);

  return (
    <>
      {type === "radio" ? (
        <RadioGroup<GenderType>
          label="Пол"
          className="lg:w-[12.5rem] lg:shrink-0"
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
          label="Пол"
          name="gender"
          className={"w-[100px] mr-2"}
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
