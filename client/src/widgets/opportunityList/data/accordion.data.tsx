import { AccordionItemType } from "@shared/ui/Accordion";
import { SafetyIcon } from "@shared/ui/Icons/SafetyIcon.tsx";
import { SpeedIcon } from "@shared/ui/Icons/SpeedIcon.tsx";
import { ExactlyIcon } from "@shared/ui/Icons/ExactlyIcon.tsx";

export const accordionItems: AccordionItemType[] = [
  {
    id: 1,
    icon: (
      <SafetyIcon className={"inline size-10 text-white dark:text-white"} />
    ),
    title: "Безопасно",
    content: (
      <ul>
        <li>
          Мы не сканируем ваши персональные данные (телефон, возраст, время
          сдачи, ФИО) и тем более не передаем их третьим лицам
        </li>
        <li>Сканер анализирует исключительно показатели анализов</li>
        <li>Важно указать возраст на момент сдачи анализа</li>
      </ul>
    ),
  },
  {
    id: 2,
    icon: <SpeedIcon className={"inline size-10 text-white dark:text-white"} />,
    title: "Быстро",
    content: (
      <ul>
        <li>Результаты расшифровываются мгновенно</li>
        <li>Вы можете скачать файл или поделиться ссылкой</li>
      </ul>
    ),
  },
  {
    id: 3,
    icon: (
      <ExactlyIcon className={"inline size-10 text-white dark:text-white"} />
    ),
    title: "Точно",
    content: (
      <ul>
        <li>Референсы для каждого месяца для детей до 1 года</li>
        <li>Референсы для всех возрастов в зависимости от пола</li>
        <li>
          Используем алгоритмы, которые анализируют не только каждый показатель
          в отдельности, но и зависимость нескольких показателей друг от друга
        </li>
      </ul>
    ),
  },
];
