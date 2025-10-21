import { Routes, Route } from "react-router-dom";
import { MainPage } from "@pages/main";
import { NotFoundPage } from "@pages/404";
import { TestPage } from "@pages/test";
import { AboutPage } from "@pages/about/AboutPage.tsx";
import { ContactsPage } from "@pages/contacts/ContactsPage.tsx";
import { Navigation } from "@widgets/navigation";
import { AnalysisPage } from "@pages/analysis";
import { AnalysisResultPage } from "@pages/analysisResult";
import { LoginPage } from "@pages/login";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { checkLSUser, selectIsUserAdmin } from "@entities/user";
import { LogoutPage } from "@pages/logout";
import { TranslationsPage } from "@pages/Admin/translations";

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        {isUserAdmin && (
          <Route path="/admin/translations" element={<TranslationsPage />} />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default AppContainer;
