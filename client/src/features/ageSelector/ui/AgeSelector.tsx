import SelectUI from "@shared/ui/SelectUI.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAgesListForSelect, useAgesLoad } from "@entities/ages";
import { useTranslation } from "react-i18next";

interface AgeSelectorProps {
  age: string;
  setAge: (value: string) => void;
}

export const AgeSelector = ({ age, setAge }: AgeSelectorProps) => {
  const ageOptions = useAppSelector(selectAgesListForSelect);
  useAgesLoad();
  const { t } = useTranslation("common");
  const { t: tEntities } = useTranslation("entities");

  return (
    <SelectUI<string>
      label={t("age")}
      name={"age"}
      options={ageOptions.map((item) => ({
        ...item,
        label: tEntities(`ages.${item.label}`),
      }))}
      value={age}
      onChange={setAge}
      placeholder="Выберите возраст"
      className="w-full mb-4"
    />
  );
};
