import { Donwload, ListsIcon } from "@shared/ui/Icons";
import type { NavItem } from "./NavigationUI";

export const publicNavigationItems = (): NavItem[] => [
  {
    key: "list",
    path: "list",
    label: "Список анализов",
    iconLink: (
      <ListsIcon
        className={
          "lg:absolute mr-2 lg:mr-0 h-5 w-5 lg:-left-6 transition-[left] duration-200 cubic-bezier(0.68, -0.55, 0.265, 1.55) group-hover:left-0 group-hover:text-orange-50"
        }
      />
    ),
  },
  {
    key: "analysis",
    path: "analysis",
    label: "Загрузить анализы",
    iconLink: (
      <Donwload
        className={
          "lg:absolute mr-2 lg:mr-0 h-5 w-5 lg:-left-6 transition-[left] duration-200 cubic-bezier(0.68, -0.55, 0.265, 1.55) group-hover:left-0 group-hover:text-orange-50"
        }
      />
    ),
  },
  { key: "articles", path: "/articles", label: "Статьи" },
  { key: "contacts", path: "/contacts", label: "Контакты" },
];
