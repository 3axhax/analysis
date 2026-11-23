import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { PoliticsAgreementBlock } from "@features/politicsAgreementBlock";
import { Metrica } from "@features/metrica/Metrica";
import { InfoModal } from "@features/infoModal";
import { Navigation } from "@widgets/navigation";
import { NotFoundPage } from "@pages/404";
import { TestPage } from "@pages/test";
import { AboutPage } from "@pages/about";
import { ContactsPage } from "@pages/contacts";
import { AnalysisGroupPage } from "@pages/analysis/AnalysisGroupPage";
import { AnalysisPage } from "@pages/analysis";
import { ArticlesPage } from "@pages/articles/ArticlesPage";
import { AnalysisPointArticlePage } from "@pages/articles/AnalysisPointArticlePage";
import { AnalysisResultPage } from "@pages/analysisResult";
import { LogoutPage } from "@pages/logout";
import { checkLSUser, selectIsUserAdmin } from "@entities/user";
import { TranslationsPage } from "@pages/Admin/translations";
import { UnitsPage } from "@pages/Admin/units";
import { AgesPage } from "@pages/Admin/ages";
import { AnalysisPointsPage } from "@pages/Admin/analysisPoints";
import { DescriptionsPage } from "@pages/Admin/descriptions";
import { AnalysisTypePage } from "@pages/Admin/analysisType";
import { ConsentPersonalData } from "@pages/consentPersonalData";
import { PolicyPersonalData } from "@pages/policyPersonalData";
import { Basement } from "@pages/basement";
import { usePageCanonical } from "@shared/hooks/usePageCanonical.ts";
import { usePageMetadata } from "@shared/hooks/usePageMetadata.ts";
import { ClientOnly } from "@shared/ui/ClientOnly.tsx";
import { PublicNavigation } from "@widgets/navigation/ui/PublicNavigation.tsx";
import { ArticleCatalogContext, type ArticleCatalog } from "@shared/catalog/article-catalog";
import { getArticleRoute, isArticleCatalogPath } from "@shared/catalog/article-routes.mjs";

function AppContainer({ initialCatalog }: { initialCatalog?: ArticleCatalog }) {
  const dispatch = useAppDispatch();
  const isUserAdmin = useAppSelector(selectIsUserAdmin);
  const { pathname, search, hash } = useLocation();
  const [catalog, setCatalog] = useState(initialCatalog);
  const [failed, setFailed] = useState(false);
  const needsCatalog = pathname === "/" || isArticleCatalogPath(pathname);
  const article = getArticleRoute(pathname, catalog);
  const title = article?.title;
  const description = article?.description;
  usePageCanonical(pathname, title);
  usePageMetadata(pathname, title, description);

  useEffect(() => {
    if (!needsCatalog || catalog) return;
    const controller = new AbortController();
    const url = `${import.meta.env.VITE_BASE_API_URL}/analysisType?view=articles`;
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return response.json();
      })
      .then((data: ArticleCatalog) => setCatalog(data))
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [needsCatalog, catalog]);

  useEffect(() => {
    dispatch(checkLSUser());
  }, [dispatch]);

  return (
    <div className="page min-h-screen flex flex-col">
      <ClientOnly fallback={<PublicNavigation />}>
        <Navigation />
      </ClientOnly>
      <ArticleCatalogContext.Provider value={{ catalog, failed }}>
        <Routes>
          <Route path="/" element={<AnalysisPage />} />
          <Route path="/analizy/:slug" element={<AnalysisGroupPage />} />
          <Route path="/pokazateli/:slug" element={<AnalysisPointArticlePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route
            path="/analysis"
            element={<Navigate to={{ pathname: "/", search, hash }} replace />}
          />
          <Route path="/result/:resultId" element={<AnalysisResultPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route
            path="/consent-personal-data"
            element={<ConsentPersonalData />}
          />
          <Route path="/privacy-policy" element={<PolicyPersonalData />} />
          {isUserAdmin && (
            <>
              <Route path="/admin/translations" element={<TranslationsPage />} />
              <Route path="/admin/units" element={<UnitsPage />} />
              <Route path="/admin/ages" element={<AgesPage />} />
              <Route path="/admin/descriptions" element={<DescriptionsPage />} />
              <Route
                path="/admin/analysisPoints"
                element={<AnalysisPointsPage />}
              />
              <Route path="/admin/analysisType" element={<AnalysisTypePage />} />
            </>
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ArticleCatalogContext.Provider>
      <Basement />
      <ClientOnly>
        <Metrica />
        <InfoModal />
        <PoliticsAgreementBlock />
      </ClientOnly>
    </div>
  );
}

export default AppContainer;
