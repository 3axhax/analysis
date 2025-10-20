import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectIsUserAuthorized, selectUserName } from "@entities/user";
import { UserIcon } from "@heroicons/react/24/outline";
import {JSX} from "react";
import {Logo} from "@features/logo";

interface NavItem {
  path: string;
  label: string;
  iconLink?: JSX.Element
}

export const Navigation = () => {
  const location = useLocation();

  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);
  console.log("isUserAuthorized", isUserAuthorized);
  const userName = useAppSelector(selectUserName);

  const isAdmin = location.pathname.startsWith("/admin");

  const mainNavItems: NavItem[] = [
    { path: "/", label: "Главная" },
    { path: "/analysis", label: "Загрузить анализы" },
    { path: "/admin", label: "Админ панель" },
    { path: "/about", label: "О проекте" },
    { path: "/contacts", label: "Контакты" },
  ];

  if (!isUserAuthorized) {
    mainNavItems.push({ path: "/login", label: "Войти", iconLink:
    <UserIcon className="inline-flex h-5 w-5 mr-2 text-gray-500" />});
  } else {
    mainNavItems.push({ path: "/logout", label: `${userName} (Выйти)` });
  }

  const adminNavItems: NavItem[] = [
    { path: "/", label: "Главная" },
    { path: "/admin/analysis", label: "Управление анализами" },
    { path: "/admin/users", label: "Пользователи" },
    { path: "/admin/settings", label: "Настройки" },
  ];

  const navItems = isAdmin ? adminNavItems : mainNavItems;

  return (
    <nav className="navigation">
      <Logo />
      <ul className="inline-flex space-x-6 justify-center">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center flex-gap-2 px-4 py-2 rounded-lg transition-colors duration-200${
                location.pathname === item.path
                  ? "bg-green-900 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {item.iconLink && item.iconLink}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
