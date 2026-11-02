import { Link } from "react-router-dom";

export const ContactsPage = () => (
  <div className="app">
    <article className="max-w-3xl text-left space-y-6 text-gray-700 dark:text-gray-200">
      <h1 className="text-4xl font-light text-gray-900 dark:text-white">Контакты проекта</h1>
      <p>Автор и владелец сервиса — Захарова Татьяна Владимировна. Для вопросов о работе «Проанализируй» и сообщений об ошибках используйте email:</p>
      <p><a className="text-xl underline text-cyan-700 dark:text-cyan-200" href="mailto:proanalize@yandex.ru">proanalize@yandex.ru</a></p>
      <section className="space-y-3">
        <h2 className="text-2xl font-medium">Как сообщить об ошибке</h2>
        <p>Опишите действие, ожидаемый результат и то, что произошло. Для ошибки интерфейса укажите браузер и устройство. Для ошибки справочника укажите название показателя, единицу и источник, с которым вы сравниваете диапазон.</p>
        <p>Не отправляйте медицинские PDF, личные результаты, полные ссылки на них, пароли или данные для входа. Для объяснения технической проблемы используйте вымышленные числа и изображения без личных сведений.</p>
      </section>
      <p>Обратная связь предназначена для вопросов о сервисе. Она не является каналом медицинских консультаций.</p>
      <p>Сведения о медицинских рецензентах и их квалификации пока не опубликованы. Телефон и адрес приёма посетителей не указаны.</p>
      <Link className="underline text-cyan-700 dark:text-cyan-200" to="/about">Как работает сервис и какие у него ограничения</Link>
    </article>
  </div>
);
