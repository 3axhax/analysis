import { Link, useLocation } from "react-router-dom";
import { JSX, useState } from "react";
import { Logo } from "@widgets/logo";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import {BurgerButton} from "@widgets/navigation/ui/BurgerButton.tsx";

export interface NavItem {
  key: string;
  path: string;
  label: string;
  iconLink?: JSX.Element;
  isDropdown?: boolean;
  isButton?: boolean;
  onClick?: () => void;
  setIsBurgerOpen?: () => void;
  items?: { path: string; label?: string }[];
}

export const NavigationUI = ({ navItems }: { navItems: NavItem[] }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="header">
        <Logo />
        <BurgerButton isOpen={isMobileMenuOpen} className={"lg:hidden absolute top-0 right-0"} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}/>
        <nav className={`ml-auto fixed z-40 top-0 right-0 bottom-0 overflow-hidden lg:overflow-visible lg:relative lg:visible ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
          <div
              className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
                  isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`absolute inset-0 bg-black ${isMobileMenuOpen ? 'opacity-50' : 'opacity-0'}`}/>
          </div>
          <ul className={`navigation__menu py-6 px-4 z-40 bg-white dark:bg-gray-950 fixed inset-y-0 right-0 w-80 transition-transform duration-300 transform lg:relative lg:right-auto lg:translate-x-0 lg:w-auto lg:py-0 lg:px-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {navItems.map((item) => (
                <li key={item.key} className={"flex justify-stretch w-full"}>
                  {item.isDropdown ? (
                      <>
                        <div
                            className={`relative flex items-center flex-gap-2 px-4 py-2 rounded-full transition-colors duration-200 border-1 border-green-800 hover:cursor-pointer text-gray-600 dark:text-gray-300 group hover:text-green-800 hover:bg-green-600/10 hover:text-green-800 dark:hover:bg-gray-700`}
                            onClick={() => setIsDropdownOpen(item.key)}
                        >
                          {item.iconLink && item.iconLink}
                          <span
                              className={
                                "max-w-50 overflow-ellipsis text-nowrap overflow-hidden uppercase"
                              }
                          >
                        {item.label}
                      </span>
                          <ChevronDownIcon
                              className={`inline-flex h-4 w-4 ml-2 text-gray-600 transition-transform group-hover:text-green-800 duration-200 ${isDropdownOpen === item.key ? "rotate-180" : ""}`}
                          />
                          {isDropdownOpen === item.key && (
                              <div
                                  className="absolute top-full left-0 mt-4 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                {item.items?.map((dropdownItem) =>
                                    dropdownItem.label ? (
                                        <Link
                                            key={dropdownItem.path}
                                            to={dropdownItem.path}
                                            onClick={() => setIsDropdownOpen("")}
                                            className={`block text-left px-4 py-2 text-sm transition-colors${
                                                location.pathname === dropdownItem.path
                                                    ? " bg-green-900 text-white"
                                                    : " text-gray-700 dark:text-gray-300 hover:bg-green-800/10 dark:hover:bg-gray-700"
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
                          className={
                            "cursor-pointer flex justify-center items-center rounded-full px-4 font-medium py-2 border-2 border-green-800 bg-green-800 text-white hover:bg-white hover:text-green-800 lg:ml-20 transition-all"
                          }
                          key={item.key}
                          onClick={item.onClick}
                      >
                        <ArrowRightEndOnRectangleIcon className="inline-flex h-5 w-5 mr-1"/>
                        {item.label}
                      </button>
                  ) : (
                      <a
                          href={'#' + item.key}
                          className={`flex items-center flex-gap-2 px-4 py-2 rounded-full transition-colors duration-200 border-1 border-white uppercase lg:whitespace-pre  ${
                              location.pathname === item.path
                                  ? " bg-green-900 text-white"
                                  : " text-gray-600 dark:text-gray-300 hover:text-green-800 hover:border-green-800 hover:bg-green-600/10 dark:hover:bg-gray-700"
                          }`}
                      >
                        {item.iconLink && item.iconLink}
                        {item.label}
                      </a>
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
    </header>
  );
};
