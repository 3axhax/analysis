import { Counter } from "@features/counter";

export const TestPage = () => {
  return (
    <div className="app">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          React + TypeScript + Redux Toolkit + FSD
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Демонстрация архитектуры Feature-Sliced Design с Tailwind CSS
        </p>
      </div>
      <Counter />
    </div>
  );
};
