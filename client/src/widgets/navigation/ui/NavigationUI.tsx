import { Link, useLocation } from "react-router-dom";
import { JSX, useState } from "react";
import { Logo } from "@widgets/logo";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { BurgerButton } from "@widgets/navigation/ui/BurgerButton.tsx";
import { LoginIcon } from "@shared/ui/Icons";

export interface NavItem {
  key: string;
  path: string;
  label: string;
  iconLink?: JSX.Element;
  isDropdown?: boolean;
  isButton?: boolean;
  onClick?: () => void;
  setIsBurgerOpen?: () => void;
  items?: { path: string; label?: string; iconLink?: JSX.Element }[];
}

export const NavigationUI = ({ navItems }: { navItems: NavItem[] }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="header bg-cyan-600 shadow-lg dark:bg-cyan-950 dark:shadow-white/20">
      <Logo />
      <BurgerButton
        isOpen={isMobileMenuOpen}
        className={"lg:hidden absolute top-0 right-0"}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <nav
        className={`ml-auto fixed z-40 top-0 right-0 bottom-0 overflow-hidden lg:overflow-visible lg:relative lg:visible ${isMobileMenuOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span
            className={`absolute inset-0 bg-black ${isMobileMenuOpen ? "opacity-50" : "opacity-0"}`}
          />
        </div>
        <ul
          className={`bg-cyan-600 dark:bg-cyan-950 py-4 lg:py-0 flex flex-col lg:justify-start lg:flex-row lg:inline-flex z-40 lg:bg-transparent fixed inset-y-0 right-0 w-80 transition-transform duration-300 transform lg:relative lg:right-auto lg:translate-x-0 lg:w-auto lg:px-0 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {navItems.map((item) => (
            <li
              key={item.key}
              className={"flex justify-stretch items-center w-full m-0"}
            >
              {item.isDropdown ? (
                <>
                  <div
                    className={`relative flex flex-col items-start lg:items-center w-full`}
                    onClick={() =>
                      setIsDropdownOpen(
                        isDropdownOpen === item.key ? "" : item.key,
                      )
                    }
                  >
                    <span
                      className={
                        "hover:cursor-pointer w-full transition-colors duration-200 group text-orange-50 hover:text-orange-300 hover:border-orange-300 py-2 lg:py-6 px-3 flex items-center bg-cyan-600 dark:bg-cyan-950 lg:w-50 z-2"
                      }
                    >
                      {item.iconLink && item.iconLink}
                      <span
                        className={
                          "max-w-50 text-nowrap overflow-hidden uppercase"
                        }
                      >
                        {item.label}
                      </span>
                      <ChevronDownIcon
                        className={`inline-flex h-4 w-4 ml-1 text-white transition-transform group-hover:text-orange-300 duration-200 ${isDropdownOpen === item.key ? "rotate-180" : ""}`}
                      />
                    </span>
                    <div
                      className={`relative overflow-hidden lg:absolute flex flex-col gap-2 lg:left-0 w-full lg:w-48 lg:rounded-b-lg 
                               bg-orange-400/90 dark:bg-orange-700/90 lg:shadow-lg shadow-cyan-950/40 transition-all duration-300 ease-linear ${isDropdownOpen === item.key ? "max-h-[500px] lg:translate-y-0 z-1 lg:top-full" : "max-h-0 lg:-translate-y-full z-0 lg:-top-full"}`}
                    >
                      <ul className={"py-3 flex flex-col w-full m-0"}>
                        {item.items?.map(
                          (dropdownItem) =>
                            dropdownItem.label && (
                              <li
                                className={"text-left"}
                                key={dropdownItem.path}
                              >
                                <Link
                                  to={dropdownItem.path}
                                  onClick={() => setIsDropdownOpen("")}
                                  className={`group group-hover:text-cyan-950 inline-flex text-white justify-start mx-4 py-1 text-sm font-normal transition-colors`}
                                >
                                  {dropdownItem.iconLink &&
                                    dropdownItem.iconLink}
                                  <span
                                    className={` ${
                                      location.pathname === dropdownItem.path
                                        ? " bg-underline-current"
                                        : " bg-underline"
                                    }`}
                                  >
                                    {dropdownItem.label}
                                  </span>
                                </Link>
                              </li>
                            ),
                        )}
                      </ul>
                    </div>
                  </div>
                </>
              ) : item.isButton ? (
                <button
                  className={
                    "cursor-pointer flex justify-center items-center text-white transition-colors h-10 ml-3 lg:ml-0 lg:mr-6 group"
                  }
                  key={item.key}
                  onClick={item.onClick}
                >
                  <LoginIcon className="inline-flex h-5 w-5 mr-2" />
                  {item.label}
                </button>
              ) : (
                <a
                  href={"/#" + item.key}
                  className={`relative flex w-full overflow-hidden items-center hover:text-shadow-[0_0px_.5px_#faa968] 
                          flex-gap-2 pr-10 pl-3 lg:pl-0 py-2 lg:py-6 bg-cyan-600 dark:bg-cyan-950 z-2 uppercase group lg:whitespace-pre hover:text-orange-50  ${
                            location.pathname === item.path
                              ? " text-orange-200"
                              : " text-orange-50"
                          }`}
                >
                  {item.iconLink && item.iconLink}
                  <span
                    className={
                      "group-hover:translate-x-6  transition-transform duration-200 ease-linear"
                    }
                  >
                    {item.label}
                  </span>
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
