import { Link, useLocation } from "react-router-dom";
import { JSX, useState } from "react";
import { Logo } from "@features/logo";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { ChevronUpIcon } from "@heroicons/react/16/solid";

export interface NavItem {
  key: string;
  path: string;
  label: string;
  iconLink?: JSX.Element;
  isDropdown?: boolean;
  isButton?: boolean;
  onClick?: () => void;
  items?: { path: string; label?: string }[];
}

export const NavigationUI = ({ navItems }: { navItems: NavItem[] }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState<string>("");

  return (
    <header className="header">
      <div className={"container flex"}>
        <Logo />
        <nav className="navigation ml-auto">
          <ul className="inline-flex space-x-6 justify-center">
            {navItems.map((item) => (
              <li key={item.key}>
                {item.isDropdown ? (
                  <>
                    <div
                      className={`relative flex items-center flex-gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer`}
                      onClick={() => setIsDropdownOpen(item.key)}
                    >
                      {item.iconLink && item.iconLink}
                      {item.label}
                      {isDropdownOpen === item.key ? (
                        <ChevronUpIcon className="inline-flex h-5 w-5 mr-2 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="inline-flex h-5 w-5 mr-2 text-gray-500" />
                      )}
                      {isDropdownOpen === item.key && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10 border border-gray-200 dark:border-gray-700">
                          {item.items?.map((dropdownItem) =>
                            dropdownItem.label ? (
                              <Link
                                key={dropdownItem.path}
                                to={dropdownItem.path}
                                onClick={() => setIsDropdownOpen("")}
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
                    key={item.key}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    to={item.key}
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
          {isDropdownOpen !== "" && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setIsDropdownOpen("")}
            />
          )}
        </nav>
      </div>
    </header>
  );
};
