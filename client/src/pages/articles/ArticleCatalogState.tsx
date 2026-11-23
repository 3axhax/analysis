export function ArticleCatalogState({ failed }: { failed: boolean }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <h1 className="mb-4 text-3xl lg:text-4xl">Статьи</h1>
      <p role="status">{failed ? "Не удалось загрузить справочник." : "Загрузка справочника…"}</p>
    </main>
  );
}
