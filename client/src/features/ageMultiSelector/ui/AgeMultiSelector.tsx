import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAgesListForSelect, useAgesLoad } from "@entities/ages";
import { useTranslation } from "react-i18next";
import { SelectMultiUI } from "@shared/ui/SelectMultiUI.tsx";

interface AgeMultiSelectorProps {
  age: string[];
  setAge: (value: string[]) => void;
}

export const AgeMultiSelector = ({ age, setAge }: AgeMultiSelectorProps) => {
  const ageOptions = useAppSelector(selectAgesListForSelect);
  useAgesLoad();
  const { t } = useTranslation("common");
  const { t: tEntities } = useTranslation("entities");

  return (
    <SelectMultiUI<string>
      label={t("age")}
      name={"age"}
      options={ageOptions.map((item) => ({
        ...item,
        label: tEntities(`ages.${item.label}`),
      }))}
      value={age}
      onChange={setAge}
      placeholder="Выберите возраст"
      className="flex-grow"
    />
  );
};
