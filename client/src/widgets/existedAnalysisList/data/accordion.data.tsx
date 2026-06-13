import { AccordionItemType } from "@shared/ui/Accordion";
import { CheckCircleIcon } from "@shared/ui/Icons/CheckCircleIcon.tsx";

export const accordionItems: AccordionItemType[] = [
  {
    id: 1,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Общий анализ крови с лейкоцитарной формулой и СОЭ",
    content: (
      <ul>
        <li>Гемоглобин</li>
        <li>Эритроциты</li>
        <li>Гематокрит</li>
        <li>Средний объем эритроцита</li>
        <li>Среднее содержание гемоглобина</li>
        <li>Средняя концентрация гемоглобина</li>
        <li>Распределение эритроцитов по объему</li>
        <li>Тромбоциты</li>
        <li>Средний объем тромбоцитов</li>
        <li>Ретикулоциты</li>
        <li>Лейкоциты</li>
        <li>Нейтрофилы</li>
        <li>Лимфоциты</li>
        <li>Моноциты</li>
        <li>Эозинофилы</li>
        <li>Базофилы</li>
        <li>СОЭ</li>
      </ul>
    ),
  },
  {
    id: 2,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Анемия или избыток железа",
    content: (
      <ul>
        <li>Железо</li>
        <li>Трансферритин</li>
        <li>Ферритин</li>
        <li>ОЖСС</li>
        <li>Церулоплазмин</li>
      </ul>
    ),
  },
  {
    id: 3,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Оценка работы печени",
    content: (
      <ul>
        <li>АЛТ и АСТ. Вычисляем коэффициент де Ритиса.</li>
        <li>Щелочная фосфатаза</li>
        <li>ГГТП (Гамма-глютамилтранспептидаза)</li>
        <li>ЛДГ (Лактатд егидрогеназа)</li>
        <li>Билирубин: общий, прямой, непрямой</li>
      </ul>
    ),
  },
  {
    id: 4,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Гормоны щитовидной железы",
    content: (
      <ul>
        <li>ТТГ</li>
        <li>Т3 свободный</li>
        <li>Т4 свободный</li>
      </ul>
    ),
  },
  {
    id: 5,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Оценка работы почек",
    content: (
      <ul>
        <li>Мочевина</li>
        <li>Креатинин</li>
        <li>Аммиак</li>
        <li>Мочевая кислота</li>
      </ul>
    ),
  },
  {
    id: 6,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Углеводный обмен",
    content: (
      <ul>
        <li>Глюкоза</li>
        <li>Инсулин</li>
        <li>Гликированный гемоглобин</li>
        <li>Фруктозамин</li>
        <li>С-пептид</li>
      </ul>
    ),
  },
  {
    id: 7,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Липидный обмен",
    content: (
      <ul>
        <li>
          Холестерин и его фракции: ЛПВП, ЛПНП, Триглицериды. Вычисляем
          коэффициент атерогенности.
        </li>
      </ul>
    ),
  },
  {
    id: 8,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Белковый обмен",
    content: (
      <ul>
        <li>Общий белок</li>
        <li>
          Белковые фракции: Альбуминовая, Альфа-1 глобулины, Альфа-2 глобулины,
          Бета глобулины, Бета-2 глобулины, Гамма глобулины
        </li>
      </ul>
    ),
  },
  {
    id: 9,
    icon: (
      <CheckCircleIcon
        className={"inline size-5 text-cyan-600 mr-2 dark:text-white"}
      />
    ),
    title: "Электролиты",
    content: (
      <ul>
        <li>Натрий</li>
        <li>Калий</li>
        <li>Кальций</li>
        <li>Магний</li>
        <li>Фосфор</li>
        <li>Хлориды</li>
      </ul>
    ),
  },
];
