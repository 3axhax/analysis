import { TranslationsListItem as TranslationsListItemType } from "@entities/translations";

export const TranslationsListItem = ({
  item,
}: {
  item: TranslationsListItemType;
}) => {
  return (
    <tr className="border-t border-gray-300 hover:bg-gray-50">
      <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900">
        {item.id}
      </td>
      <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900">
        {item.lang}
      </td>
      <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900">
        {item.namespace}
      </td>
      <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900">
        {item.module}
      </td>
      <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900">
        {item.submodule}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.value}</td>
    </tr>
  );
};
