import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "@shared/store/hooks.ts";
import {
  selectIsUserAuthorized,
  selectUserName,
  selectIsUserAdmin,
} from "@entities/user";
import { JSX, useState } from "react";
import { Logo } from "@features/logo";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { ChevronUpIcon } from "@heroicons/react/16/solid";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { LoginForm } from "@features/loginForm/ui/LoginForm.tsx";

interface NavItem {
  path: string;
  label: string;
  iconLink?: JSX.Element;
  isDropdown?: boolean;
  isButton?: boolean;
  onClick?: () => void;
  items?: { path: string; label?: string }[];
}

export const Navigation = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);
  const isUserAdmin = useAppSelector(selectIsUserAdmin);
  const userName = useAppSelector(selectUserName);
  const { openModal } = useInfoModalData();

  const navItems: NavItem[] = [
    { path: "/analysis", label: "Загрузить анализы" },
    { path: "/about", label: "О проекте" },
    { path: "/contacts", label: "Контакты" },
  ];

  if (isUserAdmin) {
    navItems.push({
      path: "#",
      label: "Управление",
      isDropdown: true,
      items: [
        { path: "/admin/analysisType", label: "Типы анализов" },
        { path: "/admin/analysisPoint", label: "Параметры анализов" },
        { path: "/admin/descriptions", label: "Описания" },
        { path: "/admin/units", label: "Единицы измерений" },
        { path: "/admin/ages", label: "Возрастные группы" },
        { path: "" },
        { path: "/admin/translations", label: "Переводы" },
      ],
    });
  } else {
    navItems.push({
      path: "login",
      label: "Вход (модалка)",
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
    navItems.push({ path: "/logout", label: `${userName} (Выйти)` });
  }

  return (
    <header className="header">
      <div className={"container flex"}>
        <Logo />
        <nav className="navigation ml-auto">
          <ul className="inline-flex space-x-6 justify-center">
            {navItems.map((item) => (
              <li key={item.path}>
                {item.isDropdown ? (
                  <>
                    <div
                      className={`relative flex items-center flex-gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer`}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {item.iconLink && item.iconLink}
                      {item.label}
                      {isDropdownOpen ? (
                        <ChevronUpIcon className="inline-flex h-5 w-5 mr-2 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="inline-flex h-5 w-5 mr-2 text-gray-500" />
                      )}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10 border border-gray-200 dark:border-gray-700">
                          {item.items?.map((dropdownItem) =>
                            dropdownItem.label ? (
                              <Link
                                key={dropdownItem.path}
                                to={dropdownItem.path}
                                onClick={() => setIsDropdownOpen(false)}
                                className={`block px-4 py-2 text-sm transition-colors${
                                  location.pathname === dropdownItem.path
                                    ? " bg-green-900 text-white"
                                    : " text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                {dropdownItem.label}
                              </Link>
                            ) : (
                              <hr
                                key={dropdownItem.path}
                                className="text-gray-300"
                              />
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : item.isButton ? (
                  <button
                    className={"cursor-pointer"}
                    key={item.path}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center flex-gap-2 px-4 py-2 rounded-lg transition-colors duration-200${
                      location.pathname === item.path
                        ? " bg-green-900 text-white"
                        : " text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.iconLink && item.iconLink}
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </nav>
      </div>
    </header>
  );
};
