import { Accordion } from "@shared/ui/Accordion";
import { Link } from "react-router-dom";
import { useArticleCatalog } from "@shared/catalog/article-catalog";
import { pointPath } from "@shared/catalog/article-routes.mjs";
import { CheckCircleIcon } from "@shared/ui/Icons/CheckCircleIcon.tsx";

export const ExistedAnalysisList = () => {
  const { catalog, failed } = useArticleCatalog();
  if (!catalog) {
    return <p role="status">{failed ? "Не удалось загрузить список анализов." : "Загрузка списка анализов…"}</p>;
  }

  const points = new Map(catalog.points.map((point) => [point.id, point]));
  const items = catalog.groups.filter((group) => group.pointIds.length > 0).map((group) => ({
    id: group.alias,
    masonryColumn: group.alias === "mineralnyy-obmen" ? 1 as const : undefined,
    title: group.title,
    icon: <CheckCircleIcon className="inline size-5 text-cyan-600 dark:text-white" />,
    content: (
      <ul className="space-y-2">
        {group.pointIds.map((id) => {
          const point = points.get(id);
          if (!point) return null;
          return (
            <li key={id}>
              <Link className="bg-underline-hover hover:text-cyan-700 dark:hover:text-cyan-200" to={pointPath(point.alias)}>
                {point.name}
              </Link>
            </li>
          );
        })}
      </ul>
    ),
  }));
  return (
    <Accordion
      items={items}
      masonry
      closeOnOutsideClick
      itemClassName={"relative"}
      className={"grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 items-start"}
      contentClassName={
        "w-full bg-cyan-50 dark:bg-gray-900 ring-1 ring-cyan-600 ring-inset rounded-b-xl text-gray-800 dark:text-white"
      }
      headerClassName={
        "border-1 border-cyan-600 dark:border-cyan-800 hover:shadow-md px-4 py-3 text-left transition-colors transition-border duration-300 ease-in-out hover:bg-cyan-50 dark:hover:bg-gray-700"
      }
      headerOpenedClassName={
        "bg-cyan-50 dark:bg-gray-900 border-b-cyan-50 rounded-b-none"
      }
      headerClosedClassName={"bg-white dark:bg-gray-900"}
      dropdownIconClassName={"text-gray-400 dark:text-white"}
    />
  );
};
