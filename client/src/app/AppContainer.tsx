import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InfoModal } from "@features/infoModal";
import { Navigation } from "@features/navigation";
import { MainPage } from "@pages/main";
import { NotFoundPage } from "@pages/404";
import { TestPage } from "@pages/test";
import { AboutPage } from "@pages/about";
import { ContactsPage } from "@pages/contacts";
import { AnalysisPage } from "@pages/analysis";
import { AnalysisResultPage } from "@pages/analysisResult";
import { LogoutPage } from "@pages/logout";
import { checkLSUser, selectIsUserAdmin } from "@entities/user";
import { TranslationsPage } from "@pages/Admin/translations";
import { UnitsPage } from "@pages/Admin/units";

function AppContainer() {
  const dispatch = useAppDispatch();
  const isUserAdmin = useAppSelector(selectIsUserAdmin);

  useEffect(() => {
    dispatch(checkLSUser());
  }, [dispatch]);

  return (
    <div className="app">
      <Navigation />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/result/:resultId" element={<AnalysisResultPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        {isUserAdmin && (
          <>
            <Route path="/admin/translations" element={<TranslationsPage />} />
            <Route path="/admin/units" element={<UnitsPage />} />
          </>
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <InfoModal />
    </div>
  );
}

export default AppContainer;
