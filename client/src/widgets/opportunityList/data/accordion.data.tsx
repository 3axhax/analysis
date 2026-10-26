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
    title: "Данные",
    content: (
      <ul className={"list-disc p-4 space-y-3"}>
        <li>
          PDF передаётся на сервер и может содержать личные сведения. Удалите их перед загрузкой или используйте ручной ввод.
        </li>
        <li>Результат доступен любому, у кого есть полная ссылка. Не публикуйте её.</li>
        <li>
          В связи с этим важно указать возраст на момент сдачи анализа и пол
        </li>
      </ul>
    ),
  },
  {
    id: 2,
    icon: <SpeedIcon className={"inline size-10 text-white dark:text-white"} />,
    title: "Проверка",
    content: (
      <ul className={"list-disc p-4 space-y-3"}>
        <li>Распознавание PDF может ошибаться: сверьте названия, значения и единицы с бланком.</li>
        <li>Обрабатываются первые пять страниц PDF размером до 10 МБ.</li>
      </ul>
    ),
  },
  {
    id: 3,
    icon: (
      <ExactlyIcon className={"inline size-10 text-white dark:text-white"} />
    ),
    title: "Сравнение",
    content: (
      <ul className={"list-disc p-4 space-y-3"}>
        <li>Диапазон подбирается по показателю, возрасту, полу и единице.</li>
        <li>Если диапазон отсутствует или противоречив, сервис показывает предупреждение.</li>
        <li>
          Пояснения выбираются по заранее заданным условиям. Справочная информация не является диагнозом.
        </li>
      </ul>
    ),
  },
];
