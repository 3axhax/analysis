export const AboutPage = () => {
  return (
    <div className="app">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          О проекте
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Демонстрация архитектуры Feature-Sliced Design с React Router
        </p>
      </div>

      <div className="max-w-4xl mx-auto text-left">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Технологический стек
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• React 18 с TypeScript</li>
            <li>• Redux Toolkit для управления состоянием</li>
            <li>• Tailwind CSS для стилизации</li>
            <li>• React Router для навигации</li>
            <li>• Feature-Sliced Design архитектура</li>
            <li>• Vite для сборки</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
