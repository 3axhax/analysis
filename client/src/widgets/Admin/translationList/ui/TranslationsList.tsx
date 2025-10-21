import { useTranslation } from "react-i18next";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectTranslationsList } from "@entities/translations/model/slice.ts";
import { TranslationsListItem } from "@widgets/Admin/translationList/ui/TranslationsListItem.tsx";

export const TranslationsList = () => {
  const { t } = useTranslation("entities");
  const { t: tCommon } = useTranslation("widgets");

  const translationList = useAppSelector(selectTranslationsList);

  return (
    <table className={`max-w-[90%] m-auto border border-gray-300`}>
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            ID
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {t("translation.lang")}
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {t("translation.namespace")}
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {t("translation.module")}
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {t("translation.submodule")}
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {t("translation.value")}
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {tCommon("translationsList.action")}
          </th>
        </tr>
      </thead>
      <tbody>
        {translationList ? (
          translationList.map((item) => (
            <TranslationsListItem key={item.id} item={item} />
          ))
        ) : (
          <tr>
            <td colSpan={6}>Empty list</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
