import { Accordion } from "@shared/ui/Accordion";
import { QuestionsIcon } from "@shared/ui/Icons/QuestionsIcon";

const questions = [
  {
    id: "how-it-works",
    title: "Что такое Расшифровка анализов",
    content:
      "Proanalyze — онлайн-сервис, который сканирует PDF-документ или использует данные, введённые вручную, сопоставляет их с референсными диапазонами и оптимальными значениями. Затем сервис комплексно сравнивает показатели и формирует описание.",
  },
  {
    id: "privacy",
    title: "Защищены ли мои данные?",
    content:
      "Да, наш сервис настроен только на сканирование медицинских показателей. Все персональные данные игнорируются. Мы не храним ваш файл в базе данных и не передаём его третьим лицам.",
  },
  {
    id: "sources",
    title: "Какие источники данных вы используете?",
    content:
      "Мы используем как разработки российских врачей, так и данные, разрешённые для коммерческого использования, например BioMed. В расшифровке вы увидите ссылку на источник.",
  },
  {
    id: "price",
    title: "Сколько стоит расшифровка анализа?",
    content:
      "Расшифровка одного файла размером до 10 МБ объёмом до 5 страниц стоит 99 рублей.",
  },
  {
    id: "support",
    title: "Как связаться с технической поддержкой?",
    content: (
      <>
        По всем интересующим вас вопросам напишите нам по адресу{" "}
        <a className="bg-underline-hover" href="mailto:proanalize@yandex.ru">
          proanalize@yandex.ru
        </a>
        .
      </>
    ),
  },
];

export const AnalysisFaq = () => (
  <section
    className="mb-5 lg:w-8/12 sm:w-full"
    id="faq"
    aria-labelledby="faq-title"
  >
    <h2
      id="faq-title"
      className="text-[24px] font-light font-sans text-gray-900 dark:text-white mb-4"
    >
      <QuestionsIcon className="inline size-7 mr-1 mb-1" />
      Часто задаваемые вопросы
    </h2>
    <Accordion
      items={questions}
      className="w-full space-y-4"
      itemClassName="w-full"
      headerClassName="border border-cyan-600 dark:border-cyan-800 px-4 py-3 text-left hover:bg-cyan-50 dark:hover:bg-gray-700"
      headerOpenedClassName="bg-cyan-50 dark:bg-gray-900 rounded-b-none border-b-transparent"
      headerClosedClassName="bg-white dark:bg-gray-900"
      contentClassName="bg-cyan-50 dark:bg-gray-900 border border-t-0 border-cyan-600 dark:border-cyan-800 rounded-b-xl text-gray-800 dark:text-white"
      dropdownIconClassName="text-gray-400 dark:text-white"
    />
  </section>
);
