import { useAppSelector } from "@shared/store/hooks.ts";
import {
  selectIsUserAuthorized,
  selectUserName,
  selectIsUserAdmin,
} from "@entities/user";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { LoginForm } from "@features/loginForm/ui/LoginForm.tsx";
import { useTranslation } from "react-i18next";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/outline";
import { NavigationUI, NavItem } from "./NavigationUI.tsx";
import {Laboratory} from "@shared/ui/Icons/Laboratory.tsx";
import {Donwload} from "@shared/ui/Icons/Donwload.tsx";

export const Navigation = () => {
  const { t } = useTranslation("common");

  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);
  const isUserAdmin = useAppSelector(selectIsUserAdmin);
  const userName = useAppSelector(selectUserName);
  const { openModal } = useInfoModalData();

  const navItems: NavItem[] = [
    { key: "preparation",
      path: "preparation",
      label: "Подготовка",
      iconLink: <Laboratory className={'absolute h-5 w-5 text-white -left-6 transition-[left] duration-200 cubic-bezier(0.68, -0.55, 0.265, 1.55) group-hover:left-0 group-hover:text-orange-50'}/>
    },
    { key: "analysis",
      path: "analysis",
      label: "Загрузить анализы",
      iconLink: <Donwload className={'absolute h-5 w-5 text-white -left-6 transition-[left] duration-200 cubic-bezier(0.68, -0.55, 0.265, 1.55) group-hover:left-0 group-hover:text-orange-50'}/>
    },
  ];

  if (isUserAdmin) {
    navItems.push({
      key: "admin",
      path: "#",
      label: "Управление",
      isDropdown: true,
      iconLink: (<Cog8ToothIcon className="h-5 w-5 text-white group-hover:text-orange-300 mr-2" />
  ),
      items: [
        { path: "/admin/analysisType", label: t("pageTitle.analysisType") },
        { path: "/admin/analysisPoints", label: t("pageTitle.analysisPoints") },
        { path: "/admin/descriptions", label: t("pageTitle.descriptions") },
        { path: "/admin/units", label: t("pageTitle.units") },
        { path: "/admin/ages", label: t("pageTitle.ages") },
        { path: "" },
        { path: "/admin/translations", label: t("pageTitle.translations") },
      ],
    });
  } else {
    navItems.push({
      key: "login",
      path: "#",
      label: "Вход",
      isButton: true,
      onClick: () => {
        openModal({
          title: "Войти",
          type: "standard",
          hasButtons: false,
          body: <LoginForm />,
        });
      },
    });
  }

  if (isUserAuthorized) {
    navItems.push({
      key: "userMenu",
      path: "#",
      label: `${userName}`,
      isDropdown: true,
      iconLink: <UserIcon className="h-5 w-5 text-white group-hover:text-orange-300 mr-2" />,
      items: [
        { path: "/user/profile", label: "Профиль" },
        { path: "/user/analysis", label: "Мои анализы" },
        { path: "/logout", label: "Выход" },
      ],
    });
  }

  return <NavigationUI navItems={navItems} />;
};
