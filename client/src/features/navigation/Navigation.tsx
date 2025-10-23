import { useAppSelector } from "@shared/store/hooks.ts";
import {
  selectIsUserAuthorized,
  selectUserName,
  selectIsUserAdmin,
} from "@entities/user";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { LoginForm } from "@features/loginForm/ui/LoginForm.tsx";
import { NavigationUI, NavItem } from "@widgets/navigation";
import { useTranslation } from "react-i18next";

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
      items: [
        { path: "/admin/analysisType", label: "Типы анализов" },
        { path: "/admin/analysisPoint", label: "Параметры анализов" },
        { path: "/admin/descriptions", label: "Описания" },
        { path: "/admin/units", label: t("pageTitle.units") },
        { path: "/admin/ages", label: "Возрастные группы" },
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
      key: "logout",
      path: "/logout",
      label: `${userName} (Выйти)`,
    });
  }

  return <NavigationUI navItems={navItems} />;
};
