import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  const mainNavItems = [
    { path: "/", label: "Главная" },
    { path: "/analysis", label: "Загрузить анализы" },
    { path: "/admin", label: "Админ панель" },
    { path: "/about", label: "О проекте" },
    { path: "/contacts", label: "Контакты" },
  ];

  const adminNavItems = [
    { path: "/", label: "Главная" },
    { path: "/admin/analysis", label: "Управление анализами" },
    { path: "/admin/users", label: "Пользователи" },
    { path: "/admin/settings", label: "Настройки" },
  ];

  const navItems = isAdmin ? adminNavItems : mainNavItems;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-8">
      <ul className="flex space-x-6 justify-center">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
