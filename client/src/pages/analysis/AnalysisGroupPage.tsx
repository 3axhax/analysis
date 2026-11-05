import { Link, useParams } from "react-router-dom";
import groups from "@shared/config/analysis-groups.json";
import referenceData from "@shared/config/analysis-reference-data.json";
import { NotFoundPage } from "@pages/404";

const groupPointIds: Record<string, number[]> = {
  "obshchiy-analiz-krovi": [1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 69, 17, 70, 18, 71, 19, 72, 20, 73, 21],
  "anemiya-i-zhelezo": [22, 23, 24, 25, 26],
  pechen: [32, 33, 34, 35, 62, 65, 37, 38, 39],
  gormony: [48, 49, 50],
  pochki: [28, 30, 29, 31],
  "uglevodnyy-obmen": [44, 45, 66, 46, 47],
  "lipidnyy-obmen": [40, 41, 42, 43],
  "belkovyy-obmen": [27, 4, 5, 58, 59, 60, 61],
  elektrolity: [51, 52, 53, 54, 55, 56],
};

export const AnalysisGroupPage = () => {
  const { slug } = useParams();
  const group = groups.find((item) => item.slug === slug);
  if (!group) return <NotFoundPage />;
  const ids = groupPointIds[group.slug] ?? [];
  const points = ids.map((id) => referenceData.find((point) => point.id === id));
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8 flex-1">
      <nav aria-label="Хлебные крошки" className="mb-5">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="text-cyan-600 no-underline" to="/">Главная</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link className="text-cyan-600 no-underline" to="/articles">Статьи</Link></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">{group.title}</li>
        </ol>
      </nav>
      <h1 className="text-3xl lg:text-4xl mb-6">{group.title}</h1>
      <p className="mb-6">Описания приведены из справочника сервиса. Информация не является диагнозом.</p>
      <div className="space-y-6">
        {points.map((point, index) => point ? (
          <section key={point.id} className="rounded-xl border border-cyan-600 p-5">
            <h2 className="text-2xl mb-3">{point.name.replace(/\s*\([^)]*\)\s*$/, "")}</h2>
            <p className="whitespace-pre-line mb-4">{point.description || "Описание в справочнике отсутствует."}</p>
            {point.id === 14 && <p className="mb-4">В описании выше содержится ошибка: ретикулоциты — незрелые эритроциты; их количество помогает оценить образование эритроцитов в костном мозге. <a className="underline text-cyan-700 dark:text-cyan-200" href="https://medlineplus.gov/lab-tests/reticulocyte-count/">Источник: MedlinePlus</a>.</p>}
          </section>
        ) : <p key={ids[index]}>Показатель {ids[index]} отсутствует в справочнике.</p>)}
      </div>
      <Link className="inline-block mt-6 text-cyan-600 underline" to="/#analysis">Расшифровать анализы</Link>
    </main>
  );
};
