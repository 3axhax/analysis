import { useAppSelector } from "@shared/store/hooks.ts";
import {
  selectIsUserAuthorized,
  selectUserName,
  selectIsUserAdmin,
} from "@entities/user";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { LoginForm } from "@features/loginForm/ui/LoginForm.tsx";
import { useTranslation } from "react-i18next";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/16/solid";
import { NavigationUI, NavItem } from "./NavigationUI.tsx";

export const Navigation = () => {
  const { t } = useTranslation("common");

  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);
  const isUserAdmin = useAppSelector(selectIsUserAdmin);
  const userName = useAppSelector(selectUserName);
  const { openModal } = useInfoModalData();

  const navItems: NavItem[] = [
    { key: "analysis", path: "/analysis", label: "Загрузить анализы" },
    { key: "about", path: "/about", label: "О проекте" },
    { key: "contacts", path: "/contacts", label: "Контакты" },
  ];

  if (isUserAdmin) {
    navItems.push({
      key: "admin",
      path: "#",
      label: "Управление",
      isDropdown: true,
      iconLink: (
        <WrenchScrewdriverIcon className="h-5 w-5 text-green-800 mr-2" />
      ),
      items: [
        { path: "/admin/analysisType", label: t("pageTitle.analysisTYpe") },
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
      iconLink: <UserIcon className="h-5 w-5 text-green-800 mr-2" />,
      items: [
        { path: "/user/profile", label: "Профиль" },
        { path: "/user/analysis", label: "Мои анализы" },
        { path: "/logout", label: "Выход" },
      ],
    });
  }

  return <NavigationUI navItems={navItems} />;
};
