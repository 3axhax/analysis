import { Link, useLocation } from "react-router-dom";
import { JSX, useState } from "react";
import { Logo } from "@widgets/logo";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {BurgerButton} from "@widgets/navigation/ui/BurgerButton.tsx";
import {LoginIcon} from "@shared/ui/Icons/LoginIcon.tsx";

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
    <header className="header bg-cyan-600 shadow-lg dark:bg-gray-950/95 dark:shadow-white/20">
        <Logo />
        <BurgerButton isOpen={isMobileMenuOpen} className={"lg:hidden absolute top-0 right-0"} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}/>
        <nav className={`ml-auto mr-6 fixed z-40 top-0 right-0 bottom-0 overflow-hidden lg:overflow-visible lg:relative lg:visible ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
          <div
              className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
                  isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`absolute inset-0 bg-black ${isMobileMenuOpen ? 'opacity-50' : 'opacity-0'}`}/>
          </div>
          <ul className={`flex flex-col lg:justify-start lg:flex-row lg:inline-flex z-40 bg-white lg:bg-transparent dark:bg-gray-950 fixed inset-y-0 right-0 w-80 transition-transform duration-300 transform lg:relative lg:right-auto lg:translate-x-0 lg:w-auto lg:py-0 lg:px-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {navItems.map((item) => (
                <li key={item.key} className={"flex justify-stretch w-full m-0"}>
                  {item.isDropdown ? (
                      <>
                        <div
                            className={`relative bg-cyan-600 flex items-center hover:cursor-pointer
                            transition-colors duration-200 group 
                            text-orange-50 hover:text-orange-300 hover:border-orange-300`}
                            onClick={() => setIsDropdownOpen(isDropdownOpen === item.key ? "" : item.key)}
                        ><span className={'py-6 px-3 flex items-center bg-cyan-600 lg:w-50 z-2'}>
                          {item.iconLink && item.iconLink}
                          <span className={"max-w-50 text-nowrap overflow-hidden uppercase"}>{item.label}</span>
                          <ChevronDownIcon
                              className={`inline-flex h-4 w-4 ml-1 text-white transition-transform group-hover:text-orange-300 duration-200 ${isDropdownOpen === item.key ? "rotate-180" : ""}`}
                          />
                          </span>
                              <div className={`absolute flex flex-col gap-2 left-0 w-48 rounded-b-lg bg-white shadow-lg shadow-cyan-950/40 transition-transform duration-300 ease-in-out ${isDropdownOpen === item.key ? 'translate-y-0 z-1 top-full': '-translate-y-full z-0 -top-full'}`}>
                                <ul className={'py-3'}>{item.items?.map((dropdownItem) =>
                                    dropdownItem.label &&
                                        <li><Link
                                            key={dropdownItem.path}
                                            to={dropdownItem.path}
                                            onClick={() => setIsDropdownOpen("")}
                                            className={`block text-left px-4 py-1 text-sm font-normal transition-colors${
                                                location.pathname === dropdownItem.path
                                                    ? " bg-cyan-600 text-white"
                                                    : " text-cyan-800 hover:text-cyan-950"
                                            }`}
                                        >
                                          {dropdownItem.label}
                                        </Link></li>
                                )}
                                </ul>
                              </div>
                        </div>
                      </>
                  ) : item.isButton ? (
                      <button
                          className={
                            "cursor-pointer flex justify-center items-center text-white transition-colors"
                          }
                          key={item.key}
                          onClick={item.onClick}
                      >
                        <LoginIcon className="inline-flex h-4 w-4 mr-2"/>
                        {item.label}
                      </button>
                  ) : (
                      <a
                          href={'#' + item.key}
                          className={`relative flex overflow-hidden items-center hover:text-shadow-[0_0px_.5px_#faa968] 
                          flex-gap-2 pr-10 py-6 bg-cyan-600 z-2 uppercase group lg:whitespace-pre hover:text-orange-50  ${
                              location.pathname === item.path
                                  ? " text-orange-200"
                                  : " text-orange-50"
                          }`}
                      >
                        {item.iconLink && item.iconLink}
                        <span className={'group-hover:translate-x-6  transition-transform duration-200 ease-linear'}>{item.label}</span>
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
