import { useTranslation } from "react-i18next";

interface AddNewTranslationProps {
  className?: string;
}

export const AddNewTranslation = ({ className }: AddNewTranslationProps) => {
  const { t } = useTranslation("features");
  return (
    <button
      className={`bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-green-500${className ? " " + className : ""}`}
    >
      {t("addNewTranslation.add")}
    </button>
  );
};
