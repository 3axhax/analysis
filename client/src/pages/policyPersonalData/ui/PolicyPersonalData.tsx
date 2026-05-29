import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { Link } from "react-router-dom";

export const PolicyPersonalData = () => {
  const title = "Политика обработки персональных данных";
  useDocumentTitle(title);
  return (
    <div className={"mx-auto lg:w-8/12 sm:w-full text-left content"}>
      <h1
        className={
          "text-2xl text-center font-light lg:text-4xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        {title}
      </h1>
      <p
        className={
          "text-cyan-950 text text-center font-light lg:text-lg font-sans"
        }
      >
        <strong>Дата последнего обновления</strong>: 26 мая 2026 г.
      </p>
      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        1. Общие положения
      </h2>
      <p>
        Настоящая Политика обработки персональных данных (далее — «Политика»)
        составлена в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
        «О персональных данных» и определяет позицию сайта «Расшифровка
        медицинских анализов Онлайн» (далее — «Сайт») в отношении обработки
        персональных данных.
      </p>
      <p>Адрес сайта: https://proanalize.ru/</p>
      <p>Оператор персональных данных: Владелец сайта proanalize.ru</p>
      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        2. Основные понятия
      </h2>
      <p>
        Для целей настоящей Политики используются следующие определения:
        <ul>
          <li>
            <strong>Персональные данные</strong> — любая информация, относящаяся
            к прямо или косвенно определенному или определяемому физическому
            лицу (субъекту персональных данных);
          </li>
          <li>
            <strong>Обезличенные данные</strong> — данные, которые не позволяют
            идентифицировать конкретного человека без использования
            дополнительной информации;
          </li>
          <li>
            <strong>Параметры анализов</strong> — числовые значения результатов
            медицинских исследований, единицы измерения, референсные интервалы;
          </li>
          <li>
            <strong>LocalStorage</strong> — технология веб-хранилища,
            позволяющая сохранять данные в браузере пользователя;
          </li>
          <li>
            <strong>Зашифрованная ссылка</strong> — уникальный URL-адрес,
            содержащий зашифрованную информацию, доступную только при наличии
            полной ссылки.
          </li>
        </ul>
      </p>
      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        3. Какие данные обрабатывает Сайт
      </h2>
      <h3>3.1. Данные, предоставляемые пользователем</h3>
      <p>
        Для предоставления услуги расшифровки медицинских анализов пользователь
        добровольно передает следующие данные:
        <ul>
          <li>Параметры медицинских анализов (результаты исследований);</li>
          <li>Пол (мужской/женский);</li>
          <li>Возраст (в годах или месяцах).</li>
        </ul>
      </p>
      <p>
        <strong>Важное замечание</strong>: Указанные данные{" "}
        <strong>
          не содержат информации, позволяющей прямо идентифицировать личность
          пользователя
        </strong>{" "}
        (ФИО, адрес, телефон, email и т.д.). В совокупности эти данные не
        относятся к персональным данным в смысле, придаваемом им
        законодательством о персональных данных, так как не позволяют определить
        конкретного субъекта.
      </p>
      <h3>3.2. Технические данные</h3>
      <p>
        При использовании Сайта автоматически обрабатываются следующие
        технические данные:
        <ul>
          <li>
            IP-адрес (в обезличенном виде, передаваемый в составе HTTP-запроса);
          </li>
          <li>Тип устройства, операционная система и браузер (User-Agent);</li>
          <li>Время и дата посещения;</li>
          <li>
            Информация о действиях на Сайте (в рамках работы Яндекс Метрики).
          </li>
        </ul>
      </p>
      <h2>4. Использование LocalStorage. Отсутствие Cookie</h2>
      <h3>4.1. Общие сведения</h3>
      <p>
        Сайт <strong>не использует файлы Cookie</strong> для сохранения
        информации на устройстве пользователя.
      </p>
      <p>
        Для сохранения выбора пользователя (согласие/отказ на сбор статистики
        Яндекс Метрикой) Сайт использует технологию{" "}
        <strong>LocalStorage</strong> — веб-хранилище браузера.
      </p>
      <h3>4.2. Особенности LocalStorage</h3>
      <p>
        <ul>
          <li>Данные в LocalStorage не передаются на сервер автоматически;</li>
          <li>LocalStorage привязан к конкретному браузеру и устройству;</li>
          <li>
            Пользователь может в любой момент очистить LocalStorage через
            настройки браузера;
          </li>
          <li>
            LocalStorage не используется для отслеживания пользователя между
            разными сайтами.
          </li>
        </ul>
      </p>
      <h3>4.3. Отсутствие файлов Cookie</h3>
      <p>
        Сайт <strong>не устанавливает</strong> и <strong>не использует</strong>:
        <ul>
          <li>Постоянные файлы Cookie;</li>
          <li>Сессионные файлы Cookie;</li>
          <li>Сторонние файлы Cookie;</li>
          <li>Отслеживающие пиксели и веб-маяки.</li>
        </ul>
      </p>
      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        5. Хранение данных. Уникальная зашифрованная ссылка
      </h2>
      <h3>5.1. Принцип хранения</h3>
      <p>
        Сайт предоставляет пользователю возможность сохранить введенные
        параметры анализов, пол и возраст для последующего доступа. Хранение
        осуществляется следующим образом:
        <ul>
          <li>Данные сохраняются на сервере в зашифрованном виде;</li>
          <li>
            Каждому сохраненному набору данных присваивается уникальная
            зашифрованная ссылка;
          </li>
          <li>Доступ к данным возможен только при наличии полной ссылки;</li>
          <li>
            Ссылка не содержит персональных данных пользователя в открытом виде.
          </li>
        </ul>
      </p>
      <h3>5.2. Срок хранения</h3>
      <p>
        Сохраненные данные хранятся на сервере в течение{" "}
        <p>30 (тридцати) дней</p> с момента последнего обращения по ссылке. По
        истечении этого срока данные автоматически удаляются и не подлежат
        восстановлению.
      </p>
      <h3>5.3. Конфиденциальность ссылки</h3>
      <p>
        <strong>
          Ответственность за сохранность уникальной зашифрованной ссылки несет
          пользователь
        </strong>
        . Оператор не имеет возможности идентифицировать, кому принадлежит та
        или иная ссылка, и не может восстановить доступ к данным в случае утраты
        ссылки.
      </p>
      <p>
        <strong>Рекомендации пользователям</strong>:
        <ul>
          <li>
            Не передавайте ссылку третьим лицам, если не желаете раскрывать им
            результаты анализов;
          </li>
          <li>Не публикуйте ссылку в открытых источниках;</li>
          <li>Используйте надежные способы хранения ссылки.</li>
        </ul>
      </p>
      <h3>5.4. Отсутствие идентификации</h3>
      <p>
        Оператор <strong>не связывает</strong> сохраненные данные с личностью
        пользователя. По уникальной зашифрованной ссылке невозможно определить,
        кому именно принадлежат данные. Это означает:
        <ul>
          <li>
            Оператор не знает, чьи именно анализы сохранены по той или иной
            ссылке;
          </li>
          <li>
            Пользователь не обязан предоставлять какие-либо идентифицирующие
            данные для создания ссылки;
          </li>
          <li>
            При обращении в службу поддержки Оператор не сможет найти данные
            пользователя по ссылке, если пользователь не предоставит ее
            самостоятельно.
          </li>
        </ul>
      </p>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        6. Яндекс Метрика (сбор статистики)
      </h2>

      <h3>6.1. Общие сведения</h3>
      <p>
        На Сайте установлен счетчик Яндекс Метрика для сбора статистики
        посещаемости и анализа поведения пользователей.
      </p>

      <h3>6.2. Собираемые данные</h3>
      <p>Яндекс Метрика собирает обезличенные технические данные:</p>
      <ul>
        <li>IP-адрес (в обезличенном виде);</li>
        <li>
          Тип устройства, операционная система и браузер (из заголовка
          User-Agent);
        </li>
        <li>Время посещения, продолжительность сессии;</li>
        <li>Просмотренные страницы и действия на Сайте;</li>
        <li>Приблизительное местоположение (регион, определяемый по IP);</li>
        <li>Источник перехода на Сайт;</li>
        <li>Файлы Cookie, присвоенные браузеру пользователя.</li>
      </ul>
      <p>
        Яндекс Метрика <strong>не собирает</strong>:
      </p>
      <ul>
        <li>Параметры анализов, пол и возраст пользователя;</li>
        <li>Уникальные зашифрованные ссылки;</li>
        <li>Данные из LocalStorage;</li>
        <li>Иные данные, вводимые пользователем на Сайте.</li>
      </ul>

      <h3>6.3. Использование файлов Cookie</h3>
      <p>Стандартный счетчик Яндекс Метрики использует файлы Cookie для:</p>
      <ul>
        <li>Идентификации уникальных посетителей;</li>
        <li>Различения новых и возвращающихся пользователей;</li>
        <li>Расчета статистики посещений и сессий;</li>
        <li>Предотвращения дублирования счетчика посещений.</li>
      </ul>
      <p>
        Файлы Cookie, устанавливаемые Яндекс Метрикой, являются сторонними по
        отношению к Сайту (принадлежат домену Яндекса) и содержат обезличенные
        идентификаторы, не позволяющие идентифицировать конкретного человека.
      </p>

      <h3>6.4. Правовое основание и согласие</h3>
      <p>
        Сбор статистики осуществляется на основании согласия пользователя,
        которое запрашивается при первом посещении Сайта с помощью всплывающего
        уведомления. Выбор пользователя сохраняется в LocalStorage браузера
        (ключ accept_ym) и определяет, будет ли загружен и активирован счетчик
        Яндекс Метрики.
      </p>
      <p>Пользователь может:</p>
      <ul>
        <li>
          <strong>Принять</strong> — дать согласие на сбор статистики Яндекс
          Метрикой (в этом случае счетчик загружается и устанавливает файлы
          Cookie);
        </li>
        <li>
          <strong>Отказаться</strong> — отказаться от сбора статистики (в этом
          случае Яндекс Метрика не загружается и не активируется, файлы Cookie
          не устанавливаются).
        </li>
      </ul>

      <h3>6.5. Отзыв согласия</h3>
      <p>
        Пользователь может в любой момент отозвать согласие на сбор статистики
        следующими способами:
      </p>
      <p>
        <strong>Способ 1. Очистка LocalStorage и Cookie браузера:</strong>
      </p>
      <ul>
        <li>Очистить LocalStorage браузера (хранилище сайта proanalize.ru);</li>
        <li>
          Очистить файлы Cookie браузера (все или относящиеся к домену
          yandex.ru);
        </li>
        <li>
          При следующем посещении Сайта уведомление о согласии будет показано
          повторно.
        </li>
      </ul>
      <p>
        <strong>Способ 2. Через настройки браузера:</strong>
      </p>
      <ul>
        <li>
          Заблокировать файлы Cookie для домена yandex.ru в настройках браузера;
        </li>
        <li>
          Использовать режим «Инкогнито» / «Приватный просмотр» (Cookie не
          сохраняются после закрытия окна).
        </li>
      </ul>
      <p>
        <strong>Способ 3. Использование блокировщиков:</strong>
      </p>
      <ul>
        <li>
          Установить браузерное расширение для блокировки счетчиков (например,
          «Блокировщик Яндекс Метрики» или uBlock Origin).
        </li>
      </ul>

      <h3>6.6. Управление файлами Cookie Яндекс Метрики</h3>
      <p>
        Пользователь может дополнительно настроить параметры конфиденциальности
        Яндекс Метрики, используя:
      </p>
      <ul>
        <li>
          Специальный инструмент Яндекса:{" "}
          <a
            href="https://yandex.ru/support/metrika/general/opt-out.html"
            target="_blank"
          >
            https://yandex.ru/support/metrika/general/opt-out.html
          </a>{" "}
          (страница отказа от сбора данных);
        </li>
        <li>Настройки браузера для блокировки сторонних Cookie;</li>
        <li>Расширения браузера для управления Cookie.</li>
      </ul>

      <h3>6.7. Срок хранения Cookie Яндекс Метрики</h3>
      <p>
        Файлы Cookie, устанавливаемые Яндекс Метрикой, имеют следующие сроки
        хранения:
      </p>
      <table
        className={
          "result-table m-auto w-full border border-cyan-800 dark:border-white mb-4"
        }
      >
        <thead>
          <tr className={"bg-cyan-800 text-white"}>
            <th className="border-r border-white last:border-r-cyan-800 dark:last:border-r-white px-4 py-3 text-start text-sm font-medium">
              Назначение
            </th>
            <th className="border-r border-white last:border-r-cyan-800 dark:last:border-r-white px-4 py-3 text-start text-sm font-medium">
              Срок хранения
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Идентификация уникального посетителя
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              До 1 года
            </td>
          </tr>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Идентификация сессии
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              До 30 минут бездействия
            </td>
          </tr>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Хранение выбора пользователя (отказ от сбора)
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              До 1 года
            </td>
          </tr>
        </tbody>
      </table>

      <h3>6.8. Политика конфиденциальности Яндекс Метрики</h3>
      <p>
        Подробная информация о сборе и обработке данных Яндекс Метрикой, а также
        о файлах Cookie содержится в официальных документах:
      </p>
      <ul>
        <li>
          Политика конфиденциальности Яндекса:{" "}
          <a href="https://yandex.ru/legal/confidentiality/" target="_blank">
            https://yandex.ru/legal/confidentiality/
          </a>
        </li>
        <li>
          Условия использования Яндекс Метрики:{" "}
          <a href="https://yandex.ru/legal/metrica_termsofuse/" target="_blank">
            https://yandex.ru/legal/metrica_termsofuse/
          </a>
        </li>
        <li>
          Информация об отказе от сбора данных:{" "}
          <a
            href="https://yandex.ru/support/metrika/general/opt-out.html"
            target="_blank"
          >
            https://yandex.ru/support/metrika/general/opt-out.html
          </a>
        </li>
      </ul>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        7. Цели обработки данных
      </h2>

      <h3>7.1. Обработка параметров анализов, пола и возраста</h3>
      <p>Указанные данные обрабатываются исключительно в следующих целях:</p>
      <ul>
        <li>
          <strong>Предоставление услуги расшифровки</strong> — математический и
          алгоритмический расчет интерпретации результатов анализов в режиме
          реального времени;
        </li>
        <li>
          <strong>Сохранение результатов</strong> — возможность сохранения
          расшифровки для последующего доступа по уникальной зашифрованной
          ссылке;
        </li>
        <li>
          <strong>Повторный доступ</strong> — предоставление пользователю
          возможности вернуться к сохраненным результатам анализов без
          необходимости повторного ввода.
        </li>
      </ul>

      <h3>7.2. Обработка технических данных</h3>
      <p>Технические данные обрабатываются для:</p>
      <ul>
        <li>Обеспечения корректной работы Сайта;</li>
        <li>
          Анализа посещаемости и улучшения работы Сайта (Яндекс Метрика, только
          при наличии согласия);
        </li>
        <li>Обеспечения безопасности и предотвращения атак.</li>
      </ul>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        8. Правовые основания обработки
      </h2>
      <p>Обработка данных осуществляется на следующих правовых основаниях:</p>
      <ul>
        <li>
          <strong>Согласие пользователя</strong> — предоставляется при
          использовании функционала сохранения результатов и при согласии на
          сбор статистики Яндекс Метрикой;
        </li>
        <li>
          <strong>Договорная основа</strong> — обработка необходима для
          предоставления пользователю услуги расшифровки анализов;
        </li>
        <li>
          <strong>Законный интерес</strong> — обеспечение функционирования и
          безопасности Сайта.
        </li>
      </ul>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        9. Передача данных третьим лицам
      </h2>

      <h3>9.1. Яндекс Метрика</h3>
      <p>
        Обезличенные технические данные передаются ООО «ЯНДЕКС» для обработки в
        рамках предоставления сервиса Яндекс Метрика. Передача осуществляется
        только при наличии согласия пользователя, сохраненного в LocalStorage.
      </p>
      <p>
        Политика конфиденциальности Яндекс Метрики:{" "}
        <a href="https://yandex.ru/legal/metrica_termsofuse/" target="_blank">
          https://yandex.ru/legal/metrica_termsofuse/
        </a>
      </p>

      <h3>9.2. Иные третьи лица</h3>
      <p>
        Оператор не передает какие-либо данные пользователей иным третьим лицам,
        за исключением случаев, прямо предусмотренных законодательством РФ.
      </p>

      <h3>9.3. Трансграничная передача</h3>
      <p>
        Обезличенные технические данные в рамках работы Яндекс Метрики могут
        передаваться на серверы, расположенные за пределами РФ. Обработка
        осуществляется в соответствии с требованиями законодательства РФ и
        политикой конфиденциальности ООО «ЯНДЕКС».
      </p>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        10. Меры защиты информации
      </h2>
      <p>Оператор принимает следующие меры для защиты данных:</p>
      <table
        className={
          "result-table m-auto w-full border border-cyan-800 dark:border-white mb-4"
        }
      >
        <thead>
          <tr className={"bg-cyan-800 text-white"}>
            <th className="border-r border-white last:border-r-cyan-800 dark:last:border-r-white px-4 py-3 text-start text-sm font-medium">
              Мера
            </th>
            <th className="border-r border-white last:border-r-cyan-800 dark:last:border-r-white px-4 py-3 text-start text-sm font-medium">
              Описание
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Шифрование
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Все сохраняемые данные шифруются перед записью на сервер
            </td>
          </tr>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              HTTPS
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Используется защищенный протокол для передачи данных между
              пользователем и сайтом
            </td>
          </tr>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Отсутствие Cookie
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Исключен риск утечки данных через Cookie
            </td>
          </tr>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Ограниченный доступ
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Доступ к серверам имеют только авторизованные сотрудники
            </td>
          </tr>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Регулярное обновление ПО
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Установка обновлений безопасности
            </td>
          </tr>
          <tr
            className={
              "border-t border-gray-300 hover:bg-cyan-50 hover:dark:bg-cyan-900 first:border-t-0"
            }
          >
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Автоматическое удаление
            </td>
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-white">
              Данных по истечении срока хранения (30 дней)
            </td>
          </tr>
        </tbody>
      </table>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        11. Права пользователей
      </h2>
      <p>Пользователь, чьи данные обрабатываются, имеет право:</p>
      <ul>
        <li>
          <strong>На получение информации</strong> — об обрабатываемых данных,
          касающихся пользователя;
        </li>
        <li>
          <strong>На уточнение данных</strong> — если они являются неполными,
          устаревшими или недостоверными;
        </li>
        <li>
          <strong>На удаление данных</strong> — потребовать удаления сохраненных
          данных;
        </li>
        <li>
          <strong>На отзыв согласия</strong> — в отношении сбора статистики
          Яндекс Метрикой (путем очистки LocalStorage);
        </li>
        <li>
          <strong>На обращение к Оператору</strong> — с запросом или жалобой.
        </li>
      </ul>

      <h3>Ограничения реализации прав</h3>
      <p>
        Ввиду того, что Сайт не собирает идентифицирующую информацию (ФИО,
        email, телефон и т.д.) и не использует Cookie, Оператор не имеет
        технической возможности связать конкретного пользователя с его
        сохраненными данными (зашифрованной ссылкой), если пользователь не
        предоставит эту ссылку самостоятельно.
      </p>
      <p>
        Для реализации прав, связанных с сохраненными данными, пользователю
        необходимо предоставить Оператору уникальную зашифрованную ссылку,
        полученную при сохранении результатов.
      </p>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        12. Управление LocalStorage
      </h2>

      <h3>12.1. Как очистить LocalStorage</h3>
      <p>Пользователь может в любой момент очистить данные LocalStorage:</p>
      <p>
        <strong>Google Chrome:</strong>
      </p>
      <ul>
        <li>Открыть Инструменты разработчика (F12);</li>
        <li>Перейти во вкладку Application → Local Storage;</li>
        <li>Выбрать сайт https://proanalize.ru/;</li>
        <li>Нажать правой кнопкой мыши и выбрать «Clear».</li>
      </ul>
      <p>
        <strong>Или через настройки браузера:</strong>
      </p>
      <ul>
        <li>Настройки → Конфиденциальность и безопасность;</li>
        <li>
          Очистить историю → выбрать «Файлы cookie и другие данные сайтов»;
        </li>
        <li>Нажать «Удалить данные».</li>
      </ul>
      <p>
        <strong>Mozilla Firefox:</strong>
      </p>
      <ul>
        <li>Инструменты разработчика (F12) → Storage → Local Storage;</li>
        <li>Очистить данные.</li>
      </ul>

      <h3>12.2. Последствия очистки LocalStorage</h3>
      <p>Очистка LocalStorage приведет к тому, что:</p>
      <ul>
        <li>
          Выбор пользователя относительно Яндекс Метрики (согласие/отказ) будет
          сброшен;
        </li>
        <li>
          При следующем посещении Сайта уведомление о согласии на сбор
          статистики будет показано повторно.
        </li>
      </ul>
      <p>
        Очистка LocalStorage не влияет на сохраненные по уникальным
        зашифрованным ссылкам результаты анализов, так как они хранятся на
        сервере.
      </p>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        13. Обработка персональных данных несовершеннолетних
      </h2>
      <p>
        Сайт не предназначен для использования лицами младше 18 лет без согласия
        законных представителей. Если Оператору станет известно, что данные
        несовершеннолетнего были сохранены без согласия родителей или законных
        представителей, такие данные будут удалены.
      </p>

      <h2>14. Изменение Политики</h2>
      <p>
        Оператор оставляет за собой право вносить изменения в настоящую
        Политику. Актуальная версия всегда доступна по адресу:{" "}
        <Link to="/privacy-policy/" target="_blank">
          https://proanalize.ru/privacy-policy/
        </Link>
      </p>
      <p>
        <strong>Уведомление об изменениях:</strong> При внесении существенных
        изменений Оператор размещает соответствующее уведомление на Сайте за 7
        дней до вступления изменений в силу.
      </p>

      <h2
        className={
          "text-xl text-center font-light lg:text-2xl font-sans text-gray-900 dark:text-white mb-4"
        }
      >
        15. Контактная информация
      </h2>
      <p>
        По вопросам, связанным с настоящей Политикой, пользователи могут
        обратиться по электронной почте{" "}
        <a href="mailto:privacy@proanalize.ru">privacy@proanalize.ru</a>
      </p>
      <p>
        Срок рассмотрения обращений — <strong>30 (тридцать) дней</strong> с
        момента получения.
      </p>

      <div>
        <p>
          <strong>Важно:</strong> Сайт предоставляет информационные услуги и не
          является медицинским учреждением. Результаты расшифровки носят
          ознакомительный характер и не заменяют консультацию врача. Все
          медицинские решения следует принимать только после консультации с
          квалифицированным специалистом.
        </p>
      </div>
    </div>
  );
};
