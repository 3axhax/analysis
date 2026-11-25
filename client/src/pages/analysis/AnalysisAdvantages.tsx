import { KidAdvantagesIcon } from "@shared/ui/Icons/KidAdvantagesIcon";
import { MoneyAdvantagesIcon } from "@shared/ui/Icons/MoneyAdvantagesIcon";
import { CountAdvantagesIcon } from "@shared/ui/Icons/CountAdvantagesIcon";
import { OpportunityList } from "@widgets/opportunityList";
import advantagesIcon from "@shared/assets/icons/service-advantages-transparent.png";

export const AnalysisAdvantages = () => (
  <section
    className="w-[calc(100%+3rem)] px-6 py-6"
    aria-labelledby="advantages-title"
  >
    <div className="mx-auto lg:w-8/12 w-full">
      <h2
        id="advantages-title"
        className="text-[24px] font-light font-sans text-gray-900 dark:text-white mb-4"
      >
        <img
          src={advantagesIcon}
          alt=""
          className="inline size-7 mr-1 mb-1 object-contain dark:invert"
        />
        Преимущества нашего сервиса
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left text-gray-800 dark:text-white">
        <li className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-orange-800 via-orange-600 to-orange-800 bg-[length:300%_100%] px-4 py-3 text-white">
          <KidAdvantagesIcon className="inline size-7 shrink-0 text-white" />
          <div>
            <span className="text-xl lg:text-2xl">
              Есть референсы для малышей до 1 года
            </span>
          </div>
        </li>
        <li className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-orange-800 via-orange-600 to-orange-800 bg-[length:300%_100%] px-4 py-3 text-white">
          <MoneyAdvantagesIcon className="inline size-7 shrink-0 text-white" />
          <div>
            <span className="text-xl lg:text-2xl">Бесплатно*</span> (до 1 января
            2027 года)
          </div>
        </li>
        <li className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-orange-800 via-orange-600 to-orange-800 bg-[length:300%_100%] px-4 py-3 text-white">
          <CountAdvantagesIcon className="inline size-7 shrink-0 text-white" />
          <div>
            Используем собственные алгоритмы, за которые несём ответственность,
            а не калейдоскоп ИИ-генераций
          </div>
        </li>
      </ul>
      <div className="mt-6">
        <OpportunityList />
      </div>
    </div>
  </section>
);
