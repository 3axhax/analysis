import { JSX } from "react";
import { useTranslation } from "react-i18next";

export type TableDataRow = {
  name: string;
  data: string | JSX.Element;
  className?: string;
};

export interface TableData {
  header: { name: string; label: string | JSX.Element; className?: string }[];
  rows: TableDataRow[][];
}

interface TableProps {
  tableData: TableData;
  className?: string;
}

export const Table = ({ tableData, className }: TableProps) => {
  const { t } = useTranslation("common");
  return (
    <table
      className={`m-auto w-full border border-cyan-800 dark:border-white${className ? ` ${className}` : ""}`}
    >
      <thead>
        <tr className="bg-cyan-800 text-white">
          {tableData.header.map((th) => (
            <th
              key={th.name}
              className={`border-r border-white last:border-r-cyan-800 dark:last:border-r-white px-4 py-3 text-start text-sm font-medium${th.className ? ` ${th.className}` : ``}`}
            >
              {th.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.rows.length > 0 ? (
          tableData.rows.map((row: TableDataRow[], index: number) => (
            <tr
              key={index}
              className="border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            >
              {row.map((cell: TableDataRow, cellIndex: number) => (
                <td
                  key={cell.name}
                  className={`px-3 py-2 text-sm text-gray-900 dark:text-white${cellIndex + 1 < Object.keys(row).length ? ` border-r border-gray-300 dark:border-white` : ``}${cell.className ? ` ${cell.className}` : ``}`}
                >
                  {cell.data}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={tableData.header.length}>{t("table.emptyData")}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
