export const groupPath = (alias) => `/analizy/${alias}/`;
export const pointPath = (alias) => `/pokazateli/${alias}/`;
export const isArticleCatalogPath = (path) =>
  /^\/articles\/?$|^\/(analizy|pokazateli)\/[^/]+\/?$/.test(path);

export function getArticleRoute(path, catalog) {
  const normalized = path.replace(/\/+$/, '');
  const group = catalog?.groups.find(({ alias }) => groupPath(alias) === `${normalized}/`);
  if (group) return { title: group.title, description: `Показатели раздела «${group.title}».` };
  const point = catalog?.points.find(({ alias }) => pointPath(alias) === `${normalized}/`);
  if (point) return { title: point.name, description: `Справочная информация о показателе «${point.name}».` };
}
