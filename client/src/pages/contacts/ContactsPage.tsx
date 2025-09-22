export const ContactsPage = () => {
  return (
    <div className="app">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Контакты
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Свяжитесь с нами для получения дополнительной информации
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Email
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                contact@example.com
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Телефон
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                +7 (999) 123-45-67
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Адрес
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Москва, ул. Примерная, д. 1
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
