import { Link } from "react-router-dom";

export function ArticleBreadcrumbs({ title }: { title: string }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-5">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link className="text-cyan-600" to="/">Главная</Link></li>
        <li aria-hidden="true">›</li>
        <li><Link className="text-cyan-600" to="/articles">Статьи</Link></li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">{title}</li>
      </ol>
    </nav>
  );
}
