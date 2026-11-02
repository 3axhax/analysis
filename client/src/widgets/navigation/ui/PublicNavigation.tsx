import { NavigationUI } from "./NavigationUI";
import { publicNavigationItems } from "./publicNavigationItems";

export const PublicNavigation = () => (
  <NavigationUI
    navItems={[
      ...publicNavigationItems(),
      { key: "login", path: "#", label: "Вход", isButton: true },
    ]}
  />
);
