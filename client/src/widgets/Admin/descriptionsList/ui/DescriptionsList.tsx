import { useTranslation } from "react-i18next";
import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui/Table";
import {
  DescriptionsListItem,
  selectDescriptionsList,
} from "@entities/descriptions";
import { DescriptionsConditionsList } from "@widgets/Admin/descriptionsConditionsList";
import { DescriptionsListActionItems } from "@features/Admin/descriptions/descriptionsListActionItems";

export const DescriptionsList = () => {
  const { t } = useTranslation("entities");
  const { t: tCommon } = useTranslation("common");

  const descriptionsList: DescriptionsListItem[] = useAppSelector(
    selectDescriptionsList,
  );

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      {
        name: "translationRu",
        label: t("descriptions.translationRu"),
        className: "min-w-[300px]",
      },
      {
        name: "conditions",
        label: t("descriptions.conditions"),
        className: "min-w-[300px]",
      },
      { name: "action", label: tCommon("table.action") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (descriptionsList?.length > 0) {
    tableData.rows = descriptionsList.map((row: DescriptionsListItem) => {
      return [
        { name: "id", data: row.id.toString() },
        {
          name: "translationRu",
          data: row.description_ru,
        },
        {
          name: "conditions",
          data: <DescriptionsConditionsList descriptionId={row.id} />,
          className: "text-start",
        },
        {
          name: "action",
          data: <DescriptionsListActionItems rowId={row.id} />,
          className: "flex justify-center",
        },
      ];
    });
  }

  return <Table tableData={tableData} className={"max-w-[90%]"} />;
};
